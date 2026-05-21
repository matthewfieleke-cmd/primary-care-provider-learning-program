/**
 * Batch 4 expansion pass 2 — bring remaining explanations to 400–425 words
 */
const fs = require("fs");
const path = require("path");

const extra3 = {
  796: "Plain radiographs may show pencil-in-cup deformity or fluffy periostitis at DIP. Minimal disease activity (MDA) targets guide treat-to-target biologic therapy. Screen cardiovascular risk aggressively—PsA carries elevated MI and stroke risk independent of psoriasis severity. Document nail and skin involvement at each visit for treatment response tracking.",
  797: "Human leukocyte antigen B27 testing supports but does not diagnose—use in context of clinical features. Night pain improving with morning activity distinguishes inflammatory from mechanical back pain. CRP guides biologic initiation when objective inflammation present. Occupational modifications for prolonged sitting—standing desks and extension breaks reduce stiffness.",
  798: "American College of Rheumatology fibromyalgia management emphasizes nonpharmacologic therapies as cornerstone. Trauma and PTSD correlate with fibromyalgia—screen and refer behavioral health when indicated. Avoid excessive imaging that medicalizes symptoms without changing management. Warm water exercise and tai chi show benefit in clinical trials for fibromyalgia pain and function.",
  799: "Document date and modality of last CRC screening in EHR problem list for continuity. Stool DNA tests have higher false-positive rate than FIT—counsel before ordering. Transition from pediatric to adult screening at age 45 for average-risk individuals born after guideline change. Veterans and smokers may qualify for lung cancer screening separately—distinct workflow.",
  800: "Risk stratification combines sonographic pattern, nodule size, and clinical factors (family history, radiation exposure). Suspicious cervical lymphadenopathy with thyroid nodule increases malignancy risk—FNA nodes when indicated. Observe benign FNA (Bethesda II) with serial ultrasound at 12–24 months. Thyroid cancer survival excellent when papillary subtype treated appropriately.",
  801: "Peripheral neuropathy and hypercalcemia may accompany advanced myeloma—neurologic exam and calcium at presentation. Renal impairment from light chains requires hydration and avoid nephrotoxins until specialist evaluation. Bisphosphonates reduce skeletal events in myeloma with bone disease. Vaccination updates before immunosuppressive chemotherapy when elective window exists.",
  802: "Dermoscopy by trained clinicians improves specificity before referral. Partial biopsy of large lesions may miss deepest Breslow thickness—excise entire lesion when feasible. Subungual and acral lentiginous melanoma occur in darker skin tones—lower threshold for biopsy on nail bed or sole lesions. Sun protection counseling at every skin cancer discussion.",
  803: "NCCN survivorship guidelines recommend assessing fatigue at every visit for cancer survivors. Mindfulness-based stress reduction may reduce cancer-related fatigue severity in trials. Coordinate with oncology for treatment summary and surveillance schedule. Return-to-work accommodations when fatigue limits occupational function—document functional capacity.",
  804: "Prehospital 12-lead ECG transmission to receiving PCI center reduces door-to-balloon time. Right ventricular infarction: obtain right-sided leads (V4R) when hypotension with inferior STEMI. Contraindications to fibrinolysis reviewed before administration in non-PCI settings. Cardiac rehabilitation referral before hospital discharge when available.",
  805: "Food allergy action plan should specify when to give epinephrine versus antihistamine alone. Consider oral food challenge under allergist supervision after appropriate interval. Carrying epinephrine mandatory for peanut-allergic patients—counsel on expiration dates and temperature storage. School nurse and childcare provider training on auto-injector use.",
  806: "Graduated return-to-learn parallels return-to-sport for student athletes—cognitive rest initially then progressive classroom exposure. Vestibular ocular motor screening identifies treatable dizziness after concussion. Avoid alcohol and excessive screen time during acute recovery phase. Workers compensation and school nurse communication when prolonged recovery.",
  807: "Single-time-point acetaminophen level inadequate if unknown ingestion time—treat empirically when high suspicion. Hepatic failure signs: INR elevation, encephalopathy, rising bilirubin—transfer to transplant center. N-acetylcysteine oral versus IV selected by severity and facility capability. Safety planning and means restriction after intentional overdose.",
  808: "Sepsis bundles emphasize antibiotics within 1 hour without delaying for CT when unstable. Narrow antibiotics when cultures and sensitivities return. De-escalate vasopressors as perfusion improves with lactate clearance. Advance care planning discussions in recurrent nursing home sepsis when goals of care shift.",
  809: "HbA1c reduction slows diabetic retinopathy progression—intensify glycemic control per ADA targets when safe. Coordinate with endocrinology when proliferative retinopathy or macular edema diagnosed. Patient education: vision symptoms (floaters, curtain) require same-day ophthalmology—not wait for annual exam. Track diabetic eye exam quality measure in value-based contracts.",
  810: "Neuro-imaging (MRI brain) when amaurosis fugax accompanied by contralateral weakness or aphasia—stroke protocol. Optimize blood pressure and statin therapy for secondary stroke prevention. Carotid duplex timing urgent within days of symptomatic event. Document anticoagulation adherence and CHA2DS2-VASc score in atrial fibrillation.",
  811: "Recurrent AOM with effusion ≥3 months may indicate otitis media with effusion requiring audiology. Tympanic membrane perforation with otorrhea: topical fluoroquinolone drops if no tympanostomy tube contraindication. Vaccinate influenza and pneumococcus to reduce URI complications leading to AOM. Parent education on analgesic dosing and when to return.",
  812: "Epiglottitis incidence fell dramatically after Hib conjugate vaccine—maintain high vaccination rates. Differential includes retropharyngeal abscess (neck extension pain) and angioedema (no fever). Keep child upright in parent's lap during transport—minimize crying. ENT and anesthesia at receiving facility should be alerted en route.",
  813: "Recurrent HSV keratitis may require chronic oral antiviral prophylaxis per ophthalmology. Bandage contact lens occasionally used by specialist for persistent epithelial defects—not primary care initiation. Educate on UV protection and stress triggers for recurrence. Bacterial superinfection suspected with worsening pain and purulent discharge despite antivirals.",
  814: "Black women have higher breast cancer mortality—ensure equitable screening access and follow-up. Diagnostic workup for palpable mass regardless of recent normal mammogram. Breast MRI for BRCA carriers starting age 25–30 per guidelines—not average-risk screening. Document shared decision conversation in chart for ages 40–49 when offered screening.",
  815: "Linkage to care critical—chronic HBV patients lost to follow-up develop cirrhosis without symptoms. Vaccinate unprotected sexual and household contacts. HBV DNA and ALT guide treatment initiation per AASLD. Coinfection with HDV worsens prognosis—specialist evaluation when indicated.",
  816: "Food insecurity screening (Hunger Vital Sign) before diet counseling—refer SNAP/WIC when positive. Cultural adaptation of Mediterranean pattern improves adherence in diverse populations. Limit sugar-sweetened beverages independent of other dietary changes—high impact on glycemia and weight. Coordinate dietitian referral when A1c remains above target despite medication.",
  817: "Motivational interviewing training improves brief intervention effectiveness in primary care. Liver elastography or fibrosis scores when considering pharmacotherapy in heavy drinkers. Gabapentin may reduce alcohol craving in some studies—specialist-guided off-label use. Document driving safety and occupational impact of hazardous drinking.",
  818: "Identify prediabetes on problem list and track A1c in registry-based outreach programs. Group lifestyle classes match DPP format and improve social support. Metformin gastrointestinal side effects minimized with slow titration and take with food. Celebrate incremental weight loss—5% loss produces meaningful metabolic benefit."
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
  if (exp.includes(add.slice(0, 35))) return;
  exp = exp.replace(/\n\nKEY POINTS:/, `\n\n${add}\n\nKEY POINTS:`);
  html = html.replace(re, `$1${JSON.stringify(exp).slice(1, -1)}$3`);
}

for (const [id, add] of Object.entries(extra3)) expand(Number(id), add);

fs.writeFileSync(indexPath, html, "utf8");

console.log("Batch 4 expansion pass 2:\n");
for (let id = 794; id <= 818; id++) {
  const re = new RegExp(
    `"id": ${id},[\\s\\S]*?"explanation": "([\\s\\S]*?)",\\s*\\r?\\n\\s*"bulletExplanation"`
  );
  const m = html.match(re);
  if (m) {
    const w = countWords(m[1].replace(/\\n/g, " ").replace(/\\"/g, '"'));
    const ok = w >= 400 && w <= 425 ? "OK" : w < 400 ? "LOW" : "HIGH";
    console.log(`  ${id}: ${w}w ${ok}`);
  }
}
