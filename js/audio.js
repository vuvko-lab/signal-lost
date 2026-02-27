// === AUDIO MANAGER ===
// Background music + intermittent ambient noise layers linked to vessel locations

let bgMusic = null;
let noiseLayers = [];
let muted = false;
let audioStarted = false;
let noiseTimer = null;

// Background music tracks (one plays at a time, randomly selected)
const BG_TRACKS = [
  'assets/GloryToTheMachine/NASOD.ogg',
  'assets/GloryToTheMachine/CYPHER.ogg',
  'assets/GloryToTheMachine/WATER_LVL - GLORYTOTHEMACHINE.ogg',
  'assets/GloryToTheMachine/WALKING_ON_WATER.ogg',
  "assets/GloryToTheMachine/SATURN'S_RING - GLORYTOTHEMACHINE.ogg",
  'assets/GloryToTheMachine/NOSTALGIA - GLORYTOTHEMACHINE.ogg',
  'assets/GloryToTheMachine/UNKNOWN_ENTITY - GLORYTOTHEMACHINE.ogg',
  'assets/GloryToTheMachine/WATERBENDER - GLORYTOTHEMACHINE.ogg',
  'assets/GloryToTheMachine/CYBER_CELESTE - GLORYTOTHEMACHINE.ogg',
  'assets/GloryToTheMachine/BIOHAZARD - GLORYTOTHEMACHINE.ogg',
  'assets/GloryToTheMachine/XTRA001 ; PEACEFUL_FIREWORKS.ogg',
];

// Ambient noise layers — intermittent, tagged by location keywords
const NOISE_LAYERS = [
  { src: 'assets/ambient/air-conditioning.ogg', volume: 0.04, label: 'Air Conditioning', tags: ['underground', 'reactor', 'server', 'bunker'] },
  { src: 'assets/ambient/fridge-hum.ogg', volume: 0.03, label: 'Fridge Hum', tags: ['server', 'reactor', 'data', 'archive'] },
  { src: 'assets/ambient/machinery.ogg', volume: 0.025, label: 'Machinery', tags: ['factory', 'launch', 'reactor', 'industrial'] },
  { src: 'assets/ambient/plague-drone.ogg', volume: 0.035, label: 'Drone Loop', tags: ['waste', 'ruin', 'orbital', 'dead'] },
  { src: 'assets/ambient/radio-loop.ogg', volume: 0.02, label: 'Radio Static', tags: ['relay', 'signal', 'antenna', 'zone'] },
];

const BG_VOLUME = 0.3;

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Smooth volume fade
function fadeVolume(audio, target, durationMs = 2000) {
  const start = audio.volume;
  const diff = target - start;
  const steps = 20;
  const stepMs = durationMs / steps;
  let step = 0;
  const interval = setInterval(() => {
    step++;
    audio.volume = Math.max(0, Math.min(1, start + diff * (step / steps)));
    if (step >= steps) {
      clearInterval(interval);
      audio.volume = target;
      if (target === 0) audio.pause();
    }
  }, stepMs);
}

// Preload audio files and report progress via callback
export function preloadAudio(onProgress) {
  const trackSrc = pickRandom(BG_TRACKS);

  // Pick 2-3 noise layers for this session
  const layerCount = 2 + Math.floor(Math.random() * 2);
  const shuffled = [...NOISE_LAYERS].sort(() => Math.random() - 0.5);
  const selectedConfigs = shuffled.slice(0, layerCount);

  const filesToLoad = [
    { src: trackSrc, label: 'music', isBg: true },
    ...selectedConfigs.map(c => ({ src: c.src, label: c.label, config: c })),
  ];

  let loaded = 0;
  const total = filesToLoad.length;

  return new Promise((resolve) => {
    const results = [];

    for (const file of filesToLoad) {
      const audio = new Audio();
      audio.preload = 'auto';

      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        loaded++;
        if (onProgress) onProgress(loaded, total, file.label);

        if (file.isBg) {
          results.push({ type: 'bg', audio, src: file.src });
        } else {
          results.push({ type: 'noise', audio, config: file.config });
        }

        if (loaded >= total) {
          resolve(results);
        }
      };

      audio.addEventListener('canplaythrough', done, { once: true });
      setTimeout(done, 8000);
      audio.src = file.src;
    }
  });
}

