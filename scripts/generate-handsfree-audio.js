#!/usr/bin/env node
/**
 * Generate Hands-Free Piper audio for LearnHealth Hub.
 *
 * Prerequisites (Windows — no pip needed):
 *   Piper binary is bundled at tools/piper/piper/piper.exe (run scripts/setup-piper.ps1 once)
 *   Voice model at tools/piper/voices/ (e.g. en_US-ryan-high.onnx + .onnx.json)
 *   Optional: ffmpeg on PATH for smaller MP3 output (otherwise WAV is used)
 *
 * Usage:
 *   node scripts/generate-handsfree-audio.js --category 4
 *   node scripts/generate-handsfree-audio.js --ids 1,2,3
 *   node scripts/generate-handsfree-audio.js --category 4 --model path/to/voice.onnx
 *   node scripts/generate-handsfree-audio.js --category 4 --dry-run
 *   node scripts/generate-handsfree-audio.js --list-categories
 *
 * Output: assets/tts/{voiceId}/cat-{categoryId}/q-{id}-{segment}.mp3
 *         assets/tts/manifest.json (updated)
 *
 * In the app: Voice picker → "Offline Piper" → Hands-Free uses these files.
 * Options stay in canonical A–D order when pre-generated audio is used (no shuffle).
 */

const fs = require("fs");
const path = require("path");
const { execSync, spawnSync } = require("child_process");
const { createSpeechHelpers, INDEX_PATH } = require("./handsfree-speech-text");

const ROOT = path.join(__dirname, "..");
const TTS_ROOT = path.join(ROOT, "assets", "tts");
const MANIFEST_PATH = path.join(TTS_ROOT, "manifest.json");

const PIPER_DIR = path.join(ROOT, "tools", "piper");
const DEFAULT_PIPER_EXE = path.join(PIPER_DIR, "piper", "piper.exe");
const DEFAULT_MODEL = path.join(PIPER_DIR, "voices", "en_US-ryan-high.onnx");
const DEFAULT_VOICE_ID = "en_US-ryan-high";

function parseArgs(argv) {
  const args = {
    category: null,
    ids: null,
    all: false,
    model: null,
    config: null,
    voiceId: DEFAULT_VOICE_ID,
    piperExe: null,
    dryRun: false,
    listCategories: false,
    force: false
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--category") args.category = parseInt(argv[++i], 10);
    else if (a === "--ids") args.ids = argv[++i].split(",").map((x) => parseInt(x.trim(), 10));
    else if (a === "--all") args.all = true;
    else if (a === "--model") args.model = argv[++i];
    else if (a === "--config") args.config = argv[++i];
    else if (a === "--piper-exe") args.piperExe = argv[++i];
    else if (a === "--voice-id") args.voiceId = argv[++i];
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--list-categories") args.listCategories = true;
    else if (a === "--force") args.force = true;
    else if (a === "--help" || a === "-h") {
      console.log(fs.readFileSync(__filename, "utf8").slice(0, 1200));
      process.exit(0);
    } else {
      console.error("Unknown argument:", a);
      process.exit(1);
    }
  }
  return args;
}

function hasCommand(cmd) {
  try {
    execSync(process.platform === "win32" ? `where ${cmd}` : `which ${cmd}`, {
      stdio: "ignore"
    });
    return true;
  } catch {
    return false;
  }
}

function resolveConfigForModel(modelPath, configArg) {
  if (configArg) return path.resolve(configArg);
  const onnxJson = modelPath.replace(/\.onnx$/i, ".onnx.json");
  if (fs.existsSync(onnxJson)) return onnxJson;
  const plainJson = modelPath + ".json";
  if (fs.existsSync(plainJson)) return plainJson;
  throw new Error("Config not found for model. Pass --config path.");
}

function resolvePiperModel(args) {
  if (args.model) {
    const model = path.resolve(args.model);
    if (!fs.existsSync(model)) throw new Error("Model not found: " + model);
    return { model, config: resolveConfigForModel(model, args.config) };
  }
  const envModel = process.env.PIPER_MODEL;
  if (envModel && fs.existsSync(envModel)) {
    const model = path.resolve(envModel);
    return {
      model,
      config: process.env.PIPER_CONFIG
        ? path.resolve(process.env.PIPER_CONFIG)
        : resolveConfigForModel(model, null)
    };
  }
  if (fs.existsSync(DEFAULT_MODEL)) {
    return { model: DEFAULT_MODEL, config: resolveConfigForModel(DEFAULT_MODEL, null) };
  }
  throw new Error(
    "Piper voice model not found.\n" +
      "  Run: powershell -ExecutionPolicy Bypass -File scripts/setup-piper.ps1\n" +
      "  Or pass: --model path/to/en_US-ryan-high.onnx"
  );
}

