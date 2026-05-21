const fs = require("fs");
const path = require("path");
const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

function wc(t){return String(t).trim().split(/\s+/).filter(Boolean).length;}

function patch(id, add) {
  const re = new RegExp(`(\\{\\s*"id": ${id},[\\s\\S]*?"explanation": ")([\\s\\S]*?)(",\\s*\\r?\\n\\s*"bulletExplanation")`);
  const m = html.match(re);
  if (!m) return;
  let exp = m[2].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  if (exp.includes(add.slice(0, 28))) return wc(exp);
  exp = exp.replace(/\n\nKEY POINTS:/, `\n\n${add}\n\nKEY POINTS:`);
  html = html.replace(re, `$1${JSON.stringify(exp).slice(1, -1)}$3`);
  return wc(exp);
}

const p3 = {
  770: "Reassess at 6 and 12 weeks; refer to orthopedics if persistent weakness suggests full-thickness tear. Patient education that most rotator cuff tendinopathy improves without surgery reduces unnecessary MRI utilization in primary care.",
  771: "Consider topical NSAIDs or muscle relaxants short course if spasm prominent. Document occupational ergonomics and lifting technique counseling. Chronic LBP beyond 12 weeks triggers expanded evaluation for radiculopathy, stenosis, or inflammatory spondylopathy.",
  772: "Recalcitrant cases beyond 6–12 months may qualify for plantar fascia release rarely—exhaust conservative options first. Obesity management adjunct reduces recurrence. Patient education that symptoms may persist months despite treatment sets realistic expectations.",
  773: "Calcium and vitamin D supplementation while planning osteoporosis pharmacotherapy after stabilization. Hip fracture registries track quality metrics including VTE prophylaxis and early mobilization—primary care reinforces at transition of care.",
  774: "Repeat iron studies after repletion to confirm normalization before closing case. H. pylori testing and treatment if peptic ulcer identified on EGD. Document shared decision-making if patient initially declines endoscopy—revisit if anemia persists.",
  775: "Coordinate iron supplementation only when iron deficiency component confirmed in inflammatory states. Quality-of-life impact of anemia in RA warrants treatment even when mild if symptomatic. Monitor for GI bleeding from NSAIDs contributing to iron loss.",
  776: "Patient education on signs of PE (sudden dyspnea, chest pain) while on anticoagulation. Renal dose adjustment for DOACs when eGFR declines. Cancer screening if unprovoked VTE in older adults per evolving guidelines.",
  777: "All heparin products including heparin flushes and LMWH contraindicated once HIT confirmed. Platelet recovery monitoring daily until >150k before warfarin if used. Thrombosis risk highest at platelet nadir—maintain alternative anticoagulation throughout.",
  778: "Primary care coordinates smoking cessation and cardiovascular risk reduction alongside hematology-directed cytoreduction. Pruritus and aquagenic symptoms significantly affect quality of life—symptomatic management per specialist. Thrombotic events require emergency evaluation even on therapy.",
  779: "Primary care maintains cardiovascular risk factor control in psoriasis patients. Document joint symptoms at every visit for psoriatic arthritis screening. Topical steroid holidays on face/intertrigo reduce atrophy risk.",
  780: "Atopic dermatitis action plan for families improves flare management. Swim/soak-and-seal technique after bath enhances emollient benefit. Refer dermatology when topicals fail or widespread involvement affects sleep and growth.",
  781: "Primary care follow-up within 48–72 hours for diabetic cellulitis ensures response. Mark borders and photograph progression when possible. Hospitalize if systemic inflammatory response or failed outpatient therapy.",
  782: "Institutional scabies outbreaks require treating all exposed individuals simultaneously and laundering bedding/clothing. Pruritus may outlast mite eradication—counsel on expected duration. Norwegian scabies in immunocompromised hosts needs ivermectin plus topical scabicide.",
  783: "Referral to Mohs or dermatologic surgery within weeks prevents local invasion on nasal tip. Document lesion size and morphology for pathology. Full skin exam for additional skin cancers at diagnosis visit when feasible.",
  784: "PHQ-9 repeat at 4–8 weeks guides adequacy of response. Suicide safety plan even when ideation denied initially. Exercise prescription and sleep hygiene are evidence-based adjuncts to pharmacotherapy.",
  785: "Urgent psychiatric evaluation or ED if agitation, psychosis, or safety cannot be managed outpatient. After mania resolves, maintenance therapy duration typically lifelong. Document antidepressant-associated mania in chart to prevent future SSRI monotherapy.",
  786: "Shared decision on maintenance vs discontinuation after multiple episodes—generally longer treatment after recurrent depression. Slowest taper steps at lowest doses reduce withdrawal. Pharmacist-led taper plans improve adherence.",
  787: "Monitor blood pressure at follow-up visits when starting bupropion. Combining with NRT patch may increase BP—use caution. Document smoking quit date and relapse prevention plan at each visit.",
  788: "Gradual SSRI titration reduces initial jitteriness. Rule out hyperthyroidism and caffeine excess. Refer psychiatry if partial response after two adequate SSRI trials plus CBT.",
  789: "Outpatient phototherapy or readmission when bilirubin crosses treatment threshold on nomogram. Lactation consultant support for breastfeeding jaundice without abandoning breastfeeding. Universal bilirubin screening before nursery discharge reduces readmissions in some systems.",
  790: "Winter season anticipatory guidance reduces unnecessary antibiotic prescribing for viral wheeze. Pulse oximetry in office guides oxygen need. ED transfer criteria: severe retractions, dehydration, or SpO2 persistently below guideline threshold despite supplemental O2.",
  791: "Document penicillin allergy type before choosing macrolide. Household contact testing when recurrent GAS in family. Peritonsillar abscess requires drainage—not continued oral amoxicillin alone.",
  792: "Early intervention before age 3 maximizes language outcomes. Autism-specific evaluation if social communication deficits emerge on follow-up. Parent training programs complement formal speech therapy.",
  793: "Document confidential portion of visit separately per clinic policy. Safety contract with adolescent listing warning signs and crisis resources. Involve parent in treatment when teen consents or safety mandates disclosure."
};

