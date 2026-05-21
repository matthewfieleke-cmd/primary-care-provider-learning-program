const fs = require("fs");
const path = require("path");

const expansions = {
  709: "Primary care follow-up should include informant input at each visit because patients may underreport decline. Assess driving safety, medication adherence, sleep, mood, and hearing—each modifiable contributor to cognitive symptoms. Document functional baselines (IADLs, medication management) to detect progression objectively over 6–12 month intervals.",
  710: "Document fall circumstances (time, location, prodrome) and review footwear, vision, and home lighting at every visit. Coordinate with physical therapy and consider referral to occupational therapy for home safety evaluation. Reassess TUG and chair-stand performance after interventions to confirm improvement.",
  711: "Schedule a follow-up visit 4–8 weeks after PPI taper to assess reflux recurrence and fracture-prevention needs. If acid suppression remains necessary, use the lowest effective dose and reconsider indication if bisphosphonate or antiplatelet therapy is added later.",
  712: "Clinic workflows should include a standard question about feeling safe at home for older adults. Partner with adult protective services and community agencies; know your state reporting requirements before the patient leaves the office when suspicion is high.",
  713: "Teach seated ankle pumps, slow positional changes, and adequate daytime hydration. Review blood pressure targets—over-treatment of hypertension worsens orthostatic symptoms in Parkinson disease. Recheck standing vitals after medication adjustments.",
  714: "Discuss fertility preservation options promptly when POI is diagnosed in women desiring pregnancy. Evaluate autoimmune thyroid disease and adrenal insufficiency, which can accompany autoimmune oophoritis. Bone density screening is indicated because of hypoestrogenism.",
  715: "Document Rh status at first prenatal visit and again at delivery. If vaginal bleeding or abdominal trauma occurs in an Rh-negative patient, administer additional RhIg per protocol. Ensure postpartum type and screen on the infant before discharging RhIg orders.",
  716: "Schedule follow-up in 6–12 weeks to assess treatment response and inspect for erosions or fissures. Long-term maintenance topical steroid may be required. Biopsy nonhealing or hypertrophic lesions to exclude vulvar intraepithelial neoplasia or squamous cell carcinoma.",
  717: "Fit pessaries require periodic removal, cleaning, and mucosal inspection to prevent erosions and odor. Combine with pelvic floor physical therapy when available. Discuss surgical options if conservative management fails or prolapse progresses.",
  718: "Prospective symptom charting for two cycles confirms the diagnosis before starting pharmacotherapy. SSRIs can be used continuously if luteal-phase dosing is impractical. Screen for suicidality and bipolar disorder before initiating antidepressants.",
  719: "If symptoms persist after one antibiotic course, reconsider chronic pelvic pain syndrome (nonbacterial) and emphasize multimodal therapy. Avoid repeated fluoroquinolone courses without culture justification because of resistance and adverse effect profiles.",
  720: "Repeat 24-hour urine testing after dietary changes to verify pH goal achievement. Recurrence prevention requires lifelong adherence to alkalinization in many patients. Evaluate for gout and metabolic syndrome as comorbid conditions.",
  721: "Ensure partner notification and STI treatment. If pain worsens or testicle becomes high-riding with absent cremasteric reflex, obtain emergent ultrasound to exclude torsion. Follow up in 72 hours to confirm clinical improvement.",
  722: "Screen first-degree relatives with imaging when ADPKD is confirmed. Monitor blood pressure aggressively from adolescence onward because hypertension accelerates progression. Counsel about avoiding contact sports if solitary large cysts or organomegaly increase rupture concern.",
  723: "Avoid ACE inhibitor rechallenge if creatinine rose substantially after initiation until revascularization or nephrology guidance. Control blood pressure, lipids, and smoking cessation to limit progressive renovascular disease. Monitor renal function and potassium after any antihypertensive change.",
  724: "Post-tussive emesis and whoop are classic but often absent in adults; prolonged cough after URI should trigger testing during outbreaks. Offer postexposure prophylaxis to household contacts, especially infants and pregnant women in third trimester.",
  725: "Confirm diagnosis with treponemal test if RPR is positive. Report to public health, treat partners, and schedule follow-up RPR titers to document expected fourfold decline. Perform HIV testing and counsel on condom use.",
  726: "Mark the erythema border and reassess within 48 hours—outpatient MRSA cellulitis should improve; failure suggests abscess or deeper infection. Optimize glycemic control and ulcer offloading to prevent recurrence.",
  727: "Review medication interactions before starting rifampin-based LTBI therapy (including hormonal contraception and some direct-acting antivirals). Emphasize completion of the full course to maximize prevention benefit.",
  728: "Start antivirals even if presentation is beyond 48 hours when the patient is hospitalized or severely ill. Update pneumococcal and influenza vaccination annually; provide COPD action plan for secondary bacterial pneumonia.",
  729: "If AAA is detected, refer to vascular surgery when diameter thresholds for repair are met or if symptomatic. Reinforce smoking cessation even after quitting because prior exposure defines screening eligibility.",
  730: "Recheck B12 after 8–12 weeks of repletion; neurologic recovery may lag hematologic correction. Consider intrinsic factor antibody testing if absorption defect is suspected. Continue periodic B12 monitoring on long-term metformin.",
  731: "Use motivational interviewing to set measurable drinking goals; offer referral to behavioral health or pharmacotherapy when AUDIT-C suggests alcohol use disorder. Document screening annually per USPSTF.",
  732: "After positive HCV antibody, reflex to HCV RNA before counseling on cure. Treat nearly all viremic patients with direct-acting antivirals; cure prevents cirrhosis progression when treated before advanced fibrosis.",
  733: "Add food insecurity to the problem list and re-screen periodically. Tailor dietary advice to feasible, affordable foods rather than idealized plans the patient cannot access."
};

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");
const match = html.match(/const QUESTIONS = (\[[\s\S]*?\n\]);/);
const questions = eval(match[1]);

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

for (const q of questions) {
  if (!expansions[q.id]) continue;
  const add = expansions[q.id];
  if (q.explanation.includes(add.slice(0, 40))) continue;
  q.explanation = q.explanation.replace(
    /\n\nKEY POINTS:/,
    `\n\n${add}\n\nKEY POINTS:`
  );
}

const wc = (id) => countWords(questions.find((q) => q.id === id).explanation);

// Serialize entire QUESTIONS array back - too large for simple replace
// Replace each question block by id instead
for (const q of questions.filter((x) => x.id >= 709)) {
  const oldBlock = html.match(new RegExp(`\\{\\s*"id": ${q.id},[\\s\\S]*?"bulletExplanation": "[^"]*(?:\\\\.[^"]*)*"\\s*\\}`));
  if (!oldBlock) {
    console.warn("Block not found for", q.id);
    continue;
  }
  const newBlock = [
    "  {",
    `    "id": ${q.id},`,
    `    "categoryId": ${q.categoryId},`,
    ...(q.questionImages ? [`    "questionImages": [],`] : []),
    `    "question": ${JSON.stringify(q.question)},`,
    `    "options": ${JSON.stringify(q.options)},`,
    `    "correctAnswer": ${q.correctAnswer},`,
    ...(q.explanationImages || q.questionImages ? [`    "explanationImages": [],`] : []),
    `    "explanation": ${JSON.stringify(q.explanation)},`,
    `    "bulletExplanation": ${JSON.stringify(q.bulletExplanation)}`,
    "  }"
  ].join("\n");
  html = html.replace(oldBlock[0], newBlock);
  console.log(`Q${q.id} -> ${wc(q.id)} words`);
}

fs.writeFileSync(indexPath, html);
