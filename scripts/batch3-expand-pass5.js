const fs = require("fs");
const path = require("path");
const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

function wc(t) {
  return String(t).trim().split(/\s+/).filter(Boolean).length;
}

function patch(id, transform) {
  const re = new RegExp(
    `(\\{\\s*"id": ${id},[\\s\\S]*?"explanation": ")([\\s\\S]*?)(",\\s*\\r?\\n\\s*"bulletExplanation")`
  );
  const m = html.match(re);
  if (!m) return;
  let exp = m[2].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  exp = transform(exp);
  html = html.replace(re, `$1${JSON.stringify(exp).slice(1, -1)}$3`);
  return wc(exp);
}

patch(774, (e) =>
  e.replace(
    "Men and postmenopausal women with IDA are colon cancer screening populations until proven otherwise—document colonoscopy referral in care plan.\n\n",
    ""
  )
);

const adds = {
  778:
    "Refer all JAK2-positive erythrocytosis to hematology before initiating phlebotomy in primary care. Thrombotic risk is elevated even when patient is asymptomatic.",
  779:
    "Primary care tracks psoriasis body surface area and joint symptoms at visits to time dermatology referral for systemic therapy.",
  781:
    "Diabetic cellulitis requires foot inspection for portal of entry and optimization of glycemic control alongside appropriate antibiotics.",
  782:
    "Treatment failure usually reflects untreated contacts or inadequate application—re-educate on full-body permethrin technique.",
  784:
    "Serial PHQ-9 monitoring every 4–8 weeks documents antidepressant response and guides dose changes or referral.",
  785:
    "Hospitalization is indicated for mania with psychosis, severe agitation, or inability to maintain safety outpatient.",
  787:
    "Do not exceed recommended bupropion doses; seizure risk increases with high doses or bulimia history.",
  788:
    "GAD first-line remains SSRI/SNRI plus CBT; benzodiazepines only as short-term bridge when SSRI not yet effective.",
  791:
    "Completing the full antibiotic course for GAS pharyngitis reduces suppurative complications and rheumatic fever risk.",
  792:
    "Refer early intervention promptly—language outcomes are best when therapy begins before age three."
};

const adds6 = {
  784: "Document suicide risk at each follow-up visit when initiating SSRI therapy in primary care.",
  785: "After manic episode, maintenance mood stabilizer prevents recurrence and protects against future antidepressant-induced switches.",
  787: "Weekly follow-up during the first month of bupropion supports smoking cessation adherence and monitors mood.",
  788: "Venlafaxine or duloxetine are effective SNRI alternatives when SSRI partial response occurs in generalized anxiety disorder.",
  791: "Penicillin remains first-line for GAS pharyngitis; macrolides reserved for documented anaphylactic penicillin allergy."
};

for (const [id, add] of Object.entries(adds)) {
  patch(Number(id), (e) =>
    e.includes(add.slice(0, 28)) ? e : e.replace(/\n\nKEY POINTS:/, `\n\n${add}\n\nKEY POINTS:`)
  );
}

for (const [id, add] of Object.entries(adds6)) {
  patch(Number(id), (e) =>
    e.includes(add.slice(0, 28)) ? e : e.replace(/\n\nKEY POINTS:/, `\n\n${add}\n\nKEY POINTS:`)
  );
}

fs.writeFileSync(indexPath, html);

for (let id = 769; id <= 793; id++) {
  const re = new RegExp(
    `"id": ${id},[\\s\\S]*?"explanation": "([\\s\\S]*?)",\\s*\\r?\\n\\s*"bulletExplanation"`
  );
  const m = html.match(re);
  if (!m) continue;
  const w = wc(m[1].replace(/\\n/g, " "));
  console.log((w >= 400 && w <= 425 ? "OK" : "!!") + ` Q${id}: ${w}w`);
}
