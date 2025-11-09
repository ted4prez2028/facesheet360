// Web Audio API based sound generation
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Play a simple beep tone
const playTone = (frequency: number, duration: number, volume: number = 0.3) => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (err) {
    console.error('Error playing tone:', err);
  }
};

// Face detection sound (short higher pitch beep)
export const playFaceDetectedSound = () => {
  playTone(800, 0.1, 0.2);
};

// Capture success sound (pleasant two-tone chime)
export const playCaptureSuccessSound = () => {
  playTone(523.25, 0.15, 0.3); // C5
  setTimeout(() => playTone(659.25, 0.2, 0.3), 100); // E5
};

// Countdown beep sound (medium pitch)
export const playCountdownSound = () => {
  playTone(440, 0.15, 0.25); // A4
};
