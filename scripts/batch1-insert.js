/**
 * Batch 1: subcategories + 25 questions (709-733)
 * Run: node scripts/batch1-insert.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const indexPath = path.join(root, "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const UROLOGY_SUBCAT = {
  18: "luts", 24: "luts", 71: "misc", 189: "luts", 312: "luts", 609: "luts", 611: "luts", 612: "luts", 613: "luts",
  22: "nephrology", 178: "nephrology", 201: "nephrology", 204: "nephrology", 586: "nephrology",
  610: "stone",
  43: "scrotal", 465: "scrotal", 614: "scrotal"
};

const ID_SUBCAT = {
  14: "sti", 591: "sti", 593: "sti", 596: "sti", 598: "sti",
  702: "respiratory",
  40: "misc", 48: "misc", 58: "misc", 64: "misc", 73: "misc", 198: "misc", 356: "misc",
  589: "misc", 590: "misc", 594: "misc", 595: "misc", 597: "misc", 644: "misc"
};

const WH_SUBCAT = {
  13: "gynecologic", 180: "gynecologic", 662: "gynecologic", 664: "gynecologic", 666: "gynecologic",
  668: "gynecologic", 671: "gynecologic", 680: "gynecologic", 683: "gynecologic", 684: "gynecologic",
  47: "pregnancy", 307: "pregnancy", 423: "pregnancy", 436: "pregnancy", 661: "pregnancy",
  670: "pregnancy", 672: "pregnancy", 673: "pregnancy", 676: "pregnancy", 689: "pregnancy",
  101: "reproductive", 123: "reproductive", 134: "reproductive", 231: "reproductive", 309: "reproductive",
  583: "reproductive", 663: "reproductive", 665: "reproductive", 667: "reproductive", 669: "reproductive",
  674: "reproductive", 675: "reproductive", 681: "reproductive", 685: "reproductive", 688: "reproductive"
};

const GERI_SUBCAT = {};

const NEW_QUESTIONS = require("./batch1-questions.json");

function formatSubcat(obj) {
  const lines = Object.entries(obj)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([id, sub]) => `  ${id}:"${sub}"`);
  return lines.join(",\n");
}

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

function validateQuestions(questions) {
  for (const q of questions) {
    const w = countWords(q.explanation);
    const bw = countWords(q.bulletExplanation);
    if (w > 475) throw new Error(`Q${q.id} explanation ${w} words (max 475)`);
    if (bw > 100) throw new Error(`Q${q.id} bullet ${bw} words (max 100)`);
    if (!q.options || q.options.length !== 4) throw new Error(`Q${q.id} needs 4 options`);
  }
}

validateQuestions(NEW_QUESTIONS);

for (const q of NEW_QUESTIONS) {
  if (q.subcategory) {
    const mapKey = { 5: UROLOGY_SUBCAT, 8: ID_SUBCAT, 18: WH_SUBCAT, 19: GERI_SUBCAT, 16: null }[q.categoryId];
    if (q.categoryId === 19) GERI_SUBCAT[q.id] = q.subcategory;
    else if (q.categoryId === 16) {
      /* PREV_SUBCAT updated separately below */
    } else if (mapKey) mapKey[q.id] = q.subcategory;
  }
}

const PREV_NEW = {
  729: "screening", 730: "nutrition", 731: "exerciseLifestyle", 732: "screening", 733: "misc"
};

// --- CATEGORIES ---
html = html.replace(
  `{ id: 5, name: "Urology", icon: "kidneys", color: "#F4A261" },`,
  `{ id: 5, name: "Urology", icon: "kidneys", color: "#F4A261", subcategories: [
    { id: "luts", name: "Lower Urinary Tract / Prostate" },
    { id: "stone", name: "Nephrolithiasis" },
    { id: "scrotal", name: "Scrotal / Testicular" },
    { id: "nephrology", name: "Nephrology / CKD" },
    { id: "misc", name: "General / Misc" }
  ] },`
);

html = html.replace(
  `{ id: 8, name: "Infectious Disease", icon: "virus", color: "#0F766E" },`,
  `{ id: 8, name: "Infectious Disease", icon: "virus", color: "#0F766E", subcategories: [
    { id: "respiratory", name: "Respiratory / ENT Infections" },
    { id: "sti", name: "STI / HIV" },
    { id: "skinSoftTissue", name: "Skin / Soft Tissue" },
    { id: "misc", name: "General / Misc" }
  ] },`
);

html = html.replace(
  `{ id: 18, name: "Women's Health", icon: "womens", color: "#E88BC4" },`,
  `{ id: 18, name: "Women's Health", icon: "womens", color: "#E88BC4", subcategories: [
    { id: "reproductive", name: "Reproductive / Contraception" },
    { id: "pregnancy", name: "Pregnancy / Postpartum" },
    { id: "gynecologic", name: "Gynecologic" },
    { id: "misc", name: "General / Misc" }
  ] },`
);

