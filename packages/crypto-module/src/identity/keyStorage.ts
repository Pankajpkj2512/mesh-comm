// BUG #10 FIX: Replaced browser-only Storage API with a platform-agnostic IStorage interface.
// - Node.js / tests: use MemoryStorage
// - Browser (PWA):   pass localStorage
// - React Native:    wrap AsyncStorage in a class that implements IStorage

export interface IStorage {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

// In-memory implementation — safe in Node.js and useful for tests
export class MemoryStorage implements IStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }
}

export class KeyStorage {
  private storage: IStorage;

  // Pass any IStorage implementation:
  //   new KeyStorage(new MemoryStorage())          — for tests / Node.js
  //   new KeyStorage(localStorage)                 — for PWA (localStorage satisfies IStorage)
  //   new KeyStorage(new ReactNativeStorageAdapter()) — for React Native
  constructor(storage: IStorage) {
    this.storage = storage;
  }

  async savePrivateKey(userId: string, privateKey: string): Promise<void> {
    await this.storage.setItem(`privKey-${userId}`, privateKey);
  }

  async getPrivateKey(userId: string): Promise<string | null> {
    return await this.storage.getItem(`privKey-${userId}`);
  }

  async savePublicKey(userId: string, publicKey: string): Promise<void> {
    await this.storage.setItem(`pubKey-${userId}`, publicKey);
  }

  async getPublicKey(userId: string): Promise<string | null> {
    return await this.storage.getItem(`pubKey-${userId}`);
  }

  async deleteKeys(userId: string): Promise<void> {
    await this.storage.removeItem(`privKey-${userId}`);
    await this.storage.removeItem(`pubKey-${userId}`);
  }
}
