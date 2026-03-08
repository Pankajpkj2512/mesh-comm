import sodium from "libsodium-wrappers-sumo";

// Storage adapters: React Native vs PWA
// React Native: use @react-native-async-storage/async-storage
// PWA: use localStorage

export class KeyStorage {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async savePrivateKey(userId: string, privateKey: string) {
    this.storage.setItem(`privKey-${userId}`, privateKey);
  }

  async getPrivateKey(userId: string): Promise<string | null> {
    return this.storage.getItem(`privKey-${userId}`);
  }

  async savePublicKey(userId: string, publicKey: string) {
    this.storage.setItem(`pubKey-${userId}`, publicKey);
  }

  async getPublicKey(userId: string): Promise<string | null> {
    return this.storage.getItem(`pubKey-${userId}`);
  }
}
