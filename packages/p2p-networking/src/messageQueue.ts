// BUG #5 FIX: Changed message field type from `string` to EncryptedPayload
//             to match the actual return type of encryptMessage().

export type EncryptedPayload = {
  cipher: string;
  nonce: string;
};

type QueuedMessage = {
  peerId: string;
  message: EncryptedPayload; // was incorrectly typed as string
  timestamp: number;
};

const queue: QueuedMessage[] = [];

export function enqueueMessage(peerId: string, message: EncryptedPayload): void {
  queue.push({ peerId, message, timestamp: Date.now() });
  console.log(`[Queue] Message queued for ${peerId}. Queue size: ${queue.length}`);
}

export function getQueuedMessages(): QueuedMessage[] {
  return [...queue];
}

export function getQueuedMessagesForPeer(peerId: string): QueuedMessage[] {
  return queue.filter((m) => m.peerId === peerId);
}

export function clearQueuedMessages(peerId: string): void {
  for (let i = queue.length - 1; i >= 0; i--) {
    if (queue[i].peerId === peerId) queue.splice(i, 1);
  }
  console.log(`[Queue] Cleared messages for ${peerId}`);
}
