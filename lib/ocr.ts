"use client";

// Same-origin assets under /public/tesseract
const WORKER_PATH = "/tesseract/worker.min.js";
const CORE_PATH = "/tesseract";
const OCR_TIMEOUT_MS = 90_000;

export type OcrProgress = {
  status: string;
  progress?: number;
};

export type OcrPickResult = {
  /** Value to put in the search box */
  value: string;
  /** Raw OCR text for debugging / editing context */
  rawText: string;
  /** Alternate guesses the user can tap */
  alternatives: string[];
  /** True when we matched against a known bank ID */
  matchedKnownId: boolean;
};

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        window.clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/** Grayscale + contrast + mild upscale for small label photos. */
async function prepareImage(file: File | Blob): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    try {
      const maxSide = 1600;
      const minSide = 900;
      const longest = Math.max(bitmap.width, bitmap.height);
      let scale = 1;
      if (longest < minSide) scale = minSide / longest;
      else if (longest > maxSide) scale = maxSide / longest;

      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;

      ctx.drawImage(bitmap, 0, 0, width, height);
      const image = ctx.getImageData(0, 0, width, height);
      const { data } = image;

      // Grayscale + contrast boost helps printed SKUs
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const contrasted = Math.min(255, Math.max(0, (gray - 128) * 1.45 + 128));
        data[i] = data[i + 1] = data[i + 2] = contrasted;
      }
      ctx.putImageData(image, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      return blob || file;
    } finally {
      bitmap.close();
    }
  } catch {
    return file;
  }
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    "loading tesseract core": "Loading OCR engine…",
    "initializing tesseract": "Starting OCR…",
    "loading language traineddata": "Downloading language pack…",
    "initializing api": "Preparing OCR…",
    "recognizing text": "Reading image…",
  };
  return map[status] || status || "Working…";
}

/**
 * Run Tesseract.js OCR in the browser.
 * Creates a fresh worker per call so a hung job cannot block the next attempt.
 */
export async function recognizeTextFromImage(
  file: File | Blob,
  onProgress?: (info: OcrProgress) => void,
): Promise<string> {
  onProgress?.({ status: "Preparing image…" });
  const prepared = await prepareImage(file);

  onProgress?.({ status: "Loading OCR engine…" });
  const { createWorker, PSM } = await import("tesseract.js");

  const worker = await withTimeout(
    createWorker("eng", 1, {
      workerPath: WORKER_PATH,
      corePath: CORE_PATH,
      workerBlobURL: false,
      logger: (m) => {
        if (!m?.status) return;
        onProgress?.({
          status: statusLabel(String(m.status)),
          progress:
            typeof m.progress === "number" ? Math.round(m.progress * 100) : undefined,
        });
      },
      errorHandler: (err) => {
        console.error("[tesseract]", err);
      },
    }),
    OCR_TIMEOUT_MS,
    "OCR engine took too long to start. Check your network and try again.",
  );

  const objectUrl = URL.createObjectURL(prepared);
  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      tessedit_char_whitelist:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_/.",
      preserve_interword_spaces: "1",
    });

    onProgress?.({ status: "Reading image…", progress: 0 });
    const result = await withTimeout(
      worker.recognize(objectUrl),
      OCR_TIMEOUT_MS,
      "OCR timed out while reading the image. Try a clearer, closer photo.",
    );
    return (result.data.text || "").trim();
  } finally {
    URL.revokeObjectURL(objectUrl);
    try {
      await worker.terminate();
    } catch {
      // ignore
    }
  }
}

