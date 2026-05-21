const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");
const NEW = require("./batch1-questions.json");

function serializeQuestion(q) {
  const parts = ["  {", `    "id": ${q.id},`, `    "categoryId": ${q.categoryId},`];
  if (q.imageReady) parts.push(`    "questionImages": [],`);
  parts.push(`    "question": ${JSON.stringify(q.question)},`);
  parts.push(`    "options": ${JSON.stringify(q.options)},`);
  parts.push(`    "correctAnswer": ${q.correctAnswer},`);
  if (q.imageReady) parts.push(`    "explanationImages": [],`);
  parts.push(`    "explanation": ${JSON.stringify(q.explanation)},`);
  parts.push(`    "bulletExplanation": ${JSON.stringify(q.bulletExplanation)}`);
  parts.push("  }");
  return parts.join("\n");
}

if (html.includes('"id": 709')) {
  console.log("Questions already inserted");
  process.exit(0);
}

const marker = "\r\n];\r\nconst GERIATRICS_CATEGORY_ID = 19;";
const idx = html.indexOf(marker);
if (idx < 0) {
  console.error("Marker not found");
  process.exit(1);
}

const block =
  ",\n/* BATCH 1 NEW QUESTIONS (709-733) — IMAGE-READY IDs: 709,710,716,721,722,725,726,729 */\n" +
  NEW.map(serializeQuestion).join(",\n");

html = html.slice(0, idx) + block + html.slice(idx);
fs.writeFileSync(indexPath, html);

const questions = eval(html.match(/const QUESTIONS = (\[[\s\S]*?\n\]);/)[1]);
console.log("Inserted. Total:", questions.length, "Max ID:", Math.max(...questions.map((q) => q.id)));
