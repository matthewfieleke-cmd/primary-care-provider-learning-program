/**
 * Speech text helpers for Hands-Free Piper pre-generation.
 * Normalization is extracted from index.html so it stays in sync with the app.
 */
const fs = require("fs");
const path = require("path");

const INDEX_PATH = path.join(__dirname, "..", "index.html");

function loadIndexHtml() {
  return fs.readFileSync(INDEX_PATH, "utf8");
}

function loadQuestions(html) {
  const match = html.match(/const QUESTIONS = (\[[\s\S]*?\n\]);/);
  if (!match) throw new Error("Could not parse QUESTIONS from index.html");
  return eval(match[1]);
}

function loadCategories(html) {
  const match = html.match(/const CATEGORIES = (\[[\s\S]*?\n\]);/);
  if (!match) throw new Error("Could not parse CATEGORIES from index.html");
  return eval(match[1]);
}

function createNormalizeMedicalSpeechText(html) {
  const match = html.match(
    /const normalizeMedicalSpeechText = useCallback\(\(text\) => \{([\s\S]*?)\n  \}, \[\]\);/
  );
  if (!match) throw new Error("Could not extract normalizeMedicalSpeechText from index.html");
  // eslint-disable-next-line no-new-func
  return new Function("text", match[1]);
}

function plainSpeechCleanup(text) {
  let plain = String(text || "")
    .replace(/\n+/g, ". ")
    .replace(/\s{2,}/g, " ")
    .replace(/---/g, "")
    .trim();
  return plain
    .replace(/[•●▪►–—]/g, ".")
    .replace(/CORRECT:\s*([A-D])\)\s*/gi, "Correct answer, $1. ")
    .replace(/KEY\s+LEARNING\s+POINTS?:?/gi, "Key learning points.")
    .replace(/\.\s*\./g, ".")
    .replace(/,\s*,/g, ",");
}

function buildSpeechText(normalizeMedicalSpeechText, text) {
  return normalizeMedicalSpeechText(plainSpeechCleanup(text));
}

function buildOpenAISpeechText(text) {
  return plainSpeechCleanup(text);
}

function fixExplanationLetter(text, correctLetter) {
  if (!text || !correctLetter) return text;
  return text.replace(
    /(^|\n)(-\s*)?(CORRECT:\s*)[A-D]\b/g,
    (_, prefix, bullet, label) =>
      (prefix || "") + (bullet || "") + (label || "CORRECT: ") + correctLetter
  );
}

function cleanOption(opt) {
  return String(opt || "").replace(/^[A-D]\)\s*/, "");
}

function getCanonicalCorrectLetter(question) {
  const idx = Number.isInteger(question?.correctAnswer) ? question.correctAnswer : 0;
  return String.fromCharCode(65 + Math.min(3, Math.max(0, idx)));
}

function getExpandedExplanation(question, normalizeMedicalSpeechText) {
  const letter = getCanonicalCorrectLetter(question);
  const expanded =
    typeof question?.explanation === "string" ? question.explanation : "";
  return buildSpeechText(
    normalizeMedicalSpeechText,
    fixExplanationLetter(expanded, letter)
  );
}

function buildHandsFreeSegmentsForEngine(question, normalizeMedicalSpeechText, engine) {
  const useOpenAI = engine === "openai";
  const speak = (text) =>
    useOpenAI
      ? buildOpenAISpeechText(text)
      : buildSpeechText(normalizeMedicalSpeechText, text);
  const correctIdx = Number.isInteger(question.correctAnswer)
    ? question.correctAnswer
    : 0;
  const correctLetter = getCanonicalCorrectLetter(question);
  const options = question.options || [];
  const letter = getCanonicalCorrectLetter(question);
  const expanded =
    typeof question?.explanation === "string" ? question.explanation : "";

  const segments = {
    question: speak(question.question),
    explanation: speak(fixExplanationLetter(expanded, letter)),
    incorrect: speak(
      `Incorrect. The correct answer is ${correctLetter}, ${cleanOption(options[correctIdx])}.`
    )
  };

  for (let i = 0; i < options.length; i++) {
    const optLetter = String.fromCharCode(65 + i);
    segments[`opt-${i}`] = speak(`${optLetter}, ${cleanOption(options[i])}`);
  }

  return segments;
}

function buildHandsFreeSegments(question, normalizeMedicalSpeechText) {
  return buildHandsFreeSegmentsForEngine(question, normalizeMedicalSpeechText, "piper");
}

function buildHandsFreeSegmentsOpenAI(question) {
  return buildHandsFreeSegmentsForEngine(question, null, "openai");
}

const SHARED_SEGMENTS = {
  prompt: "What is your answer?",
  correct: "Correct!"
};

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen",
  "nineteen", "twenty", "twenty-one", "twenty-two", "twenty-three", "twenty-four", "twenty-five",
  "twenty-six", "twenty-seven", "twenty-eight", "twenty-nine", "thirty", "thirty-one",
  "thirty-two", "thirty-three", "thirty-four", "thirty-five", "thirty-six", "thirty-seven",
  "thirty-eight", "thirty-nine", "forty", "forty-one", "forty-two", "forty-three", "forty-four",
  "forty-five", "forty-six", "forty-seven", "forty-eight", "forty-nine", "fifty"
];

function numberWord(n) {
  const i = Math.floor(Number(n));
  if (!Number.isFinite(i) || i < 0) return String(n);
  if (i < NUMBER_WORDS.length) return NUMBER_WORDS[i];
  if (i < 100) {
    const tens = Math.floor(i / 10);
    const ones = i % 10;
    const tensWords = [
      "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
    ];
    if (ones === 0) return tensWords[tens];
    return `${tensWords[tens]}-${NUMBER_WORDS[ones]}`;
  }
  return String(i);
}

/** Cedar progress clips: "Question three of ten." keyed as progress-3-of-10 */
function buildProgressSegments(maxTotal = 80) {
  const segments = {};
  const cap = Math.min(Math.max(1, maxTotal), NUMBER_WORDS.length - 1);
  for (let total = 1; total <= cap; total++) {
    for (let n = 1; n <= total; n++) {
      segments[`progress-${n}-of-${total}`] =
        `Question ${numberWord(n)} of ${numberWord(total)}.`;
    }
  }
  return segments;
}

function createSpeechHelpers(indexHtml) {
  const html = indexHtml || loadIndexHtml();
  const normalizeMedicalSpeechText = createNormalizeMedicalSpeechText(html);
  return {
    loadQuestions: () => loadQuestions(html),
    loadCategories: () => loadCategories(html),
    buildSpeechText: (text) => buildSpeechText(normalizeMedicalSpeechText, text),
    buildHandsFreeSegments: (question) =>
      buildHandsFreeSegments(question, normalizeMedicalSpeechText),
    buildHandsFreeSegmentsOpenAI: (question) => buildHandsFreeSegmentsOpenAI(question),
    SHARED_SEGMENTS
  };
}

module.exports = {
  INDEX_PATH,
  loadIndexHtml,
  loadQuestions,
  loadCategories,
  createSpeechHelpers,
  SHARED_SEGMENTS,
  buildProgressSegments,
  numberWord
};
