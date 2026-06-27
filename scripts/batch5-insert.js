/**
 * Batch 5: taxonomy expansion + 67 FM residency questions (819-885).
 *
 * This script intentionally keeps the existing single-file runtime architecture.
 * It updates selected subcategory definitions, remaps legacy questions into the
 * revised taxonomy, inserts the new batch, and validates the resulting bank.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const indexPath = path.join(root, "index.html");

const parts = [1, 2, 3].map((n) =>
  require(`./batch5-questions-part${n}.json`)
);
const questions = parts.flat();

fs.writeFileSync(
  path.join(__dirname, "batch5-questions.json"),
  JSON.stringify(questions, null, 2)
);

let html = fs.readFileSync(indexPath, "utf8");

const CATEGORY_NAMES = {
  2: "Pulmonology",
  5: "Urology",
  8: "Infectious Disease",
  10: "Dermatology",
  12: "Pediatric",
  15: "Emergency",
  17: "HEENT",
  18: "Women's Health",
  19: "Geriatrics",
};

const SUBCATS = {
  2: ["obstructive", "infectious", "immunology", "sleep", "vascular", "pleuralInterstitial", "misc"],
  5: ["luts", "stone", "scrotal", "nephrology", "misc"],
  8: ["respiratory", "sti", "skinSoftTissue", "gi", "urinary", "systemic", "tickborne", "misc"],
  10: ["inflammatory", "infectious", "neoplastic", "misc"],
  12: ["neonatal", "infectious", "development", "wellChild", "adolescent", "misc"],
  15: ["cardiac", "trauma", "toxicology", "neuro", "airwayShock", "ob", "misc"],
  17: ["eye", "ear", "throatAirway", "misc"],
  18: ["reproductive", "pregnancy", "gynecologic", "misc"],
  19: ["cognitive", "mobility", "polypharmacy", "misc"],
};

const MAP_NAMES = {
  2: "PULM_SUBCAT",
  5: "UROLOGY_SUBCAT",
  8: "ID_SUBCAT",
  10: "DERM_SUBCAT",
  12: "PEDS_SUBCAT",
  15: "ER_SUBCAT",
  17: "HEENT_SUBCAT",
  18: "WH_SUBCAT",
  19: "GERI_SUBCAT",
};

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

function getMap(name) {
  const re = new RegExp(`const ${name} = \\{([\\s\\S]*?)\\};`);
  const m = html.match(re);
  if (!m) throw new Error(`${name} not found`);
  return eval("({" + m[1] + "})");
}

function setQuestionCategory(id, categoryId) {
  const re = new RegExp(`("id": ${id},\\r?\\n\\s*"categoryId": )\\d+`);
  if (!re.test(html)) throw new Error(`Question ${id} categoryId not found`);
  html = html.replace(re, `$1${categoryId}`);
}

function removeFromAllMaps(maps, id) {
  for (const map of Object.values(maps)) {
    delete map[id];
  }
}

function assign(maps, id, categoryId, subcat, opts = {}) {
  if (!SUBCATS[categoryId]) throw new Error(`Unknown category ${categoryId} for ${id}`);
  if (!SUBCATS[categoryId].includes(subcat)) {
    throw new Error(`Invalid subcat ${subcat} for ${CATEGORY_NAMES[categoryId]} question ${id}`);
  }
  removeFromAllMaps(maps, id);
  maps[categoryId][id] = subcat;
  if (opts.categoryId !== false) setQuestionCategory(id, categoryId);
}

function formatMap(name, map) {
  const entries = Object.entries(map)
    .map(([id, subcat]) => [Number(id), subcat])
    .sort((a, b) => a[0] - b[0])
    .map(([id, subcat]) => `  ${id}:"${subcat}"`);
  return `const ${name} = {\r\n${entries.join(",\r\n")}\r\n};`;
}

function replaceMap(name, map) {
  const re = new RegExp(`const ${name} = \\{[\\s\\S]*?\\};`);
  if (!re.test(html)) throw new Error(`${name} block not found`);
  html = html.replace(re, formatMap(name, map));
}

function updateCategoryDefinitions() {
  const replacements = [
    [
      /  \{ id: 2, name: "Pulmonology", icon: "pulm", color: "#457B9D", subcategories: \[[\s\S]*?  \] \},/,
      `  { id: 2, name: "Pulmonology", icon: "pulm", color: "#457B9D", subcategories: [
    { id: "obstructive", name: "Obstructive (COPD / Asthma)" },
    { id: "infectious", name: "Infectious / Pneumonia" },
    { id: "immunology", name: "Immunology / Allergy" },
    { id: "sleep", name: "Sleep / OSA" },
    { id: "vascular", name: "Pulmonary Vascular / PE" },
    { id: "pleuralInterstitial", name: "Pleural / Interstitial" },
    { id: "misc", name: "General / Misc" }
  ] },`,
    ],
    [
      /  \{ id: 8, name: "Infectious Disease", icon: "virus", color: "#0F766E", subcategories: \[[\s\S]*?  \] \},/,
      `  { id: 8, name: "Infectious Disease", icon: "virus", color: "#0F766E", subcategories: [
    { id: "respiratory", name: "Respiratory / ENT Infections" },
    { id: "sti", name: "STI / HIV" },
    { id: "skinSoftTissue", name: "Skin / Soft Tissue" },
    { id: "gi", name: "GI / Foodborne" },
    { id: "urinary", name: "Urinary / Prostatitis" },
    { id: "systemic", name: "Systemic / Bacteremia" },
    { id: "tickborne", name: "Tickborne / Midwest" },
    { id: "misc", name: "General / Misc" }
  ] },`,
    ],
    [
      /  \{ id: 12, name: "Pediatric", icon: "peds", color: "#FF99C8", subcategories: \[[\s\S]*?  \] \},/,
      `  { id: 12, name: "Pediatric", icon: "peds", color: "#FF99C8", subcategories: [
    { id: "neonatal", name: "Neonatal / Infant" },
    { id: "infectious", name: "Infectious / Febrile" },
    { id: "development", name: "Development / General" },
    { id: "wellChild", name: "Well Child / Prevention" },
    { id: "adolescent", name: "Adolescent" },
    { id: "misc", name: "General / Misc" }
  ] },`,
    ],
    [
      /  \{ id: 15, name: "Emergency", icon: "emergency", color: "#FF6B6B", subcategories: \[[\s\S]*?  \] \},/,
      `  { id: 15, name: "Emergency", icon: "emergency", color: "#FF6B6B", subcategories: [
    { id: "cardiac", name: "Cardiac Emergencies" },
    { id: "trauma", name: "Trauma" },
    { id: "toxicology", name: "Toxicology" },
    { id: "neuro", name: "Neurologic Emergencies" },
    { id: "airwayShock", name: "Airway / Shock" },
    { id: "ob", name: "OB Emergencies" },
    { id: "misc", name: "General / Misc" }
  ] },`,
    ],
    [
      `    { id: "throatAirway", name: "Throat / Airway" },`,
      `    { id: "throatAirway", name: "Nose / Throat / Airway" },`,
    ],
  ];

  for (const [pattern, newText] of replacements) {
    if (pattern instanceof RegExp) {
      if (!pattern.test(html)) throw new Error(`Category replacement not found: ${pattern}`);
      html = html.replace(pattern, newText);
    } else {
      if (!html.includes(pattern)) throw new Error(`Category replacement not found: ${pattern.slice(0, 80)}`);
      html = html.replace(pattern, newText);
    }
  }
}

function recategorizeLegacy(maps) {
  // Pulmonology: move old catch-all questions into new resident-facing bins.
  assign(maps, 38, 2, "vascular");
  assign(maps, 181, 2, "misc");
  assign(maps, 634, 2, "misc");
  assign(maps, 638, 2, "pleuralInterstitial");
  assign(maps, 753, 2, "sleep");
  assign(maps, 637, 2, "sleep");

  // Acute airway/shock items fit Emergency better than Pulmonology/Pediatrics.
  assign(maps, 44, 15, "airwayShock");
  assign(maps, 243, 15, "airwayShock");
  assign(maps, 701, 15, "airwayShock");

  // UTI infection content moves to ID urinary; structural urology stays Urology.
  assign(maps, 24, 8, "urinary");
  assign(maps, 590, 8, "urinary");
  assign(maps, 611, 8, "urinary");
  assign(maps, 743, 8, "urinary");

  // Infectious Disease remaps.
  assign(maps, 40, 8, "systemic");
  assign(maps, 48, 8, "systemic");
  assign(maps, 64, 8, "gi");
  assign(maps, 73, 8, "systemic");
  assign(maps, 198, 8, "systemic");
  assign(maps, 589, 8, "respiratory");
  assign(maps, 594, 8, "respiratory");
  assign(maps, 595, 8, "gi");
  assign(maps, 597, 8, "tickborne");
  assign(maps, 644, 8, "gi");
  assign(maps, 727, 8, "systemic");

  // HEENT remaps/backfill.
  assign(maps, 622, 8, "systemic");
  assign(maps, 813, 17, "eye");

  // Pediatric remaps/backfill into new bins.
  assign(maps, 29, 12, "misc");
  assign(maps, 80, 12, "misc");
  assign(maps, 135, 12, "wellChild");
  assign(maps, 196, 12, "adolescent");
  assign(maps, 254, 12, "misc");
  assign(maps, 338, 12, "misc");
  assign(maps, 537, 12, "neonatal");
  assign(maps, 542, 12, "neonatal");
  assign(maps, 554, 12, "wellChild");
  assign(maps, 558, 12, "wellChild");
  assign(maps, 559, 12, "wellChild");
  assign(maps, 793, 12, "adolescent");

  // Emergency remaps/backfill.
  assign(maps, 31, 15, "ob");
  assign(maps, 236, 15, "airwayShock");
  assign(maps, 244, 15, "airwayShock");
  assign(maps, 247, 15, "neuro");
  assign(maps, 251, 15, "ob");
  assign(maps, 253, 15, "misc");
  assign(maps, 258, 15, "misc");
  assign(maps, 262, 15, "airwayShock");
  assign(maps, 616, 15, "neuro");
  assign(maps, 621, 15, "neuro");
  assign(maps, 805, 15, "airwayShock");
  assign(maps, 808, 15, "airwayShock");

  // Dermatology backfill.
  assign(maps, 42, 10, "misc");
  assign(maps, 68, 10, "misc");
  assign(maps, 182, 10, "inflammatory");
  assign(maps, 191, 10, "misc");
  assign(maps, 603, 10, "misc");
  assign(maps, 607, 10, "misc");
}

function validateNewQuestions() {
  const ids = questions.map((q) => q.id);
  const expected = Array.from({ length: 67 }, (_, i) => 819 + i);
  if (ids.length !== 67) throw new Error(`Expected 67 questions, found ${ids.length}`);
  if (JSON.stringify(ids) !== JSON.stringify(expected)) {
    throw new Error(`IDs must be contiguous 819-885; found ${ids.join(",")}`);
  }
  const seen = new Set();
  for (const q of questions) {
    if (seen.has(q.id)) throw new Error(`Duplicate batch id ${q.id}`);
    seen.add(q.id);
    if (!CATEGORY_NAMES[q.categoryId]) throw new Error(`Q${q.id} invalid category ${q.categoryId}`);
    if (!SUBCATS[q.categoryId].includes(q.subcat)) {
      throw new Error(`Q${q.id} invalid subcat ${q.subcat} for category ${q.categoryId}`);
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) throw new Error(`Q${q.id} options invalid`);
    if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) {
      throw new Error(`Q${q.id} correctAnswer invalid`);
    }
    for (const field of ["question", "explanation", "bulletExplanation"]) {
      if (typeof q[field] !== "string" || !q[field].trim()) throw new Error(`Q${q.id} missing ${field}`);
    }
    const letter = String.fromCharCode(65 + q.correctAnswer);
    if (!q.explanation.startsWith(`CORRECT: ${letter}`)) {
      throw new Error(`Q${q.id} explanation must start with CORRECT: ${letter}`);
    }
    for (const header of ["CLINICAL MANIFESTATIONS:", "PATHOPHYSIOLOGY:", "DIAGNOSTIC APPROACH:", "MANAGEMENT:", "KEY POINTS:"]) {
      if (!q.explanation.includes(`\n\n${header}`)) throw new Error(`Q${q.id} missing ${header}`);
    }
    if (countWords(q.explanation) > 475) throw new Error(`Q${q.id} explanation ${countWords(q.explanation)} words (max 475)`);
    if (countWords(q.bulletExplanation) > 100) throw new Error(`Q${q.id} bullet ${countWords(q.bulletExplanation)} words (max 100)`);
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
    `\r\n/* BATCH 5 NEW QUESTIONS (819-885) — FM RESIDENCY EXPANSION */\r\n` +
    blocks.join(",\r\n");

  const markers = ["\r\n];\r\nconst GERIATRICS_CATEGORY_ID", "\n];\nconst GERIATRICS_CATEGORY_ID"];
  const marker = markers.find((m) => html.includes(m));
  if (!marker) throw new Error("Insert marker not found");
  if (html.includes("BATCH 5 NEW QUESTIONS")) throw new Error("Batch 5 already inserted");
  html = html.replace(marker, `,\r${insertBlock}` + marker);

  for (const q of questions) {
    maps[q.categoryId][q.id] = q.subcat;
  }
}

function finalValidate() {
  const qs = eval(html.match(/const QUESTIONS = (\[[\s\S]*?\n\]);/)[1]);
  const ids = qs.map((q) => q.id);
  const unique = new Set(ids);
  if (qs.length !== 877) throw new Error(`Expected 877 total questions, found ${qs.length}`);
  if (unique.size !== qs.length) throw new Error("Duplicate question IDs after insert");
  if (Math.max(...ids) !== 885) throw new Error(`Expected max ID 885, found ${Math.max(...ids)}`);
  const q24 = qs.find((q) => q.id === 24);
  const q611 = qs.find((q) => q.id === 611);
  if (q24.categoryId !== 8 || q611.categoryId !== 8) {
    throw new Error("UTI recategorization failed");
  }
  if (!html.includes('const startQuiz = (count) =>')) throw new Error("startQuiz missing");
  if (!html.includes("const getEligibleQuestions = (prog")) {
    throw new Error("New-question-only quiz semantics changed");
  }
}

validateNewQuestions();
updateCategoryDefinitions();

const maps = Object.fromEntries(
  Object.entries(MAP_NAMES).map(([catId, name]) => [Number(catId), getMap(name)])
);

recategorizeLegacy(maps);
insertQuestions(maps);

for (const [catId, name] of Object.entries(MAP_NAMES)) {
  replaceMap(name, maps[Number(catId)]);
}

finalValidate();
fs.writeFileSync(indexPath, html, "utf8");

console.log("Inserted Batch 5 questions 819-885 and updated taxonomy.");
console.log("Total questions: 877; max ID: 885.");
