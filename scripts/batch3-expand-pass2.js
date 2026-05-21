const fs = require("fs");
const path = require("path");
const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

function patch(id, add) {
  const re = new RegExp(
    `(\\{\\s*"id": ${id},[\\s\\S]*?"explanation": ")([\\s\\S]*?)(",\\s*\\r?\\n\\s*"bulletExplanation")`
  );
  const m = html.match(re);
  if (!m) return;
  let exp = m[2].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  if (exp.includes(add.slice(0, 30))) return;
  exp = exp.replace(/\n\nKEY POINTS:/, `\n\n${add}\n\nKEY POINTS:`);
  html = html.replace(re, `$1${JSON.stringify(exp).slice(1, -1)}$3`);
  return countWords(exp);
}

const extra3 = {
  769: "Shared decision-making should address expectations: OA is chronic but function can improve substantially with nonoperative care. Prior joint injury and meniscectomy accelerate progression—document mechanical symptoms triggering orthopedics. Consider duloxetine for centralized pain phenotypes when NSAIDs contraindicated.",
  770: "Differentiate from cervical radiculopathy with Spurling test and neck exam. Adhesive capsulitis remains in differential if passive ROM becomes limited over time. Workers compensation and ergonomic modification reduce recurrence in manual laborers.",
  771: "Patient handouts on prognosis (90% improve substantially within 6 weeks) reduce imaging requests. Consider dextroamphetamine not indicated—avoid opioid initiation. Physical therapy within 2 weeks if not improving accelerates recovery in trials.",
  772: "Stress fracture suspicion rises with sudden training increase—MRI if no improvement at 6 weeks. Achilles tightness contributes—eccentric calf program adjunct. Diabetic patients may have plantar neuropathic pain mimicking fasciitis.",
  773: "Advance care planning and goals of conversation appropriate in frail elders with hip fracture. Anemia and delirium workup common postoperatively. Coordinate SNF or home PT early to maximize functional recovery and reduce readmission.",
  774: "Upper endoscopy detects erosive esophagitis, Cameron lesions, and peptic ulcer contributing to iron loss with NSAIDs. Colonoscopy detects cancer and angiodysplasia. Document iron intolerance and switch formulations (every-other-day dosing improves tolerance).",
  775: "Reticulocyte production index clarifies marrow response. GI evaluation still warranted if iron studies suggest deficiency despite inflammation when soluble transferrin receptor elevated. Coordinate with rheumatology on methotrexate folate and monitoring.",
  776: "Post-thrombotic syndrome prevention includes early ambulation and compression stockings after acute DVT. Document provoking factor to guide duration counseling. Unprovoked VTE may prompt limited thrombophilia evaluation in young patients without clear provocation.",
  777: "Hospital pharmacists should remove heparin from all orders and flushes when HIT confirmed. Document 4T score and platelet trend in chart for medicolegal clarity. Thrombosis prophylaxis mandatory despite thrombocytopenia in HIT.",
  778: "Erythrocytosis evaluation includes EPO level, pulse oximetry, and abdominal imaging if EPO elevated. JAK2-negative cases may need bone marrow biopsy for diagnosis. Thrombotic events (stroke, MI) are major morbidity—aspirin unless contraindicated after hematology plan.",
  779: "Phototherapy requires dermatology referral and eye protection protocols. Comorbid psoriatic arthritis treated with systemic agents may improve skin and joints together. Smoking cessation improves psoriasis severity and treatment response.",
  780: "Secondary bacterial infection presents with honey-colored crust—topical mupirocin or oral cephalexin for widespread impetiginization. Parent sleep deprivation from infant itch warrants aggressive early control. Atopic march to asthma supports early dermatology in severe cases.",
  781: "Erysipelas (well-demarcated raised border) also streptococcal—similar antibiotic approach. Orbital cellulitis (eye pain, proptosis, ophthalmoplegia) requires IV antibiotics and CT—not outpatient cephalexin alone. Lymphedema predisposes to recurrent cellulitis—compression therapy long-term.",
  782: "Close contacts with prolonged skin exposure need treatment even if asymptomatic during incubation. Pruritus management with cetirizine at night improves sleep during post-scabicidal period. Crusted scabies in elderly or immunosuppressed is highly contagious—public health notification.",
  783: "Squamous cell carcinoma and melanoma in differential for non-healing or pigmented lesions—biopsy when uncertain. After treatment, schedule full skin exam at least annually in fair-skinned patients. Sunscreen and protective clothing reduce subsequent skin cancer risk.",
  784: "Screen substance use and trauma history affecting depression treatment. Collaborative care registry follow-up improves remission rates in primary care. If partial response, augment with bupropion or atypical antipsychotic at low dose per psychiatry guidance.",
  785: "Document manic episode in problem list; future antidepressants require mood stabilizer cover. Family psychoeducation reduces relapse. Substance-induced mania requires abstinence and toxicology screen before attributing to primary bipolar disorder.",
  786: "Relapse prevention planning: if depression returns, restart prior effective dose rather than switching classes unnecessarily. Pharmacist consultation aids taper scheduling for paroxetine 40 mg long-term use discontinuation.",
  787: "Cardiovascular disease history does not absolutely contraindicate bupropion but use caution with uncontrolled hypertension. Combining with varenicline possible under specialist guidance—not routine in primary care without experience.",
  788: "Panic attacks may coexist—screen for panic disorder and avoid benzodiazepine dependency. SSRI activation may occur first week—start low, go slow. Refer CBT through EAP or psychology when access limited.",
  789: "Phototherapy units in hospital or home per AAP nomogram when outpatient levels approach treatment line. Breastfeeding support increases intake and may reduce excessive jaundice from inadequate feeding. G6PD testing in at-risk ethnicities when hemolysis suspected.",
  790: "Trial of bronchodilator may be considered once in moderate-severe bronchiolitis per some clinicians but not repeated if no response—document single trial result. High-flow nasal cannula in hospital for moderate hypoxia. Parent education sets expectations for 7–10 day illness course.",
  791: "Household contacts with symptomatic pharyngitis should be tested—not treat contacts empirically. Scarlet fever desquamation follows rash—continued antibiotics still indicated. Post-streptococcal glomerulonephritis presents with cola urine and edema days later.",
  792: "Expressive delay with preserved joint attention may be isolated language disorder—still warrants therapy. Regressive language loss is red flag for autism or neurologic disorder requiring expedited evaluation. Read aloud daily and limit screens to <1 hour in toddlers per AAP.",
  793: "Minor consent laws vary—document what adolescent consents to share with parent. Positive depression screen with school decline warrants safety plan even without active SI. Warm handoff to therapist within 2 weeks; SSRI if moderate-severe with black box monitoring schedule."
};

for (const [id, add] of Object.entries(extra3)) {
  const w = patch(Number(id), add);
  if (w) {
    const flag = w < 400 || w > 425 ? " ***" : "";
    console.log(`Q${id} -> ${w} words${flag}`);
  }
}

fs.writeFileSync(indexPath, html);
