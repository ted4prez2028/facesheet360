import { Howl } from 'howler';

// Face detection sound (short beep)
const faceDetectedSound = new Howl({
  src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGJ1PjEaCEFKH3P8+CWRw0WYqPl4q1gGAY9k9r5xXApBSh+zvPjk0QIE12z7O6xVBIMRKbk8ctzIgcvgdP40oExDhxnvO7nvKdcITiS3/fPdi4KLH/N8+OURxEWYb3v8rf6=' ],
  volume: 0.3,
  sprite: {
    beep: [0, 100]
  }
});

// Capture success sound (positive chime)
const captureSuccessSound = new Howl({
  src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGJ1PjEaCEFKH3P8+CWRw0WYqPl4q1gGAY9k9r5xXApBSh+zvPjk0QIE12z7O6xVBIMRKbk8ctzIgcvgdP40oExDhxnvO7nvKdcITiS3/fPdi4KLH/N8+OURxEWYb3v8rf6=' ],
  volume: 0.5,
  sprite: {
    success: [0, 300]
  }
});

// Countdown beep sound
const countdownSound = new Howl({
  src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGJ1PjEaCEFKH3P8+CWRw0WYqPl4q1gGAY9k9r5xXApBSh+zvPjk0QIE12z7O6xVBIMRKbk8ctzIgcvgdP40oExDhxnvO7nvKdcITiS3/fPdi4KLH/N8+OURxEWYb3v8rf6=' ],
  volume: 0.4,
  sprite: {
    tick: [0, 150]
  }
});

export const playFaceDetectedSound = () => {
  try {
    faceDetectedSound.play('beep');
  } catch (err) {
    console.error('Error playing face detected sound:', err);
  }
};

export const playCaptureSuccessSound = () => {
  try {
    captureSuccessSound.play('success');
  } catch (err) {
    console.error('Error playing capture success sound:', err);
  }
};

export const playCountdownSound = () => {
  try {
    countdownSound.play('tick');
  } catch (err) {
    console.error('Error playing countdown sound:', err);
  }
};