function resolvePiperExe(args) {
  if (args.piperExe) {
    const exe = path.resolve(args.piperExe);
    if (!fs.existsSync(exe)) throw new Error("piper.exe not found: " + exe);
    return exe;
  }
  if (process.env.PIPER_EXE && fs.existsSync(process.env.PIPER_EXE)) {
    return path.resolve(process.env.PIPER_EXE);
  }
  if (fs.existsSync(DEFAULT_PIPER_EXE)) return DEFAULT_PIPER_EXE;
  if (hasCommand("piper")) return "piper";
  if (hasCommand("piper.exe")) return "piper.exe";
  throw new Error(
    "piper.exe not found.\n" +
      "  Run: powershell -ExecutionPolicy Bypass -File scripts/setup-piper.ps1"
  );
}

function piperAvailable(args) {
  try {
    resolvePiperExe(args || {});
    return true;
  } catch {
    return false;
  }
}

function synthesizeWithPiper(text, piperExe, modelPath, configPath, outPath) {
  const args = ["--model", modelPath, "--config", configPath, "--output_file", outPath];
  const result = spawnSync(piperExe, args, {
    input: text,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    cwd: path.dirname(piperExe)
  });
  if (result.status !== 0) {
    const err = (result.stderr || result.stdout || "").trim();
    throw new Error("Piper failed: " + err);
  }
  if (!fs.existsSync(outPath)) throw new Error("Piper did not create output: " + outPath);
}

function convertToMp3(wavPath, mp3Path) {
  if (!hasCommand("ffmpeg")) return false;
  execSync(
    `ffmpeg -y -i "${wavPath}" -codec:a libmp3lame -b:a 64k "${mp3Path}"`,
    { stdio: "ignore" }
  );
  fs.unlinkSync(wavPath);
  return fs.existsSync(mp3Path);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return { version: 1, voice: DEFAULT_VOICE_ID, shared: {}, questions: {}, categories: {} };
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
}

function saveManifest(manifest) {
  ensureDir(TTS_ROOT);
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
}

function relVoicePath(voiceId, ...parts) {
  return path.join(voiceId, ...parts).split(path.sep).join("/");
}

function audioExt() {
  return hasCommand("ffmpeg") ? "mp3" : "wav";
}

function generateAudioFile(text, outBase, piperExe, modelPath, configPath, dryRun, force) {
  const ext = audioExt();
  const finalPath = outBase + "." + ext;
  if (dryRun) {
    console.log("  [dry-run]", path.basename(finalPath), `(${text.length} chars)`);
    return { path: finalPath, skipped: false };
  }
  if (!force && fs.existsSync(finalPath) && fs.statSync(finalPath).size > 0) {
    const kb = (fs.statSync(finalPath).size / 1024).toFixed(1);
    console.log("  ↷", path.basename(finalPath), `(skip, ${kb} KB)`);
    return { path: finalPath, skipped: true };
  }
  ensureDir(path.dirname(outBase));
  const wavPath = outBase + ".wav";
  synthesizeWithPiper(text, piperExe, modelPath, configPath, wavPath);
  if (ext === "mp3") {
    convertToMp3(wavPath, finalPath);
  } else if (wavPath !== finalPath) {
    fs.renameSync(wavPath, finalPath);
  }
  const kb = (fs.statSync(finalPath).size / 1024).toFixed(1);
  console.log("  ✓", path.basename(finalPath), `(${kb} KB)`);
  return { path: finalPath, skipped: false };
}

function selectQuestions(questions, categories, args) {
  if (args.ids?.length) {
    const set = new Set(args.ids);
    return questions.filter((q) => set.has(q.id));
  }
  if (args.category) {
    return questions.filter((q) => q.categoryId === args.category);
  }
  if (args.all) return questions;
  return null;
}

