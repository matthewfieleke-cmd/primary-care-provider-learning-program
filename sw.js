// Service Worker — shell network-first; TTS audio cache-first with bulk install preload

const CACHE_NAME = "pcp-learning-v17";
const TTS_PRECACHE_MANIFEST = "assets/tts/openai-cedar/precache-urls.json";
const TTS_BATCH_SIZE = 25;

const OFFLINE_URLS = [
  "index.html",
  "/",
  "manifest.json",
  "privacy-policy.html",
  "assets/pwa-icon-44.png",
  "assets/pwa-icon-44-maskable.png",
  "assets/pwa-icon-150.png",
  "assets/pwa-icon-150-maskable.png",
  "assets/pwa-icon-192.png",
  "assets/pwa-icon-192-maskable.png",
  "assets/pwa-icon-512.png",
  "assets/pwa-icon-512-maskable.png",
  "assets/pwa-apple-touch-icon.png",
  "assets/chat-icon-mobile.png",
  "assets/screenshot-wide.png",
  "assets/screenshot-narrow.png",
  "assets/cardiovascular.png",
  "assets/pulmonology.png",
  "assets/gastroenterology.png",
  "assets/endocrine.png",
  "assets/urology.PNG",
  "assets/neurology.png",
  "assets/musculoskeletal.png",
  "assets/infectious-disease.png",
  "assets/hematology.png",
  "assets/dermatology.png",
  "assets/mental-health.png",
  "assets/pediatric.png",
  "assets/rheumatology.png",
  "assets/oncology.png",
  "assets/emergency.png",
  "assets/preventive-shield.png",
  "assets/heent.png",
  "assets/geriatrics.png",
  "assets/emergency-ambulance.png",
  "assets/achillesinsert---cropped.jpg",
  "assets/afib-ecg-comparison.png",
  "assets/ankle-5th-metatarsal-avulsion-xray.png",
  "assets/ankle-fibular-avulsion-xray.png",
  "assets/ankle-lateral-clinical.png",
  "assets/ankle-lateral-ligament-diagram.png",
  "assets/aortic-dissection.png",
  "assets/atherosclerosis-progression.png",
  "assets/atrial-fibrillation-stroke.png",
  "assets/bunions.jpeg",
  "assets/circle-of-willis.png",
  "assets/cli-foot-gangrene.png",
  "assets/cli-lower-limbs.png",
  "assets/corn-mayo.jpg",
  "assets/dash-diet-servings.png",
  "assets/diastasis-recti.png",
  "assets/ds00468_im00333_mcdc7_mortons_neuromathu_jpg.jpg",
  "assets/epigastric-hernia.png",
  "assets/femoral-hernia.png",
  "assets/fibromuscular-dysplasia-renal-artery.png",
  "assets/hammertoe-clinical.png",
  "assets/hammertoe-diagram.png",
  "assets/heart-attack-myocardial-infarction.png",
  "assets/heart-diastolic-systolic.png",
  "assets/hernia-anatomy.png",
  "assets/hernia-anatomy-inguinal-femoral.png",
  "assets/hernia-anatomy-top-replacement.png",
  "assets/hydrocele-anatomy.png",
  "assets/incisional-hernia.png",
  "assets/inferior-stemi-ekg.png",
  "assets/kidney-stones-anatomy.png",
  "assets/leg-arteries-lower-limb.png",
  "assets/metatarsalgia.jpg",
  "assets/myocardial-perfusion-scan.jpg",
  "assets/pad-illustration.png",
  "assets/pitting-edema.png",
  "assets/plantar-wart-dermnet-19131.jpg",
  "assets/portal-vein.png",
  "assets/pulmonary-embolism.png",
  "assets/raynaud-color-sequence.png",
  "assets/raynaud-pallor.png",
  "assets/sma-syndrome.png",
  "assets/SS084B.gif",
  "assets/stasis-dermatitis.png",
  "assets/svt-normal-heartbeat.png",
  "assets/svt-reentry-diagram.png",
  "assets/umbilical-hernia.png",
  "assets/varicocele-anatomy.png",
  "assets/venous-ulcer.png",
  "assets/tts/openai-cedar/manifest.json",
  TTS_PRECACHE_MANIFEST
];

function isTtsAssetRequest(request) {
  try {
    return new URL(request.url).pathname.includes("/assets/tts/");
  } catch {
    return false;
  }
}

async function precacheTtsAudio(cache) {
  let listResp;
  try {
    listResp = await fetch(TTS_PRECACHE_MANIFEST);
  } catch {
    return { ok: 0, total: 0 };
  }
  if (!listResp.ok) return { ok: 0, total: 0 };

  let data;
  try {
    data = await listResp.json();
  } catch {
    return { ok: 0, total: 0 };
  }

  const urls = Array.isArray(data.urls) ? data.urls : [];
  let ok = 0;
  for (let i = 0; i < urls.length; i += TTS_BATCH_SIZE) {
    const batch = urls.slice(i, i + TTS_BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (url) => {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        await cache.put(url, resp);
      })
    );
    ok += results.filter((r) => r.status === "fulfilled").length;
  }
  return { ok, total: urls.length };
}

// Install: pre-cache shell, then bulk-download all Ash TTS clips listed in precache-urls.json
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(OFFLINE_URLS);
      await precacheTtsAudio(cache);
    })()
  );
  self.skipWaiting();
});

// Activate: clean up any old caches from previous versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: TTS = cache-first; everything else = network-first with offline fallback
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (isTtsAssetRequest(event.request)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.ok) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
