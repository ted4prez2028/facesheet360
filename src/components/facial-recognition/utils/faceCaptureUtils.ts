
import { toast } from 'sonner';
import { detectFaces, matchPatientByFace } from '@/lib/facialRecognition';
import { getPatientByFacialData } from '@/lib/supabaseApi';
import { Patient } from '@/types';

export const checkCameraAvailability = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (err) {
    toast.error("Camera not found. Please connect a camera and try again.");
    return false;
  }
};

export const initializeCamera = async (videoRef: React.RefObject<HTMLVideoElement>): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      return new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(err => {
              console.error("Autoplay error:", err);
              toast.error("Failed to start camera. Autoplay might be disabled.");
              resolve(false);
            });
            resolve(true);
          };
        } else {
          resolve(false);
        }
      });
    }
    return false;
  } catch (err: any) {
    console.error("Camera access error:", err);
    toast.error(err.message || "Failed to access camera.");
    return false;
  }
};

export const captureImage = (
  videoRef: React.RefObject<HTMLVideoElement>, 
  canvasRef: React.RefObject<HTMLCanvasElement>
): string | null => {
  if (!videoRef.current || !canvasRef.current) return null;

  const video = videoRef.current;
  const canvas = canvasRef.current;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext('2d');
  context?.drawImage(video, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg');
};

export const identifyPatient = async (capturedImage: string): Promise<Patient | null> => {
  if (!capturedImage) {
    toast.error("No image captured. Please capture an image first.");
    return null;
  }

  try {
    const faceData = await detectFaces(capturedImage);
    if (!faceData) {
      toast.error("No face detected. Please try again.");
      return null;
    }

    const patients = await getPatientByFacialData();
    if (!patients || patients.length === 0) {
      toast.error("No patients with facial data found.");
      return null;
    }

    const matchedPatient = await matchPatientByFace(faceData, patients);
    if (matchedPatient) {
      toast.success(`Patient identified: ${matchedPatient.first_name} ${matchedPatient.last_name}`);
      return matchedPatient;
    } else {
      toast.error("No matching patient found.");
      return null;
    }
  } catch (err: any) {
    console.error("Facial recognition error:", err);
    toast.error(err.message || "Failed to identify patient.");
    return null;
  }
};

export const registerFace = async (
  capturedImage: string, 
  patientId?: string
): Promise<string | null> => {
  if (!capturedImage) {
    toast.error("No image captured. Please capture an image first.");
    return null;
  }

  try {
    const faceData = await detectFaces(capturedImage);
    if (!faceData) {
      toast.error("No face detected. Please try again.");
      return null;
    }

    // Convert faceData to string
    const faceDataString = JSON.stringify(faceData);
    toast.success("Face data captured successfully.");
    
    return faceDataString;
  } catch (err: any) {
    console.error("Facial recognition error:", err);
    toast.error(err.message || "Failed to register face.");
    return null;
  }
};
