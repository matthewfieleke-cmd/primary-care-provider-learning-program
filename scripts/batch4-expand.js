/**
 * Batch 4 explanation expansion — target 400–425 words each
 */
const fs = require("fs");
const path = require("path");

const extra1 = {
  794: "Prophylactic colchicine 0.6 mg daily may be used when initiating urate-lowering therapy to reduce flare risk during the first 6 months. Avoid NSAIDs in decompensated heart failure or active peptic ulcer disease; corticosteroids preferred in those settings. Ice and rest adjunct symptom relief. Recurrent flares despite lifestyle measures warrant rheumatology co-management for ULT titration.",
  795: "ESR often exceeds 40–60 mm/hr in PMR; CRP correlates with disease activity. Low-dose aspirin may be added when GCA is confirmed to reduce ischemic complications per specialist guidance. Vision symptoms (amaurosis fugax, diplopia) require same-day ophthalmology and neurology involvement. PMR relapse during taper occurs in up to 50%—slow taper over months to years.",
  796: "Enthesitis at Achilles or plantar fascia and nail onycholysis are high-yield exam findings. PsA increases cardiovascular and metabolic risk—screen lipids, BP, and glucose. TNF inhibitors require TB screening; IL-17 inhibitors may worsen IBD—coordinate if gut symptoms. Oligoarthritis pattern differs from symmetric small-joint RA.",
  797: "Inflammatory back pain criteria (ASAS): age onset <40, insidious onset, morning stiffness >30 minutes, improvement with exercise, no improvement with rest, night pain with morning improvement. HLA-B27 negative does not exclude disease—10% of axial spondyloarthritis is seronegative. Uveitis presents with painful red eye and photophobia requiring urgent ophthalmology.",
  798: "Sleep apnea screening (STOP-BANG) is essential because untreated OSA worsens fibromyalgia symptoms. Pregabalin and duloxetine are FDA-approved for fibromyalgia; amitriptyline low dose at bedtime may help sleep-pain cycle. Set realistic functional goals; disability certification when appropriate. Avoid benzodiazepines long-term due to dependence and cognitive effects.",
  799: "Positive FIT requires diagnostic colonoscopy—not surveillance colonoscopy interval reset without complete exam. Average-risk screening stops when life expectancy <10 years or patient declines after informed discussion. Family history of CRC in first-degree relative before age 60 lowers surveillance age to 40 or 10 years earlier than relative's diagnosis.",
  800: "Bethesda III–IV indeterminate cytology often leads to molecular testing or repeat FNA/surgery per endocrinology. Autonomously functioning nodule on scan (hot nodule) rarely harbors malignancy—observe or treat hyperthyroidism. Incidental nodules on PET may be benign but still require dedicated thyroid ultrasound characterization.",
  801: "Hyperviscosity syndrome (blurred vision, headache, epistaxis) with very high paraprotein warrants urgent plasmapheresis. Renal biopsy may show cast nephropathy. Avoid NSAIDs and IV contrast when myeloma with renal impairment suspected. Bone pain from lytic lesions responds to radiation and bisphosphonates under oncology guidance.",
  802: "Family history of melanoma and multiple atypical nevi increase risk—dermatology surveillance every 3–12 months when dysplastic nevus syndrome. Teach ABCDE self-exam and sun protection (SPF 30+, protective clothing). Nodular melanoma may lack ABCDE features—any changing lesion biopsied. Staging drives sentinel node biopsy and adjuvant immunotherapy when indicated.",
  803: "Screen for hypothyroidism, anemia, and cardiac dysfunction in cancer survivors with fatigue. Cognitive behavioral therapy for insomnia (CBT-I) improves both sleep and fatigue. Oncology reassessment if new focal symptoms, weight loss, or rising tumor markers suggest recurrence—not routine for isolated stable fatigue with normal exam.",
  804: "Right ventricular infarction: avoid nitrates and diuretics if hypotension with inferior STEMI; prioritize fluid loading. Chewed aspirin 325 mg unless allergy or active bleeding. Door-to-balloon time ≤90 minutes at PCI centers; fibrinolysis if PCI unavailable within 120 minutes. Post-MI secondary prevention: high-intensity statin, beta-blocker, ACEi/ARB, dual antiplatelet therapy per cardiology.",
  805: "Prescribe two epinephrine auto-injectors—one for home, one for school/work. Refer to allergist for confirmatory testing and oral immunotherapy discussion when appropriate. Biphasic anaphylaxis occurs in up to 20%—observe minimum 4–6 hours after food-induced reactions. Written anaphylaxis action plan for patient and family.",
  806: "CDC return-to-sport progression: symptom-limited activity → light aerobic → sport-specific → non-contact practice → full contact after medical clearance. School accommodations (reduced screen time, rest breaks) during recovery. Persistent symptoms beyond 4 weeks suggest post-concussion syndrome—refer concussion clinic. Avoid same-day return even if athlete feels fine.",
  807: "NAC most effective within 8 hours but may benefit up to 24 hours or later with elevated level—toxicology consultation for extended-release ingestion or co-ingestants. Psychiatry evaluation mandatory for intentional overdose. Rumack-Matthew applies to single acute immediate-release ingestion at known time—treat at lower threshold if uncertain timing.",
  808: "qSOFA ≥2 (altered mentation, RR ≥22, SBP ≤100) prompts sepsis evaluation in infection. Repeat lactate after fluid resuscitation—clearing lactate guides adequacy of perfusion. Source control (relieve obstruction, drain abscess) essential alongside antibiotics. Nursing home patients with indwelling catheters: treat only if systemic signs present—not asymptomatic bacteriuria.",
  809: "Tele-retinal screening programs expand access in underserved areas when quality standards met. Pregnancy with preexisting diabetes: eye exam each trimester and 1 year postpartum. Anti-VEGF injections for macular edema preserve vision—timely ophthalmology referral when edema detected. Document annual diabetic eye exam completion in problem list and quality metrics.",
  810: "Carotid endarterectomy considered for symptomatic ≥70% stenosis in suitable surgical candidates. Optimize anticoagulation adherence in AF—subtherapeutic dosing fails to prevent emboli. Amaurosis fugax warrants same-day stroke pathway evaluation. Differentiate from ocular migraine (positive visual phenomena, bilateral or homonymous fields).",
  811: "Watchful waiting option for unilateral nonsevere AOM in children ≥2 years with shared decision-making—antibiotics if worsening or no improvement in 48–72 hours. Otorrhea through perforated TM still warrants antibiotics in acute setting. Tympanostomy tubes considered for recurrent AOM (≥3 in 6 months). Analgesia is essential regardless of antibiotic decision.",
  812: "Intubation in controlled OR setting preferred over emergency department attempts when epiglottitis suspected. Hib vaccination status should be updated for unvaccinated contacts per public health. Lateral neck film thumbprint sign supportive but never delay transfer for imaging in unstable child. Racemic epinephrine may bridge croup—not substitute for epiglottitis airway management.",
  813: "Topical trifluridine or ganciclovir for epithelial HSV keratitis per ophthalmology preference. Stromal keratitis requires specialist-managed steroid with antiviral cover—never primary care steroids alone. Contact lens hygiene education prevents bacterial and Acanthamoeba keratitis recurrence. Urgent referral if corneal thinning, hypopyon, or vision loss progressing.",
  814: "Dense breast notification may prompt discussion of supplemental ultrasound or MRI in high-risk subsets—not routine for all average-risk women. Diagnostic mammography (not screening) for palpable mass or nipple discharge. BRCA and strong family history require enhanced screening starting younger—refer genetics when criteria met.",
  815: "Susceptible patients (all serologies negative) should complete HBV vaccine series. Household contacts of HBsAg-positive patients need testing and vaccination if susceptible. Chronic HBV: HCC surveillance with ultrasound every 6 months in at-risk patients regardless of cirrhosis status per AASLD. Normal ALT does not exclude need for antiviral therapy.",
  816: "DASH diet complements Mediterranean pattern for hypertension control. Refer registered dietitian when food insecurity, eating disorders, or complex comorbidities limit adherence. SGLT2 inhibitors and GLP-1 agonists provide cardiorenal benefit beyond diet in diabetes—lifestyle remains foundation. Portion control and label reading skills improve glycemic and lipid outcomes.",
  817: "AUDIT-C positive screen warrants full AUDIT and brief intervention. Refer to specialty addiction treatment when severe dependence, failed brief intervention, or polysubstance use. Liver fibrosis assessment (FIB-4) when heavy drinking sustained. Naltrexone contraindicated in acute hepatitis or opioid use; acamprosate requires renal dose adjustment.",
  818: "CDC-recognized Diabetes Prevention Program delivers structured lifestyle curriculum over 12 months. Metformin 850 mg BID considered when BMI ≥35, age <60, or prior gestational diabetes if lifestyle insufficient. Repeat A1c annually in prediabetes; diagnose diabetes if A1c ≥6.5% on two occasions. Weight loss medications (GLP-1) may adjunct selected patients with obesity and prediabetes."
};