const p4 = {
  770: "Subacromial impingement and partial-thickness tears often improve with structured rehabilitation before advanced imaging.",
  771: "Choosing Wisely: imaging for nonspecific acute LBP within 6 weeks without red flags adds cost without benefit.",
  772: "Overnight splint maintains passive dorsiflexion stretch during sleep.",
  773: "Orthogeriatric co-management models reduce mortality after hip fracture when available.",
  774: "Ferritin target >100 ng/mL often used before closing iron deficiency case.",
  775: "Anemia contributes to fatigue and functional decline in inflammatory arthritis—treat when symptomatic.",
  776: "DOACs preferred over warfarin for most uncomplicated DVT when no contraindication.",
  777: "Never restart heparin after confirmed HIT without hematology guidance.",
  778: "Hematology manages phlebotomy frequency to maintain hematocrit below 45%.",
  779: "Moderate psoriasis often needs step-up beyond mid-potency topicals alone.",
  780: "Infant eczema: emollients are foundation even when skin looks clear between flares.",
  781: "Non-purulent cellulitis in diabetics still requires antibiotics—not observation.",
  782: "Treat scabies contacts simultaneously to prevent reinfestation cycles.",
  783: "Nasal BCC is high-risk anatomic site for tissue-sparing Mohs surgery.",
  784: "Moderately severe depression rarely remits without active treatment.",
  785: "Mania is psychiatric emergency when safety or psychosis present.",
  786: "Paroxetine among highest discontinuation risk SSRIs—plan tapers accordingly.",
  787: "Bupropion addresses depression and nicotine craving in one agent when safe.",
  788: "GAD-7 of 15 indicates severe anxiety warranting active pharmacologic and behavioral treatment.",
  789: "Kernicterus prevention drives hour-specific bilirubin monitoring in first week.",
  790: "Supportive care remains cornerstone of bronchiolitis management per AAP.",
  791: "Positive rapid strep in child with compatible pharyngitis requires antibiotics.",
  792: "Language delay at 18 months needs prompt referral—not watchful waiting.",
  793: "Adolescent depression requires confidential assessment with safety planning."
};

for (const [id, add] of Object.entries(p3)) patch(Number(id), add);
for (const [id, add] of Object.entries(p4)) patch(Number(id), add);

fs.writeFileSync(indexPath, html);

for (let id = 769; id <= 793; id++) {
  const re = new RegExp(`"id": ${id},[\\s\\S]*?"explanation": "([\\s\\S]*?)",\\s*\\r?\\n\\s*"bulletExplanation"`);
  const m = html.match(re);
  if (!m) continue;
  const w = wc(m[1].replace(/\\n/g, " "));
  console.log((w >= 400 && w <= 425 ? "OK" : "!!") + ` Q${id}: ${w}w`);
}
