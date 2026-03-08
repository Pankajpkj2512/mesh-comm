// packages/p2p-networking/src/encryptedMessaging.ts

import {
  encryptMessage,
  decryptMessage,
} from "../../crypto-module/src/encryption/encryptMessage";
import {
  enqueueMessage,
  clearQueuedMessages,
  getQueuedMessages,
} from "./messageQueue";

export async function sendEncryptedMessage(
  senderPrivateKey: string,
  recipientPublicKey: string,
  peerId: string,
  message: string,
) {
  try {
    const encrypted = await encryptMessage(
      senderPrivateKey,
      recipientPublicKey,
      message,
    );
    // TODO: Send over Bluetooth/peer network
    console.log(`Encrypted message ready to send to ${peerId}:`, encrypted);
    enqueueMessage(peerId, encrypted);
  } catch (err) {
    console.error("Failed to encrypt message:", err);
  }
}

export async function receiveEncryptedMessage(
  senderPublicKey: string,
  recipientPrivateKey: string,
  encryptedMessage: string,
) {
  try {
    const decrypted = await decryptMessage(
      senderPublicKey,
      recipientPrivateKey,
      encryptedMessage,
    );
    console.log("Decrypted message:", decrypted);
    return decrypted;
  } catch (err) {
    console.error("Failed to decrypt message:", err);
  }
}

// Function to attempt sending queued messages when peer comes online
export async function flushQueuedMessages(peerId: string) {
  const messages = getQueuedMessages().filter((m) => m.peerId === peerId);
  for (const m of messages) {
    // TODO: Send message via Bluetooth or WebRTC
    console.log(`Flushing queued message to ${peerId}:`, m.message);
    // On successful send:
    clearQueuedMessages(peerId);
  }
}
