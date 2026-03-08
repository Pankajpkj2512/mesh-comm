Mesh Communication Project
Overview

The Mesh Communication Project is a decentralized messaging system that allows devices to communicate peer-to-peer (P2P) securely without relying on a centralized server. The system supports encrypted messaging, identity management, QR-based contact exchange, and Bluetooth-based P2P networking.

Key features so far:

Identity Management – Generate cryptographic identities (Ed25519 keys) for users.

End-to-End Encryption – Encrypt and decrypt messages using Curve25519 keys.

QR Code Export/Import – Share public identity via QR codes.

P2P Networking – Send and receive messages via Bluetooth.

Modular Architecture – Organized as a monorepo using Yarn workspaces.

Project Structure
mesh-comm/
├── apps/
│ ├── mobile-app/ # Mobile frontend (future)
│ └── pwa-client/ # PWA frontend (future)
├── packages/
│ ├── crypto-module/ # Encryption, identity, utilities
│ ├── p2p-networking/ # P2P networking layer (Bluetooth)
│ ├── protocol/ # Protocol definitions (future)
│ ├── shared-ui/ # Shared UI components (future)
│ ├── storage-layer/ # Storage and caching layer (future)
│ └── sync-engine/ # Synchronization logic (future)
├── tools/ # Development tools
├── package.json
└── yarn.lock
Installation

Make sure you have the following installed:

Node.js >=25.6.1

Yarn >=4.13.0

Then install dependencies:

cd mesh-comm
yarn install
Packages Overview

1. crypto-module

Handles identity management and encryption.

Folder structure:

packages/crypto-module/src/
├── encryption/
│ ├── encryptMessage.ts
│ └── decryptMessage.ts
├── identity/
│ ├── generateIdentity.ts
│ ├── fingerprint.ts
│ ├── qrExport.ts
│ └── qrImport.ts
├── utils/
├── index.ts
└── testCrypto.ts

Example usage:

import { generateIdentity } from './packages/crypto-module/src/identity/generateIdentity';
import { encryptMessage, decryptMessage } from './packages/crypto-module/src/encryption/encryptMessage';

const alice = generateIdentity();
const bob = generateIdentity();

const encrypted = await encryptMessage(alice.privateKey, bob.publicKey, "Hello Bob!");
const decrypted = await decryptMessage(bob.privateKey, alice.publicKey, encrypted);

console.log(decrypted); // Hello Bob!

QR export/import allows sending public keys via QR codes:

import { exportIdentityToQR, importIdentityFromQR } from './identity/qrExport';
const qrData = await exportIdentityToQR(alice);
const importedContact = await importIdentityFromQR(qrData); 2. p2p-networking

Handles Bluetooth-based peer-to-peer messaging.

Folder structure:

packages/p2p-networking/src/
├── bluetooth/
│ ├── discoverPeers.ts
│ ├── sendMessage.ts
│ └── receiveMessage.ts
├── encryptedMessaging.ts
├── index.ts
└── testP2P.ts

Example usage:

import { sendMessage, receiveMessage } from './packages/p2p-networking/src/bluetooth';
import { generateIdentity } from './packages/crypto-module/src/identity/generateIdentity';

const alice = generateIdentity();
const bob = generateIdentity();

await sendMessage('bob-peer', 'Hello Bob!', alice.privateKey, bob.publicKey);
receiveMessage('alice-peer', bob.privateKey, alice.publicKey);
Running Tests
Test Crypto Module
yarn tsx packages/crypto-module/src/testCrypto.ts

Expected output:

Identity generated: { userId: ..., publicKey: ..., privateKey: ... }
Encrypted: <base64-string>
Decrypted: Hello Bob!
QR JSON string: {...}
Imported contact: {...}
Test P2P Networking
yarn tsx packages/p2p-networking/src/testP2P.ts

Expected behavior:

Peer offline messages are queued.

Once the peer comes online, messages are encrypted and sent.

Decryption on the receiver side works with proper keys.

Notes / Tips

Always use Ed25519 keys for identity, and convert to Curve25519 for encryption.

Keys must be base64 encoded and correct length:

Private: 64 bytes

Public: 32 bytes

For QR export/import, only share public identity. Never share private keys.

libsodium-wrappers-sumo is used for cryptography; ensure it is installed correctly.

Future Work

Implement mobile and PWA clients in apps/.

Add protocol definitions for message formats.

Create storage-layer to persist messages offline.

Build sync-engine for multi-device message syncing.

Improve error handling and retries for P2P networking.

Commands Summary
Command Description
yarn install Install all dependencies
yarn tsx packages/crypto-module/src/testCrypto.ts Test crypto module
yarn tsx packages/p2p-networking/src/testP2P.ts Test P2P messaging

This README reflects all working modules as of now, with encryption, QR code identity, and P2P messaging functioning end-to-end.

If you want, I can also add a flow diagram showing Alice → Bob messaging, QR exchange, encryption/decryption, and how packages interact, which makes the README even more professional.

Do you want me to add that diagram too?
