/**
 * Move uploaded medical images into assets/ and attach explanationImages
 * to the approved question IDs in index.html.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const indexPath = path.join(root, "index.html");
const assetsDir = path.join(root, "assets");

const IMAGE_FILES = [
  "BPH.webp",
  "COPD.jpg",
  "DVT.jpg",
  "GERD.jpg",
  "Graves' disease.jpg",
  "MASLD.jpg",
  "OSA.jpg",
  "acromegaly.jpg",
  "actinic keratoses 1.jpg",
  "actinic keratoses 2.jpg",
  "adrenal gland anatomy.jpg",
  "asthma.png",
  "atopic dermatitis1.jpg",
  "atopic dermatitis2.jpg",
  "bleeding colonic diverticulum.jpg",
  "cellulitis1.jpg",
  "cellulitis2.jpg",
  "diverticulitis.webp",
  "endometrial cancer.jpg",
  "erythema infectiosum.jpg",
  "esophageal cancer.webp",
  "femoralneckfx.jpg",
  "hand foot mouth1.jpg",
  "hand foot mouth2.jpg",
  "herpes gladiatorum.jpg",
  "hiatal hernia.webp",
  "hidradenitis suppurativa.jpg",
  "infantile eczema.jpg",
  "inflammatory breast cancer.jpg",
  "intertrochantericfx.jpg",
  "leukoplakia1.jpg",
  "leukoplakia2.jpg",
  "lobarpneumonia.png",
  "multiple myeloma.jpg",
  "pancreatic head adenocarcinoma.webp",
  "pleural effusion.jpg",
  "pneumothorax.jpg",
  "pneumothoraxcxr.webp",
  "pulmonary fibrosis.webp",
  "roseola.jpg",
  "scabies1.webp",
  "scabies2.webp",
  "secondary hyperparathyroidism.jpg",
  "sinusitis.jpg",
  "sleepapnea.jpg",
  "spleen anatomy and physiology.png",
  "stomach cancer.webp",
  "tinea capitis.jpg",
];

function assetSrc(filename) {
  return `assets/${filename}`;
}

function img(filename, alt, caption) {
  return { src: assetSrc(filename), alt, caption };
}

const ASSIGNMENTS = {
  6: [img("COPD.jpg", "COPD lung changes", "Chronic obstructive pulmonary disease (COPD).")],
  16: [img("asthma.png", "Asthma airway inflammation", "Asthma: reversible airway obstruction and inflammation.")],
  44: [
    img("pneumothorax.jpg", "Tension pneumothorax clinical illustration", "Tension pneumothorax with mediastinal shift."),
    img("pneumothoraxcxr.webp", "Pneumothorax chest radiograph", "Chest X-ray showing pneumothorax."),
  ],
  146: [img("diverticulitis.webp", "Acute diverticulitis", "Acute diverticulitis of the colon.")],
  158: [
    img(
      "bleeding colonic diverticulum.jpg",
      "Bleeding colonic diverticulum",
      "Diverticular lower gastrointestinal bleeding source."
    ),
  ],
  167: [img("hiatal hernia.webp", "Hiatal hernia anatomy", "Hiatal hernia contributing to gastroesophageal reflux.")],
  219: [img("GERD.jpg", "GERD pathophysiology", "Gastroesophageal reflux disease (GERD).")],
  358: [img("Graves' disease.jpg", "Graves disease eye and thyroid findings", "Graves disease hyperthyroidism.")],
  366: [
    img(
      "spleen anatomy and physiology.png",
      "Spleen red pulp and white pulp anatomy",
      "Spleen anatomy: red pulp filters blood; white pulp supports immune response."
    ),
  ],
  418: [
    img(
      "adrenal gland anatomy.jpg",
      "Adrenal gland cortex and medulla anatomy",
      "Adrenal gland anatomy: cortex and medulla."
    ),
  ],
  429: [img("acromegaly.jpg", "Acromegaly facial features", "Acromegaly from excess growth hormone.")],
  438: [
    img(
      "secondary hyperparathyroidism.jpg",
      "Secondary hyperparathyroidism in chronic kidney disease",
      "Secondary hyperparathyroidism in chronic kidney disease."
    ),
  ],
  506: [
    img(
      "inflammatory breast cancer.jpg",
      "Inflammatory breast cancer peau d orange appearance",
      "Inflammatory breast cancer with peau d'orange skin changes."
    ),
  ],
  509: [
    img(
      "pancreatic head adenocarcinoma.webp",
      "Pancreatic head adenocarcinoma",
      "Pancreatic head adenocarcinoma, classic cause of painless jaundice."
    ),
  ],
  510: [
    img(
      "multiple myeloma.jpg",
      "Lytic bone lesions of multiple myeloma",
      "Multiple myeloma with lytic \"punched-out\" bone lesions."
    ),
  ],
  518: [
    img(
      "endometrial cancer.jpg",
      "Endometrial cancer presentation",
      "Endometrial cancer: postmenopausal bleeding is the classic presentation."
    ),
  ],
  525: [
    img(
      "esophageal cancer.webp",
      "Esophageal adenocarcinoma",
      "Esophageal adenocarcinoma linked to GERD and Barrett esophagus."
    ),
    img(
      "stomach cancer.webp",
      "Gastric adenocarcinoma",
      "Gastric adenocarcinoma; H. pylori and dietary factors are additional risk factors."
    ),
  ],
  530: [
    img("leukoplakia1.jpg", "Oral leukoplakia white patch", "Oral leukoplakia: white patch that cannot be scraped off."),
    img("leukoplakia2.jpg", "Oral leukoplakia close-up", "Leukoplakia is a premalignant oral mucosal lesion."),
  ],
  535: [img("roseola.jpg", "Roseola rash after fever", "Roseola (exanthem subitum): rash appears after fever breaks.")],
  543: [
    img(
      "erythema infectiosum.jpg",
      "Erythema infectiosum slapped cheek rash",
      "Erythema infectiosum (fifth disease) with slapped-cheek rash."
    ),
  ],
  555: [
    img("hand foot mouth1.jpg", "Hand-foot-mouth disease lesions", "Hand-foot-mouth disease caused by Coxsackievirus."),
    img("hand foot mouth2.jpg", "Hand-foot-mouth disease oral and skin lesions", "HFMD: oral ulcers and vesicles on hands and feet."),
  ],
  609: [img("BPH.webp", "Benign prostatic hyperplasia", "Benign prostatic hyperplasia (BPH).")],
  637: [
    img("sleepapnea.jpg", "Obstructive sleep apnea pathophysiology", "Obstructive sleep apnea: recurrent upper airway collapse during sleep."),
    img("OSA.jpg", "Obstructive sleep apnea illustration", "OSA is diagnosed with polysomnography when clinically suspected."),
  ],
  638: [
    img(
      "pulmonary fibrosis.webp",
      "Idiopathic pulmonary fibrosis honeycombing",
      "Idiopathic pulmonary fibrosis with basilar reticular opacities and honeycombing."
    ),
  ],
  751: [img("lobarpneumonia.png", "Lobar pneumonia chest radiograph", "Lobar community-acquired pneumonia on chest imaging.")],
  757: [img("MASLD.jpg", "Metabolic dysfunction-associated steatotic liver disease", "MASLD (formerly NAFLD): hepatic steatosis on imaging.")],
  773: [
    img("femoralneckfx.jpg", "Femoral neck fracture", "Displaced femoral neck fracture in an older adult."),
    img("intertrochantericfx.jpg", "Intertrochanteric hip fracture", "Intertrochanteric hip fracture after low-energy fall."),
  ],
  776: [img("DVT.jpg", "Deep vein thrombosis of the leg", "Deep vein thrombosis with unilateral leg swelling.")],
  780: [
    img(
      "infantile eczema.jpg",
      "Infantile atopic dermatitis on cheeks",
      "Infantile atopic dermatitis on the cheeks and extensor surfaces."
    ),
  ],
  781: [
    img("cellulitis1.jpg", "Lower extremity cellulitis", "Cellulitis: spreading erythema, warmth, and tenderness."),
    img("cellulitis2.jpg", "Cellulitis clinical appearance", "Lower-extremity cellulitis in a patient with diabetes."),
  ],
  782: [
    img("scabies1.webp", "Scabies burrows and excoriations", "Scabies: linear burrows in web spaces with intense nocturnal pruritus."),
    img("scabies2.webp", "Scabies distribution", "Scabies infestation with characteristic burrows and excoriations."),
  ],
  821: [img("sinusitis.jpg", "Acute bacterial sinusitis", "Acute bacterial rhinosinusitis with maxillary sinus involvement.")],
  834: [
    img("atopic dermatitis1.jpg", "Adult atopic dermatitis flexural eczema", "Adult atopic dermatitis in flexural distribution."),
    img("atopic dermatitis2.jpg", "Atopic dermatitis eczematous plaques", "Atopic dermatitis: pruritic eczematous plaques with atopy history."),
  ],
  835: [
    img(
      "tinea capitis.jpg",
      "Tinea capitis with scalp alopecia",
      "Tinea capitis: scaly alopecic patch with broken hairs."
    ),
  ],
  836: [
    img("actinic keratoses 1.jpg", "Actinic keratoses on sun-exposed skin", "Actinic keratoses on sun-exposed skin."),
    img("actinic keratoses 2.jpg", "Actinic keratosis close-up", "Actinic keratosis: rough, scaly premalignant lesion."),
  ],
  837: [
    img(
      "herpes gladiatorum.jpg",
      "Herpes gladiatorum in wrestler",
      "Herpes gladiatorum: HSV skin infection in close-contact athletes."
    ),
  ],
  838: [
    img(
      "hidradenitis suppurativa.jpg",
      "Hidradenitis suppurativa in axilla",
      "Hidradenitis suppurativa with nodules, sinus tracts, and scarring."
    ),
  ],
  874: [img("pleural effusion.jpg", "Unilateral pleural effusion", "Moderate unilateral pleural effusion on chest imaging.")],
};

function moveImagesToAssets() {
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
  for (const filename of IMAGE_FILES) {
    const from = path.join(root, filename);
    const to = path.join(assetsDir, filename);
    if (!fs.existsSync(from)) {
      if (fs.existsSync(to)) continue;
      throw new Error(`Missing image file: ${filename}`);
    }
    if (fs.existsSync(to)) fs.unlinkSync(to);
    fs.renameSync(from, to);
    console.log(`Moved ${filename} -> assets/`);
  }
}

function formatImagesBlock(images) {
  const entries = images.map((entry) => {
    if (images.length === 1) {
      return `      { "src": ${JSON.stringify(entry.src)}, "alt": ${JSON.stringify(entry.alt)}, "caption": ${JSON.stringify(entry.caption)} }`;
    }
    return [
      "      {",
      `        "src": ${JSON.stringify(entry.src)},`,
      `        "alt": ${JSON.stringify(entry.alt)},`,
      `        "caption": ${JSON.stringify(entry.caption)}`,
      "      }",
    ].join("\r\n");
  });
  return `    "explanationImages": [\r\n${entries.join(",\r\n")}\r\n    ]`;
}

function findQuestionBounds(html, id) {
  const marker = `"id": ${id},`;
  const idIdx = html.indexOf(marker);
  if (idIdx === -1) throw new Error(`Question ${id} not found`);
  const qStart = html.lastIndexOf("{", idIdx);
  let depth = 0;
  for (let i = qStart; i < html.length; i++) {
    if (html[i] === "{") depth++;
    else if (html[i] === "}") {
      depth--;
      if (depth === 0) return { qStart, qEnd: i + 1 };
    }
  }
  throw new Error(`Could not parse question block for ${id}`);
}

function patchQuestion(html, id, images) {
  const { qStart, qEnd } = findQuestionBounds(html, id);
  let block = html.slice(qStart, qEnd);
  const imagesBlock = formatImagesBlock(images);

  if (/"explanationImages"\s*:/.test(block)) {
    block = block.replace(/"explanationImages"\s*:\s*\[[\s\S]*?\],?\r?\n/, `${imagesBlock},\r\n`);
  } else {
    block = block.replace(/("correctAnswer"\s*:\s*\d+,)\r?\n/, `$1\r\n${imagesBlock},\r\n`);
  }

  return html.slice(0, qStart) + block + html.slice(qEnd);
}

function validate(html) {
  const qs = eval(html.match(/const QUESTIONS = (\[[\s\S]*?\n\]);/)[1]);
  const errors = [];

  for (const [idStr, images] of Object.entries(ASSIGNMENTS)) {
    const id = Number(idStr);
    const q = qs.find((item) => item.id === id);
    if (!q) {
      errors.push(`Question ${id} missing from bank`);
      continue;
    }
    if (!Array.isArray(q.explanationImages) || q.explanationImages.length !== images.length) {
      errors.push(`Question ${id} explanationImages count mismatch`);
      continue;
    }
    for (let i = 0; i < images.length; i++) {
      const expected = images[i];
      const actual = q.explanationImages[i];
      if (actual.src !== expected.src) errors.push(`Question ${id} image ${i + 1} src mismatch`);
      const filePath = path.join(root, actual.src.replace(/\//g, path.sep));
      if (!fs.existsSync(filePath)) errors.push(`Missing file for Q${id}: ${actual.src}`);
    }
  }

  if (errors.length) throw new Error(errors.join("\n"));
  console.log(`Validated ${Object.keys(ASSIGNMENTS).length} questions with explanation images.`);
}

moveImagesToAssets();

let html = fs.readFileSync(indexPath, "utf8");
for (const [idStr, images] of Object.entries(ASSIGNMENTS)) {
  html = patchQuestion(html, Number(idStr), images);
  console.log(`Patched Q${idStr} (${images.length} image${images.length === 1 ? "" : "s"})`);
}

validate(html);
fs.writeFileSync(indexPath, html, "utf8");
console.log("Done.");
