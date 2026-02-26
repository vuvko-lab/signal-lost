// === AUDIO MANAGER ===
// Minimal: one ambient loop, mute toggle

let audio = null;
let muted = false;

export function initAudio() {
  audio = new Audio('assets/GloryToTheMachine/NASOD.mp3');
  audio.loop = true;
  audio.volume = 0.3;

  // Wire up mute button
  const muteBtn = document.getElementById('mute-btn');
  muteBtn.addEventListener('click', toggleMute);

  // Autoplay requires user interaction — start on first click anywhere
  const startAudio = () => {
    if (audio.paused && !muted) {
      audio.play().catch(() => {});
    }
    document.removeEventListener('click', startAudio);
  };
  document.addEventListener('click', startAudio);
}

function toggleMute() {
  muted = !muted;
  const muteBtn = document.getElementById('mute-btn');

  if (muted) {
    audio.pause();
    muteBtn.classList.add('muted');
    muteBtn.innerHTML = '<img class="icon icon-red" src="assets/icons/mute.png" alt="">MUTE';
  } else {
    audio.play().catch(() => {});
    muteBtn.classList.remove('muted');
    muteBtn.innerHTML = '<img class="icon" src="assets/icons/volume.png" alt="">VOL';
  }
}
