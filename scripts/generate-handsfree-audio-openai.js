#!/usr/bin/env node
/**
 * One-time OpenAI TTS generation for Hands-Free offline audio (no runtime API key in app).
 *
 * Setup:
 *   set OPENAI_API_KEY=sk-...          (PowerShell: $env:OPENAI_API_KEY="sk-...")
 *
 * Usage:
 *   node scripts/generate-handsfree-audio-openai.js --ids 1
 *   node scripts/generate-handsfree-audio-openai.js --category 4
 *   node scripts/generate-handsfree-audio-openai.js --all
 *   node scripts/generate-handsfree-audio-openai.js --ids 7 --model gpt-4o-mini-tts --bundle-id openai-ash-mini-test --force
 *
 * Output: assets/tts/openai-ash/...  +  assets/tts/openai-ash/manifest.json
 * App: Voice → "OpenAI Ash (Offline)"
 */

const fs = require("fs");
const path = require("path");
const { createSpeechHelpers, SHARED_SEGMENTS, buildProgressSegments } = require("./handsfree-speech-text");

const ROOT = path.join(__dirname, "..");
const TTS_ROOT = path.join(ROOT, "assets", "tts");
const BUNDLES_PATH = path.join(TTS_ROOT, "bundles.json");

const OPENAI_SPEECH_URL = "https://api.openai.com/v1/audio/speech";
const MAX_CHARS_LEGACY = 3800;
const MAX_CHARS_GPT4O_MINI = 1800;
const CEDAR_AUDIOBOOK_INSTRUCTIONS =
  "Speak like an award-winning audiobook narrator: engaging, confident, and compelling—you excel at capturing and holding your listener's attention. You are a dynamic speaker with a broad range and resonant tone.";
const RETRIES = 3;
const RETRY_DELAY_MS = 1500;
const REQUEST_GAP_MS = 350;

