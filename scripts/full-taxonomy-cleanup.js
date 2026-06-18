/**
 * Full taxonomy cleanup after Batch 5.
 *
 * Updates selected subcategory definitions and aggressively remaps every
 * existing question to the most appropriate Family Medicine curriculum bucket.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const indexPath = path.join(root, "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const qs = eval(html.match(/const QUESTIONS = (\[[\s\S]*?\n\]);/)[1]);

const MAP_NAMES = {
  1: "CV_SUBCAT",
  2: "PULM_SUBCAT",
  3: "GI_SUBCAT",
  4: "ENDO_SUBCAT",
  5: "UROLOGY_SUBCAT",
  6: "NEURO_SUBCAT",
  7: "MSK_SUBCAT",
  8: "ID_SUBCAT",
  9: "HEME_SUBCAT",
  10: "DERM_SUBCAT",
  11: "MH_SUBCAT",
  12: "PEDS_SUBCAT",
  13: "RHEUM_SUBCAT",
  14: "ONCO_SUBCAT",
  15: "ER_SUBCAT",
  16: "PREV_SUBCAT",
  17: "HEENT_SUBCAT",
  18: "WH_SUBCAT",
  19: "GERI_SUBCAT",
};

const VALID_SUBCATS = {
  1: ["athero", "hypertension", "electrophys", "chf", "vascular", "misc"],
  2: ["obstructive", "infectious", "immunology", "sleep", "vascular", "pleuralInterstitial", "misc"],
  3: ["upperGI", "lowerGI", "hepatobiliary", "functional", "misc"],
  4: ["diabetes", "thyroid", "pituitaryAdrenal", "obesity", "misc"],
  5: ["luts", "stone", "scrotal", "nephrology", "misc"],
  6: ["strokeVascular", "headache", "seizure", "vestibular", "neurodegenerative", "neuromuscular", "misc"],
  7: ["spine", "footAnkle", "knee", "hip", "handWristElbow", "shoulder", "hernias", "metabolicBone", "misc"],
  8: ["respiratory", "sti", "skinSoftTissue", "gi", "urinary", "systemic", "tickborne", "misc"],
  9: ["anemia", "coagulation", "misc"],
  10: ["inflammatory", "infectious", "neoplastic", "misc"],
  11: ["mood", "anxietyTrauma", "substanceUse", "psychopharm", "behavioral", "misc"],
  12: ["neonatal", "infectious", "development", "wellChild", "adolescent", "misc"],
  13: ["crystal", "autoimmune", "immunology", "misc"],
  14: ["hematologic", "solid", "skinCancer", "misc"],
  15: ["cardiac", "trauma", "toxicology", "neuro", "airwayShock", "ob", "misc"],
  16: ["nutrition", "screening", "exerciseLifestyle", "substancePrevention", "counselingBehaviorChange", "misc"],
  17: ["eye", "ear", "throatAirway", "misc"],
  18: ["reproductive", "pregnancy", "gynecologic", "misc"],
  19: ["cognitive", "mobility", "polypharmacy", "misc"],
};

function getMap(name) {
  const m = html.match(new RegExp(`const ${name} = \\{([\\s\\S]*?)\\};`));
  if (!m) throw new Error(`${name} not found`);
  return eval("({" + m[1] + "})");
}

const currentMaps = Object.fromEntries(
  Object.entries(MAP_NAMES).map(([catId, name]) => [Number(catId), getMap(name)])
);

function textFor(q) {
  return `${q.question || ""} ${(q.options || []).join(" ")} ${q.explanation || ""}`.toLowerCase();
}

function has(t, re) {
  return re.test(t);
}

function currentSubcat(q) {
  return currentMaps[q.categoryId]?.[q.id] || "misc";
}

function assign(categoryId, subcat) {
  return { categoryId, subcat };
}

function classifyWithin(categoryId, subcat, q, t) {
  const s = String(q.question || "").toLowerCase();
  switch (categoryId) {
    case 1:
      if (has(s, /\b(atrial fibrillation|afib|svt|arrhythmia|ecg|ekg|qrs|qt|bradycardia|tachycardia|heart block|palpitation|sotalol|amiodarone|ventricular tachycardia|digoxin)\b/)) return assign(1, "electrophys");
      if (has(s, /\b(heart failure|hfr?ef|hfpef|ejection fraction|entresto|sacubitril|spironolactone|congestion|pulmonary edema|bnp|s3 heart sound|frank-starling|lymphedema|venous edema)\b/)) return assign(1, "chf");
      if (has(s, /\b(pad|peripheral artery|claudication|aaa|aneurysm|aortic dissection|carotid|renal artery stenosis|fibromuscular dysplasia|abi|critical limb|raynaud|venous insufficiency|portal vein|nitric oxide|popliteal|circle of willis|buerger|vasculitis|vascular)\b/)) return assign(1, "vascular");
      if (has(s, /\b(ascvd|statin|ldl|cholesterol|atherosclerosis|myocardial infarction|mi\b|coronary|angina|cac|calcium score|plaque|cabg|coenzyme q10|red yeast rice|hs-crp|acute coronary|chest pain)\b/)) return assign(1, "athero");
      if (has(s, /\b(hypertension|blood pressure|bp\s|antihypertensive|lisinopril|losartan|amlodipine|hydrochlorothiazide|chlorthalidone|ace inhibitor|arb|thiazide|white coat|resistant htn|dash diet|dash)\b/)) return assign(1, "hypertension");
      return assign(1, subcat);
    case 2:
      if (has(t, /\b(asthma|copd|bronchodilator|inhaler|fev1|obstructive|albuterol|lama|laba|ics|exacerbation)\b/)) return assign(2, "obstructive");
      if (has(t, /\b(pneumonia|bronchiolitis|influenza|pertussis|productive cough|cap\b|curb-65)\b/)) return assign(2, "infectious");
      if (has(t, /\b(allergic|allergy|anaphylaxis|hypersensitivity|complement|sarcoidosis|eosinophil)\b/)) return assign(2, "immunology");
      if (has(t, /\b(osa|sleep apnea|snoring|apnea|obesity hypoventilation)\b/)) return assign(2, "sleep");
      if (has(t, /\b(pulmonary embol|pleuritic chest pain|wells|d-dimer|ct pulmonary angiography|pulmonary hypertension)\b/)) return assign(2, "vascular");
      if (has(t, /\b(pleural|effusion|interstitial|fibrosis|ild|empyema|velcro crackles|clubbing|asbest|nodule)\b/)) return assign(2, "pleuralInterstitial");
      return assign(2, subcat);
    case 3:
      if (has(t, /\b(gerd|dyspepsia|h\. pylori|ulcer|upper gi|esophag|gastric|epigastric|pancreatitis)\b/)) return assign(3, "upperGI");
      if (has(t, /\b(ibd|crohn|ulcerative colitis|colon|colonoscopy|fit\b|diverticul|appendicitis|diarrhea|constipation|ibs|functional)\b/)) {
        if (has(t, /\b(ibs|functional|constipation|functional dyspepsia)\b/)) return assign(3, "functional");
        return assign(3, "lowerGI");
      }
      if (has(t, /\b(liver|hepatic|hepatitis|cirrhosis|nafld|masld|gallbladder|biliary|pancreas|portal vein)\b/)) return assign(3, "hepatobiliary");
      return assign(3, subcat);
    case 4:
      if (has(t, /\b(diabetes|a1c|insulin|metformin|sglt2|glp-1|dka|prediabetes|hypoglycemia|hyperglycemia)\b/)) return assign(4, "diabetes");
      if (has(t, /\b(thyroid|tsh|t4|levothyroxine|graves|hashimoto|thyrotoxicosis)\b/)) return assign(4, "thyroid");
      if (has(t, /\b(adrenal|pituitary|cortisol|cushing|addison|pheochromocytoma|prolactin|hyperparathyroid|pth|calcium)\b/)) return assign(4, "pituitaryAdrenal");
      if (has(t, /\b(obesity|bmi|weight loss|metabolic|semaglutide)\b/)) return assign(4, "obesity");
      return assign(4, subcat);
    case 5:
      if (has(s, /\b(stone|nephrolithiasis|ureteral stone|renal stone|kidney stone|flank pain|radiolucent|calcium oxalate|uric acid stone|staghorn)\b/)) return assign(5, "stone");
      if (has(s, /\b(ckd|egfr|albuminuria|proteinuria|aki|creatinine|kidney|renal|nephrotic|glomerul|hematuria|hyperkalemia|polycystic|nephrology)\b/)) return assign(5, "nephrology");
      if (has(t, /\b(testicular|scrotal|varicocele|hydrocele|epididymitis|torsion|priapism|inguinal hernia)\b/)) return assign(5, "scrotal");
      if (has(t, /\b(bph|luts|prostate|psa|urinary retention|incontinence|overactive bladder|stress incontinence|urge incontinence|sildenafil|erectile)\b/)) return assign(5, "luts");
      return assign(5, subcat);
    case 6:
      if (has(s, /\b(stroke|tia|cva|amaurosis|carotid|cerebellar|posterior circulation)\b/)) return assign(6, "strokeVascular");
      if (has(s, /\b(headache|migraine|giant cell arteritis|temporal arteritis|cluster)\b/)) return assign(6, "headache");
      if (has(s, /\b(seizure|epilepsy|antiepileptic|status epilepticus)\b/)) return assign(6, "seizure");
      if (has(s, /\b(vertigo|meniere|vestibular|dix-hallpike|epley|hints)\b/)) return assign(6, "vestibular");
      if (has(s, /\b(dementia|alzheimer|parkinson|huntington|neurodegenerative)\b/)) return assign(6, "neurodegenerative");
      if (has(s, /\b(neuropathy|radiculopathy|bell palsy|facial nerve|guillain|myasthenia|carpal tunnel|neuromuscular)\b/)) return assign(6, "neuromuscular");
      return assign(6, subcat);
    case 7:
      if (has(s, /\b(osteoporosis|fragility fracture|dxa|bisphosphonate|vitamin d|bone density|metabolic bone|hyperparathyroid)\b/)) return assign(7, "metabolicBone");
      if (has(s, /\b(spine|back pain|lumbar|cervical|sciatica|cauda equina|radiculopathy|stenosis)\b/)) return assign(7, "spine");
      if (has(s, /\b(ankle|foot|plantar|achilles|metatarsal|toe|bunions|corn|wart)\b/)) return assign(7, "footAnkle");
      if (has(s, /\b(knee|meniscus|acl|patellar|osteoarthritis)\b/)) return assign(7, "knee");
      if (has(s, /\b(hip|scfe|trochanteric)\b/)) return assign(7, "hip");
      if (has(s, /\b(hand|wrist|elbow|carpal|scaphoid|olecranon|finger|thumb)\b/)) return assign(7, "handWristElbow");
      if (has(s, /\b(shoulder|rotator cuff|adhesive capsulitis)\b/)) return assign(7, "shoulder");
      if (has(s, /\b(hernia|inguinal|femoral|umbilical|incisional)\b/)) return assign(7, "hernias");
      return assign(7, subcat);
    case 8:
      if (has(s, /\b(dysuria|cystitis|pyelonephritis|uti\b|urinary tract infection|prostatitis|catheter-associated|asymptomatic bacteriuria)\b/)) return assign(8, "urinary");
      if (has(s, /\b(gonorrhea|chlamydia|syphilis|hiv|prep|pep|genital|cervicitis|trichomon)\b/)) return assign(8, "sti");
      if (has(s, /\b(cellulitis|abscess|impetigo|bite|wound infection|mrsa|skin soft tissue|necrotizing)\b/)) return assign(8, "skinSoftTissue");
      if (has(s, /\b(c\. difficile|clostridioides|diarrhea|foodborne|intra-abdominal|anaerobe|bacteroides)\b/)) return assign(8, "gi");
      if (has(s, /\b(lyme|tick|anaplas|ehrlich|babesia|rmsf|rocky mountain)\b/)) return assign(8, "tickborne");
      if (has(s, /\b(pneumonia|pharyngitis|pertussis|influenza|tb|tuberculosis|histoplasmosis|cough)\b/)) return assign(8, "respiratory");
      if (has(s, /\b(meningitis|sepsis|bacteremia|endocarditis|rabies|neutropenic|isoniazid|antibiotic|antibody|primary response)\b/)) return assign(8, "systemic");
      return assign(8, subcat);
    case 9:
      if (has(t, /\b(anemia|microcyt|macrocyt|ferritin|iron|thalassemia|b12|folate|hemoglobin)\b/)) return assign(9, "anemia");
      if (has(t, /\b(coag|thromb|dvt|pe\b|warfarin|inr|anticoag|platelet|bleeding|vte)\b/)) return assign(9, "coagulation");
      return assign(9, subcat);
    case 10:
      if (has(t, /\b(basal cell|squamous|melanoma|actinic|neoplastic|skin cancer|pearly|telangiectasia)\b/)) return assign(10, "neoplastic");
      if (has(t, /\b(tinea|scabies|herpes|zoster|cellulitis|abscess|impetigo|warts|molluscum)\b/)) return assign(10, "infectious");
      if (has(t, /\b(psoriasis|eczema|dermatitis|rosacea|acne|lichen planus|pityriasis|hidradenitis|urticaria|steroid)\b/)) return assign(10, "inflammatory");
      return assign(10, subcat);
    case 11:
      if (has(s, /\b(depression|bipolar|mania|mood|pmdd|postpartum depression)\b/)) return assign(11, "mood");
      if (has(s, /\b(anxiety|panic|ptsd|trauma|ocd|phobia|gad)\b/)) return assign(11, "anxietyTrauma");
      if (has(s, /\b(alcohol|opioid|substance|aud\b|naltrexone|acamprosate|buprenorphine|cannabis)\b/)) return assign(11, "substanceUse");
      if (has(s, /\b(ssri|snri|antipsychotic|benzodiazepine|lithium|stimulant|bupropion|varenicline|medication|psychopharm|serotonin|nms)\b/)) return assign(11, "psychopharm");
      if (has(s, /\b(motivational interviewing|cbt|behavioral|lifestyle|sleep hygiene|mindfulness)\b/)) return assign(11, "behavioral");
      return assign(11, subcat);
    case 12:
      if (has(t, /\b(newborn|neonate|neonatal|infant|meconium|jaundice|sids|pyloric|hirschsprung)\b/)) return assign(12, "neonatal");
      if (has(t, /\b(fever|infectious|bronchiolitis|strep|roseola|fifth disease|kawasaki|hand-foot-mouth|meningitis|febrile uti)\b/)) return assign(12, "infectious");
      if (has(t, /\b(development|autism|m-chat|speech|growth|puberty|adhd)\b/)) return assign(12, "development");
      if (has(t, /\b(well-child|well child|screening|immunization|lead|sids|iron|milk|penicillin prophylaxis)\b/)) return assign(12, "wellChild");
      if (has(t, /\b(adolescent|teen|confidential|sports|amenorrhea|eating disorder|contraception)\b/)) return assign(12, "adolescent");
      return assign(12, subcat);
    case 13:
      if (has(t, /\b(gout|pseudogout|crystal|urate|uric acid)\b/)) return assign(13, "crystal");
      if (has(t, /\b(lupus|sle|rheumatoid|vasculitis|giant cell|polymyalgia|scleroderma|sjogren|psoriatic arthritis|autoimmune)\b/)) return assign(13, "autoimmune");
      if (has(t, /\b(ana|rf|anti-ccp|hla|complement|immunology|hypersensitivity)\b/)) return assign(13, "immunology");
      return assign(13, subcat);
    case 14:
      if (has(t, /\b(leukemia|lymphoma|myeloma|hematologic)\b/)) return assign(14, "hematologic");
      if (has(t, /\b(melanoma|basal cell|squamous|skin cancer)\b/)) return assign(14, "skinCancer");
      if (has(t, /\b(cancer|tumor|carcinoma|breast|colon|lung|prostate|pancreatic|survivorship|chemotherapy)\b/)) return assign(14, "solid");
      return assign(14, subcat);
    case 15:
      if (has(t, /\b(stemi|acs|shockable|cardiac arrest|tamponade|bradycardia|aortic dissection|aaa rupture|hyperkalemia)\b/)) return assign(15, "cardiac");
      if (has(t, /\b(trauma|fracture|head injury|subdural|compartment|burn|tooth avulsion)\b/)) return assign(15, "trauma");
      if (has(t, /\b(acetaminophen|toxicology|poison|carbon monoxide|anticholinergic|overdose|cyanide)\b/)) return assign(15, "toxicology");
      if (has(t, /\b(seizure|status epilepticus|subarachnoid|meningitis|hyponatremia|thunderclap|stroke)\b/)) return assign(15, "neuro");
      if (has(t, /\b(anaphylaxis|airway|shock|sepsis|tension pneumothorax|hemoptysis|angioedema|foreign body)\b/)) return assign(15, "airwayShock");
      if (has(t, /\b(ectopic|preeclampsia|eclampsia|cord prolapse|postpartum hemorrhage|pregnant|pregnancy)\b/)) return assign(15, "ob");
      return assign(15, subcat);
    case 16:
      if (has(s, /\b(smoking|tobacco|alcohol screening|substance prevention|lung cancer screening)\b/)) return assign(16, "substancePrevention");
      if (has(s, /\b(motivational interviewing|brief intervention|counseling|behavior change|sbirt|readiness)\b/)) return assign(16, "counselingBehaviorChange");
      if (has(s, /\b(diet|nutrition|mediterranean|dash|protein|calcium|vitamin|food)\b/)) return assign(16, "nutrition");
      if (has(s, /\b(screening|mammography|colonoscopy|immunization|vaccine|uspstf|hepatitis b|psa|pap|cervical)\b/)) return assign(16, "screening");
      if (has(s, /\b(exercise|sleep|lifestyle|physical activity|dpp|weight loss|prediabetes)\b/)) return assign(16, "exerciseLifestyle");
      return assign(16, subcat);
    case 17:
      if (has(t, /\b(eye|vision|retina|glaucoma|red eye|cornea|ophthalm|macula|leukocoria)\b/)) return assign(17, "eye");
      if (has(t, /\b(ear|otitis|hearing|vertigo|meniere|eustachian|tinnitus)\b/)) return assign(17, "ear");
      if (has(t, /\b(sinus|rhinitis|nasal|throat|airway|croup|epiglottitis|hoarseness|tonsil|pharyngitis)\b/)) return assign(17, "throatAirway");
      return assign(17, subcat);
    case 18:
      if (has(s, /\b(pregnant|pregnancy|postpartum|prenatal|gestation|gestational|preeclampsia|rhogam|placenta)\b/)) return assign(18, "pregnancy");
      if (has(s, /\b(vaginal|vulvar|cervical|uterine|endometrial|ovarian|pelvic|fibroid|bleeding|prolapse|gynecologic|pap smear|vaginitis|candidiasis|adenomyosis|endometriosis|pelvic inflammatory)\b/)) return assign(18, "gynecologic");
      if (has(s, /\b(contraception|pcos|menopause|hot flashes|hormone therapy|fertile|infertility|emergency contraception|migraine with aura|pmdd|galactorrhea|oligomenorrhea|amenorrhea)\b/)) return assign(18, "reproductive");
      return assign(18, subcat);
    case 19:
      if (has(t, /\b(dementia|delirium|cognitive|alzheimer|confusion)\b/)) return assign(19, "cognitive");
      if (has(t, /\b(fall|frailty|mobility|gait|orthostatic|fracture|sarcopenia)\b/)) return assign(19, "mobility");
      if (has(t, /\b(polypharmacy|deprescribing|beers|benzodiazepine|anticholinergic|ppi|medication burden)\b/)) return assign(19, "polypharmacy");
      return assign(19, subcat);
    default:
      return assign(categoryId, subcat);
  }
}

function baseCategoryMove(q, categoryId, subcat, t) {
  const explicitMoves = {
    // Infectious urinary disease belongs with ID; structural urinary disease stays Urology.
    24: [8, "urinary"],
    590: [8, "urinary"],
    611: [8, "urinary"],
    743: [8, "urinary"],

    // Tickborne disease is grouped under ID for Midwest-oriented review.
    54: [8, "tickborne"],
    597: [8, "tickborne"],

    // Core emergency presentations that are better reviewed under Emergency.
    31: [15, "ob"],
    47: [15, "ob"],
    251: [15, "ob"],
    661: [15, "ob"],
    666: [15, "ob"],
    44: [15, "airwayShock"],
    236: [15, "airwayShock"],
    243: [15, "airwayShock"],
    262: [15, "airwayShock"],
    701: [15, "airwayShock"],
    805: [15, "airwayShock"],
    808: [15, "airwayShock"],
    247: [15, "neuro"],
    616: [15, "neuro"],
    621: [15, "neuro"],

    // Sleep-disordered breathing belongs under Pulmonology after Batch 5.
    637: [2, "sleep"],
  };
  if (explicitMoves[q.id]) {
    const [nextCategory, nextSubcat] = explicitMoves[q.id];
    return assign(nextCategory, nextSubcat);
  }
  return assign(categoryId, subcat);
}

function classify(q) {
  const t = textFor(q);
  let categoryId = q.categoryId;
  let subcat = currentSubcat(q);

  ({ categoryId, subcat } = baseCategoryMove(q, categoryId, subcat, t));
  return classifyWithin(categoryId, subcat, q, t);
}

function updateCategoryDefinitions() {
  const blocks = {
    1: `  { id: 1, name: "Cardiovascular", icon: "cardio", color: "#E63946", subcategories: [
    { id: "athero", name: "Atherosclerosis" },
    { id: "hypertension", name: "Hypertension" },
    { id: "electrophys", name: "Electrophysiology" },
    { id: "chf", name: "Congestive Heart Failure" },
    { id: "vascular", name: "Vascular Medicine" },
    { id: "misc", name: "General / Misc" }
  ] },`,
    3: `  { id: 3, name: "Gastroenterology", icon: "gi", color: "#2A9D8F", subcategories: [
    { id: "upperGI", name: "Upper GI" },
    { id: "lowerGI", name: "Lower GI" },
    { id: "hepatobiliary", name: "Hepatobiliary / Pancreatic" },
    { id: "functional", name: "Functional GI" },
    { id: "misc", name: "General / Misc" }
  ] },`,
    6: `  { id: 6, name: "Neurology", icon: "neuro", color: "#9B5DE5", subcategories: [
    { id: "strokeVascular", name: "Stroke / Vascular" },
    { id: "headache", name: "Headache" },
    { id: "seizure", name: "Seizure / Epilepsy" },
    { id: "vestibular", name: "Vestibular / Vertigo" },
    { id: "neurodegenerative", name: "Neurodegenerative" },
    { id: "neuromuscular", name: "Neuromuscular / Peripheral Nerve" },
    { id: "misc", name: "General / Misc" }
  ] },`,
    7: `  { id: 7, name: "Musculoskeletal", icon: "msk", color: "#00BBF9", subcategories: [
    { id: "spine", name: "Spine" },
    { id: "footAnkle", name: "Foot and Ankle" },
    { id: "knee", name: "Knee" },
    { id: "hip", name: "Hip" },
    { id: "handWristElbow", name: "Hand / Wrist / Elbow" },
    { id: "shoulder", name: "Shoulder" },
    { id: "hernias", name: "Hernias" },
    { id: "metabolicBone", name: "Metabolic Bone" },
    { id: "misc", name: "General / Misc" }
  ] },`,
    11: `  { id: 11, name: "Mental Health", icon: "mental", color: "#8AC926", subcategories: [
    { id: "mood", name: "Mood Disorders" },
    { id: "anxietyTrauma", name: "Anxiety / Trauma" },
    { id: "substanceUse", name: "Substance Use" },
    { id: "psychopharm", name: "Psychopharmacology" },
    { id: "behavioral", name: "Behavioral / Lifestyle" },
    { id: "misc", name: "General / Misc" }
  ] },`,
    16: `  { id: 16, name: "Preventive", icon: "shield", color: "#4ECDC4", subcategories: [
    { id: "nutrition", name: "Nutrition / Diet" },
    { id: "screening", name: "Screening / Immunization" },
    { id: "exerciseLifestyle", name: "Exercise / Sleep / Lifestyle" },
    { id: "substancePrevention", name: "Substance Prevention" },
    { id: "counselingBehaviorChange", name: "Counseling / Behavior Change" },
    { id: "misc", name: "General / Misc" }
  ] },`,
  };
  for (const [id, replacement] of Object.entries(blocks)) {
    const catId = Number(id);
    const name = {
      1: "Cardiovascular",
      3: "Gastroenterology",
      6: "Neurology",
      7: "Musculoskeletal",
      11: "Mental Health",
      16: "Preventive",
    }[catId];
    const re = new RegExp(`  \\{ id: ${catId}, name: "${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}",[\\s\\S]*?  \\] \\},`);
    if (!re.test(html)) throw new Error(`Category block not found for ${name}`);
    html = html.replace(re, replacement);
  }
}

function setQuestionCategory(id, categoryId) {
  const re = new RegExp(`("id"\\s*:\\s*${id},[\\s\\S]*?"categoryId"\\s*:\\s*)\\d+`);
  if (!re.test(html)) throw new Error(`Question ${id} categoryId not found`);
  html = html.replace(re, `$1${categoryId}`);
}

function formatMap(name, map) {
  const entries = Object.entries(map)
    .map(([id, subcat]) => [Number(id), subcat])
    .sort((a, b) => a[0] - b[0])
    .map(([id, subcat]) => `  ${id}:"${subcat}"`);
  return `const ${name} = {\r\n${entries.join(",\r\n")}\r\n};`;
}

function replaceMap(name, map) {
  const re = new RegExp(`const ${name} = \\{[\\s\\S]*?\\};`);
  if (!re.test(html)) throw new Error(`${name} block not found`);
  html = html.replace(re, formatMap(name, map));
}

function validateAssignments(assignments) {
  const seen = new Set(qs.map((q) => q.id));
  if (qs.length !== 877) throw new Error(`Expected 877 questions, found ${qs.length}`);
  if (seen.size !== qs.length) throw new Error("Duplicate question IDs");
  if (Math.max(...qs.map((q) => q.id)) !== 885) throw new Error("Expected max ID 885");

  for (const q of qs) {
    const a = assignments[q.id];
    if (!a) throw new Error(`Missing assignment for ${q.id}`);
    if (!VALID_SUBCATS[a.categoryId]) throw new Error(`Invalid category ${a.categoryId} for ${q.id}`);
    if (!VALID_SUBCATS[a.categoryId].includes(a.subcat)) {
      throw new Error(`Invalid subcat ${a.subcat} for category ${a.categoryId}, question ${q.id}`);
    }
  }
}

const assignments = {};
for (const q of qs) assignments[q.id] = classify(q);
validateAssignments(assignments);

updateCategoryDefinitions();

const newMaps = Object.fromEntries(
  Object.keys(MAP_NAMES).map((catId) => [Number(catId), {}])
);

let movedCategories = 0;
for (const q of qs) {
  const a = assignments[q.id];
  if (a.categoryId !== q.categoryId) {
    movedCategories += 1;
    setQuestionCategory(q.id, a.categoryId);
  }
  newMaps[a.categoryId][q.id] = a.subcat;
}

for (const [catId, name] of Object.entries(MAP_NAMES)) {
  replaceMap(name, newMaps[Number(catId)]);
}

const finalQs = eval(html.match(/const QUESTIONS = (\[[\s\S]*?\n\]);/)[1]);
if (finalQs.length !== 877) throw new Error(`Final count changed: ${finalQs.length}`);
if (Math.max(...finalQs.map((q) => q.id)) !== 885) throw new Error("Final max ID changed");
if (!html.includes("const unanswered = QUESTIONS.filter((q) => !(q.id in progress.answeredQuestions));")) {
  throw new Error("New-question-only quiz selection changed");
}

fs.writeFileSync(indexPath, html, "utf8");

const counts = {};
for (const a of Object.values(assignments)) {
  counts[a.categoryId] ||= {};
  counts[a.categoryId][a.subcat] = (counts[a.categoryId][a.subcat] || 0) + 1;
}
fs.writeFileSync(
  path.join(__dirname, "full-taxonomy-cleanup-summary.json"),
  JSON.stringify({ movedCategories, counts }, null, 2)
);

console.log(`Full taxonomy cleanup complete. Cross-category moves: ${movedCategories}.`);
