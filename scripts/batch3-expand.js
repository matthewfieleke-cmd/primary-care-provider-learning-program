const fs = require("fs");
const path = require("path");

const extra1 = {
  769: "Intra-articular hyaluronic acid and glucosamine have inconsistent evidence; prioritize evidence-based nonpharmacologic care first. Consider cane in contralateral hand to reduce joint load. Evaluate depression and sleep, which amplify pain perception. Refer orthopedics when mechanical symptoms (locking, instability) or end-stage disease limit function despite optimized care.",
  770: "Document overhead work restrictions and workers compensation forms when occupational triggers present. Night pain interfering with sleep may respond to short-term NSAID before bed. Rotator cuff tears with acute trauma and significant weakness need expedited imaging. Patient education on prognosis: most improve over 3–6 months with rehab.",
  771: "Spinal manipulation and acupuncture may adjunct selected patients with short duration pain. Red-flag screen includes age >50 with new pain, IV drug use, immunosuppression, and significant trauma. Return precautions: saddle anesthesia, leg weakness, fever. Avoid chronic opioid initiation for acute uncomplicated LBP.",
  772: "Limit high-impact running temporarily; cross-train with cycling or swimming. Night splints and dorsiflexion night braces improve first-step pain in trials. Evaluate for plantar fibroma or Baxter nerve entrapment if refractory. Weight loss reduces plantar fascia load in overweight patients.",
  773: "Multimodal pain control and delirium prevention bundles reduce postoperative complications. Orthogeriatric co-management improves mortality outcomes. Schedule bone density scan and fall prevention home assessment before discharge when possible. Anticoagulation duration post hip fracture follows orthopedic/VTE guidelines—typically extended beyond hospital stay.",
  774: "Test celiac serology in iron deficiency when GI endoscopy unrevealing. IV iron sucrose or carboxymaltose accelerates repletion when oral intolerance or malabsorption. Repeat CBC and ferritin in 8–12 weeks to confirm response. Transfusion threshold individualized by symptoms and comorbidities.",
  775: "Treat active RA inflammation to improve anemia when feasible. Erythropoietin-stimulating agents reserved for CKD-related anemia under specialty care. Monitor methotrexate-related marrow suppression with CBC. Combined iron deficiency and ACI may require IV iron despite elevated ferritin in selected cases.",
  776: "Duration of anticoagulation: 3 months if provoked (surgery/immobilization), consider extended therapy if unprovoked after shared decision-making. Bleeding risk assessment (HAS-BLED) guides monitoring, not withholding indicated therapy. Educate on leg elevation and ambulation—not bed rest. IVC filter only when anticoagulation contraindicated.",
  777: "Platelet nadir timing day 5–10 is hallmark; continue platelet monitoring until recovery. Document heparin exposure including flushes and heparin-coated catheters in chart. Hematology consultation supports choice of direct thrombin inhibitor vs fondaparinux. Warfarin initiation deferred until platelet count recovery per protocol.",
  778: "Phlebotomy schedule often weekly until target hematocrit, then maintenance intervals. Pruritus may respond to antihistamines and aspirin after hematology guidance. Assess for aquagenic pruritus and splenomegaly on exam. Secondary erythrocytosis from sleep apnea requires CPAP alongside PV management if both present.",
  779: "Biologic therapy indications include BSA >10%, face/genital/palmoplantar involvement, or psoriatic arthritis. Screen for TB and hepatitis B before biologics. Cardiovascular risk counseling essential—psoriasis linked to MI and stroke. Topical steroid strength matched to site—lower potency on face/axillae.",
  780: "Bleach baths (dilute bleach) reduce Staph colonization in moderate-severe eczema per some guidelines. Wet wrap therapy for flares under clinician guidance. Food elimination only with clear history of anaphylaxis or proven IgE-mediated allergy—not routine blanket restrictions. Eczema herpeticum requires urgent acyclovir.",
  781: "Mark erythema borders and photograph if available to track spread. Outpatient failure (fever, tachycardia, rapid progression) requires admission and IV antibiotics. Treat tinea pedis concurrently to reduce recurrence. MRSA coverage with TMP-SMX or doxycycline when purulent or risk factors present.",
  782: "Oral ivermectin 200 mcg/kg may be used for crusted scabies or institutional outbreaks per CDC. Pruritus may persist 2–4 weeks post-treatment—antihistamines for symptom relief. Crusted (Norwegian) scabies requires dermatology/infection control and repeated scabicidal plus ivermectin.",
  783: "Biopsy confirms diagnosis before destructive therapy when clinical uncertainty exists. Educate on UV protection and self-skin exams. Infiltrative or morpheaform BCC on face may require Mohs over standard excision. NCCN guidelines stratify treatment by risk category and location.",
  784: "Discuss common SSRI side effects (GI upset, sleep change, sexual dysfunction) and timeline to effect. Black box warning: monitor suicidality in adults under 25 early in treatment. Switch SSRI if inadequate response after 4–8 weeks at adequate dose. Exercise and sleep hygiene adjunctive.",
  785: "Mania severity determines level of care—involuntary hold if grave disability or danger. After stabilization, maintenance mood stabilizer prevents recurrence. Psychoeducation on illness course and medication adherence critical. Substance use screen—stimulants/cannabis may trigger mania.",
  786: "If depression relapse after taper, restart effective dose rather than switching unnecessarily. Fluoxetine cross-taper sometimes used to ease paroxetine withdrawal under supervision. Document taper schedule in after-visit summary. Maintenance treatment duration individualized by recurrence history.",
  787: "Combine bupropion with nicotine patch for additive quit rates in some trials—monitor BP. Avoid evening dosing if insomnia occurs. Screen bipolar history—bupropion may unmask mania rarely. Weight-neutral profile helpful in patients concerned about SSRI weight gain.",
  788: "Pregabalin/gabapentin third-line for GAD when SSRI/SNRI insufficient or not tolerated. Mindfulness-based stress reduction may adjunct. Limit caffeine and alcohol which worsen anxiety. Reassess GAD-7 every 4–8 weeks to track response.",
  789: "Direct antiglobulin test if hemolysis suspected (rapid rise, pallor, lethargy). Encourage frequent effective breastfeeding; supplement only if weight loss/dehydration. Kernicterus prevention drives treatment thresholds—never ignore rising bilirubin in first week. Home nursing visit or readmission if poor follow-up access.",
  790: "Palivizumab prophylaxis for high-risk infants (prematurity, CHD) per seasonal guidelines—not all bronchiolitis patients. Hand hygiene and smoke exposure reduction prevent spread. Apnea monitoring in young infants with bronchiolitis when indicated. Return precautions for increased work of breathing or dehydration.",
  791: "Return to school after 24 hours of antibiotics and fever-free improves contagion control. Penicillin allergy: cephalexin if non-anaphylactic; azithromycin if anaphylaxis. Peritonsillar abscess presents with uvular deviation, trismus—urgent ENT. Rheumatic fever prevention depends on completing full antibiotic course.",
  792: "Bilingual exposure may delay expressive vocabulary temporarily—assess total language environment. Autism evaluation if regression, lack of joint attention, or repetitive behaviors emerge. Early intervention Part C referral time-sensitive before age 3. Limit passive screen time per AAP.",
  793: "Know state laws on minor consent for mental health and reproductive care. Document safety plan with crisis numbers. Involve school counselor with permission when academic decline present. Fluoxetine monitoring visits weekly x4 then biweekly when initiating in adolescents per FDA guidance."
};

