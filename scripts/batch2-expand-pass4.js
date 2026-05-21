const fs = require("fs");
const path = require("path");
const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

function patch(id, transform) {
  const re = new RegExp(
    `(\\{\\s*"id": ${id},[\\s\\S]*?"explanation": ")([\\s\\S]*?)(",\\s*\\r?\\n\\s*"bulletExplanation")`
  );
  const m = html.match(re);
  if (!m) return;
  let exp = m[2].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  exp = transform(exp);
  html = html.replace(re, `$1${JSON.stringify(exp).slice(1, -1)}$3`);
  console.log(`Q${id} -> ${countWords(exp)} words`);
}

const adds = {
  757: "Counsel patients that even modest weight loss improves liver histology and cardiometabolic risk concurrently.",
  758: "Oral rehydration solution is preferred over sugary drinks or plain water alone when stool losses are high.",
  760: "Recheck glucose and medication list at two-week follow-up after any hypoglycemic event on secretagogues.",
  761: "Levothyroxine absorption improves with consistent timing; separate from calcium and iron supplements by several hours.",
  762: "Unexplained hypokalemia on any antihypertensive regimen should prompt consideration of primary aldosteronism screening.",
  763: "Combination with metformin is common and generally well tolerated when GLP-1 therapy is added for obesity and T2DM.",
  765: "Coordinate with emergency department protocols when transferring thunderclap headache patients for LP or CTA after hours.",
  766: "Distinguish RLS from nocturnal leg cramps and peripheral arterial disease through history and exam before labeling idiopathic RLS.",
  767: "Screening for depression is appropriate because chronic neuropathic pain frequently coexists with mood disorders in diabetes."
};

for (const [id, add] of Object.entries(adds)) {
  patch(Number(id), (exp) => exp.replace(/\n\nKEY POINTS:/, `\n\n${add}\n\nKEY POINTS:`));
}

patch(744, (exp) => exp.replace(
  "When eGFR declines below SGLT2 thresholds, consult cardiology for alternative GDMT rather than abrupt withdrawal without plan.\n\n",
  ""
));
patch(745, (exp) => exp.replace(
  "Document shared decision-making about anticoagulation benefits and bleeding risks in the chart; ensure follow-up within one week of initiating DOAC to confirm tolerance and adherence.\n\n",
  ""
));
patch(746, (exp) => exp.replace(
  "Evaluate secondary dyslipidemia (hypothyroidism, nephrotic syndrome) if LDL disproportionately elevated despite therapy. ",
  ""
));

fs.writeFileSync(indexPath, html);

// Final report
const reAll = /"id": (\d+),[\s\S]*?"explanation": "([\s\S]*?)",\s*\r?\n\s*"bulletExplanation"/g;
let m;
const report = [];
while ((m = reAll.exec(html)) !== null) {
  const id = +m[1];
  if (id < 744 || id > 768) continue;
  const w = countWords(m[2].replace(/\\n/g, "\n"));
  report.push({ id, w, ok: w >= 400 && w <= 425 });
}
report.sort((a, b) => a.id - b.id);
report.forEach(({ id, w, ok }) => console.log(`${ok ? "OK" : "!!"} Q${id}: ${w}w`));
