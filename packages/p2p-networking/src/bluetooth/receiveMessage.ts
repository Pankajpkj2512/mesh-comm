// BUG #3 FIX: Updated function signature from 3 params to 5 params to match
//             how testP2P.ts calls it. Previously the Curve25519 keys were
//             passed but silently ignored — decryption always failed.

import { receiveEncryptedMessage } from "../encryptedMessaging";
import { EncryptedPayload } from "../messageQueue";

export async function receiveMessage(
  sender: string,                        // peer label (for logging)
  receiver: string,                      // peer label (for logging)
  encryptedPayload: EncryptedPayload,    // { cipher, nonce } from encryptMessage
  recipientPrivateKey: string,           // base64-encoded Ed25519 private key
  senderPublicKey: string,               // base64-encoded Ed25519 public key
): Promise<string> {
  console.log(`[Bluetooth] ${sender} → ${receiver} : receiving message`);
  const decrypted = await receiveEncryptedMessage(
    senderPublicKey,
    recipientPrivateKey,
    encryptedPayload,
  );
  console.log(`[Bluetooth] Decrypted message for ${receiver}:`, decrypted);
  return decrypted;
}
