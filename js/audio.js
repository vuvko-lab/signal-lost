// === AUDIO MANAGER ===
// Background music + layered ambient noise loops with volume control

let bgMusic = null;
let noiseLayers = [];
let muted = false;
let audioStarted = false;

// Background music tracks (one plays at a time, randomly selected)
const BG_TRACKS = [
  'assets/GloryToTheMachine/NASOD.mp3',
  'assets/GloryToTheMachine/CYPHER.mp3',
  'assets/GloryToTheMachine/WATER_LVL.mp3',
  'assets/GloryToTheMachine/WALKING_ON_WATER.mp3',
  "assets/GloryToTheMachine/SATURN'S_RING - GLORYTOTHEMACHINE.mp3",
  'assets/GloryToTheMachine/NOSTALGIA - GLORYTOTHEMACHINE.mp3',
  'assets/GloryToTheMachine/UNKNOWN_ENTITY - GLORYTOTHEMACHINE.mp3',
  'assets/GloryToTheMachine/WATERBENDER - GLORYTOTHEMACHINE.mp3',
  'assets/GloryToTheMachine/CYBER_CELESTE - GLORYTOTHEMACHINE.mp3',
  'assets/GloryToTheMachine/BIOHAZARD - GLORYTOTHEMACHINE.mp3',
  'assets/GloryToTheMachine/XTRA001 ; PEACEFUL_FIREWORKS.mp3',
];

// Ambient noise layers — played simultaneously on top of music
// Each has its own volume so the mix stays balanced
const NOISE_LAYERS = [
  { src: 'assets/ambient/air-conditioning.ogg', volume: 0.08, label: 'Air Conditioning' },
  { src: 'assets/ambient/fridge-hum.ogg', volume: 0.06, label: 'Fridge Hum' },
  { src: 'assets/ambient/machinery.ogg', volume: 0.05, label: 'Machinery' },
  { src: 'assets/ambient/plague-drone.ogg', volume: 0.07, label: 'Drone Loop' },
  { src: 'assets/ambient/radio-loop.ogg', volume: 0.04, label: 'Radio Static' },
];

const BG_VOLUME = 0.3;

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Preload audio files and report progress via callback
// Returns a promise that resolves when critical audio (first bg track + noise layers) is ready
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
      // Fallback: if loading stalls after 8s, continue anyway
      setTimeout(done, 8000);
      audio.src = file.src;
    }
  });
}

export function initAudio(preloaded) {
  if (preloaded) {
    // Use preloaded audio elements
    const bgResult = preloaded.find(r => r.type === 'bg');
    bgMusic = bgResult.audio;
    bgMusic.loop = false;
    bgMusic.volume = BG_VOLUME;

    for (const r of preloaded.filter(r => r.type === 'noise')) {
      r.audio.loop = true;
      r.audio.volume = r.config.volume;
      noiseLayers.push({ audio: r.audio, config: r.config });
    }
  } else {
    // Fallback: create without preloading
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
      audio.volume = layer.volume;
      noiseLayers.push({ audio, config: layer });
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

  // Autoplay requires user interaction — start on first click anywhere
  const startAudio = () => {
    if (!audioStarted && !muted) {
      audioStarted = true;
      bgMusic.play().catch(() => {});
      for (const layer of noiseLayers) {
        layer.audio.play().catch(() => {});
      }
    }
    document.removeEventListener('click', startAudio);
  };
  document.addEventListener('click', startAudio);
}

function toggleMute() {
  muted = !muted;
  const muteBtn = document.getElementById('mute-btn');

  if (muted) {
    bgMusic.pause();
    for (const layer of noiseLayers) {
      layer.audio.pause();
    }
    muteBtn.classList.add('muted');
    muteBtn.innerHTML = '<img class="icon icon-red" src="assets/icons/mute.png" alt="">MUTE';
  } else {
    bgMusic.play().catch(() => {});
    for (const layer of noiseLayers) {
      layer.audio.play().catch(() => {});
    }
    audioStarted = true;
    muteBtn.classList.remove('muted');
    muteBtn.innerHTML = '<img class="icon" src="assets/icons/volume.png" alt="">VOL';
  }
}
