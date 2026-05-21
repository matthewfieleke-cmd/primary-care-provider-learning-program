const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const indexPath = path.join(root, "index.html");
const questionsPath = path.join(__dirname, "geri-add10-questions.json");

let html = fs.readFileSync(indexPath, "utf8");
const questions = JSON.parse(fs.readFileSync(questionsPath, "utf8"));

// Build question blocks
const blocks = questions.map((q) => {
  const { subcat, ...rest } = q;
  const lines = [
    "      {",
    `    "id": ${rest.id},`,
    `    "categoryId": ${rest.categoryId},`,
  ];
  if (rest.questionImages !== undefined) {
    lines.push(`    "questionImages": ${JSON.stringify(rest.questionImages)},`);
  }
  if (rest.explanationImages !== undefined) {
    lines.push(`    "explanationImages": ${JSON.stringify(rest.explanationImages)},`);
  }
  lines.push(`    "question": ${JSON.stringify(rest.question)},`);
  lines.push(`    "options": ${JSON.stringify(rest.options)},`);
  lines.push(`    "correctAnswer": ${rest.correctAnswer},`);
  lines.push(`    "explanation": ${JSON.stringify(rest.explanation)},`);
  lines.push(`    "bulletExplanation": ${JSON.stringify(rest.bulletExplanation)}`);
  lines.push("  }");
  return lines.join("\r\n");
});

const insertBlock = `\r\n/* GERIATRICS ADD-10 (734-743) — IMAGE-READY IDs: 734,735,736,740,743 */\r\n` + blocks.join(",\r\n");

// Insert before closing QUESTIONS array
const markers = ["\r\n];\r\nconst GERIATRICS_CATEGORY_ID", "\n];\nconst GERIATRICS_CATEGORY_ID"];
let marker = markers.find((m) => html.includes(m));
if (!marker) throw new Error("Insert marker not found");
html = html.replace(marker, insertBlock + marker);

// Update GERI_SUBCAT
const subcatEntries = questions.map((q) => `  ${q.id}:"${q.subcat}"`).join(",\r\n");
const geriSubcatRe = /const GERI_SUBCAT = \{[\s\S]*?\};/;
const geriMatch = html.match(geriSubcatRe);
if (!geriMatch) throw new Error("GERI_SUBCAT not found");
const existing = geriMatch[0];
const newSubcat = existing.replace(
  /  713:"mobility"\r?\n\};/,
  `  713:"mobility",\r\n${subcatEntries}\r\n};`
);
html = html.replace(geriSubcatRe, newSubcat);

// Update GERIATRICS_EXEMPT
const exemptIds = questions.map((q) => q.id).join(",");
const exemptRe = /(709,710,711,712,713)\r?\n\]\);/;
if (!exemptRe.test(html)) throw new Error("GERIATRICS_EXEMPT marker not found");
html = html.replace(exemptRe, `$1,\r\n  ${exemptIds}\r\n]);`);

fs.writeFileSync(indexPath, html, "utf8");

// Word counts
function countWords(s) {
  return s.split(/\s+/).filter(Boolean).length;
}
console.log("Inserted questions 734-743");
questions.forEach((q) => {
  const ew = countWords(q.explanation);
  const bw = countWords(q.bulletExplanation);
  console.log(`  ${q.id} [${q.subcat}]: explanation=${ew}w, bullets=${bw}w`);
});
