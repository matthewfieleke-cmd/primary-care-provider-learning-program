/**
 * Batch 4: 25 questions (794-818) — Rheum, Onco, ER, HEENT, Preventive (2nd tranche)
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const indexPath = path.join(root, "index.html");

const parts = [1, 2, 3, 4, 5].map((n) =>
  require(`./batch4-questions-part${n}.json`)
);
const questions = parts.flat();

fs.writeFileSync(
  path.join(__dirname, "batch4-questions.json"),
  JSON.stringify(questions, null, 2)
);

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
  `\r\n/* BATCH 4 NEW QUESTIONS (794-818) — IMAGE-READY IDs: ${imageIds} */\r\n` +
  blocks.join(",\r\n");

const markers = ["\r\n];\r\nconst GERIATRICS_CATEGORY_ID", "\n];\nconst GERIATRICS_CATEGORY_ID"];
const marker = markers.find((m) => html.includes(m));
if (!marker) throw new Error("Insert marker not found");
html = html.replace(marker, `,\r${insertBlock}` + marker);

const mapNames = {
  13: "RHEUM_SUBCAT",
  14: "ONCO_SUBCAT",
  15: "ER_SUBCAT",
  16: "PREV_SUBCAT",
  17: "HEENT_SUBCAT",
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

console.log("Inserted batch 4 questions 794-818\n");
questions.forEach((q) => {
  const ew = countWords(q.explanation);
  console.log(`  ${q.id} [${q.subcat}]: explanation=${ew}w`);
});
