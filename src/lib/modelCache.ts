// IndexedDB-based caching for face-api.js models
// This significantly improves performance on subsequent loads

const DB_NAME = 'face-api-models-cache';
const DB_VERSION = 1;
const STORE_NAME = 'models';
const MODEL_VERSION = '1.0.0'; // Increment this to invalidate cache when models update

interface CachedModel {
  name: string;
  data: Blob;
  version: string;
  timestamp: number;
}

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'name' });
      }
    };
  });
};

// Get a cached model from IndexedDB
export const getCachedModel = async (modelName: string): Promise<Blob | null> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(modelName);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as CachedModel | undefined;
        
        // Check if model exists and version matches
        if (result && result.version === MODEL_VERSION) {
          console.log(`✅ Model ${modelName} loaded from cache`);
          resolve(result.data);
        } else {
          if (result) {
            console.log(`⚠️ Model ${modelName} version mismatch, will re-download`);
          }
          resolve(null);
        }
      };
    });
  } catch (error) {
    console.error('Error getting cached model:', error);
    return null;
  }
};

// Cache a model in IndexedDB
export const cacheModel = async (modelName: string, data: Blob): Promise<void> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const cachedModel: CachedModel = {
        name: modelName,
        data,
        version: MODEL_VERSION,
        timestamp: Date.now()
      };
      
      const request = store.put(cachedModel);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log(`💾 Model ${modelName} cached successfully`);
        resolve();
      };
    });
  } catch (error) {
    console.error('Error caching model:', error);
    throw error;
  }
};

// Clear all cached models (useful for debugging or forcing refresh)
export const clearModelCache = async (): Promise<void> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('🗑️ Model cache cleared');
        resolve();
      };
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw error;
  }
};

// Get cache statistics
export const getCacheStats = async (): Promise<{
  count: number;
  models: string[];
  totalSize: number;
}> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const models = request.result as CachedModel[];
        const totalSize = models.reduce((sum, model) => sum + model.data.size, 0);
        
        resolve({
          count: models.length,
          models: models.map(m => m.name),
          totalSize
        });
      };
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { count: 0, models: [], totalSize: 0 };
  }
};

// Fetch model from URL with caching
export const fetchModelWithCache = async (
  modelName: string,
  url: string
): Promise<Blob> => {
  // Try to get from cache first
  const cached = await getCachedModel(modelName);
  if (cached) {
    return cached;
  }
  
  // If not in cache, fetch from URL
  console.log(`📥 Downloading model ${modelName} from CDN...`);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch model ${modelName}: ${response.statusText}`);
  }
  
  const blob = await response.blob();
  
  // Cache for next time (don't await to avoid blocking)
  cacheModel(modelName, blob).catch(err => 
    console.warn(`Failed to cache model ${modelName}:`, err)
  );
  
  return blob;
};