const extra2 = {
  769: "Consider topical diclofenac gel for knee OA in patients with GI risk from oral NSAIDs. Assess for pseudogout if acute hot effusion—aspirate crystals. Document functional goals and shared decision-making before surgical referral.",
  770: "Ultrasound may confirm supraspinatus tendinopathy in refractory cases but does not replace initial conservative trial. Subacromial injection should follow sterile technique; limit repeated injections to avoid tendon weakening.",
  771: "Work modification and ergonomic assessment reduce recurrence in office workers. McKenzie extension exercises may benefit selected discogenic presentations under PT guidance.",
  772: "Custom orthotics no better than good OTC inserts for many patients—cost-effective approach first. Consider plantar fascia injection only after failed 6 months conservative care.",
  773: "Coordinate DVT prophylaxis timing with neuraxial anesthesia guidelines post hip surgery. Fracture liaison service improves osteoporosis treatment rates at discharge.",
  774: "Men and postmenopausal women with IDA are colon cancer screening populations until proven otherwise—document colonoscopy referral in care plan.",
  775: "Soluble transferrin receptor/log ferritin index helps when ferritin ambiguous in inflammation. Monitor CBC on methotrexate per rheumatology co-management.",
  776: "Cancer-associated VTE may require LMWH long-term rather than DOAC in some guidelines—oncology input when active malignancy diagnosed.",
  777: "Avoid platelet transfusion in HIT unless life-threatening bleeding—thrombosis risk outweighs benefit in typical HIT.",
  778: "JAK2-negative erythrocytosis requires evaluation for secondary causes before assuming PV variant.",
  779: "Document psoriasis BSA and impact on quality of life for treatment authorization. Joint exam at every dermatology-related visit.",
  780: "Parent education on trigger avoidance (fragrance, wool) and proper emollient application technique improves adherence.",
  781: "Diabetic foot cellulitis warrants foot exam for ulcer portal and glycemic optimization alongside antibiotics.",
  782: "Institutional outbreaks (daycare, nursing home) require simultaneous mass treatment and communication with public health.",
  783: "Dermoscopy training improves primary care recognition of BCC vs benign lesions before referral.",
  784: "Collaborative care models integrate behavioral health manager for depression follow-up in primary care.",
  785: "Safety planning includes restricting access to firearms and securing finances during manic episodes when feasible.",
  786: "Patient handout on discontinuation symptoms reduces panic and unnecessary ED visits during taper.",
  787: "Set quit date within 2 weeks of bupropion start for smoking cessation protocol; behavioral support doubles success.",
  788: "Rule out hyperthyroidism and substance-induced anxiety before long-term anxiolytic prescribing.",
  789: "Plot bilirubin on hour-specific nomogram at every check—trend more important than single value.",
  790: "Winter bronchiolitis season peaks—anticipatory guidance reduces unnecessary antibiotic expectations from families.",
  791: "Scarlet fever rash with sandpaper texture and strawberry tongue may accompany strep— treat same as pharyngitis.",
  792: "M-CHAT follow-up interview required when screen positive—refer early intervention while awaiting formal ASD evaluation.",
  793: "988 Suicide and Crisis Lifeline and local mobile crisis teams should be in safety plan for adolescents."
};

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