const extra2 = {
  794: "Joint aspiration with crystal analysis remains definitive when diagnosis uncertain. Febuxostat is alternative ULT when allopurinol intolerance—start only after flare resolution. Patient education: hydration, limit alcohol and high-purine foods during flare recovery. Colchicine dose-reduce in CKD stage 4–5 to avoid toxicity.",
  795: "Temporal artery biopsy may be false-negative due to skip lesions—biopsy adequate length (≥1 cm) from symptomatic side. Low-dose aspirin 81 mg often added in GCA for stroke prevention per specialist. Monitor for steroid-induced hyperglycemia and osteoporosis prophylaxis (calcium, vitamin D, bisphosphonate when indicated).",
  796: "Ultrasound may show enthesitis and synovitis supporting PsA diagnosis. Minimal disease activity targets guide biologic escalation. Contraindications to TNF inhibitors include untreated TB and demyelinating disease history. Coordinate with dermatology when skin disease drives systemic therapy choice.",
  797: "MRI sacroiliitis detects early disease before radiographic changes. Extra-articular manifestations: inflammatory bowel disease, psoriasis, uveitis—screen systematically. Smoking cessation slows radiographic progression in axial spondyloarthritis. Physical therapy emphasizes extension exercises and chest expansion monitoring.",
  798: "Multidisciplinary pain programs improve function in refractory fibromyalgia. Avoid opioid initiation—opioid-induced hyperalgesia worsens centralized pain. Validate symptoms while emphasizing active self-management. Comorbid migraine and IBS common—treat holistically.",
  799: "Cologuard (FIT-DNA) every 1–3 years is option for average-risk adults declining colonoscopy. Ensure follow-up colonoscopy completion when stool-based tests positive—high miss rate if only repeat FIT. Lynch syndrome and IBD require colonoscopy—not FIT alone.",
  800: "Thyroid nodule growth >2 mm/year or new suspicious features prompts repeat FNA. Molecular testing (Afirma, ThyroSeq) aids indeterminate cytology decisions. Suppressive levothyroxine not recommended for benign nodules per current ATA guidance. Refer compressive symptoms (dyspnea, dysphagia) for surgical evaluation.",
  801: "Light chain cast nephropathy may require urgent dialysis. VTE prophylaxis and infection prevention critical during induction chemotherapy. MGUS with M-protein <3 g/dL and no CRAB needs annual monitoring only. Bone marrow biopsy confirms plasma cell percentage for diagnosis.",
  802: "Shave biopsy understages Breslow depth—excisional preferred for pigmented lesions. Wide local excision margins per Breslow thickness after diagnosis. Patient education on monthly self-skin exam and dermatology follow-up after melanoma. Immunotherapy and targeted therapy for advanced disease—oncology referral.",
  803: "American Cancer Society survivorship care plans document treatment history and surveillance schedules. Graduated exercise program starting low intensity prevents post-exertional crash. Treat pain, anemia, and hypothyroidism as reversible fatigue contributors. Modafinil/methylphenidate reserved for refractory cases after specialist consultation.",
  804: "Activate cath lab before transfer when STEMI confirmed—prehospital ECG transmission saves time. Morphine use sparingly—may delay P2Y12 absorption. Contraindications to fibrinolysis: prior ICH, recent stroke, active bleeding. Dual antiplatelet therapy duration individualized post PCI.",
  805: "Train patient and family on auto-injector technique with trainer device. Document peanut allergy in EHR and school action plan. Consider medical alert identification. Oral antihistamines adjunct only—never substitute for epinephrine in anaphylaxis.",
  806: "Sport-specific return-to-play laws vary by state—document medical clearance. Persistent post-concussion headache or vestibular symptoms warrant vestibular rehabilitation. Avoid second head impact during recovery window. Educate on red flags: worsening headache, repeated vomiting, confusion.",
  807: "Extended-release acetaminophen ingestion may require NAC beyond standard nomogram—poison control consultation. Charcoal within 1–2 hours if alert with protected airway. Monitor AST/ALT, INR, creatinine serially during NAC course. Liver transplant evaluation if King’s College criteria met.",
  808: "Empiric antibiotics should cover likely source—adjust per cultures. 30 mL/kg crystalloid for sepsis-induced hypotension unless fluid overload concern. Reassess volume status and lactate within 3 hours. Early goal-directed care reduces mortality in septic shock.",
  809: "Poor glycemic control accelerates DR progression—intensify diabetes management alongside eye referral. Nonmydriatic cameras acceptable in validated screening programs with quality assurance. Macular edema may be asymptomatic—optical coherence tomography at ophthalmology visit.",
  810: "Holter or extended monitoring if paroxysmal AF suspected despite office ECG. Carotid endarterectomy benefit highest within 2 weeks of symptomatic stenosis. Statin therapy for atherosclerotic disease regardless of LDL. Patient education on stroke warning signs (FAST).",
  811: "Amoxicillin-clavulanate when beta-lactamase producers prevalent or treatment failure with amoxicillin. Bilateral severe AOM in children <2 years always treated with antibiotics. Follow-up otoscopy at 2–3 weeks if effusion persists. Preventive pneumococcal vaccination reduces AOM incidence.",
  812: "Ceftriaxone IV after airway secured covers common epiglottitis pathogens. Dexamethasone used in croup—not primary epiglottitis treatment. Never lay child supine or force oral examination—may precipitate complete obstruction. PICU admission standard of care.",
  813: "Dendritic ulcer without classic terminals may still be HSV—ophthalmology confirms. Acanthamoeba keratitis in contact lens wearers causes severe pain—urgent referral. Shield eye if corneal thinning suspected. Oral antivirals reduce recurrence rate in selected patients per specialist.",
  814: "Tomosynthesis (3D mammography) improves detection in dense breasts at some centers. Risk assessment tools (Tyrer-Cuzick) identify candidates for enhanced screening. False-positive callbacks cause anxiety—counsel on expected rates. Continue screening while life expectancy ≥10 years.",
  815: "Anti-HBc alone may indicate isolated core antibody—retest or vaccinate if no immunity. HBsAg-positive pregnant women need perinatal prophylaxis for newborn. Screen HIV and HCV in HBV-infected patients—shared risk factors. Link to hepatology when treatment criteria met.",
  816: "Plant-forward Mediterranean pattern reduces red meat to occasional servings. Mediterranean diet improves heart failure outcomes in observational studies. Coordinate with GLP-1 agonists when obesity and diabetes coexist. Avoid ultra-processed foods independent of macronutrient focus.",
  817: "Document AUDIT score and brief intervention in chart for quality metrics. Harm reduction strategies when abstinence not immediate goal. Screen for depression and trauma—integrated behavioral health improves outcomes. Disulfiram requires motivated patient and no recent alcohol use.",
  818: "Track weight and activity minutes at follow-up visits every 3–6 months. Prediabetes also warrants BP and lipid management for ASCVD prevention. Community DPP programs improve access versus referral-only model. Bariatric surgery discussion when BMI ≥35 with comorbidities failing lifestyle."
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
  if (!m) {
    console.warn("No match for", id);
    return;
  }
  let exp = m[2].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  if (exp.includes(add.slice(0, 35))) return;
  exp = exp.replace(/\n\nKEY POINTS:/, `\n\n${add}\n\nKEY POINTS:`);
  html = html.replace(re, `$1${JSON.stringify(exp).slice(1, -1)}$3`);
}

for (const [id, add] of Object.entries(extra1)) expand(Number(id), add);
for (const [id, add] of Object.entries(extra2)) expand(Number(id), add);

fs.writeFileSync(indexPath, html, "utf8");

console.log("Batch 4 expansion pass complete:\n");
for (let id = 794; id <= 818; id++) {
  const re = new RegExp(
    `"id": ${id},[\\s\\S]*?"explanation": "([\\s\\S]*?)",\\s*\\r?\\n\\s*"bulletExplanation"`
  );
  const m = html.match(re);
  if (m) {
    const w = countWords(m[1].replace(/\\n/g, " ").replace(/\\"/g, '"'));
    console.log(`  ${id}: ${w}w`);
  }
}
