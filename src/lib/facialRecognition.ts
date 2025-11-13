
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { storeFacialData } from './supabaseApi';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { Patient } from '@/types';
import { 
  fetchModelWithCache, 
  getCacheStats, 
  clearModelCache as clearCache 
} from './modelCache';

// Flag to track whether models are loaded
let modelsLoaded = false;

// Progress callback type
export type ModelProgressCallback = (models: Array<{
  name: string;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  progress: number;
}>) => void;

// Model configuration - using vladmandic/face-api from GitHub
const MODEL_BASE_URL = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model';

const MODELS = [
  { name: 'ssdMobilenetv1', files: ['ssd_mobilenetv1_model-weights_manifest.json', 'ssd_mobilenetv1_model.bin'] },
  { name: 'faceLandmark68Net', files: ['face_landmark_68_model-weights_manifest.json', 'face_landmark_68_model.bin'] },
  { name: 'faceRecognitionNet', files: ['face_recognition_model-weights_manifest.json', 'face_recognition_model.bin'] }
];

// Function to load face-api.js models with caching
export const loadFaceDetectionModels = async (onProgress?: ModelProgressCallback) => {
  if (modelsLoaded) return;
  
  try {
    // Check if offline first
    if (!navigator.onLine) {
      console.log('📴 Device is offline - skipping model download');
      throw new Error('Device is offline. Facial recognition requires an internet connection for first-time setup.');
    }
    
    // Initialize TensorFlow.js backend FIRST
    console.log('🔧 Initializing TensorFlow.js backend...');
    
    // Ensure we have a clean backend state
    if (tf.getBackend()) {
      console.log('⚠️ Backend already exists, disposing...');
      await tf.disposeVariables();
    }
    
    // Set backend and wait for it to be fully ready
    await tf.setBackend('webgl');
    await tf.ready();
    
    // Verify backend is actually available
    const backend = tf.getBackend();
    if (!backend) {
      throw new Error('Failed to initialize TensorFlow.js backend');
    }
    
    console.log('✅ TensorFlow.js backend initialized:', backend);
    
    console.log('🚀 Loading face detection models (with IndexedDB cache)...');
    
    // Check cache stats
    const stats = await getCacheStats();
    if (stats.count > 0) {
      console.log(`📊 Found ${stats.count} cached models (${(stats.totalSize / 1024 / 1024).toFixed(2)} MB)`);
    } else {
      console.log('📥 First time loading - downloading from CDN...');
    }
    
    // Fetch all model files with caching
    const modelBlobs = new Map<string, Blob>();
    
    // Initialize progress tracking
    const allFiles: string[] = [];
    MODELS.forEach(model => allFiles.push(...model.files));
    const progressMap = new Map<string, number>();
    allFiles.forEach(file => progressMap.set(file, 0));
    
    const updateProgress = () => {
      if (onProgress) {
        const modelProgress = allFiles.map(name => ({
          name,
          status: progressMap.get(name) === 100 
            ? 'completed' as const
            : progressMap.get(name)! > 0 
            ? 'downloading' as const 
            : 'pending' as const,
          progress: progressMap.get(name) || 0
        }));
        onProgress(modelProgress);
      }
    };
    
    try {
      updateProgress(); // Initial state
      
      // Fetch all model files
      for (const model of MODELS) {
        for (const fileName of model.files) {
          const blob = await fetchModelWithCache(
            fileName,
            `${MODEL_BASE_URL}/${fileName}`,
            (progress) => {
              progressMap.set(fileName, progress);
              updateProgress();
            }
          );
          modelBlobs.set(fileName, blob);
        }
      }
      
      // Intercept fetch to return cached blobs
      const originalFetch = window.fetch;
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = typeof input === 'string' ? input : input.toString();
        
        // Check if this URL is requesting one of our model files
        for (const [fileName, blob] of modelBlobs.entries()) {
          if (url.includes(fileName) || url.endsWith(fileName)) {
            console.log(`📦 Serving cached model: ${fileName}`);
            return new Response(blob, {
              status: 200,
              statusText: 'OK',
              headers: {
                'Content-Type': fileName.endsWith('.json') ? 'application/json' : 'application/octet-stream',
                'Content-Length': blob.size.toString()
              }
            });
          }
        }
        
        return originalFetch(input, init);
      };
      
      // Load models from GitHub (fetch interceptor will serve cached versions)
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_BASE_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_BASE_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_BASE_URL)
      ]);
      
      // Restore original fetch
      window.fetch = originalFetch;
      
      modelsLoaded = true;
      console.log('✅ Face detection models loaded successfully!');
      
    } catch (loadError) {
      // Clean up on error
      modelBlobs.clear();
      throw loadError;
    }
    
  } catch (error) {
    console.error('❌ Error loading face detection models:', error);
    
    // Provide user-friendly error messages
    let errorMessage = 'Failed to load face detection models';
    
    if (error instanceof Error) {
      if (error.message.includes('offline') || error.message.includes('network')) {
        errorMessage = 'Network unavailable. Please check your connection and try again.';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Unable to download models. Please check your internet connection.';
      } else {
        errorMessage = error.message;
      }
    }
    
    toast.error(errorMessage);
    throw error;
  }
};

