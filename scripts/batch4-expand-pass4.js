/**
 * Batch 4 expansion pass 4 — final push to 400–425 words
 */
const fs = require("fs");
const path = require("path");

const extra5 = {
  800: "Multinodular goiter with dominant suspicious nodule follows same FNA criteria as solitary nodules. Thyroglobulin and calcitonin are not screening tests for unselected nodules—order only when medullary carcinoma suspected (family history MEN2, very high calcitonin). Post-FNA benign nodules: repeat ultrasound in 12–24 months or sooner if growth.",
  802: "Lentigo maligna melanoma on sun-damaged face of elderly patients may have prolonged in situ phase—low threshold for biopsy of changing macule. Registrar notification and staging imaging per oncology when invasive melanoma confirmed. Primary care continues skin surveillance for second primary melanomas and nonmelanoma skin cancers in high-risk patients.",
  803: "Fatigue severity scales (Brief Fatigue Inventory) track response to interventions over time. Address anemia of chronic disease and hypogonadism in appropriate cancer survivors when contributing. Encourage gradual increase in activity rather than boom-bust cycles that worsen post-exertional fatigue. Social support and return-to-work counseling improve long-term function.",
  805: "Epinephrine auto-injector prescription should include counseling on leg placement, hold 3 seconds, and call 911 after use even if symptoms improve. Consider comorbid asthma—anaphylaxis and asthma flare may coexist. Document allergen avoidance strategies and label reading education for peanut allergy.",
  807: "Single-ingredient acetaminophen overdose differs from combination products—identify co-ingestants (opioids, salicylates) that alter management. Primary care follow-up within 1 week after overdose addresses safety planning and psychiatric referral. Repeat LFTs at completion of NAC course confirm resolution.",
  809: "Telemedicine diabetic eye screening with validated imaging and remote interpretation expands rural access when dilated exam unavailable locally. Coordinate with pharmacy and care management to close gaps in annual eye exam quality measures. Proliferative retinopathy requires panretinal photocoagulation or anti-VEGF—primary care ensures ophthalmology engagement.",
  811: "Shared decision-making for observation versus antibiotics in older children documents discussion of natural history and follow-up plan. Prophylactic antibiotics for recurrent AOM are rarely indicated—refer ENT for tympanostomy when meeting criteria. Daycare exclusion until fever-free and analgesic needs met reduces transmission.",
  812: "Immunization history review at well-child visits prevents epiglottitis recurrence risk in unvaccinated populations. Distinguish from bacterial tracheitis (subglottic, older children, less drooling) and anaphylaxis (urticaria, no stridor pattern). Primary care practices should maintain emergency protocols for pediatric airway compromise.",
  813: "Fluorescein staining without slit lamp in primary care can suggest dendritic pattern but ophthalmology confirmation and management required. Contact lens discontinuation mandatory until complete epithelial healing confirmed. HSV keratitis recurrence risk warrants ophthalmology long-term follow-up and prophylaxis discussion.",
  814: "Insurance prior authorization for screening mammography under age 50 may require documentation of shared decision-making—note discussion in chart. Compare prior mammograms when available to assess interval change. Ultrasound adjunct for dense breast tissue on case-by-case basis per radiology recommendation—not universal replacement for mammography.",
  815: "Interpretation summary: HBsAg negative, anti-HBs positive, anti-HBc negative = vaccine immunity; HBsAg negative, anti-HBs negative, anti-HBc positive = resolved infection or occult—HBV DNA may clarify. Primary care ensures hepatitis B vaccine completion series for susceptible adults. Reinforce alcohol avoidance in chronic HBV.",
  816: "Motivational interviewing for dietary change links Mediterranean pattern to patient values (family meals, cultural foods adapted to olive oil and legumes). Group medical visits for diabetes may reinforce nutrition counseling efficiently. Monitor for eating disorders when restrictive dieting discussed—refer when indicated.",
  817: "Collaborative care for alcohol use disorder integrates behavioral health coach for follow-up brief interventions. Monitor hepatic transaminases when starting naltrexone or acamprosate. Driving under influence counseling and referral to impaired-driver programs when legally indicated. Celebrate reduction in AUDIT score as progress toward goal.",
  818: "Group DPP classes improve weight loss maintenance versus individual counseling alone in some trials. Screen for prediabetes in adults with BMI ≥25 and additional risk factors (family history, GDM history, PCOS). Cardiovascular risk assessment (ASCVD calculator) complements diabetes prevention in prediabetes population."
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
  exp = exp.replace(/\n\nKEY POINTS:/, `\n\n${add}\n\nKEY POINTS:`);
  html = html.replace(re, `$1${JSON.stringify(exp).slice(1, -1)}$3`);
}

for (const [id, add] of Object.entries(extra5)) expand(Number(id), add);

fs.writeFileSync(indexPath, html, "utf8");

console.log("Batch 4 expansion pass 4:\n");
for (let id = 794; id <= 818; id++) {
  const re = new RegExp(
    `"id": ${id},[\\s\\S]*?"explanation": "([\\s\\S]*?)",\\s*\\r?\\n\\s*"bulletExplanation"`
  );
  const m = html.match(re);
  if (m) {
    const w = countWords(m[1].replace(/\\n/g, " ").replace(/\\"/g, '"'));
    const tag = w >= 400 && w <= 430 ? "OK" : w < 400 ? "LOW" : "HIGH";
    console.log(`  ${id}: ${w}w ${tag}`);
  }
}
