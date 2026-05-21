/**
 * Batch 2: 25 questions (744-768) — CV, Pulm, GI, Endo, Neuro
 * Run: node scripts/batch2-insert.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const indexPath = path.join(root, "index.html");
const questions = require("./batch2-questions.json");

let html = fs.readFileSync(indexPath, "utf8");

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

const blocks = questions.map((q) => {
  const lines = [
    "      {",
    `    "id": ${q.id},`,
    `    "categoryId": ${q.categoryId},`,
  ];
  if (q.imageReady) {
    lines.push(`    "questionImages": [],`);
    lines.push(`    "explanationImages": [],`);
  }
  lines.push(`    "question": ${JSON.stringify(q.question)},`);
  lines.push(`    "options": ${JSON.stringify(q.options)},`);
  lines.push(`    "correctAnswer": ${q.correctAnswer},`);
  lines.push(`    "explanation": ${JSON.stringify(q.explanation)},`);
  lines.push(`    "bulletExplanation": ${JSON.stringify(q.bulletExplanation)}`);
  lines.push("  }");
  return lines.join("\r\n");
});

const imageIds = questions.filter((q) => q.imageReady).map((q) => q.id).join(",");
const insertBlock =
  `\r\n/* BATCH 2 NEW QUESTIONS (744-768) — IMAGE-READY IDs: ${imageIds} */\r\n` +
  blocks.join(",\r\n");

const markers = ["\r\n];\r\nconst GERIATRICS_CATEGORY_ID", "\n];\nconst GERIATRICS_CATEGORY_ID"];
const marker = markers.find((m) => html.includes(m));
if (!marker) throw new Error("Insert marker not found");
html = html.replace(marker, insertBlock + marker);

// Update SUBCAT maps
const maps = {
  CV_SUBCAT: 1,
  PULM_SUBCAT: 2,
  GI_SUBCAT: 3,
  ENDO_SUBCAT: 4,
  NEURO_SUBCAT: 6,
};

const mapNames = {
  1: "CV_SUBCAT",
  2: "PULM_SUBCAT",
  3: "GI_SUBCAT",
  4: "ENDO_SUBCAT",
  6: "NEURO_SUBCAT",
};

for (const q of questions) {
  const mapName = mapNames[q.categoryId];
  const re = new RegExp(`const ${mapName} = \\{([\\s\\S]*?)\\};`);
  const m = html.match(re);
  if (!m) throw new Error(`${mapName} not found`);
  const body = m[1].trim();
  const entry = `  ${q.id}:"${q.subcat}"`;
  if (body.endsWith(",")) {
    html = html.replace(re, `const ${mapName} = {${body}\r\n${entry}\r\n};`);
  } else {
    html = html.replace(re, `const ${mapName} = {${body},\r\n${entry}\r\n};`);
  }
}

fs.writeFileSync(indexPath, html, "utf8");

console.log("Inserted batch 2 questions 744-768\n");
let outOfRange = 0;
questions.forEach((q) => {
  const ew = countWords(q.explanation);
  const bw = countWords(q.bulletExplanation);
  const flag = ew < 400 || ew > 425 ? " ***" : "";
  if (flag) outOfRange++;
  console.log(`  ${q.id} [${q.subcat}]: explanation=${ew}w, bullets=${bw}w${flag}`);
});
console.log(`\nOut of 400-425 range: ${outOfRange}/${questions.length}`);
