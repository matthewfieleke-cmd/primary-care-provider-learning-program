/**
 * Batch 6: taxonomy expansion, remaps, and 34 FM residency questions (886-919).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const indexPath = path.join(root, "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const questions = require("./batch6-questions.json");

const MAP_NAMES = {
  1: "CV_SUBCAT",
  2: "PULM_SUBCAT",
  3: "GI_SUBCAT",
  4: "ENDO_SUBCAT",
  5: "UROLOGY_SUBCAT",
  6: "NEURO_SUBCAT",
  7: "MSK_SUBCAT",
  8: "ID_SUBCAT",
  9: "HEME_SUBCAT",
  10: "DERM_SUBCAT",
  11: "MH_SUBCAT",
  12: "PEDS_SUBCAT",
  13: "RHEUM_SUBCAT",
  14: "ONCO_SUBCAT",
  15: "ER_SUBCAT",
  16: "PREV_SUBCAT",
  17: "HEENT_SUBCAT",
  18: "WH_SUBCAT",
  19: "GERI_SUBCAT",
};

const SUBCATS = {
  2: ["obstructive", "infectious", "immunology", "sleep", "vascular", "pleuralInterstitial", "misc"],
  6: ["strokeVascular", "headache", "seizure", "vestibular", "neurodegenerative", "neuromuscular", "misc"],
  7: ["spine", "footAnkle", "knee", "hip", "handWristElbow", "shoulder", "hernias", "metabolicBone", "misc"],
  11: ["mood", "anxietyTrauma", "substanceUse", "psychopharm", "behavioral", "eatingDisorders", "misc"],
  12: ["neonatal", "infectious", "development", "wellChild", "adolescent", "misc"],
  16: ["nutrition", "screening", "exerciseLifestyle", "substancePrevention", "counselingBehaviorChange", "misc"],
  17: ["eye", "ear", "throatAirway", "misc"],
  19: ["cognitive", "mobility", "polypharmacy", "palliative", "misc"],
};

function countWords(s) {
  return String(s || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function getMap(name) {
  const m = html.match(new RegExp(`const ${name} = \\{([\\s\\S]*?)\\};`));
  if (!m) throw new Error(`${name} not found`);
  return eval("({" + m[1] + "})");
}

function replaceMap(name, map) {
  const body = Object.entries(map)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([id, sub]) => `  ${id}:"${sub}"`)
    .join(",\n");
  html = html.replace(
    new RegExp(`const ${name} = \\{[\\s\\S]*?\\};`),
    `const ${name} = {\n${body}\n};`
  );
}

function assign(map, id, sub) {
  map[id] = sub;
}

function updateCategoryDefinitions() {
  if (!html.includes('"palliative", name: "Palliative / Serious Illness"')) {
    html = html.replace(
      /(\{ id: "polypharmacy", name: "Polypharmacy \/ Deprescribing" \},)\r?\n(\s*\{ id: "misc", name: "General \/ Misc" \}\r?\n\s*\] \})/,
      `$1\r\n    { id: "palliative", name: "Palliative / Serious Illness" },\r\n$2`
    );
  }
  if (!html.includes('"eatingDisorders", name: "Eating Disorders"')) {
    html = html.replace(
      /(\{ id: "behavioral", name: "Behavioral \/ Lifestyle" \},)\r?\n(\s*\{ id: "misc", name: "General \/ Misc" \}\r?\n\s*\] \},\r?\n\s*\{ id: 12, name: "Pediatric")/,
      `$1\r\n    { id: "eatingDisorders", name: "Eating Disorders" },\r\n$2`
    );
  }
  if (!html.includes('"palliative", name: "Palliative / Serious Illness"')) {
    throw new Error("Failed to add Geriatrics palliative subcategory definition");
  }
  if (!html.includes('"eatingDisorders", name: "Eating Disorders"')) {
    throw new Error("Failed to add Mental Health eatingDisorders subcategory definition");
  }
}

function applyRemaps(maps) {
  // Geriatrics palliative
  for (const id of [735, 741, 832]) assign(maps[19], id, "palliative");
  // Geriatrics polypharmacy
  for (const id of [711, 738, 831]) assign(maps[19], id, "polypharmacy");
  // Pulmonology
  for (const id of [637, 753, 869]) assign(maps[2], id, "sleep");
  assign(maps[2], 38, "vascular");
  assign(maps[2], 638, "pleuralInterstitial");
  assign(maps[2], 874, "pleuralInterstitial");
  // Mental Health
  assign(maps[11], 23, "substanceUse");
  assign(maps[11], 787, "substanceUse");
  assign(maps[11], 631, "eatingDisorders");
  // Pediatrics
  assign(maps[12], 847, "adolescent");
}

function sectionWords(explanation, header) {
  const re = new RegExp(`\\n\\n${header}\\s*\\n([\\s\\S]*?)(?=\\n\\n[A-Z][A-Z /]+:|$)`);
  const m = explanation.match(re);
  return m ? countWords(m[1]) : 0;
}

function validateNewQuestions() {
  const ids = questions.map((q) => q.id);
  const expected = Array.from({ length: 34 }, (_, i) => 886 + i);
  if (ids.length !== 34) throw new Error(`Expected 34 questions, found ${ids.length}`);
  if (JSON.stringify(ids) !== JSON.stringify(expected)) {
    throw new Error(`IDs must be contiguous 886-919; found ${ids.join(",")}`);
  }

  const headers = [
    "CLINICAL MANIFESTATIONS:",
    "PATHOPHYSIOLOGY:",
    "DIAGNOSTIC APPROACH:",
    "MANAGEMENT:",
    "KEY POINTS:",
  ];

  for (const q of questions) {
    if (!SUBCATS[q.categoryId]?.includes(q.subcat)) {
      throw new Error(`Q${q.id} invalid subcat ${q.subcat} for category ${q.categoryId}`);
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) throw new Error(`Q${q.id} options invalid`);
    for (const field of ["question", "explanation", "bulletExplanation"]) {
      if (typeof q[field] !== "string" || !q[field].trim()) throw new Error(`Q${q.id} missing ${field}`);
    }
    const letter = String.fromCharCode(65 + q.correctAnswer);
    if (!q.explanation.startsWith(`CORRECT: ${letter}`)) {
      throw new Error(`Q${q.id} explanation must start with CORRECT: ${letter}`);
    }
    for (const header of headers) {
      if (!q.explanation.includes(`\n\n${header}`)) throw new Error(`Q${q.id} missing ${header}`);
    }
    if (/https?:\/\/|\bdoi\b|\bet al\b|\(\d{4}\)/i.test(q.explanation + q.bulletExplanation)) {
      throw new Error(`Q${q.id} must not contain references`);
    }

    const fullWc = countWords(q.explanation);
    const bulletWc = countWords(q.bulletExplanation);
    if (fullWc > 475) throw new Error(`Q${q.id} explanation ${fullWc} words (max 475)`);
    if (fullWc < 400) throw new Error(`Q${q.id} explanation ${fullWc} words (min 400)`);
    if (bulletWc > 100) throw new Error(`Q${q.id} bullet ${bulletWc} words (max 100)`);
    if (bulletWc < 75) throw new Error(`Q${q.id} bullet ${bulletWc} words (min 75)`);

    const mainSections = headers.slice(0, 4).map((h) => sectionWords(q.explanation, h.replace(/:$/, "")));
    const keyWc = sectionWords(q.explanation, "KEY POINTS");
    const avgMain = mainSections.reduce((a, b) => a + b, 0) / 4;
    for (const wc of mainSections) {
      if (wc < avgMain * 0.55 || wc > avgMain * 1.45) {
        throw new Error(`Q${q.id} uneven main sections: ${mainSections.join(", ")} (avg ${avgMain.toFixed(0)})`);
      }
    }
    if (keyWc > avgMain * 0.95) {
      throw new Error(`Q${q.id} KEY POINTS (${keyWc}) should be shorter than main sections (avg ${avgMain.toFixed(0)})`);
    }
  }
}

function insertQuestions(maps) {
  const blocks = questions.map((q) => {
    const lines = [
      "      {",
      `    "id": ${q.id},`,
      `    "categoryId": ${q.categoryId},`,
      `    "question": ${JSON.stringify(q.question)},`,
      `    "options": ${JSON.stringify(q.options)},`,
      `    "correctAnswer": ${q.correctAnswer},`,
      `    "explanation": ${JSON.stringify(q.explanation)},`,
      `    "bulletExplanation": ${JSON.stringify(q.bulletExplanation)}`,
      "  }",
    ];
    return lines.join("\r\n");
  });

  const insertBlock =
    `\r\n/* BATCH 6 NEW QUESTIONS (886-919) — FM TAXONOMY EXPANSION */\r\n` +
    blocks.join(",\r\n");

  const markers = ["\r\n];\r\nconst GERIATRICS_CATEGORY_ID", "\n];\nconst GERIATRICS_CATEGORY_ID"];
  const marker = markers.find((m) => html.includes(m));
  if (!marker) throw new Error("Insert marker not found");
  if (html.includes("BATCH 6 NEW QUESTIONS")) throw new Error("Batch 6 already inserted");
  html = html.replace(marker, `,\r${insertBlock}` + marker);

  for (const q of questions) {
    maps[q.categoryId][q.id] = q.subcat;
  }
}

function finalValidate() {
  const qs = eval(html.match(/const QUESTIONS = (\[[\s\S]*?\n\]);/)[1]);
  if (qs.length !== 911) throw new Error(`Expected 911 total questions, found ${qs.length}`);
  if (Math.max(...qs.map((q) => q.id)) !== 919) throw new Error("Max ID should be 919");
}

validateNewQuestions();
updateCategoryDefinitions();

const maps = Object.fromEntries(
  Object.entries(MAP_NAMES).map(([catId, name]) => [Number(catId), getMap(name)])
);

applyRemaps(maps);
insertQuestions(maps);

for (const [catId, name] of Object.entries(MAP_NAMES)) {
  if (maps[Number(catId)]) replaceMap(name, maps[Number(catId)]);
}

finalValidate();
fs.writeFileSync(indexPath, html, "utf8");

console.log("Batch 6 complete: 34 questions inserted (886-919), remaps applied.");
console.log("Total questions: 911; max ID: 919.");