function normalizeId(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Common OCR lookalikes for product IDs */
function foldOcrNoise(value: string): string {
  return normalizeId(value)
    .replace(/[OQ]/g, "0")
    .replace(/[IL|]/g, "1")
    .replace(/[S]/g, "5")
    .replace(/[B]/g, "8")
    .replace(/[Z]/g, "2")
    .replace(/[G]/g, "6");
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const row = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[n];
}

/** Best window distance of needle inside haystack (or vice versa). */
function bestWindowDistance(haystack: string, needle: string): number {
  if (!needle) return Infinity;
  if (!haystack) return needle.length;
  if (haystack.length <= needle.length) return levenshtein(haystack, needle);

  let best = Infinity;
  for (let i = 0; i <= haystack.length - needle.length; i++) {
    const slice = haystack.slice(i, i + needle.length);
    best = Math.min(best, levenshtein(slice, needle));
    if (best === 0) return 0;
  }
  return best;
}

function scoreAgainstKnownId(ocrToken: string, knownId: string): number {
  const a = normalizeId(ocrToken);
  const b = normalizeId(knownId);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.95;

  const dist = Math.min(bestWindowDistance(a, b), bestWindowDistance(foldOcrNoise(a), foldOcrNoise(b)));
  const maxLen = Math.max(a.length, b.length, 1);
  return Math.max(0, 1 - dist / maxLen);
}

/** Pull likely MODEL / SKU tokens from OCR text (no giant glued blobs). */
export function extractModelCandidates(text: string): string[] {
  const candidates = new Set<string>();
  const chunks = text.split(/[\s,;|]+/).map((c) => c.trim()).filter(Boolean);

  for (const chunk of chunks) {
    const matches = chunk.match(/[A-Z0-9][A-Z0-9\-_/].{1,24}/gi) || [];
    for (const m of matches) {
      const token = normalizeId(m);
      // Prefer SKU-like: has letters + digits, reasonable length
      if (token.length >= 4 && token.length <= 24 && /[A-Z]/.test(token) && /\d/.test(token)) {
        candidates.add(token);
      }
    }
  }

  // Also scan raw lines without deleting all spaces first
  for (const line of text.split(/\r?\n/)) {
    const matches = line.match(/[A-Z0-9][A-Z0-9\-_/]{3,23}/gi) || [];
    for (const m of matches) {
      const token = normalizeId(m);
      if (token.length >= 4 && token.length <= 24 && /[A-Z]/.test(token) && /\d/.test(token)) {
        candidates.add(token);
      }
    }
  }

  return Array.from(candidates).slice(0, 20);
}

/**
 * Choose a search value from OCR, preferring the closest known bank ID.
 */
export function pickBestId(
  text: string,
  knownIds: string[] = [],
): OcrPickResult | null {
  const rawText = text.replace(/\s+/g, " ").trim();
  if (!rawText) return null;

  const candidates = extractModelCandidates(text);
  const compactRaw = normalizeId(rawText);

  const known = knownIds
    .map((id) => String(id || "").trim())
    .filter((id) => id.length >= 2);

  if (known.length) {
    const probes = [
      ...candidates,
      compactRaw.slice(0, 32),
      ...rawText.split(/\s+/).map(normalizeId).filter((t) => t.length >= 4),
    ];

    let bestId = "";
    let bestScore = 0;
    for (const id of known) {
      for (const probe of probes) {
        const score = scoreAgainstKnownId(probe, id);
        if (score > bestScore) {
          bestScore = score;
          bestId = id;
        }
      }
      // Also score full OCR blob as one window against this ID
      const blobScore = scoreAgainstKnownId(compactRaw, id);
      if (blobScore > bestScore) {
        bestScore = blobScore;
        bestId = id;
      }
    }

    // Accept strong fuzzy matches (OCR often misreads 1–3 chars on labels)
    if (bestId && bestScore >= 0.62) {
      const alternatives = [
        ...candidates.filter((c) => c !== normalizeId(bestId)),
        ...known.filter((id) => id !== bestId).slice(0, 5),
      ].slice(0, 6);
      return {
        value: bestId,
        rawText,
        alternatives,
        matchedKnownId: true,
      };
    }
  }

  // No bank match — use the most SKU-like OCR token (shortest reasonable first)
  const ranked = [...candidates].sort((a, b) => {
    const aMix = (/[A-Z]/.test(a) && /\d/.test(a) ? 0 : 1);
    const bMix = (/[A-Z]/.test(b) && /\d/.test(b) ? 0 : 1);
    if (aMix !== bMix) return aMix - bMix;
    return a.length - b.length;
  });

  const value = ranked[0] || (compactRaw.length >= 4 ? compactRaw.slice(0, 24) : null);
  if (!value) return null;

  return {
    value,
    rawText,
    alternatives: ranked.filter((c) => c !== value).slice(0, 6),
    matchedKnownId: false,
  };
}
