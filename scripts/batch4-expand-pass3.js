/**
 * Batch 4 expansion pass 3 — final word count tuning (400–425 target)
 */
const fs = require("fs");
const path = require("path");

const extra4 = {
  794: null,
  795: null,
  796: "Primary care should coordinate rheumatology referral within weeks of suspected PsA—not months—because joint damage can occur early. Document psoriasis severity and functional impact for prior authorization of biologics.",
  797: "Primary care red flags for spondyloarthritis: age of back pain onset under 40, alternating buttock pain, and response to NSAIDs within 48 hours—prompt rheumatology referral when present.",
  798: "Schedule follow-up in 4–8 weeks to reassess exercise adherence and sleep quality. Rule out hypothyroidism and vitamin D deficiency once—do not repeat broad panels unnecessarily.",
  800: "When FNA shows malignancy or suspicious cytology, refer endocrine surgery for thyroidectomy planning. Incidental microcalcifications on ultrasound increase malignancy risk even in subcentimeter nodules.",
  801: "Primary care initiates urgent referral and supports hydration, pain control, and infection precautions while awaiting hematology appointment—never attribute CRAB syndrome to age alone.",
  802: "Primary care role: identify suspicious pigmented lesions, perform or arrange timely excisional biopsy, and ensure dermatology/oncology follow-up for confirmed melanoma. Document lesion diameter and evolution history.",
  803: "Schedule follow-up in 4–6 weeks to assess exercise adherence and mood. Coordinate with oncology survivorship clinic when available for integrated fatigue management.",
  805: "Primary care documents allergy in medical record, prescribes epinephrine auto-injector, and reviews technique at every visit. State laws may require epinephrine availability in schools.",
  806: "Primary care provides written return-to-activity instructions and school/work note limiting cognitive and physical demand during recovery. Re-evaluate before clearing contact sports.",
  807: "Poison control (1-800-222-1222) consultation recommended for complex acetaminophen ingestions. Primary care follow-up after discharge should address underlying mental health and substance use.",
  808: "Primary care in long-term care settings should have sepsis transfer protocols and standing orders for EMS activation when residents meet systemic inflammatory criteria with infection.",
  809: "Add diabetic eye exam to annual checklist alongside A1c and foot exam—the diabetes standard-of-care triad for complication prevention.",
  810: "Primary care ensures carotid imaging and neurology referral are completed after amaurosis fugax—do not assume anticoagulation alone obviates vascular imaging.",
  811: "Primary care follow-up at 2–4 weeks confirms otoscopic resolution; persistent effusion warrants audiology for hearing impact in language-development years.",
  812: "Primary care recognition and immediate EMS activation saves lives—never attempt direct oropharyngeal examination in the office when epiglottitis is suspected.",
  813: "Primary care must refer same-day or next-day ophthalmology for suspected HSV keratitis—delay risks corneal scarring and permanent vision loss.",
  814: "Primary care orders screening mammography and tracks BI-RADS results to ensure diagnostic follow-up completion when callbacks occur.",
  815: "Primary care implements birth-country and risk-based HBV screening at preventive visits and links HBsAg-positive patients to hepatology for long-term monitoring.",
  816: "Primary care reinforces Mediterranean dietary counseling at chronic disease visits—small sustained changes outperform short-term restrictive diets.",
  817: "Primary care re-administers AUDIT at follow-up to track reduction in hazardous drinking and adjusts pharmacotherapy when goals not met.",
  818: "Primary care enrolls eligible patients in DPP or equivalent and rechecks A1c every 6–12 months to detect progression to diabetes early."
};

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

function expand(id, add) {
  if (!add) return;
  const re = new RegExp(
    `(\\{\\s*"id": ${id},[\\s\\S]*?"explanation": ")([\\s\\S]*?)(",\\s*\\r?\\n\\s*"bulletExplanation")`
  );
  const m = html.match(re);
  if (!m) {
    console.warn("No match", id);
    return;
  }
  let exp = m[2].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  exp = exp.replace(/\n\nKEY POINTS:/, `\n\n${add}\n\nKEY POINTS:`);
  html = html.replace(re, `$1${JSON.stringify(exp).slice(1, -1)}$3`);
}

for (const [id, add] of Object.entries(extra4)) expand(Number(id), add);

fs.writeFileSync(indexPath, html, "utf8");

console.log("Batch 4 expansion pass 3:\n");
let low = 0, ok = 0, high = 0;
for (let id = 794; id <= 818; id++) {
  const re = new RegExp(
    `"id": ${id},[\\s\\S]*?"explanation": "([\\s\\S]*?)",\\s*\\r?\\n\\s*"bulletExplanation"`
  );
  const m = html.match(re);
  if (m) {
    const w = countWords(m[1].replace(/\\n/g, " ").replace(/\\"/g, '"'));
    if (w >= 400 && w <= 425) ok++;
    else if (w < 400) low++;
    else high++;
    console.log(`  ${id}: ${w}w`);
  }
}
console.log(`\nOK: ${ok}, LOW: ${low}, HIGH: ${high}`);
