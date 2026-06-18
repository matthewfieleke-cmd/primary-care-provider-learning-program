const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const ASSIGNMENTS = {
  2: "thyroid",
  8: "diabetes",
  33: "thyroid",
  50: "diabetes",
  59: "diabetes",
  70: "thyroid",
  77: "diabetes",
  86: "diabetes",
  88: "diabetes",
  90: "obesity",
  92: "obesity",
  96: "obesity",
  104: "obesity",
  106: "obesity",
  112: "misc",
  114: "obesity",
  115: "diabetes",
  120: "obesity",
  125: "diabetes",
  132: "diabetes",
  140: "obesity",
  175: "thyroid",
  195: "pituitaryAdrenal",
  209: "diabetes",
  213: "thyroid",
  224: "pituitaryAdrenal",
  246: "pituitaryAdrenal",
  261: "thyroid",
  267: "diabetes",
  277: "obesity",
  306: "diabetes",
  315: "thyroid",
  358: "thyroid",
  364: "diabetes",
  414: "pituitaryAdrenal",
  415: "pituitaryAdrenal",
  416: "pituitaryAdrenal",
  417: "pituitaryAdrenal",
  418: "pituitaryAdrenal",
  419: "pituitaryAdrenal",
  420: "diabetes",
  421: "pituitaryAdrenal",
  422: "thyroid",
  424: "pituitaryAdrenal",
  425: "pituitaryAdrenal",
  426: "diabetes",
  427: "pituitaryAdrenal",
  428: "thyroid",
  429: "pituitaryAdrenal",
  430: "thyroid",
  431: "diabetes",
  432: "pituitaryAdrenal",
  433: "misc",
  434: "pituitaryAdrenal",
  435: "obesity",
  437: "obesity",
  438: "pituitaryAdrenal",
  439: "pituitaryAdrenal",
  440: "thyroid",
  441: "misc",
  442: "pituitaryAdrenal",
  521: "thyroid",
  560: "diabetes",
  571: "diabetes",
  572: "diabetes",
  581: "obesity",
  648: "diabetes",
  660: "diabetes",
  759: "diabetes",
  760: "diabetes",
  761: "thyroid",
  762: "pituitaryAdrenal",
  763: "obesity",
};

const VALID = new Set(["diabetes", "thyroid", "pituitaryAdrenal", "obesity", "misc"]);
const qs = eval(html.match(/const QUESTIONS = (\[[\s\S]*?\n\]);/)[1]);
const endoIds = qs.filter((q) => q.categoryId === 4).map((q) => q.id).sort((a, b) => a - b);

for (const id of endoIds) {
  if (!ASSIGNMENTS[id]) throw new Error(`Missing assignment for Endocrine question ${id}`);
}
for (const id of Object.keys(ASSIGNMENTS).map(Number)) {
  const q = qs.find((item) => item.id === id);
  if (!q || q.categoryId !== 4) throw new Error(`Assignment ${id} is not an Endocrine question`);
  if (!VALID.has(ASSIGNMENTS[id])) throw new Error(`Invalid subcategory for ${id}`);
}
if (endoIds.length !== 73) throw new Error(`Expected 73 Endocrine questions, found ${endoIds.length}`);

const re = /const ENDO_SUBCAT = \{[\s\S]*?\};/;
const entries = endoIds.map((id) => `  ${id}:"${ASSIGNMENTS[id]}"`);
html = html.replace(re, `const ENDO_SUBCAT = {\r\n${entries.join(",\r\n")}\r\n};`);

fs.writeFileSync(indexPath, html, "utf8");

const counts = {};
for (const id of endoIds) counts[ASSIGNMENTS[id]] = (counts[ASSIGNMENTS[id]] || 0) + 1;
console.log(JSON.stringify({ total: endoIds.length, counts }, null, 2));
