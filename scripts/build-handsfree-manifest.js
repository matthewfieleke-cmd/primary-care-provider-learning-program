#!/usr/bin/env node
/**
 * Merge openai-ash + openai-cedar bundle manifests into a single Hands-Free manifest
 * and write a combined precache-urls.json for the service worker.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TTS_ROOT = path.join(ROOT, "assets", "tts");
const ASH_ID = "openai-ash";
const CEDAR_ID = "openai-cedar";
const HF_DIR = path.join(TTS_ROOT, "handsfree");
const HF_MANIFEST = path.join(HF_DIR, "manifest.json");
const HF_PRECACHE = path.join(HF_DIR, "precache-urls.json");

function loadJson(p) {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function addRelUrls(urls, bundleId, rel) {
  if (!rel) return;
  const prefix = `assets/tts/${bundleId}/`;
  if (Array.isArray(rel)) rel.forEach((r) => addRelUrls(urls, bundleId, r));
  else urls.add(prefix + rel);
}

function collectBundleUrls(urls, bundleId, manifest) {
  if (!manifest) return;
  urls.add(`assets/tts/${bundleId}/manifest.json`);
  for (const rel of Object.values(manifest.shared || {})) {
    if (rel && typeof rel === "object" && !Array.isArray(rel)) {
      for (const v of Object.values(rel)) addRelUrls(urls, bundleId, v);
    } else {
      addRelUrls(urls, bundleId, rel);
    }
  }
  for (const q of Object.values(manifest.questions || {})) {
    for (const rel of Object.values(q.files || {})) addRelUrls(urls, bundleId, rel);
  }
}

function main() {
  const ash = loadJson(path.join(TTS_ROOT, ASH_ID, "manifest.json"));
  const cedar = loadJson(path.join(TTS_ROOT, CEDAR_ID, "manifest.json"));

  if (!ash?.questions && !cedar?.questions) {
    console.error("No Ash or Cedar manifest found.");
    process.exit(1);
  }

  const questions = {};
  for (const [qid, entry] of Object.entries(ash?.questions || {})) {
    questions[qid] = { bundle: ASH_ID, categoryId: entry.categoryId, files: entry.files };
  }
  for (const [qid, entry] of Object.entries(cedar?.questions || {})) {
    questions[qid] = { bundle: CEDAR_ID, categoryId: entry.categoryId, files: entry.files };
  }

  const sharedBundle = CEDAR_ID;
  const shared = cedar?.shared
    ? { ...cedar.shared }
    : { prompt: null, correct: null, progress: {} };

  const unified = {
    version: 2,
    type: "hybrid",
    sharedBundle,
    ashBundle: ASH_ID,
    cedarBundle: CEDAR_ID,
    shared,
    questions,
    stats: {
      ash: Object.values(questions).filter((q) => q.bundle === ASH_ID).length,
      cedar: Object.values(questions).filter((q) => q.bundle === CEDAR_ID).length,
      total: Object.keys(questions).length
    },
    builtAt: new Date().toISOString()
  };

  fs.mkdirSync(HF_DIR, { recursive: true });
  fs.writeFileSync(HF_MANIFEST, JSON.stringify(unified, null, 2) + "\n");

  const urls = new Set(["assets/tts/bundles.json", "assets/tts/handsfree/manifest.json"]);
  collectBundleUrls(urls, ASH_ID, ash);
  collectBundleUrls(urls, CEDAR_ID, cedar);

  const precache = {
    version: 2,
    bundleId: "handsfree",
    questionCount: unified.stats.total,
    ashCount: unified.stats.ash,
    cedarCount: unified.stats.cedar,
    urlCount: urls.size,
    generatedAt: new Date().toISOString(),
    urls: [...urls].sort()
  };
  fs.writeFileSync(HF_PRECACHE, JSON.stringify(precache, null, 2) + "\n");

  console.log(`Hands-Free manifest: ${HF_MANIFEST}`);
  console.log(`  Ash: ${unified.stats.ash} | Cedar: ${unified.stats.cedar} | Total: ${unified.stats.total}`);
  console.log(`Precache URLs: ${precache.urlCount} → ${HF_PRECACHE}`);
}

main();
