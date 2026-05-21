/**
 * Pass 3: fine-tune batch 2 explanations into 400-425 words
 */
const fs = require("fs");
const path = require("path");

const extra3 = {
  749: "Inhaler technique review at every visit improves outcomes more than blind regimen escalation. Document exacerbation history annually to guide ICS decisions and pulmonary referral timing.",
  752: "Document symptom severity and medication response to guide step-up or referral. Eye symptoms may improve with intranasal steroid plus intranasal antihistamine combination spray when monotherapy fails.",
  753: "Document Epworth score and BP response after OSA treatment at follow-up visits. CPAP adherence data should be reviewed with sleep medicine when residual symptoms persist despite adequate usage hours.",
  755: "Primary care should not provide prolonged PPI monotherapy as substitute for endoscopy when alarm features present. Coordinate nutrition support if dysphagia limits oral intake before definitive diagnosis.",
  756: "Average-risk screening programs depend on closing the loop from positive FIT to colonoscopy—use tracking systems and patient navigation when available.",
  757: "Repeat ALT and FIB-4 every 1–2 years in patients with metabolic risk to detect fibrosis progression early.",
  758: "Mild traveler's diarrhea resolves in most healthy adults within 3–5 days with supportive care alone.",
  759: "Insurance prior authorization for CGM may require documenting hypoglycemia frequency and A1c above individualized target despite optimized therapy.",
  760: "Partner with diabetes educator to reinforce meal timing and carbohydrate consistency when secretagogues cannot be immediately discontinued.",
  761: "Bone density screening may be appropriate in postmenopausal women with overt or long-standing untreated hypothyroidism.",
  762: "Plasma aldosterone and renin should be drawn with standardized conditions—morning sample, seated posture when protocol allows—for interpretable ARR results.",
  763: "Screen for eating disorders and unrealistic expectations before initiating anti-obesity pharmacotherapy to support sustainable outcomes.",
  764: "Time-sensitive TIA management within 24 hours reduces early recurrent stroke—use expedited pathways when available in your health system.",
  765: "Maintain low diagnostic threshold: a single missed SAH carries catastrophic consequences; neurology consultation is appropriate when workup is incomplete.",
  766: "Periodic reassessment of ferritin and symptoms guides duration of iron therapy before declaring treatment failure.",
  767: "Fall risk increases with painful neuropathy and sedating neuropathic agents—counsel on nighttime safety and driving when paresthesias affect feet."
};

const trim3 = {
  744: "Primary care should track weight, edema, and functional status at each visit and adjust diuretics seasonally when HFpEF patients retain fluid during heat or dietary indiscretion. Patient activation—daily weights and action plans for 2–3 lb gain—reduces emergency visits.",
  745: "For rate control, reassess symptoms and resting heart rate at 2–4 weeks; uptitrate beta-blocker as tolerated. If ventricular rates remain elevated, consider adding digoxin in selected patients or referral for rhythm control discussion.",
  746: "Document ASCVD risk discussion and statin choice in the medical record for quality metrics. In women of childbearing potential, counsel on contraception with statins."
};

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

function patchExplanation(id, transform) {
  const re = new RegExp(
    `(\\{\\s*"id": ${id},[\\s\\S]*?"explanation": ")([\\s\\S]*?)(",\\s*\\r?\\n\\s*"bulletExplanation")`
  );
  const m = html.match(re);
  if (!m) return;
  let exp = m[2].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  exp = transform(exp);
  const expJson = JSON.stringify(exp).slice(1, -1);
  html = html.replace(re, `$1${expJson}$3`);
  const w = countWords(exp);
  const flag = w < 400 || w > 425 ? " ***" : "";
  console.log(`Q${id} -> ${w} words${flag}`);
}

for (const [id, add] of Object.entries(extra3)) {
  patchExplanation(id, (exp) => {
    if (exp.includes(add.slice(0, 30))) return exp;
    return exp.replace(/\n\nKEY POINTS:/, `\n\n${add}\n\nKEY POINTS:`);
  });
}

for (const [id, old] of Object.entries(trim3)) {
  patchExplanation(id, (exp) => exp.replace(old + "\n\n", ""));
}

fs.writeFileSync(indexPath, html);
