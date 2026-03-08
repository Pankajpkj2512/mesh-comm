// packages/p2p-networking/src/messageQueue.ts

type QueuedMessage = {
  peerId: string;
  message: string; // encrypted
  timestamp: number;
};

const queue: QueuedMessage[] = [];

export function enqueueMessage(peerId: string, message: string) {
  queue.push({ peerId, message, timestamp: Date.now() });
  console.log(`Message queued for ${peerId}`);
}

export function getQueuedMessages(): QueuedMessage[] {
  return [...queue];
}

export function clearQueuedMessages(peerId: string) {
  for (let i = queue.length - 1; i >= 0; i--) {
    if (queue[i].peerId === peerId) queue.splice(i, 1);
  }
}
