
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { storeFacialData } from './supabaseApi';
import * as faceapi from 'face-api.js';
import { Patient } from '@/types';
import { 
  fetchModelWithCache, 
  getCacheStats, 
  clearModelCache as clearCache 
} from './modelCache';

// Flag to track whether models are loaded
let modelsLoaded = false;

// Model configuration
const MODEL_BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const MODELS = [
  { name: 'ssdMobilenetv1', files: ['ssd_mobilenetv1_model-weights_manifest.json', 'ssd_mobilenetv1_model-shard1', 'ssd_mobilenetv1_model-shard2'] },
  { name: 'faceLandmark68Net', files: ['face_landmark_68_model-weights_manifest.json', 'face_landmark_68_model-shard1'] },
  { name: 'faceRecognitionNet', files: ['face_recognition_model-weights_manifest.json', 'face_recognition_model-shard1', 'face_recognition_model-shard2'] }
];

// Function to load face-api.js models with caching
export const loadFaceDetectionModels = async () => {
  if (modelsLoaded) return;
  
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
      
      // Clean up object URLs after a short delay
      setTimeout(() => {
        fileUrls.forEach(url => URL.revokeObjectURL(url));
        console.log('🧹 Cleaned up temporary object URLs');
      }, 1000);
      
    } catch (loadError) {
      // Clean up on error
      fileUrls.forEach(url => URL.revokeObjectURL(url));
      throw loadError;
    }
    
  } catch (error) {
    console.error('❌ Error loading face detection models:', error);
    toast.error('Failed to load face detection models');
    throw error;
  }
};

// Function to detect faces in an image
export const detectFaces = async (imageData: string) => {
  try {
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
