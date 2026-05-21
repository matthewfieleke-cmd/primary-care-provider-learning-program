const fs = require("fs");
const path = require("path");
const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");
function wc(t){return String(t).trim().split(/\s+/).filter(Boolean).length;}

function patch(id, transform) {
  const re = new RegExp(`(\\{\\s*"id": ${id},[\\s\\S]*?"explanation": ")([\\s\\S]*?)(",\\s*\\r?\\n\\s*"bulletExplanation")`);
  const m = html.match(re);
  if (!m) return;
  let exp = m[2].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  exp = transform(exp);
  html = html.replace(re, `$1${JSON.stringify(exp).slice(1, -1)}$3`);
  return wc(exp);
}

const adds = {
  772: "Steroid injection may provide temporary relief but risks fascia rupture if repeated—reserve for refractory cases after months of conservative therapy.",
  773: "Delirium prevention (orientation, sleep, glasses/hearing aids) and early PT are as important as VTE prophylaxis for functional recovery after hip fracture.",
  776: "Compression stockings for 2 years post-DVT may reduce post-thrombotic syndrome in some guidelines—counsel on adherence.",
  777: "HIT is a never-event target in hospitalized patients—high index of suspicion on platelet fall days 5–10 of heparin.",
  778: "Primary care should not attempt phlebotomy without hematology; refer promptly when JAK2-positive erythrocytosis confirmed.",
  779: "Facial/genital psoriasis may require systemic therapy sooner due to quality-of-life impact.",
  780: "Daily emollient application within 3 minutes of bathing is key technique parents must learn.",
  781: "Cellulitis recurrence on same leg warrants evaluation for tinea pedis, lymphedema, and diabetes control.",
  782: "Daycare outbreaks: treat staff and children per public health guidance simultaneously.",
  783: "Slowly enlarging bleeding nodule on sun-exposed face should never be observed without biopsy.",
  784: "First-line SSRI choice considers prior response, side effects, and comorbidities (e.g., bupropion if smoking).",
  785: "Document manic episode carefully—future prescribers must avoid antidepressant monotherapy.",
  786: "Patients should know withdrawal symptoms are common with paroxetine and usually time-limited if taper slow.",
  787: "Set quit date and follow up weekly during bupropion initiation for smoking cessation support.",
  788: "CBT availability through telehealth expands access when local therapists scarce.",
  789: "Always plot bilirubin on hour-specific nomogram—never interpret single value without age in hours.",
  790: "Parent education that wheeze in infants is often viral reduces antibiotic pressure in primary care.",
  791: "Completing full 10-day course prevents rheumatic fever in endemic settings and reduces recurrence.",
  792: "Hearing recheck if language plateau—passing newborn screen does not exclude later hearing loss."
};

const adds2 = {
  772: "Weight-bearing activity modification prevents aggravation while maintaining fitness through low-impact alternatives.",
  773: "Fracture liaison service referral increases osteoporosis treatment rates at discharge when available.",
  776: "Warfarin alternative when DOAC contraindicated (mechanical valve, severe renal failure, APS).",
  777: "Argatroban dosing in ICU patients requires hematology-pharmacy coordination.",
  778: "Elevated hematocrit causes hyperviscosity symptoms—headache and vision changes warrant urgent evaluation.",
  779: "Narrowband UVB phototherapy is effective for widespread plaque psoriasis without systemic immunosuppression.",
  780: "Secondary infection with honey crusts requires topical or oral antibiotics in addition to eczema care.",
  781: "Orbital involvement (eye pain, limited gaze) is emergency—not outpatient cellulitis management.",
  782: "Permethrin application must cover entire body from neck down including nails and skin folds.",
  783: "Mohs micrographic surgery offers highest cure rate for high-risk facial basal cell carcinoma.",
  784: "Collaborative care models improve depression outcomes in primary care clinics with care manager support.",
  785: "Lithium levels, renal function, and TSH monitoring required on maintenance mood stabilizer therapy.",
  786: "Cross-taper to fluoxetine occasionally used for difficult paroxetine discontinuation under psychiatric guidance.",
  787: "Depression remission on bupropion may precede successful long-term smoking abstinence.",
  788: "SNRI venlafaxine/duloxetine effective for GAD when SSRI inadequate or not tolerated.",
  789: "Exchange transfusion reserved for severe hyperbilirubinemia or acute bilirubin encephalopathy signs.",
  790: "Trial single bronchodilator dose may be used once; repeated doses not recommended if no response.",
  791: "Centor criteria guide testing; treat only confirmed GAS to limit antibiotic resistance.",
  792: "Joint attention preserved does not exclude language disorder requiring speech therapy referral."
};

for (const [id, a] of Object.entries(adds)) {
  patch(Number(id), e => e.includes(a.slice(0,25)) ? e : e.replace(/\n\nKEY POINTS:/, `\n\n${a}\n\nKEY POINTS:`));
}
for (const [id, a] of Object.entries(adds2)) {
  patch(Number(id), e => e.includes(a.slice(0,25)) ? e : e.replace(/\n\nKEY POINTS:/, `\n\n${a}\n\nKEY POINTS:`));
}

// trim 774
patch(774, e => e.replace(
  "Document shared decision-making if patient initially declines endoscopy—revisit if anemia persists.\n\n",
  ""
));

fs.writeFileSync(indexPath, html);

for (let id = 769; id <= 793; id++) {
  const re = new RegExp(`"id": ${id},[\\s\\S]*?"explanation": "([\\s\\S]*?)",\\s*\\r?\\n\\s*"bulletExplanation"`);
  const m = html.match(re);
  if (!m) continue;
  const w = wc(m[1].replace(/\\n/g, " "));
  console.log((w >= 400 && w <= 425 ? "OK" : "!!") + ` Q${id}: ${w}w`);
}
