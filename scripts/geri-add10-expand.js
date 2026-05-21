const fs = require("fs");
const path = require("path");

const extra = {
  734: "Hospital delirium prevention bundles (orientation boards, sleep protocols, minimizing nighttime vitals) reduce incidence when applied proactively. If antipsychotics are used, monitor QTc and avoid benzo co-prescription. Document delirium in the discharge summary so primary care can watch for persistent post-hospital cognitive change.",
  735: "Caregiver education on avoiding arguing, simplifying commands, and using distraction reduces escalation. Occupational therapy can recommend home safety modifications. If antipsychotics are used, document indication, dose, duration limit, and planned taper at each visit.",
  736: "Screen for social isolation and food insecurity, which accelerate frailty trajectories. Physical therapy referral should specify progressive resistance and gait training goals. When weight loss persists despite initial workup, escalate cancer screening and consider geriatrics co-management.",
  737: "Before starting bisphosphonates, ensure dental evaluation when possible and counsel on rare osteonecrosis of the jaw with invasive dental procedures. For patients unable to sit upright 30–60 minutes, consider IV zoledronic acid or denosumab. Reassess fracture risk in 3–5 years for drug holidays when appropriate.",
  738: "Document taper plan in the chart with patient/caregiver agreement. Warn that rebound insomnia peaks in the first 1–2 weeks. If anxiety disorder coexists, treat with non-sedating SSRI/SNRI rather than replacing one sedative with another.",
  739: "Review all OTC products including sleep aids, allergy medications, and bladder supplements. Parkinson patients are especially sensitive—coordinate changes with neurology. Repeat MoCA or cognitive screen 3 months after deprescribing to assess improvement.",
  740: "Involve dietitian when albumin is low or oral intake remains inadequate after treating depression and dental issues. Consider medication review for drugs causing anorexia (digoxin toxicity, SSRIs early on). Repeat weight at every visit until stable for three months.",
  741: "Confirm health care proxy/agent understands POLST complements—not replaces—surrogate decision-making. In states without POLST, document equivalent portable DNR/medical orders per local law. Review orders after any change in clinical status or care setting transfer.",
  742: "Cerumen impaction is a common reversible cause—irrigate when safe before formal audiology. Hearing aid adherence improves with follow-up tuning and family support. Reassess PHQ-9 because untreated hearing loss contributes to depression and isolation.",
  743: "Postvoid residual measurement helps distinguish retention overflow from urge incontinence when anticholinergics are present. Prompted voiding every 2–3 hours reduces accidents during delirium recovery. Reevaluate need for bladder medications only after acute illness resolves and cognition stabilizes."
};

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

for (const [id, add] of Object.entries(extra)) {
  const re = new RegExp(
    `(\\{\\s*"id": ${id},[\\s\\S]*?"explanation": ")([\\s\\S]*?)(",\\s*\\r?\\n\\s*"bulletExplanation")`
  );
  const m = html.match(re);
  if (!m) {
    console.log(`Skip Q${id}`);
    continue;
  }
  let exp = m[2].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  if (exp.includes(add.slice(0, 40))) {
    console.log(`Q${id} already expanded (${countWords(exp)}w)`);
    continue;
  }
  exp = exp.replace(/\n\nKEY POINTS:/, `\n\n${add}\n\nKEY POINTS:`);
  const expJson = JSON.stringify(exp).slice(1, -1);
  html = html.replace(re, `$1${expJson}$3`);
  console.log(`Q${id} -> ${countWords(exp)} words`);
}

fs.writeFileSync(indexPath, html);