export function initAudio(preloaded) {
  if (preloaded) {
    const bgResult = preloaded.find(r => r.type === 'bg');
    bgMusic = bgResult.audio;
    bgMusic.loop = false;
    bgMusic.volume = BG_VOLUME;

    for (const r of preloaded.filter(r => r.type === 'noise')) {
      r.audio.loop = true;
      r.audio.volume = 0; // start silent — noise cycle will fade them in
      noiseLayers.push({ audio: r.audio, config: r.config, active: false });
    }
  } else {
    const trackSrc = pickRandom(BG_TRACKS);
    bgMusic = new Audio(trackSrc);
    bgMusic.loop = false;
    bgMusic.volume = BG_VOLUME;

    const layerCount = 2 + Math.floor(Math.random() * 2);
    const shuffled = [...NOISE_LAYERS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, layerCount);

    for (const layer of selected) {
      const audio = new Audio(layer.src);
      audio.loop = true;
      audio.volume = 0;
      noiseLayers.push({ audio, config: layer, active: false });
    }
  }

  // When a track ends, play another random one
  bgMusic.addEventListener('ended', () => {
    const next = pickRandom(BG_TRACKS);
    bgMusic.src = next;
    bgMusic.play().catch(() => {});
  });

  // Wire up mute button
  const muteBtn = document.getElementById('mute-btn');
  muteBtn.addEventListener('click', toggleMute);

  // Autoplay requires user interaction — start on first click
  const startAudio = () => {
    if (!audioStarted && !muted) {
      audioStarted = true;
      bgMusic.play().catch(() => {});
      // Start all noise layers playing (at volume 0 — cycle will fade them)
      for (const layer of noiseLayers) {
        layer.audio.play().catch(() => {});
      }
      // Start the intermittent noise cycle
      startNoiseCycle();
    }
    document.removeEventListener('click', startAudio);
  };
  document.addEventListener('click', startAudio);
}

// Intermittent noise cycle: every 15-40s, fade one layer in or out
// based on whether it matches current vessel locations
function startNoiseCycle() {
  const cycle = () => {
    if (muted) return;

    // Get current vessel locations from the DOM
    const locationEls = document.querySelectorAll('.vessel-location');
    const locationText = Array.from(locationEls).map(el => el.textContent.toLowerCase()).join(' ');

    for (const layer of noiseLayers) {
      // Check if any tag matches current vessel locations
      const matches = layer.config.tags.some(tag => locationText.includes(tag));
      const shouldPlay = matches || Math.random() < 0.2; // 20% chance even without match

      if (shouldPlay && !layer.active) {
        // Fade in
        layer.active = true;
        layer.audio.play().catch(() => {});
        fadeVolume(layer.audio, layer.config.volume, 3000);
      } else if (!shouldPlay && layer.active) {
        // Fade out
        layer.active = false;
        fadeVolume(layer.audio, 0, 3000);
      }
    }

    // Schedule next cycle: 15-40 seconds
    const nextDelay = 15000 + Math.random() * 25000;
    noiseTimer = setTimeout(cycle, nextDelay);
  };

  // First cycle after a short delay
  noiseTimer = setTimeout(cycle, 3000);
}

function toggleMute() {
  muted = !muted;
  const muteBtn = document.getElementById('mute-btn');

  if (muted) {
    bgMusic.pause();
    for (const layer of noiseLayers) {
      layer.audio.pause();
      layer.active = false;
    }
    if (noiseTimer) clearTimeout(noiseTimer);
    muteBtn.classList.add('muted');
    muteBtn.innerHTML = '<img class="icon icon-red" src="assets/icons/mute.png" alt="">MUTE';
  } else {
    bgMusic.play().catch(() => {});
    audioStarted = true;
    startNoiseCycle();
    muteBtn.classList.remove('muted');
    muteBtn.innerHTML = '<img class="icon" src="assets/icons/volume.png" alt="">VOL';
  }
}
