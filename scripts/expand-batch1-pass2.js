const fs = require("fs");
const path = require("path");

const extra = {
  710: "Consider referral to a falls clinic when available. Evaluate vitamin D level and supplement if deficient, especially with osteoporosis history. Document high-risk medications and attempt dose reduction before adding new fall-prevention drugs.",
  711: "Engage shared decision-making: some patients prefer continued PPI for fear of reflux relapse. Provide a clear restart plan (antacids, H2 blocker trial) if symptoms return during taper.",
  712: "Offer same-day social work referral when available. Safety planning includes safe contacts, emergency numbers, and assessing whether the patient can safely return home today.",
  713: "Measure supine and standing blood pressure at future visits after medication changes. Educate on compression stockings application and when to seek care for syncope or near-syncope.",
  714: "Review contraceptive needs—hormone therapy does not provide contraception in POI unless uterus absent. Discuss long-term bone health and cardiovascular risk associated with early estrogen loss.",
  716: "Vulvar hygiene with bland emollients and avoidance of irritants supports healing alongside steroids. Persistent symptoms despite therapy warrant dermatology or gynecology referral.",
  717: "Stress incontinence may coexist; address both with pessary selection and pelvic floor therapy. Document postvoid residual if voiding symptoms are present.",
  718: "Nonpharmacologic strategies include sleep hygiene, aerobic exercise, and calcium supplementation. CBT for PMDD is effective alone or combined with SSRIs.",
  719: "Encourage adequate hydration and avoidance of prolonged sitting. Discuss sexual function impact openly because chronic prostatitis affects quality of life and mental health.",
  720: "Educate on limiting purine-rich foods and high-fructose corn syrup beverages. Recurrent stones warrant urology referral for metabolic stone workup.",
  721: "Scrotal elevation and NSAIDs adjunct antibiotic therapy. Test for HIV and syphilis per STI screening guidelines in sexually active adults.",
  722: "Discuss genetic counseling for family planning. Monitor for hepatic cysts and intracranial aneurysm symptoms (worst headache, focal deficits).",
  723: "Renal artery stenosis often coexists with atherosclerotic disease—intensify global cardiovascular risk reduction. Repeat imaging if blood pressure becomes refractory again after initial stabilization.",
  724: "Counsel that pertussis immunity wanes; vaccination in adults and Tdap in pregnancy protect infants. Document cough duration in the chart to support public health reporting.",
  725: "Examine for secondary rash and systemic symptoms of early syphilis. Penicillin allergy requires desensization for syphilis treatment—doxycycline is second-line with close follow-up.",
  726: "Incision and drainage is required if fluctuance develops despite antibiotics. Diabetic foot ulcers need coordinated wound care to prevent osteomyelitis.",
  727: "Baseline liver enzymes before isoniazid or rifampin-containing regimens. Directly observed therapy improves LTBI completion rates in some populations.",
  728: "Household members at high risk may receive prophylaxis when exposure to influenza is ongoing. Continue COPD bronchodilator optimization during acute illness.",
  729: "Small AAAs (3.0–3.9 cm) typically need surveillance ultrasound every 3 years; 4.0–4.9 cm often annually. Coordinate vascular follow-up before travel to remote areas.",
  730: "Peripheral neuropathy from B12 deficiency may be partially irreversible—replace early when suspected. Consider oral versus IM B12 based on absorption and severity.",
  731: "Document AUDIT-C score and intervention in the chart for quality metrics. Liver fibrosis assessment (FIB-4) may be appropriate with sustained heavy use.",
  732: "Hepatitis B vaccination if nonimmune. Alcohol abstinence improves treatment response and reduces fibrosis progression in coinfected patients.",
  733: "Screening positive for food insecurity should trigger warm handoff to clinic social worker or community navigator when available."
};

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");
const questions = eval(html.match(/const QUESTIONS = (\[[\s\S]*?\n\]);/)[1]);

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

for (const q of questions) {
  if (!extra[q.id]) continue;
  const add = extra[q.id];
  if (q.explanation.includes(add.slice(0, 35))) continue;
  q.explanation = q.explanation.replace(/\n\nKEY POINTS:/, `\n\n${add}\n\nKEY POINTS:`);
}

for (const q of questions.filter((x) => x.id >= 709)) {
  const oldBlock = html.match(
    new RegExp(`\\{\\s*"id": ${q.id},[\\s\\S]*?"bulletExplanation": "[^"]*(?:\\\\.[^"]*)*"\\s*\\}`)
  );
  if (!oldBlock) continue;
  const hasImages = html.includes(`"id": ${q.id}`) && /"questionImages": \[\]/.test(oldBlock[0]);
  const newBlock = [
    "  {",
    `    "id": ${q.id},`,
    `    "categoryId": ${q.categoryId},`,
    ...(hasImages ? [`    "questionImages": [],`, `    "explanationImages": [],`] : []),
    `    "question": ${JSON.stringify(q.question)},`,
    `    "options": ${JSON.stringify(q.options)},`,
    `    "correctAnswer": ${q.correctAnswer},`,
    `    "explanation": ${JSON.stringify(q.explanation)},`,
    `    "bulletExplanation": ${JSON.stringify(q.bulletExplanation)}`,
    "  }"
  ].join("\n");
  html = html.replace(oldBlock[0], newBlock);
  console.log(`Q${q.id} -> ${countWords(q.explanation)} words`);
}

fs.writeFileSync(indexPath, html);
