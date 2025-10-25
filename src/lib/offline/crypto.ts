/**
 * Encryption utilities for offline data
 * Uses Web Crypto API for secure client-side encryption
 */

export class OfflineCrypto {
  private static ALGORITHM = 'AES-GCM';
  private static KEY_LENGTH = 256;
  private static IV_LENGTH = 12;

  /**
   * Generate a new encryption key
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
   * Export key to storable format
   */
  static async exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('jwk', key);
    return JSON.stringify(exported);
  }

  /**
   * Import key from stored format
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
   * Encrypt data
   */
  static async encrypt(data: any, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const plaintext = encoder.encode(JSON.stringify(data));

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

    // Encrypt
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv,
      },
      key,
      plaintext
    );

    // Combine IV and ciphertext
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt data
   */
  static async decrypt(encryptedData: string, key: CryptoKey): Promise<any> {
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

    // Extract IV and ciphertext
    const iv = combined.slice(0, this.IV_LENGTH);
    const ciphertext = combined.slice(this.IV_LENGTH);

    // Decrypt
    const plaintext = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv,
      },
      key,
      ciphertext
    );

    // Decode and parse
    const decoder = new TextDecoder();
    const json = decoder.decode(plaintext);
    return JSON.parse(json);
  }

  /**
   * Generate a fingerprint for the device
   * Used as part of encryption key derivation
   */
  static async getDeviceFingerprint(): Promise<string> {
    const components = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      screen.width,
      screen.height,
      screen.colorDepth,
    ];

    const fingerprint = components.join('|');
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Derive a key from a password and salt
   */
  static async deriveKey(password: string, salt: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive key
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
}

/**
 * Manage encryption keys for offline storage
 */
export class KeyManager {
  private static KEY_STORE_NAME = 'encryption-key';
  private key: CryptoKey | null = null;

  async getOrCreateKey(): Promise<CryptoKey> {
    if (this.key) return this.key;

    // Try to load from localStorage (temporary storage)
    const stored = localStorage.getItem(KeyManager.KEY_STORE_NAME);
    if (stored) {
      this.key = await OfflineCrypto.importKey(stored);
      return this.key;
    }

    // Generate new key
    const fingerprint = await OfflineCrypto.getDeviceFingerprint();
    this.key = await OfflineCrypto.deriveKey(fingerprint, 'intelligentforms-offline');

    // Store key
    const exported = await OfflineCrypto.exportKey(this.key);
    localStorage.setItem(KeyManager.KEY_STORE_NAME, exported);

    return this.key;
  }

  async clearKey(): Promise<void> {
    this.key = null;
    localStorage.removeItem(KeyManager.KEY_STORE_NAME);
  }
}

export const keyManager = new KeyManager();
