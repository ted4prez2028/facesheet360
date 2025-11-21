/**
 * HIPAA-compliant encryption utilities for PHI (Protected Health Information)
 * Uses Web Crypto API for client-side encryption
 */

export class EncryptionService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;

  /**
   * Generate a secure encryption key
   */
  static async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Export key to storage format
   */
  static async exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('jwk', key);
    return JSON.stringify(exported);
  }

  /**
   * Import key from storage
   */
  static async importKey(keyData: string): Promise<CryptoKey> {
    const jwk = JSON.parse(keyData);
    return await crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt PHI data
   */
  static async encrypt(data: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      dataBuffer
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt PHI data
   */
  static async decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    const iv = combined.slice(0, this.IV_LENGTH);
    const data = combined.slice(this.IV_LENGTH);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  /**
   * Hash sensitive data (one-way, for comparison)
   */
  static async hash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

/**
 * Secure field-level encryption for forms
 */
/**
 * WARNING: Field-level encryption with sessionStorage is NOT secure for production.
 * Keys should be managed by a secure key management service (KMS) or backend.
 * This implementation is for development/testing only.
 */
export const encryptField = async (value: string): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new Error('encryptField can only be used in browser environment');
  }

  const key = await EncryptionService.generateKey();
  const encrypted = await EncryptionService.encrypt(value, key);
  const keyData = await EncryptionService.exportKey(key);
  
  // SECURITY WARNING: Session storage is not secure for production
  // In production, keys MUST be stored in a secure key management service
  // or managed by a backend service with proper access controls
  const keyId = `key_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  try {
    sessionStorage.setItem(keyId, keyData);
    // Store key ID with encrypted data (separate from key for security)
    return JSON.stringify({ encrypted, keyId });
  } catch (error) {
    // Handle quota exceeded or other storage errors
    throw new Error('Failed to store encryption key. Storage may be full or unavailable.');
  }
};

export const decryptField = async (encryptedData: string): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new Error('decryptField can only be used in browser environment');
  }

  try {
    const { encrypted, keyId } = JSON.parse(encryptedData);
    const keyData = sessionStorage.getItem(keyId);
    
    if (!keyData) {
      throw new Error('Encryption key not found. Session may have expired.');
    }
    
    const key = await EncryptionService.importKey(keyData);
    const decrypted = await EncryptionService.decrypt(encrypted, key);
    
    // Optionally clean up key after decryption for security
    // sessionStorage.removeItem(keyId);
    
    return decrypted;
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Legacy format support (backward compatibility)
      const keyData = sessionStorage.getItem(`key_${encryptedData.slice(0, 10)}`);
      if (!keyData) throw new Error('Encryption key not found');
      const key = await EncryptionService.importKey(keyData);
      return await EncryptionService.decrypt(encryptedData, key);
    }
    throw error;
  }
};