function expand(id, add) {
  const re = new RegExp(
    `(\\{\\s*"id": ${id},[\\s\\S]*?"explanation": ")([\\s\\S]*?)(",\\s*\\r?\\n\\s*"bulletExplanation")`
  );
  const m = html.match(re);
  if (!m) return;
  let exp = m[2].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  if (exp.includes(add.slice(0, 35))) return exp;
  exp = exp.replace(/\n\nKEY POINTS:/, `\n\n${add}\n\nKEY POINTS:`);
  html = html.replace(re, `$1${JSON.stringify(exp).slice(1, -1)}$3`);
  return exp;
}

for (const [id, add] of Object.entries(extra1)) expand(Number(id), add);
for (const [id, add] of Object.entries(extra2)) expand(Number(id), add);

fs.writeFileSync(indexPath, html);

for (let id = 769; id <= 793; id++) {
  const re = new RegExp(
    `"id": ${id},[\\s\\S]*?"explanation": "([\\s\\S]*?)",\\s*\\r?\\n\\s*"bulletExplanation"`
  );
  const m = html.match(re);
  if (!m) continue;
  const w = countWords(m[1].replace(/\\n/g, " "));
  const flag = w < 400 || w > 425 ? " ***" : "";
  console.log(`Q${id} -> ${w} words${flag}`);
}
