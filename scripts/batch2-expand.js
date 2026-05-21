/**
 * Expand batch 2 explanations to 400-425 words
 * Run: node scripts/batch2-expand.js
 */
const fs = require("fs");
const path = require("path");

const extra = {
  744: "Screen for atrial fibrillation, ischemic heart disease, and pulmonary hypertension contributing to HFpEF. Repeat BNP and echocardiography when clinical status changes. SGLT2 inhibitors may cause genital mycotic infections and require eGFR thresholds—generally acceptable above 20–25 with monitoring. Coordinate diuretic dosing with renal function and potassium; consider cardiology referral when hospitalizations recur despite optimal therapy.",
  745: "Document AF type and symptom burden for shared decision-making on rhythm versus rate control long term. Beta-blockers are preferred in HFrEF if present; nondihydropyridine CCBs are contraindicated with reduced EF. Before anticoagulation, review bleeding risk (HAS-BLED) and drug interactions; patient preference between DOAC agents matters for adherence. Reassess ventricular rate at follow-up visits and repeat ECG after medication changes.",
  746: "Reassess lipids 4–12 weeks after statin initiation and every 3–12 months once stable. Emphasize Mediterranean-style diet, aerobic activity, and weight management alongside pharmacotherapy. Statin-associated muscle symptoms should prompt evaluation of drug interactions (gemfibrozil), vitamin D deficiency, and dose adjustment rather than automatic discontinuation. In diabetic patients, consider coronary calcium scoring when statin hesitancy persists despite guideline indication.",
  747: "Symptomatic severe aortic stenosis carries poor prognosis without valve intervention—refer promptly to a heart team for TAVR versus SAVR decisions based on anatomy, frailty, and concomitant disease. In asymptomatic severe AS, recommend exercise restriction and serial echo monitoring because symptom onset should trigger intervention. Low-gradient low-flow AS may need dobutamine stress echo or careful hemodynamic assessment—primary care should not empirically vasodilate before specialist evaluation.",
  748: "Monitor for recurrence over 6–12 months; educate on warning signs of tamponade (dyspnea, hypotension, pulsus paradoxus). Restrict competitive sports for 3 months per guidelines. Consider etiology workup if recurrent: autoimmune panel, TB, malignancy. Gastric protection with PPI during high-dose NSAID therapy reduces GI bleeding risk. Colchicine dose-reduce in renal impairment and watch for diarrhea limiting adherence.",
  749: "Confirm smoking cessation at every visit; offer pharmacotherapy and counseling. Pulmonary rehabilitation improves dyspnea and exercise tolerance in COPD/ACO. Vaccinate against influenza, pneumococcus, COVID-19, and RSV per age and guideline recommendations. Monitor for pneumonia with ICS use; rinse mouth after inhaler to reduce oral candidiasis. Pulmonology referral if oxygen desaturation, frequent exacerbations, or diagnostic uncertainty.",
  750: "Before escalating therapy, observe inhaler technique with spacer and assess adherence objectively. Treat comorbid allergic rhinitis and gastroesophageal reflux, which worsen asthma control. Provide a written asthma action plan distinguishing daily controller from reliever use. Step down therapy when control maintained for 3 months to minimize steroid exposure. Refer to allergy/immunology for biologics if step 4–5 care required.",
  751: "Follow up within 48–72 hours to confirm clinical improvement; failure to improve should prompt broader spectrum, imaging review, or hospitalization. Obtain legionella/urinary antigen and blood cultures in moderate-severe inpatient CAP per local protocol. Encourage pneumococcal and influenza vaccination after recovery. Smoking cessation and comorbidity optimization (COPD, diabetes) reduce recurrence. Document CURB-65 or PSI in chart for quality and disposition justification.",
  752: "Intranasal antihistamine sprays (azelastine) or combination fluticasone-azelastine may augment control when monotherapy insufficient. Oral second-generation antihistamines help ocular symptoms adjunctively. Allergen immunotherapy is option for refractory seasonal disease after testing. Monitor for epistaxis with intranasal steroids; counsel on consistent daily use rather than PRN for inflammatory control. Screen for asthma comorbidity when persistent rhinitis present.",
  753: "If OSA confirmed, prioritize CPAP adherence support—mask fitting and humidification improve tolerance. Weight loss of 10% can reduce AHI substantially. Screen for comorbid obesity hypoventilation ( daytime hypercapnia) when BMI is very high. Treat resistant hypertension with guideline-directed regimen knowing CPAP may lower required antihypertensive burden. Commercial driver medical certification requires documented OSA treatment when applicable.",
  754: "If H. pylori test positive, use bismuth quadruple or concomitant therapy per local resistance patterns; confirm eradication with urea breath test or stool antigen at least 4 weeks after completing antibiotics and stopping PPI. For functional dyspepsia after negative testing and PPI trial, consider neuromodulators or psychological support. Document NSAID and aspirin use; prescribe PPI gastroprotection when antiplatelet or anti-inflammatory therapy required.",
  755: "While awaiting endoscopy, assess hemodynamic stability and transfusion needs; IV iron or transfusion if symptomatic anemia. Concurrently evaluate for occult bleeding sources and nutritional deficiency. Smoking cessation and alcohol moderation reduce upper GI cancer risk. If EGD reveals peptic ulcer, test H. pylori and treat; if malignancy, expedite staging. Do not empirically treat alarm-feature dysphagia with PPI delay beyond necessary referral interval.",
  756: "Timeliness matters: colonoscopy should generally occur within weeks of positive FIT to maximize cancer detection yield. If patient declines colonoscopy, discuss CT colonography with caveat that polypectomy requires colonoscopy. Ensure bowel prep instructions and transportation for sedation. After polypectomy, surveillance intervals depend on histology (advanced adenoma vs hyperplastic). Negative colonoscopy after positive FIT may still warrant continued stool-based screening per guidelines.",
  757: "Repeat FIB-4 periodically in patients with ongoing metabolic risk. Address cardiovascular risk aggressively—MASLD patients die most often from heart disease. Alcohol intake should stay within low-risk limits; no safe threshold for steatohepatitis progression is established. Emerging therapies (resmetirom, GLP-1 agents) may expand options—hepatology can advise eligible patients. Avoid hepatotoxic supplements and unnecessary medications.",
  758: "Educate on hand hygiene and safe food/water during travel. Warn against loperamide if fever or bloody diarrhea develops—stop and seek care. Post-antibiotic travelers diarrhea warrants C. difficile consideration. Probiotics may modestly shorten duration. Provide return precautions for dehydration, persistent symptoms beyond one week, or systemic toxicity requiring stool studies and targeted antibiotics.",
  759: "Verify insurance coverage for CGM and supplies; train on alarm settings and skin rotation sites. Time-in-range targets (often >70%) guide insulin adjustments more meaningfully than A1c alone. Continue diabetes self-management education and medical nutrition therapy. Assess for depression and diabetes distress affecting technology adoption. Endocrinology referral supports pump/CGM upgrades and hypoglycemia mitigation strategies.",
  760: "Document hypoglycemia episodes in problem list; relax glycemic targets (A1c 7.5–8%) if recurrent level 2/3 events in older adults. Educate household members on glucagon administration. Review alcohol intake and meal consistency with sulfonylurea timing. Consider CGM in recurrent hypoglycemia to detect nocturnal events. Switch to agents with low hypoglycemia risk as foundational therapy in vulnerable patients.",
  761: "In elderly or coronary disease, start levothyroxine at 25–50 mcg daily and titrate slowly to avoid angina or arrhythmia. Take levothyroxine on empty stomach separate from calcium, iron, and PPIs. Once stable, monitor TSH annually. Pregnancy requires immediate treatment and tighter TSH targets (often <2.5 first trimester). Subclinical hypothyroidism in pregnancy is never observe-only.",
  762: "Interpret ARR with attention to interfering drugs: ACE inhibitors and ARBs may elevate renin; spironolactone blocks aldosterone. Hypokalemia should be repleted before testing but persistent low K despite repletion supports PA. After confirmatory testing, CT adrenals and endocrinology referral guide surgery versus mineralocorticoid antagonist therapy. Unilateral adrenalectomy can cure hypertension and hypokalemia in aldosterone-producing adenoma.",
  763: "Titrate GLP-1 agonists slowly to minimize nausea; counsel on gallbladder symptoms and pancreatitis precautions (rare). Continue metformin unless contraindicated. Assess for obstructive sleep apnea and fatty liver as comorbid targets. Weight regain occurs if pharmacotherapy stopped without sustained behavior change—plan long-term strategy. Bariatric surgery remains option for BMI ≥35 with comorbidity when pharmacotherapy insufficient.",
  764: "Early neurology involvement improves adherence to secondary prevention. Carotid imaging identifies surgical candidates (≥50–69% symptomatic stenosis). Educate on stroke warning signs and when to call EMS. Ensure blood pressure lowering but avoid excessive hypotension acutely unless protocol indicates. DOAC selection considers renal function, interaction profile, and adherence (twice-daily vs once-daily).",
  765: "Blood pressure management in acute SAH is nuanced—avoid aggressive lowering before aneurysm secured unless hypertensive emergency. If LP deferred due to contraindication, proceed to CTA/MRA per institutional pathway. Nimodipine prevents vasospasm after confirmed SAH. Migraine therapy without SAH exclusion in thunderclap presentation has led to catastrophic missed diagnoses—maintain high suspicion.",
  766: "Review medications that worsen RLS: SSRIs, SNRIs, antihistamines, metoclopramide. Moderate exercise and leg massage may help mild cases. If dopamine agonist required, use lowest effective dose and monitor for augmentation. Iron repletion may take months; recheck ferritin after 8–12 weeks. Sleep hygiene and treatment of periodic limb movements improve daytime function.",
  767: "Annual comprehensive foot exams with monofilament testing are mandatory in diabetes. Ulcer prevention includes moisture control, nail care, and referral to podiatry when deformity present. Duloxetine benefits coexisting depression; pregabalin requires renal dose adjustment. If partial response, guideline-supported combination or topical capsaicin may be considered. Opioids reserve for refractory cases with caution.",
  768: "House-Brackmann grading documents severity; complete recovery occurs in most but synkinesis and crocodile tears may complicate recovery. Refer urgently if vesicles in ear (Ramsay Hunt) for antiviral plus steroid. EMG is not routine acutely but may guide prognosis after 3 weeks if incomplete recovery. Avoid corneal exposure: sunglasses outdoors, no sleeping without eye protection if lagophthalmos present."
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
    console.log(`Skip Q${id} - not found`);
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
  const w = countWords(exp);
  const flag = w < 400 || w > 425 ? " ***" : "";
  console.log(`Q${id} -> ${w} words${flag}`);
}

fs.writeFileSync(indexPath, html);
