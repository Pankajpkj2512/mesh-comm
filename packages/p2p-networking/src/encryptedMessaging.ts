// BUG #2 FIX: Import decryptMessage from the correct file (decryptMessage.ts).
// BUG #2 FIX: Convert base64 key strings to Uint8Array before passing to
//             encryptMessage / decryptMessage — they require Uint8Array, not strings.
// BUG #6 FIX: Moved clearQueuedMessages() to after the loop in flushQueuedMessages
//             so all queued messages are sent before the queue is cleared.

import sodium from "libsodium-wrappers-sumo";
import { encryptMessage } from "../../crypto-module/src/encryption/encryptMessage";
import { decryptMessage } from "../../crypto-module/src/encryption/decryptMessage"; // ✅ correct file
import { EncryptedPayload, enqueueMessage, clearQueuedMessages, getQueuedMessagesForPeer } from "./messageQueue";

export async function sendEncryptedMessage(
  senderPrivateKey: string,   // base64-encoded Ed25519 private key (will be converted)
  recipientPublicKey: string, // base64-encoded Ed25519 public key (will be converted)
  peerId: string,
  message: string,
): Promise<void> {
  await sodium.ready;
  try {
    // Convert base64 strings → Curve25519 Uint8Arrays before encrypting
    const senderPrivBytes    = sodium.crypto_sign_ed25519_sk_to_curve25519(
      sodium.from_base64(senderPrivateKey, sodium.base64_variants.ORIGINAL),
    );
    const recipientPubBytes  = sodium.crypto_sign_ed25519_pk_to_curve25519(
      sodium.from_base64(recipientPublicKey, sodium.base64_variants.ORIGINAL),
    );

    // Correct order: encryptMessage(message, recipientPub, senderPriv)
    const encrypted = await encryptMessage(message, recipientPubBytes, senderPrivBytes);

    console.log(`[Messaging] Encrypted message ready for ${peerId}`);
    enqueueMessage(peerId, encrypted);
  } catch (err) {
    console.error("[Messaging] Failed to encrypt message:", err);
    throw err;
  }
}

export async function receiveEncryptedMessage(
  senderPublicKey: string,    // base64-encoded Ed25519 public key (will be converted)
  recipientPrivateKey: string, // base64-encoded Ed25519 private key (will be converted)
  encryptedMessage: EncryptedPayload,
): Promise<string> {
  await sodium.ready;
  try {
    // Convert base64 strings → Curve25519 Uint8Arrays before decrypting
    const senderPubBytes     = sodium.crypto_sign_ed25519_pk_to_curve25519(
      sodium.from_base64(senderPublicKey, sodium.base64_variants.ORIGINAL),
    );
    const recipientPrivBytes = sodium.crypto_sign_ed25519_sk_to_curve25519(
      sodium.from_base64(recipientPrivateKey, sodium.base64_variants.ORIGINAL),
    );

    // Correct order: decryptMessage(encrypted, recipientPriv, senderPub)
    const decrypted = await decryptMessage(encryptedMessage, recipientPrivBytes, senderPubBytes);
    console.log("[Messaging] Decrypted message:", decrypted);
    return decrypted;
  } catch (err) {
    console.error("[Messaging] Failed to decrypt message:", err);
    throw err;
  }
}

// BUG #6 FIX: clearQueuedMessages is now called AFTER the loop,
// not inside it — so all messages are flushed before the queue is cleared.
export async function flushQueuedMessages(peerId: string): Promise<void> {
  const messages = getQueuedMessagesForPeer(peerId);
  if (messages.length === 0) {
    console.log(`[Queue] No queued messages for ${peerId}`);
    return;
  }

  console.log(`[Queue] Flushing ${messages.length} message(s) to ${peerId}`);
  for (const m of messages) {
    // TODO: Replace with real Bluetooth / WebRTC send
    console.log(`[Queue] → Sending to ${peerId}:`, m.message);
  }

  clearQueuedMessages(peerId); // ✅ runs once, after all messages are sent
}

