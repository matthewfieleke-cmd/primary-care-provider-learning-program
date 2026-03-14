// Service Worker — network-first with offline fallback
// Ensures users always get the latest version when online.

const CACHE_NAME = "pcp-learning-v11";
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
  "assets/venous-ulcer.png"
];

// Install: pre-cache the shell so the app works offline
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  // Activate immediately — don't wait for old tabs to close
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
  // Take control of all open tabs immediately
  self.clients.claim();
});

// Fetch: always try network first, fall back to cache
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Got a fresh response — update the cache and serve it
        if (networkResponse && networkResponse.ok) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed — serve from cache (offline mode)
        return caches.match(event.request);
      })
  );
});
