// packages/p2p-networking/src/bluetooth/receiveMessage.ts
import { receiveEncryptedMessage } from "../encryptedMessaging";

/**
 * Handles incoming Bluetooth messages.
 * Decrypts and returns the plaintext.
 */
export async function receiveMessage(
  senderPublicKey: string,
  recipientPrivateKey: string,
  encryptedMessage: string,
) {
  const decrypted = await receiveEncryptedMessage(
    senderPublicKey,
    recipientPrivateKey,
    encryptedMessage,
  );
  console.log("Received message:", decrypted);
  return decrypted;
}
