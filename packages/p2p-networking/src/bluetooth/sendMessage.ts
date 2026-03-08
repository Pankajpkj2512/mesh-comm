// BUG #4 FIX: sendMessage now actually calls sendEncryptedMessage and
//             flushQueuedMessages instead of just echoing the payload back.
//             Previously encryption was completely bypassed.

import { sendEncryptedMessage, flushQueuedMessages } from "../encryptedMessaging";

export async function sendMessage(
  sender: string,
  receiver: string,
  message: string,
  senderPrivateKey: string,    // base64-encoded Ed25519 private key
  recipientPublicKey: string,  // base64-encoded Ed25519 public key
): Promise<void> {
  console.log(`[Bluetooth] ${sender} → ${receiver} : encrypting and queuing message`);

  // Encrypt and queue the message
  await sendEncryptedMessage(senderPrivateKey, recipientPublicKey, receiver, message);

  // Simulate checking if peer is online — attempt to flush the queue
  // In real Bluetooth this would only flush when the peer is reachable
  const peerOnline = true; // TODO: replace with real peer discovery check
  if (peerOnline) {
    console.log(`[Bluetooth] Peer ${receiver} is online — flushing queue`);
    await flushQueuedMessages(receiver);
  } else {
    console.log(`[Bluetooth] Peer ${receiver} is offline — message queued for later`);
  }
}
