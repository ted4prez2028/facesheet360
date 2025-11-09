import { toast } from 'sonner';
import { detectFaces, matchPatientByFace } from '@/lib/facialRecognition';
import { getPatientByFacialData } from '@/lib/supabaseApi';
import { Patient } from '@/types';
import * as faceapi from 'face-api.js';
import { 
  fetchModelWithCache, 
  getCacheStats 
} from '@/lib/modelCache';

let modelsLoaded = false;

// Model configuration - using vladmandic/face-api repository
const MODEL_BASE_URL = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model';

const MODELS = [
  { name: 'ssdMobilenetv1', files: ['ssd_mobilenetv1_model-weights_manifest.json', 'ssd_mobilenetv1_model-shard1', 'ssd_mobilenetv1_model-shard2'] },
  { name: 'faceLandmark68Net', files: ['face_landmark_68_model-weights_manifest.json', 'face_landmark_68_model-shard1'] },
  { name: 'faceRecognitionNet', files: ['face_recognition_model-weights_manifest.json', 'face_recognition_model-shard1', 'face_recognition_model-shard2'] }
];

// Helper function to load face-api.js models with caching
const loadFaceApiModels = async () => {
  if (modelsLoaded) return true;
  
  try {
    console.log('🚀 Loading face detection models (with IndexedDB cache)...');
    
    // Check cache stats
    const stats = await getCacheStats();
    if (stats.count > 0) {
      console.log(`📊 Found ${stats.count} cached models (${(stats.totalSize / 1024 / 1024).toFixed(2)} MB)`);
    } else {
      console.log('📥 First time loading - downloading from CDN...');
    }
    
    // Fetch all model files with caching and create object URLs
    const fileUrls = new Map<string, string>();
    
    try {
      for (const model of MODELS) {
        for (const fileName of model.files) {
          const blob = await fetchModelWithCache(
            fileName,
            `${MODEL_BASE_URL}/${fileName}`
          );
          const objectUrl = URL.createObjectURL(blob);
          fileUrls.set(fileName, objectUrl);
        }
      }
      
      // Create temporary base path from first manifest file
      const firstManifestUrl = fileUrls.get('ssd_mobilenetv1_model-weights_manifest.json')!;
      const basePath = firstManifestUrl.substring(0, firstManifestUrl.lastIndexOf('/'));
      
      // Intercept fetch to return cached object URLs
      const originalFetch = window.fetch;
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = typeof input === 'string' ? input : input.toString();
        const fileName = url.split('/').pop() || '';
        
        if (fileUrls.has(fileName)) {
          return originalFetch(fileUrls.get(fileName)!, init);
        }
        
        return originalFetch(input, init);
      };
      
      // Load models
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(basePath),
        faceapi.nets.faceLandmark68Net.loadFromUri(basePath),
        faceapi.nets.faceRecognitionNet.loadFromUri(basePath)
      ]);
      
      // Restore original fetch
      window.fetch = originalFetch;
      
      modelsLoaded = true;
      console.log('✅ Face detection models loaded successfully!');
      toast.success('Face detection ready');
      
      // Clean up object URLs after a short delay
      setTimeout(() => {
        fileUrls.forEach(url => URL.revokeObjectURL(url));
        console.log('🧹 Cleaned up temporary object URLs');
      }, 1000);
      
      return true;
      
    } catch (loadError) {
      // Clean up on error
      fileUrls.forEach(url => URL.revokeObjectURL(url));
      throw loadError;
    }
    
  } catch (error) {
    console.error('❌ Error loading face detection models:', error);
    toast.error('Failed to load face detection models. Please refresh the page.');
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

export const initializeCamera = async (
  videoRef: React.RefObject<HTMLVideoElement>,
  onModelsReady?: (ready: boolean) => void,
  facingMode: 'user' | 'environment' = 'user'
): Promise<{ success: boolean; modelsLoaded: boolean }> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      
      // Load face-api models and wait for them
      const modelsLoadedSuccessfully = await loadFaceApiModels();
      if (onModelsReady) {
        onModelsReady(modelsLoadedSuccessfully);
      }
      
      return new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current?.play();
              console.log('Camera started successfully');
              resolve({ success: true, modelsLoaded: modelsLoadedSuccessfully });
            } catch (err) {
              console.error("Autoplay error:", err);
              toast.error("Failed to start camera. Autoplay might be disabled.");
              resolve({ success: false, modelsLoaded: modelsLoadedSuccessfully });
            }
          };
        } else {
          resolve({ success: false, modelsLoaded: modelsLoadedSuccessfully });
        }
      });
    }
    return { success: false, modelsLoaded: false };
  } catch (err: unknown) {
    console.error("Camera access error:", err);
    toast.error(err instanceof Error ? err.message : "Failed to access camera.");
    return { success: false, modelsLoaded: false };
  }
};

