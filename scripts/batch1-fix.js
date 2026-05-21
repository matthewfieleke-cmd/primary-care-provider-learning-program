const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");
const NEW_QUESTIONS = require("./batch1-questions.json");

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

function serializeQuestion(q) {
  const parts = [`  {`, `    "id": ${q.id},`, `    "categoryId": ${q.categoryId},`];
  if (q.imageReady) parts.push(`    "questionImages": [],`);
  parts.push(`    "question": ${JSON.stringify(q.question)},`);
  parts.push(`    "options": ${JSON.stringify(q.options, null, 2).replace(/\n/g, "\n    ")},`);
  parts.push(`    "correctAnswer": ${q.correctAnswer},`);
  if (q.imageReady) parts.push(`    "explanationImages": [],`);
  parts.push(`    "explanation": ${JSON.stringify(q.explanation)},`);
  parts.push(`    "bulletExplanation": ${JSON.stringify(q.bulletExplanation)}`);
  parts.push(`  }`);
  return parts.join("\n");
}

if (!html.includes('"id": 709')) {
  const block =
    ",\n/* BATCH 1 NEW QUESTIONS (709-733) — IMAGE-READY IDs: 709,710,716,721,722,725,726,729 */\n" +
    NEW_QUESTIONS.map(serializeQuestion).join(",\n");
  html = html.replace(
    /(\n  \}\n\];\nconst GERIATRICS_CATEGORY_ID = 19;)/,
    block + "$1"
  );
}

if (!html.includes("5:UROLOGY_SUBCAT")) {
  html = html.replace(
    "  13:RHEUM_SUBCAT, 14:ONCO_SUBCAT, 15:ER_SUBCAT, 16:PREV_SUBCAT, 17:HEENT_SUBCAT\n};",
    "  13:RHEUM_SUBCAT, 14:ONCO_SUBCAT, 15:ER_SUBCAT, 16:PREV_SUBCAT, 17:HEENT_SUBCAT,\n  5:UROLOGY_SUBCAT, 8:ID_SUBCAT, 18:WH_SUBCAT, 19:GERI_SUBCAT\n};"
  );
}

if (!html.includes('729:"screening"')) {
  html = html.replace(
    '657:"exerciseLifestyle",658:"exerciseLifestyle"\n};',
    '657:"exerciseLifestyle",658:"exerciseLifestyle",\n  729:"screening",730:"nutrition",731:"exerciseLifestyle",732:"screening",733:"misc"\n};'
  );
}

if (!html.includes("Geriatrics auto-reassignment disabled")) {
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
}

if (!html.includes("709,710,711")) {
  html = html.replace(
    "  703,704,708\n]);",
    "  703,704,708,\n  709,710,711,712,713\n]);"
  );
}

fs.writeFileSync(indexPath, html);

const qMatch = html.match(/const QUESTIONS = (\[[\s\S]*?\n\]);/);
const questions = eval(qMatch[1]);
console.log("Questions:", questions.length, "max id:", Math.max(...questions.map((q) => q.id)));
console.log("Has 709:", questions.some((q) => q.id === 709));
console.log("SUBCAT_MAPS has urology:", /5:UROLOGY_SUBCAT/.test(html));

for (const q of NEW_QUESTIONS) {
  const inserted = questions.find((x) => x.id === q.id);
  if (!inserted) console.error("MISSING", q.id);
  else
    console.log(
      `Q${q.id} expl=${countWords(inserted.explanation)}w bullet=${countWords(inserted.bulletExplanation)}w`
    );
}
