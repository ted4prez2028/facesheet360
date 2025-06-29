
import { toast } from 'sonner';
import { detectFaces, matchPatientByFace } from '@/lib/facialRecognition';
import { getPatientByFacialData } from '@/lib/supabaseApi';
import { Patient } from '@/types';
import * as faceapi from 'face-api.js';

let modelsLoaded = false;

// Helper function to load face-api.js models
const loadFaceApiModels = async () => {
  if (modelsLoaded) return true;
  
  try {
    const MODEL_URL = '/models';
    
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    
    modelsLoaded = true;
    console.log('Face detection models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading face detection models:', error);
    return false;
  }
};

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
      
      // Load face-api models while camera is initializing
      await loadFaceApiModels();
      
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
  } catch (err: unknown) {
    console.error("Camera access error:", err);
    toast.error(err instanceof Error ? err.message : "Failed to access camera.");
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

export const detectFaceInCanvas = async (
  videoElement: HTMLVideoElement,
  canvasElement: HTMLCanvasElement
): Promise<boolean> => {
  if (!modelsLoaded) {
    await loadFaceApiModels();
  }
  
  // Get canvas context and clear previous drawings
  const ctx = canvasElement.getContext('2d');
  if (!ctx) return false;
  
  // Set canvas dimensions to match video
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  
  try {
    // Detect faces in the video stream
    const detections = await faceapi.detectAllFaces(videoElement);
    
    if (detections.length === 0) {
      return false;
    }
    
    // Draw rectangles around detected faces
    detections.forEach(detection => {
      const { x, y, width, height } = detection.box;
      
      // Draw green rectangle
      ctx.strokeStyle = '#22c55e'; // Green-500
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);
      
      // Add green semi-transparent overlay
      ctx.fillStyle = 'rgba(34, 197, 94, 0.15)'; // Green-500 with 15% opacity
      ctx.fillRect(x, y, width, height);
    });
    
    return true;
  } catch (error) {
    console.error('Error detecting faces:', error);
    return false;
  }
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
  } catch (err: unknown) {
    console.error("Facial recognition error:", err);
    toast.error(err instanceof Error ? err.message : "Failed to identify patient.");
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
    // Process the face using simplified approach without relying on external model loading
    // Just store the image data for now
    const faceData = {
      image: capturedImage,
      timestamp: new Date().toISOString()
    };
    
    // Convert to string
    const faceDataString = JSON.stringify(faceData);
    toast.success("Image captured successfully");
    
    return faceDataString;
  } catch (err: unknown) {
    console.error("Facial recognition error:", err);
    toast.error(err instanceof Error ? err.message : "Failed to register face.");
    return null;
  }
};