export const stopCamera = (videoRef: React.RefObject<HTMLVideoElement>) => {
  if (videoRef.current && videoRef.current.srcObject) {
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
    videoRef.current.srcObject = null;
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
): Promise<{ detected: boolean; confidence: number }> => {
  if (!modelsLoaded) {
    const loaded = await loadFaceApiModels();
    if (!loaded) return { detected: false, confidence: 0 };
  }
  
  // Check if video is ready
  if (videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) {
    return { detected: false, confidence: 0 };
  }
  
  // Get canvas context and clear previous drawings
  const ctx = canvasElement.getContext('2d');
  if (!ctx) return { detected: false, confidence: 0 };
  
  // Get the display dimensions
  const displayWidth = videoElement.clientWidth;
  const displayHeight = videoElement.clientHeight;
  
  // Set canvas dimensions to match video display size
  canvasElement.width = displayWidth;
  canvasElement.height = displayHeight;
  ctx.clearRect(0, 0, displayWidth, displayHeight);
  
  try {
    // Detect faces in the video stream with optimized settings
    const detections = await faceapi
      .detectAllFaces(videoElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptors();
    
    if (detections.length === 0) {
      return { detected: false, confidence: 0 };
    }
    
    // Calculate scaling factors
    const scaleX = displayWidth / videoElement.videoWidth;
    const scaleY = displayHeight / videoElement.videoHeight;
    
    // Get the best detection (highest confidence)
    const bestDetection = detections.reduce((best, current) => 
      current.detection.score > best.detection.score ? current : best
    );
    const confidence = Math.round(bestDetection.detection.score * 100);
    
    // Draw rectangles around detected faces
    detections.forEach(detection => {
      const { x, y, width, height } = detection.detection.box;
      
      // Scale coordinates to match canvas size
      const scaledX = x * scaleX;
      const scaledY = y * scaleY;
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;
      
      // Draw green rectangle with rounded corners effect
      ctx.strokeStyle = '#22c55e'; // Green-500
      ctx.lineWidth = 4;
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 10;
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
      
      // Reset shadow for fill
      ctx.shadowBlur = 0;
      
      // Add green semi-transparent overlay
      ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
      ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
      
      // Draw corner accents
      const cornerLength = 20;
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#10b981'; // Green-600
      
      // Top-left corner
      ctx.beginPath();
      ctx.moveTo(scaledX, scaledY + cornerLength);
      ctx.lineTo(scaledX, scaledY);
      ctx.lineTo(scaledX + cornerLength, scaledY);
      ctx.stroke();
      
      // Top-right corner
      ctx.beginPath();
      ctx.moveTo(scaledX + scaledWidth - cornerLength, scaledY);
      ctx.lineTo(scaledX + scaledWidth, scaledY);
      ctx.lineTo(scaledX + scaledWidth, scaledY + cornerLength);
      ctx.stroke();
      
      // Bottom-left corner
      ctx.beginPath();
      ctx.moveTo(scaledX, scaledY + scaledHeight - cornerLength);
      ctx.lineTo(scaledX, scaledY + scaledHeight);
      ctx.lineTo(scaledX + cornerLength, scaledY + scaledHeight);
      ctx.stroke();
      
      // Bottom-right corner
      ctx.beginPath();
      ctx.moveTo(scaledX + scaledWidth - cornerLength, scaledY + scaledHeight);
      ctx.lineTo(scaledX + scaledWidth, scaledY + scaledHeight);
      ctx.lineTo(scaledX + scaledWidth, scaledY + scaledHeight - cornerLength);
      ctx.stroke();
      
      // Draw confidence score
      const fontSize = 16;
      ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = '#22c55e';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      const confidenceText = `${Math.round(detection.detection.score * 100)}%`;
      const textWidth = ctx.measureText(confidenceText).width;
      const textX = scaledX + scaledWidth / 2 - textWidth / 2;
      const textY = scaledY - 10;
      
      // Draw text with outline for better visibility
      ctx.strokeText(confidenceText, textX, textY);
      ctx.fillText(confidenceText, textX, textY);
    });
    
    return { detected: true, confidence };
  } catch (error) {
    console.error('Error detecting faces:', error);
    return { detected: false, confidence: 0 };
  }
};

export const identifyPatient = async (capturedImage: string): Promise<Patient | null> => {
  if (!capturedImage) {
    toast.error("No image captured. Please capture an image first.");
    return null;
  }

  try {
    if (!modelsLoaded) {
      const loaded = await loadFaceApiModels();
      if (!loaded) {
        toast.error("Failed to load face detection models");
        return null;
      }
    }

    // Create an image element from the captured image
    const img = new Image();
    img.src = capturedImage;
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Detect face and extract descriptor
    const detection = await faceapi
      .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      toast.error("No face detected in the image. Please try again.");
      return null;
    }

    const capturedDescriptor = Array.from(detection.descriptor);
    
    // Get all patients with facial data
    const patients = await getPatientByFacialData();
    if (!patients || patients.length === 0) {
      toast.error("No patients with facial data found.");
      return null;
    }

    // Find best match using Euclidean distance
    let bestMatch: Patient | null = null;
    let bestDistance = Infinity;
    const MATCH_THRESHOLD = 0.6; // Lower is better match

    for (const patient of patients) {
      if (!patient.facial_data) continue;
      
      try {
        const storedData = JSON.parse(patient.facial_data);
        if (!storedData.descriptor) continue;
        
        const storedDescriptor = storedData.descriptor;
        
        // Calculate Euclidean distance
        const distance = Math.sqrt(
          capturedDescriptor.reduce((sum, val, i) => {
            const diff = val - storedDescriptor[i];
            return sum + diff * diff;
          }, 0)
        );
        
        console.log(`Distance to ${patient.first_name} ${patient.last_name}: ${distance}`);
        
        if (distance < bestDistance && distance < MATCH_THRESHOLD) {
          bestDistance = distance;
          bestMatch = patient;
        }
      } catch (err) {
        console.error('Error parsing facial data for patient:', patient.id, err);
      }
    }

    if (bestMatch) {
      const confidence = ((1 - (bestDistance / MATCH_THRESHOLD)) * 100).toFixed(1);
      toast.success(`Patient identified: ${bestMatch.first_name} ${bestMatch.last_name} (${confidence}% match)`);
      return bestMatch;
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
    if (!modelsLoaded) {
      const loaded = await loadFaceApiModels();
      if (!loaded) {
        toast.error("Failed to load face detection models");
        return null;
      }
    }

    // Create an image element from the captured image
    const img = new Image();
    img.src = capturedImage;
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Detect face and extract descriptor
    const detection = await faceapi
      .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      toast.error("No face detected in the image. Please try again.");
      return null;
    }

    // Extract the 128-dimensional face descriptor
    const descriptor = Array.from(detection.descriptor);
    
    // Store both the image and the descriptor
    const faceData = {
      image: capturedImage,
      descriptor: descriptor,
      timestamp: new Date().toISOString(),
      confidence: detection.detection.score
    };
    
    // Convert to string for storage
    const faceDataString = JSON.stringify(faceData);
    
    console.log('Face registered with descriptor length:', descriptor.length);
    toast.success("Face registered successfully!");
    
    return faceDataString;
  } catch (err: unknown) {
    console.error("Facial recognition error:", err);
    toast.error(err instanceof Error ? err.message : "Failed to register face.");
    return null;
  }
};
