/**
 * Pass 2: push batch 2 explanations into 400-425 word range
 */
const fs = require("fs");
const path = require("path");

const extra2 = {
  744: "Primary care should track weight, edema, and functional status at each visit and adjust diuretics seasonally when HFpEF patients retain fluid during heat or dietary indiscretion. Patient activation—daily weights and action plans for 2–3 lb gain—reduces emergency visits. When eGFR declines below SGLT2 thresholds, consult cardiology for alternative GDMT rather than abrupt withdrawal without plan.",
  745: "For rate control, reassess symptoms and resting heart rate at 2–4 weeks; uptitrate beta-blocker as tolerated. If ventricular rates remain elevated, consider adding digoxin in selected patients or referral for rhythm control discussion. Document shared decision-making about anticoagulation benefits and bleeding risks in the chart; ensure follow-up within one week of initiating DOAC to confirm tolerance and adherence.",
  746: "Document ASCVD risk discussion and statin choice in the medical record for quality metrics. In women of childbearing potential, counsel on contraception with statins. Evaluate secondary dyslipidemia (hypothyroidism, nephrotic syndrome) if LDL disproportionately elevated despite therapy. Combination ezetimibe is reasonable add-on when LDL remains above goal on maximally tolerated statin intensity.",
  748: "Primary care follow-up within one week assesses pain control, CRP trend if obtained, and medication tolerance. Patients with recurrent pericarditis may need rheumatology or cardiology co-management and longer colchicine courses. Avoid heavy exertion until symptom resolution and inflammatory markers normalize. Contraception counseling applies if colchicine used in women of childbearing potential due to teratogenicity concerns.",
  749: "Document COPD/ACO diagnosis with spirometry in chart; update inhaler regimens at each exacerbation. Pulmonary function testing every 1–2 years tracks decline. Alpha-1 antitrypsin testing is indicated when emphysema presents in young patients or non-smokers. Coordinate comorbid heart failure and OSA management because overlap worsens dyspnea and prognosis.",
  750: "Schedule follow-up within 2–6 weeks after step-up to assess control and adverse effects. School or work action plans help adolescents and adults manage triggers. Influenza vaccination annually reduces severe exacerbations. Consider fractional exhaled nitric oxide if eosinophilic phenotype guides ICS dosing. Deprescribe ICS when control sustained to minimize growth and bone effects in long-term users.",
  751: "Document antibiotic choice and duration (typically 5–7 days for uncomplicated CAP per guidelines). Assess pneumococcal vaccination status at visit and update if indicated. In COPD patients with CAP, continue bronchodilators and consider steroids only when COPD exacerbation component present—not routine for uncomplicated CAP. Chest X-ray follow-up for slow responders at 6 weeks ensures resolution and excludes underlying malignancy.",
  752: "Seasonal pre-treatment starting intranasal steroid 1–2 weeks before pollen season improves outcomes. Environmental control—keeping windows closed during high pollen counts and showering after outdoor exposure—reduces burden. OTC oral decongestants may be used short-term but avoid chronic use due to rhinitis medicamentosa and cardiovascular effects. Refer for immunotherapy evaluation when symptoms impair quality of life despite optimized pharmacotherapy.",
  753: "Calculate STOP-BANG score in chart to document pre-test probability. If home sleep test is negative but suspicion remains high, repeat or proceed to polysomnography. Weight loss, lateral sleeping, and avoiding alcohol/sedatives before bedtime are adjunctive measures. Residual sleepiness despite CPAP warrants mask leak assessment and pressure titration through sleep medicine—not benzodiazepines.",
  754: "For patients failing test-and-treat and PPI trial, consider functional dyspepsia diagnosis and neuromodulator trial (low-dose tricyclic or buspirone in selected patients). Helicobacter serology alone should not guide active treatment decisions because it cannot confirm current infection. Coordinate endoscopy referral promptly when age or alarm thresholds crossed during follow-up.",
  755: "Coordinate expedited endoscopy scheduling—delays in alarm-feature dysphagia increase morbidity. While awaiting procedure, assess swallowing safety and nutrition; soft diet or temporary enteral support if aspiration risk. Iron supplementation with oral or IV iron treats deficiency but does not replace endoscopic evaluation. Barrett esophagus and peptic stricture remain in differential until endoscopy completed.",
  756: "Primary care must track positive FIT results in registry until colonoscopy completed—loss to follow-up is common and dangerous. Discuss bowel preparation assistance and transportation barriers upfront. If adenomas found, enter surveillance program per USMSTF/ASGE intervals. Patients with negative colonoscopy after positive FIT may need repeat FIT sooner per endoscopist guidance.",
  757: "Counsel on weight loss targets and aerobic activity as first-line MASLD therapy regardless of fibrosis stage. Review medications (amiodarone, methotrexate, tamoxifen) contributing to liver injury. Vaccinate against hepatitis A and B if nonimmune. Primary care monitors for cirrhosis stigmata (thrombocytopenia, splenomegaly, ascites) when FIB-4 elevated or rising.",
  758: "Provide travelers with oral rehydration packets and instructions before departure. Fluoroquinolone resistance is widespread in South and Southeast Asia—azithromycin is often preferred when antibiotics indicated. Post-infectious irritable bowel symptoms may follow; reassure and treat symptomatically if prolonged. Document antibiotic indication when prescribed to support stewardship.",
  759: "Primary care can initiate CGM prescription in many systems with endocrinology support for interpretation. Review downloads at visits to adjust basal and bolus ratios. Prescribe glucagon for all T1DM patients. Sick-day rules (ketone checking, hydration, basal continuation) reduce DKA risk during intercurrent illness.",
  760: "Create hypoglycemia mitigation plan: consistent carbohydrate intake, alcohol avoidance on secretagogues, and SMBG before driving. Deprescribe glipizide when switching to safer agents rather than overlapping therapies. For recurrent level 3 events, consider CGM and endocrinology referral. Document relaxed A1c targets when hypoglycemia limits intensification.",
  761: "Screen for dyslipidemia and subclinical hypothyroidism complications at diagnosis. In subclinical disease, repeat TSH in 2–3 months if initial elevation mild and patient asymptomatic. Levothyroxine brand consistency matters—counsel on stable manufacturer to avoid TSH fluctuation. Monitor for atrial fibrillation and osteoporosis risk in overt untreated hypothyroidism.",
  762: "Resistant hypertension definition (≥3 drugs including diuretic) should prompt standardized PA workup rather than ad hoc testing. Spironolactone 25–50 mg may treat PA empirically in some algorithms but confirmatory testing should not be indefinitely deferred. Hypokalemia refractory to repletion strongly supports PA even when aldosterone levels are borderline.",
  763: "Document BMI, comorbidities, and prior weight-loss attempts before anti-obesity pharmacotherapy for insurance authorization. Monitor heart rate and GI tolerance during GLP-1 titration. Address disordered eating and mood disorders that undermine lifestyle programs. Reassess weight and metabolic parameters every 3 months; discontinue if inadequate response after 3–6 months at target dose.",
  764: "Ensure atrial fibrillation is captured on problem list with anticoagulation plan; gaps in therapy caused this TIA. Dual antiplatelet therapy is not substitute for anticoagulation in AF-related TIA. Lifestyle modification (smoking cessation, activity, Mediterranean diet) complements pharmacotherapy. TIA clinics with 24-hour access reduce stroke rates in high-risk populations.",
  765: "Maintain low threshold for neuroimaging referral when thunderclap headache present even if initial workup negative. Observe patients with serial neurologic exams when SAH workup ongoing. Blood pressure management should follow neurocritical care guidance once SAH confirmed. Document shared decision-making if patient refuses LP after negative CT.",
  766: "Screen for peripheral neuropathy and uremia in RLS evaluation. Pregnancy and iron deficiency anemia are treatable secondary causes requiring specific management. If augmentation develops on dopamine agonist, switch to alpha-2-delta ligand under neurology guidance. Caffeine and sedating antihistamines are common reversible contributors worth eliminating before escalating pharmacotherapy.",
  767: "Refer to podiatry for deformities, prior ulcer, or Charcot foot. Autonomic neuropathy may coexist—ask about orthostatic symptoms and gastroparesis. Topical capsaicin or lidocaine patches may adjunct mild focal pain. Tricyclics are alternative but anticholinergic burden limits use in older adults. Document neuropathy diagnosis for disability and driving safety counseling.",
  768: "Reassess facial function weekly early in course; refer to otolaryngology or neurology if no improvement by 3 months or if recurrent palsy. Ramsay Hunt syndrome requires higher-dose antiviral plus steroid and has worse prognosis. Patients unable to close eye need urgent ophthalmology referral if corneal abrasion develops. Decompressive surgery is rare and specialist-directed for selected severe cases."
};

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

for (const [id, add] of Object.entries(extra2)) {
  const re = new RegExp(
    `(\\{\\s*"id": ${id},[\\s\\S]*?"explanation": ")([\\s\\S]*?)(",\\s*\\r?\\n\\s*"bulletExplanation")`
  );
  const m = html.match(re);
  if (!m) continue;
  let exp = m[2].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  if (exp.includes(add.slice(0, 35))) continue;
  exp = exp.replace(/\n\nKEY POINTS:/, `\n\n${add}\n\nKEY POINTS:`);
  const expJson = JSON.stringify(exp).slice(1, -1);
  html = html.replace(re, `$1${expJson}$3`);
  const w = countWords(exp);
  const flag = w < 400 || w > 425 ? " ***" : "";
  console.log(`Q${id} -> ${w} words${flag}`);
}

fs.writeFileSync(indexPath, html);