html = html.replace(
  `{ id: 19, name: "Geriatrics", icon: "wizard", color: "#6B7280" }`,
  `{ id: 19, name: "Geriatrics", icon: "wizard", color: "#6B7280", subcategories: [
    { id: "cognitive", name: "Cognition / Delirium" },
    { id: "mobility", name: "Falls / Mobility / Frailty" },
    { id: "polypharmacy", name: "Polypharmacy / Deprescribing" },
    { id: "misc", name: "General / Misc" }
  ] }`
);

// --- SUBCAT MAPS insert before SUBCAT_MAPS ---
const subcatBlock = `const UROLOGY_SUBCAT = {
${formatSubcat(UROLOGY_SUBCAT)}
};
const ID_SUBCAT = {
${formatSubcat(ID_SUBCAT)}
};
const WH_SUBCAT = {
${formatSubcat(WH_SUBCAT)}
};
const GERI_SUBCAT = {
${formatSubcat(GERI_SUBCAT)}
};
`;

html = html.replace("const SUBCAT_MAPS = {", subcatBlock + "const SUBCAT_MAPS = {");

html = html.replace(
  "  13:RHEUM_SUBCAT, 14:ONCO_SUBCAT, 15:ER_SUBCAT, 16:PREV_SUBCAT, 17:HEENT_SUBCAT\n};",
  "  13:RHEUM_SUBCAT, 14:ONCO_SUBCAT, 15:ER_SUBCAT, 16:PREV_SUBCAT, 17:HEENT_SUBCAT,\n  5:UROLOGY_SUBCAT, 8:ID_SUBCAT, 18:WH_SUBCAT, 19:GERI_SUBCAT\n};"
);

// PREV_SUBCAT append
html = html.replace(
  '  657:"exerciseLifestyle",658:"exerciseLifestyle"\n};',
  `  657:"exerciseLifestyle",658:"exerciseLifestyle",\n  729:"screening",730:"nutrition",731:"exerciseLifestyle",732:"screening",733:"misc"\n};`
);

// Disable geriatrics auto-reassignment
html = html.replace(
  `for (const question of QUESTIONS) {
  if (!GERIATRICS_EXEMPT.has(question.id) && isGeriatricsQuestion(question.question)) {
    question.categoryId = GERIATRICS_CATEGORY_ID;
  }
}`,
  `// Geriatrics auto-reassignment disabled: questions stay in their authored category.
// for (const question of QUESTIONS) {
//   if (!GERIATRICS_EXEMPT.has(question.id) && isGeriatricsQuestion(question.question)) {
//     question.categoryId = GERIATRICS_CATEGORY_ID;
//   }
// }`
);

// Update GERIATRICS_EXEMPT with new geriatrics IDs
html = html.replace(
  "  703,704,708\n]);",
  "  703,704,708,\n  709,710,711,712,713\n]);"
);

function serializeQuestion(q) {
  const parts = [`  {`, `    "id": ${q.id},`, `    "categoryId": ${q.categoryId},`];
  if (q.questionImages && q.questionImages.length) {
    parts.push(`    "questionImages": ${JSON.stringify(q.questionImages, null, 2).replace(/\n/g, "\n    ")},`);
  } else if (q.imageReady) {
    parts.push(`    "questionImages": [],`);
  }
  parts.push(`    "question": ${JSON.stringify(q.question)},`);
  parts.push(`    "options": ${JSON.stringify(q.options, null, 2).replace(/\n/g, "\n    ")},`);
  parts.push(`    "correctAnswer": ${q.correctAnswer},`);
  if (q.explanationImages && q.explanationImages.length) {
    parts.push(`    "explanationImages": ${JSON.stringify(q.explanationImages, null, 2).replace(/\n/g, "\n    ")},`);
  } else if (q.imageReady) {
    parts.push(`    "explanationImages": [],`);
  }
  parts.push(`    "explanation": ${JSON.stringify(q.explanation)},`);
  parts.push(`    "bulletExplanation": ${JSON.stringify(q.bulletExplanation)}`);
  parts.push(`  }`);
  return parts.join("\n");
}

const questionsJson = NEW_QUESTIONS.map(serializeQuestion).join(",\n");
html = html.replace(
  /(\n  \}\n\];\nconst GERIATRICS_CATEGORY_ID)/,
  `,\n/* BATCH 1 NEW QUESTIONS (709-733) — IMAGE-READY IDs: 709,710,716,721,722,725,726,729 */\n${questionsJson}\n$1`
);

fs.writeFileSync(indexPath, html);
console.log("Batch 1 inserted:", NEW_QUESTIONS.length, "questions");
for (const q of NEW_QUESTIONS) {
  console.log(`  Q${q.id} cat${q.categoryId} expl=${countWords(q.explanation)}w bullet=${countWords(q.bulletExplanation)}w`);
}
