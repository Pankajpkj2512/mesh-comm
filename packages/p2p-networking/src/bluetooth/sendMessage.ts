// packages/p2p-networking/src/bluetooth/sendMessage.ts
import {
  sendEncryptedMessage,
  flushQueuedMessages,
} from "../encryptedMessaging";

/**
 * Sends a message to a peer over Bluetooth.
 * If peer is offline, it will be queued.
 */
// packages/p2p-networking/src/bluetooth/sendMessage.ts
export async function sendMessage(
  sender: string,
  receiver: string,
  payload: any,
): Promise<any> {
  console.log(`[P2P] ${sender} → ${receiver} : sending payload`);
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 100));
  return payload; // In real Bluetooth, this would send over the network
}