function parseArgs(argv) {
  const args = {
    category: null,
    ids: null,
    all: false,
    voice: "ash",
    model: "tts-1-hd",
    bundleId: null,
    dryRun: false,
    listCategories: false,
    force: false,
    instructions: null,
    skipBundles: false,
    skipInManifest: null,
    progressMaxTotal: 0,
    questionsOnly: false,
    progressOnly: false,
    sharedOnly: false
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--category") args.category = parseInt(argv[++i], 10);
    else if (a === "--ids") args.ids = argv[++i].split(",").map((x) => parseInt(x.trim(), 10));
    else if (a === "--all") args.all = true;
    else if (a === "--voice") args.voice = argv[++i];
    else if (a === "--model") args.model = argv[++i];
    else if (a === "--bundle-id") args.bundleId = argv[++i];
    else if (a === "--instructions") args.instructions = argv[++i];
    else if (a === "--skip-bundles") args.skipBundles = true;
    else if (a === "--skip-in-manifest") args.skipInManifest = argv[++i];
    else if (a === "--progress-max-total") args.progressMaxTotal = parseInt(argv[++i], 10);
    else if (a === "--questions-only") args.questionsOnly = true;
    else if (a === "--progress-only") args.progressOnly = true;
    else if (a === "--shared-only") args.sharedOnly = true;
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--list-categories") args.listCategories = true;
    else if (a === "--force") args.force = true;
    else if (a === "--help" || a === "-h") {
      console.log(fs.readFileSync(__filename, "utf8").slice(0, 1400));
      process.exit(0);
    } else {
      console.error("Unknown argument:", a);
      process.exit(1);
    }
  }
  args.bundleId = args.bundleId || `openai-${args.voice}`;
  return args;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function maxCharsForModel(model) {
  return String(model || "").includes("gpt-4o-mini-tts") ? MAX_CHARS_GPT4O_MINI : MAX_CHARS_LEGACY;
}

function splitTextChunks(text, model) {
  const maxChars = maxCharsForModel(model);
  if (!text) return [];
  if (text.length <= maxChars) return [text];
  const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];
  const chunks = [];
  let current = "";
  for (const s of sentences) {
    if (current.length + s.length > maxChars && current.length > 0) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [text.slice(0, maxChars)];
}

/** Reduce TTS clip-in at the first syllable (common with MP3/TTS output). */
function prepareTtsChunkText(segmentKey, chunkIndex, text) {
  const out = String(text || "").trim();
  if (!out || chunkIndex > 0) return out;
  if (out.startsWith("…")) return out;
  return `… ${out}`;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Resilient write for OneDrive/AV file locks (transient EBUSY/UNKNOWN/EPERM). */
function writeFileWithRetry(filePath, data, attempts = 8) {
  for (let i = 0; i < attempts; i++) {
    try {
      fs.writeFileSync(filePath, data);
      return;
    } catch (e) {
      const code = e && e.code;
      const transient = code === "EBUSY" || code === "UNKNOWN" || code === "EPERM" || code === "EACCES";
      if (!transient || i === attempts - 1) throw e;
      const waitMs = 300 * (i + 1);
      const end = Date.now() + waitMs;
      while (Date.now() < end) { /* sync backoff */ }
    }
  }
}

function manifestPath(bundleId) {
  return path.join(TTS_ROOT, bundleId, "manifest.json");
}

function loadManifest(bundleId) {
  const p = manifestPath(bundleId);
  if (!fs.existsSync(p)) {
    return { version: 1, engine: "openai", voice: bundleId, openaiVoice: "ash", shared: {}, questions: {}, categories: {} };
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function collectPrecacheUrls(bundleId, manifest) {
  const prefix = `assets/tts/${bundleId}/`;
  const urls = new Set([`${prefix}manifest.json`]);
  const addRel = (rel) => {
    if (!rel) return;
    if (Array.isArray(rel)) rel.forEach(addRel);
    else urls.add(prefix + rel);
  };
  for (const rel of Object.values(manifest.shared || {})) {
    if (rel && typeof rel === "object" && !Array.isArray(rel)) {
      for (const v of Object.values(rel)) addRel(v);
    } else {
      addRel(rel);
    }
  }
  for (const q of Object.values(manifest.questions || {})) {
    for (const rel of Object.values(q.files || {})) addRel(rel);
  }
  return [...urls].sort();
}

function writePrecacheUrls(bundleId, manifest) {
  const urls = collectPrecacheUrls(bundleId, manifest);
  const bundleRoot = path.join(TTS_ROOT, bundleId);
  ensureDir(bundleRoot);
  const out = {
    version: 1,
    bundleId,
    questionCount: Object.keys(manifest.questions || {}).length,
    urlCount: urls.length,
    generatedAt: new Date().toISOString(),
    urls
  };
  writeFileWithRetry(path.join(bundleRoot, "precache-urls.json"), JSON.stringify(out, null, 2) + "\n");
  return urls.length;
}

function saveManifest(bundleId, manifest, skipBundles) {
  const p = manifestPath(bundleId);
  ensureDir(path.dirname(p));
  writeFileWithRetry(p, JSON.stringify(manifest, null, 2) + "\n");
  if (!skipBundles) updateBundlesRegistry(bundleId, manifest);
  writePrecacheUrls(bundleId, manifest);
}

function updateBundlesRegistry(bundleId, manifest) {
  const count = Object.keys(manifest.questions || {}).length;
  const openaiVoice = manifest.openaiVoice || "ash";
  const label = `OpenAI ${openaiVoice[0].toUpperCase()}${openaiVoice.slice(1)} (Offline)`;
  let bundles = [];
  if (fs.existsSync(BUNDLES_PATH)) {
    try {
      bundles = JSON.parse(fs.readFileSync(BUNDLES_PATH, "utf8"));
    } catch {
      bundles = [];
    }
  }
  bundles = bundles.filter((b) => b.id !== "en_US-ryan-high");
  const entry = {
    id: bundleId,
    label,
    manifestUrl: `assets/tts/${bundleId}/manifest.json`,
    questionCount: count
  };
  const idx = bundles.findIndex((b) => b.id === bundleId);
  if (idx >= 0) bundles[idx] = entry;
  else bundles.push(entry);
  ensureDir(TTS_ROOT);
  fs.writeFileSync(BUNDLES_PATH, JSON.stringify(bundles, null, 2) + "\n");
}

async function fetchOpenAIMp3(apiKey, model, voice, text, instructions) {
  let lastErr = null;
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      const body = {
        model,
        voice,
        input: text,
        response_format: "mp3"
      };
      if (instructions && String(model).includes("gpt-4o-mini-tts")) {
        body.instructions = instructions;
      }
      const resp = await fetch(OPENAI_SPEECH_URL, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${body.slice(0, 300)}`);
      }
      return Buffer.from(await resp.arrayBuffer());
    } catch (e) {
      lastErr = e;
      if (attempt < RETRIES - 1) await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
  throw lastErr;
}

async function generateSegmentMp3(apiKey, model, voice, text, outBase, dryRun, force, instructions, segmentKey) {
  const chunks = splitTextChunks(text, model);
  const relPaths = [];
  let totalChars = 0;

  for (let i = 0; i < chunks.length; i++) {
    const suffix = chunks.length > 1 ? `.part${i}` : "";
    const outPath = outBase + suffix + ".mp3";
    const spoken = prepareTtsChunkText(segmentKey, i, chunks[i]);
    totalChars += spoken.length;

    if (dryRun) {
      console.log(`    [dry-run] ${path.basename(outPath)} (${spoken.length} chars)`);
      relPaths.push(path.basename(outPath));
      continue;
    }

    if (!force && fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
      const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
      console.log(`    ↷ ${path.basename(outPath)} (skip, ${kb} KB)`);
      relPaths.push(path.basename(outPath));
      continue;
    }

    ensureDir(path.dirname(outPath));
    const buf = await fetchOpenAIMp3(apiKey, model, voice, spoken, instructions);
    fs.writeFileSync(outPath, buf);
    const kb = (buf.length / 1024).toFixed(1);
    console.log(`    ✓ ${path.basename(outPath)} (${kb} KB)`);
    relPaths.push(path.basename(outPath));
    await sleep(REQUEST_GAP_MS);
  }

  return { relPaths, totalChars };
}

function relCatPath(catId, filename) {
  return `cat-${catId}/${filename}`;
}

function selectQuestions(questions, args) {
  if (args.ids?.length) {
    const set = new Set(args.ids);
    return questions.filter((q) => set.has(q.id));
  }
  if (args.category) return questions.filter((q) => q.categoryId === args.category);
  if (args.all) return questions;
  return null;
}

function loadLocalApiKey() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return "";
  const line = fs.readFileSync(envPath, "utf8").split(/\r?\n/).find((l) => l.startsWith("OPENAI_API_KEY="));
  if (!line) return "";
  return line.slice("OPENAI_API_KEY=".length).trim().replace(/^["']|["']$/g, "");
}

async function main() {
  const args = parseArgs(process.argv);
  const helpers = createSpeechHelpers();
  const questions = helpers.loadQuestions();
  const categories = helpers.loadCategories();

  if (args.listCategories) {
    const counts = {};
    questions.forEach((q) => {
      counts[q.categoryId] = (counts[q.categoryId] || 0) + 1;
    });
    categories.forEach((c) => {
      console.log(`${c.id}\t${c.name}\t${counts[c.id] || 0} questions`);
    });
    return;
  }

  const selected = selectQuestions(questions, args);
  if (!selected?.length && !args.progressOnly && !args.sharedOnly) {
    console.error("Specify --category N, --ids 1,2,3, or --all");
    process.exit(1);
  }

  let filtered = selected || [];
  if (args.skipInManifest && filtered.length) {
    const skipManifest = loadManifest(args.skipInManifest);
    const skipIds = new Set(Object.keys(skipManifest.questions || {}));
    const before = filtered.length;
    filtered = filtered.filter((q) => !skipIds.has(String(q.id)));
    console.log(`Skipping ${before - filtered.length} questions already in ${args.skipInManifest} (${filtered.length} remaining)`);
    if (!filtered.length) {
      console.log("Nothing left to generate.");
      return;
    }
  }

  const apiKey = process.env.OPENAI_API_KEY || loadLocalApiKey();
  if (!args.dryRun && !apiKey) {
    console.error("Set OPENAI_API_KEY environment variable (used once at build time only).");
    process.exit(1);
  }

  const bundleId = args.bundleId;
  const bundleRoot = path.join(TTS_ROOT, bundleId);
  const instructions =
    args.instructions ??
    (args.voice === "cedar" && String(args.model).includes("gpt-4o-mini-tts")
      ? CEDAR_AUDIOBOOK_INSTRUCTIONS
      : null);
  const manifest = loadManifest(bundleId);
  manifest.version = 1;
  manifest.engine = "openai";
  manifest.voice = bundleId;
  manifest.openaiVoice = args.voice;
  manifest.model = args.model;
  if (instructions) manifest.instructions = instructions;
  if (!manifest.questions) manifest.questions = {};
  if (!manifest.categories) manifest.categories = {};

  console.log(`Bundle: ${bundleId}`);
  console.log(`OpenAI voice: ${args.voice} | model: ${args.model}`);
  if (instructions) console.log(`Instructions: ${instructions.slice(0, 80)}...`);
  if (!args.dryRun) console.log(`Output: ${bundleRoot}`);

  let totalChars = 0;
  const sharedDir = path.join(bundleRoot, "shared");
  manifest.shared = manifest.shared || {};

  if (!args.questionsOnly) {
    if (!args.progressOnly) {
      console.log("\nShared clips:");
      for (const [key, text] of Object.entries(SHARED_SEGMENTS)) {
        const outBase = path.join(sharedDir, key);
        const result = await generateSegmentMp3(
          apiKey,
          args.model,
          args.voice,
          text,
          outBase,
          args.dryRun,
          args.force,
          instructions,
          key
        );
        totalChars += result.totalChars;
        manifest.shared[key] =
          result.relPaths.length === 1
            ? `shared/${result.relPaths[0]}`
            : result.relPaths.map((f) => `shared/${f}`);
      }
    }

    const progressMax = args.progressMaxTotal || (args.voice === "cedar" && !args.progressOnly ? 80 : 0);
    if (progressMax > 0) {
      const progressSegments = buildProgressSegments(progressMax);
      manifest.shared.progress = manifest.shared.progress || {};
      console.log(`\nProgress clips (1..${progressMax} totals, ${Object.keys(progressSegments).length} clips):`);
      let progressDone = 0;
      for (const [key, text] of Object.entries(progressSegments)) {
        progressDone++;
        if (progressDone % 100 === 1 || progressDone === Object.keys(progressSegments).length) {
          console.log(`  [${progressDone}/${Object.keys(progressSegments).length}] ${key}`);
        }
        const outBase = path.join(sharedDir, key);
        const result = await generateSegmentMp3(
          apiKey,
          args.model,
          args.voice,
          text,
          outBase,
          args.dryRun,
          args.force,
          instructions,
          key
        );
        totalChars += result.totalChars;
        manifest.shared.progress[key] = `shared/${result.relPaths[0]}`;
      }
    }
    if (!args.dryRun) saveManifest(bundleId, manifest, args.skipBundles);
  }

  if (args.progressOnly || args.sharedOnly) {
    if (!args.dryRun) {
      console.log(`\nDone. Manifest: ${manifestPath(bundleId)}`);
      console.log(`Precache: assets/tts/${bundleId}/precache-urls.json`);
    }
    return;
  }

  const sorted = [...filtered].sort((a, b) => a.categoryId - b.categoryId || a.id - b.id);
  let done = 0;
  let currentCatId = null;
  let catQuestionIds = [];

  for (const question of sorted) {
    if (question.categoryId !== currentCatId) {
      if (currentCatId != null && !args.dryRun) {
        manifest.categories[String(currentCatId)] = {
          name: categories.find((c) => c.id === currentCatId)?.name || "Category " + currentCatId,
          questionIds: catQuestionIds.sort((a, b) => a - b),
          generatedAt: new Date().toISOString()
        };
        saveManifest(bundleId, manifest, args.skipBundles);
      }
      currentCatId = question.categoryId;
      catQuestionIds = [];
      const catName = categories.find((c) => c.id === currentCatId)?.name || "Category " + currentCatId;
      console.log(`\n${catName}:`);
    }

    done++;
    console.log(`[${done}/${sorted.length}] Q${question.id}:`);
    const segments = helpers.buildHandsFreeSegmentsOpenAI(question);
    const files = {};
    const catDir = path.join(bundleRoot, "cat-" + currentCatId);

    for (const [seg, text] of Object.entries(segments)) {
      const outBase = path.join(catDir, `q-${question.id}-${seg}`);
      const result = await generateSegmentMp3(
        apiKey,
        args.model,
        args.voice,
        text,
        outBase,
        args.dryRun,
        args.force,
        instructions,
        seg
      );
      totalChars += result.totalChars;
      const rel =
        result.relPaths.length === 1
          ? relCatPath(currentCatId, result.relPaths[0])
          : result.relPaths.map((f) => relCatPath(currentCatId, f));
      files[seg] = rel;
    }

    manifest.questions[String(question.id)] = { categoryId: currentCatId, files };
    catQuestionIds.push(question.id);
    if (!args.dryRun) saveManifest(bundleId, manifest, args.skipBundles);
  }

  if (currentCatId != null && !args.dryRun) {
    manifest.categories[String(currentCatId)] = {
      name: categories.find((c) => c.id === currentCatId)?.name || "Category " + currentCatId,
      questionIds: catQuestionIds.sort((a, b) => a - b),
      generatedAt: new Date().toISOString()
    };
    saveManifest(bundleId, manifest, args.skipBundles);
  }

  const estCost = args.model.includes("gpt-4o-mini-tts")
    ? "see OpenAI token pricing (~half of tts-1-hd)"
    : "~$" + ((totalChars / 1_000_000) * (args.model.includes("hd") ? 30 : 15)).toFixed(2);
  console.log(`\nCharacters synthesized this run: ${totalChars.toLocaleString()}`);
  console.log(`Estimated OpenAI cost this run: ${estCost} (${args.model})`);

  if (!args.dryRun) {
    console.log(`\nDone. Manifest: ${manifestPath(bundleId)}`);
    console.log(`Precache: assets/tts/${bundleId}/precache-urls.json`);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