function main() {
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

  const selected = selectQuestions(questions, categories, args);
  if (!selected?.length) {
    console.error("Specify --category N, --ids 1,2,3, or --all (use --list-categories to see IDs)");
    process.exit(1);
  }

  if (!args.dryRun && !piperAvailable(args)) {
    console.error("Piper not found. Run: powershell -ExecutionPolicy Bypass -File scripts/setup-piper.ps1");
    process.exit(1);
  }

  let piperExe;
  let modelPath;
  let configPath;
  if (!args.dryRun) {
    piperExe = resolvePiperExe(args);
    ({ model: modelPath, config: configPath } = resolvePiperModel(args));
    console.log("Piper:", piperExe);
    console.log("Model:", modelPath);
  }

  const voiceId = args.voiceId;
  const manifest = loadManifest();
  manifest.version = 1;
  manifest.voice = voiceId;
  if (!manifest.questions) manifest.questions = {};
  if (!manifest.categories) manifest.categories = {};

  const sharedDir = path.join(TTS_ROOT, voiceId, "shared");
  const sharedRel = manifest.shared || {};
  const ext = audioExt();

  console.log("\nShared clips:");
  for (const [key, text] of Object.entries(helpers.SHARED_SEGMENTS)) {
    const outBase = path.join(sharedDir, key);
    if (!args.dryRun) {
      generateAudioFile(text, outBase, piperExe, modelPath, configPath, false, args.force);
      sharedRel[key] = relVoicePath("shared", key + "." + ext);
    } else {
      console.log(`  [dry-run] shared/${key} (${text.length} chars)`);
      sharedRel[key] = relVoicePath("shared", key + ".mp3");
    }
  }
  manifest.shared = sharedRel;
  if (!args.dryRun) saveManifest(manifest);

  const sorted = [...selected].sort((a, b) => a.categoryId - b.categoryId || a.id - b.id);
  const totalQuestions = sorted.length;
  let doneQuestions = 0;
  let generatedClips = 0;
  let skippedClips = 0;
  let currentCatId = null;
  let catDir = null;
  let catQuestionIds = [];

  for (const question of sorted) {
    if (question.categoryId !== currentCatId) {
      if (currentCatId != null && !args.dryRun) {
        manifest.categories[String(currentCatId)] = {
          name: categories.find((c) => c.id === currentCatId)?.name || "Category " + currentCatId,
          questionIds: catQuestionIds.sort((a, b) => a - b),
          generatedAt: new Date().toISOString()
        };
        saveManifest(manifest);
      }
      currentCatId = question.categoryId;
      catDir = path.join(TTS_ROOT, voiceId, "cat-" + currentCatId);
      catQuestionIds = [];
      const catName = categories.find((c) => c.id === currentCatId)?.name || "Category " + currentCatId;
      console.log(`\n${catName}:`);
    }

    doneQuestions++;
    console.log(`[${doneQuestions}/${totalQuestions}] Q${question.id}:`);
    const segments = helpers.buildHandsFreeSegments(question);
    const files = {};

    for (const [seg, text] of Object.entries(segments)) {
      const outBase = path.join(catDir, `q-${question.id}-${seg}`);
      if (!args.dryRun) {
        const result = generateAudioFile(text, outBase, piperExe, modelPath, configPath, false, args.force);
        if (result.skipped) skippedClips++;
        else generatedClips++;
      } else {
        generateAudioFile(text, outBase, null, null, null, true, false);
      }
      files[seg] = relVoicePath("cat-" + currentCatId, `q-${question.id}-${seg}.${args.dryRun ? "mp3" : ext}`);
    }

    manifest.questions[String(question.id)] = { categoryId: currentCatId, files };
    catQuestionIds.push(question.id);
    if (!args.dryRun) saveManifest(manifest);
  }

  if (currentCatId != null && !args.dryRun) {
    manifest.categories[String(currentCatId)] = {
      name: categories.find((c) => c.id === currentCatId)?.name || "Category " + currentCatId,
      questionIds: catQuestionIds.sort((a, b) => a - b),
      generatedAt: new Date().toISOString()
    };
    saveManifest(manifest);
  }

  if (!args.dryRun) {
    console.log(`\nDone. ${totalQuestions} questions.`);
    console.log(`  Generated: ${generatedClips} clips | Skipped (existing): ${skippedClips} clips`);
    console.log("Manifest:", MANIFEST_PATH);
    console.log('\nIn the app: set Voice to "Offline Piper" and start Hands-Free Mode.');
  } else {
    console.log(`\n[dry-run] Would process ${totalQuestions} questions (${totalQuestions * 7} clips).`);
  }
}

main();