// Function to detect faces in an image
export const detectFaces = async (imageData: string) => {
  try {
    // Ensure TensorFlow backend is initialized
    const backend = tf.getBackend();
    if (!backend) {
      console.log('⚠️ TensorFlow backend not initialized, initializing now...');
      await tf.setBackend('webgl');
      await tf.ready();
      console.log('✅ TensorFlow.js backend initialized:', tf.getBackend());
    }
    
    await loadFaceDetectionModels();
    
    // Create an HTML image element from the image data
    const img = await createImageFromBase64(imageData);
    
    // Detect all faces and compute face descriptors
    const detections = await faceapi.detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors();
    
    if (detections.length === 0) {
      toast.error('No face detected in the image');
      return null;
    }
    
    // Return the first face descriptor as a plain array
    return Array.from(detections[0].descriptor);
  } catch (error) {
    console.error('Error detecting faces:', error);
    toast.error('Failed to detect faces');
    throw error;
  }
};

// Alias for detectFaces to maintain compatibility
export const detectFace = detectFaces;

// Helper function to create an image element from base64 data
const createImageFromBase64 = (base64Data: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
    img.src = base64Data;
  });
};

// Register facial data for a patient
export const registerFacialData = async (patientId: string, facialData: string) => {
  try {
    // First detect and extract the face descriptor
    const faceDescriptor = await detectFaces(facialData);
    
    if (!faceDescriptor) {
      throw new Error('No face detected in the image');
    }
    
    // Store both the original image and the facial descriptor
    const data = {
      image: facialData,
      descriptor: faceDescriptor
    };
    
    // Store the facial data in Supabase
    const patient = await storeFacialData(patientId, JSON.stringify(data));
    
    if (!patient) {
      throw new Error('Failed to store facial data');
    }
    
    return patient;
  } catch (error) {
    console.error('Error registering facial data:', error);
    toast.error('Failed to register facial data');
    throw error;
  }
};

// Function to compare face descriptors and find the best match
export const matchPatientByFace = async (faceDescriptor: number[], patients: Patient[]) => {
  try {
    if (!faceDescriptor || !patients.length) {
      return null;
    }
    
    let bestMatch = null;
    let bestMatchDistance = 0.6; // Threshold for face recognition (lower is more strict)
    
    for (const patient of patients) {
      if (!patient.facial_data) continue;
      
      try {
        const storedData = JSON.parse(patient.facial_data);
        if (!storedData.descriptor) continue;
        
        const storedDescriptor = storedData.descriptor;
        
        // Compare descriptors using Euclidean distance
        const distance = faceapi.euclideanDistance(
          new Float32Array(faceDescriptor),
          new Float32Array(storedDescriptor)
        );
        
        // If this is a better match, update our best match
        if (distance < bestMatchDistance) {
          bestMatchDistance = distance;
          bestMatch = patient;
        }
      } catch (err) {
        console.warn(`Failed to parse facial data for patient ${patient.id}`, err);
        continue;
      }
    }
    
    return bestMatch;
  } catch (error) {
    console.error('Error matching face:', error);
    toast.error('Failed to match face');
    throw error;
  }
};

// Identify patient by face
export const identifyPatientByFace = async (facialData: string) => {
  try {
    // First detect and extract the face descriptor from the captured image
    const faceDescriptor = await detectFaces(facialData);
    
    if (!faceDescriptor) {
      toast.error('No face detected in the image');
      return null;
    }
    
    const { data, error } = await supabase.functions.invoke('facial-recognition', {
      body: { 
        action: 'identify', 
        faceDescriptor: faceDescriptor 
      }
    });
    
    if (error) throw error;
    
    if (!data.success) {
      toast.error(data.message || 'No matching patient found');
      return null;
    }
    
    return data.patient;
  } catch (error) {
    console.error('Error identifying patient:', error);
    toast.error('Failed to identify patient');
    throw error;
  }
};

// Utility: Clear cached models (useful for debugging or forcing refresh)
export const clearModelCache = async () => {
  try {
    await clearCache();
    modelsLoaded = false; // Reset loaded flag
    toast.success('Model cache cleared successfully');
  } catch (error) {
    console.error('Error clearing model cache:', error);
    toast.error('Failed to clear model cache');
  }
};

// Utility: Get cache information
export const getModelCacheInfo = async () => {
  try {
    return await getCacheStats();
  } catch (error) {
    console.error('Error getting cache info:', error);
    return { count: 0, models: [], totalSize: 0 };
  }
};
