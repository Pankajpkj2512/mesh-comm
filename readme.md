# MeshComm — Encrypted Peer-to-Peer Messenger

> **No servers. No accounts. Fully encrypted.**
>
> MeshComm is a browser-based, end-to-end encrypted messaging application using pure WebCrypto (Ed25519 + X25519 ECDH + AES-256-GCM). Messages are encrypted before leaving your device. No central server ever sees your messages.

---

## 🎯 Table of Contents

1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Quick Start](#quick-start)
5. [Complete Workflow](#complete-workflow)
6. [Installation & Setup](#installation--setup)
7. [Architecture & Core Modules](#architecture--core-modules)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)
10. [Security Notes](#security-notes)

---

## ✨ Features

- ✅ **Zero Servers**: Peer-to-peer communication only
- ✅ **No CDN Dependencies**: Pure WebCrypto (browser native)
- ✅ **End-to-End Encrypted**: Ed25519 signing + X25519 ECDH + AES-256-GCM
- ✅ **Multiple Transport Methods**:
  - Web Bluetooth (Chrome Android/Desktop)
  - QR Code exchange
  - Manual key paste
  - Same-browser BroadcastChannel (tab-to-tab)
- ✅ **Offline-First**: Works completely offline
- ✅ **Progressive Web App**: Installable on mobile & desktop
- ✅ **Session Storage**: Messages persist for the session
- ✅ **No User Tracking**: Zero telemetry

---

## 📁 Project Structure

```
mesh-comm-fixed/
├── apps/
│   ├── mobile-app/                 # Native mobile (future)
│   └── pwa-client/                 # Main PWA application
│       ├── index.html              # Single-file HTML5 app
│       ├── package.json
│       ├── vite.config.ts
│       └── src/
│           └── main.ts             # Entry point
│
├── packages/
│   ├── crypto-module/              # WebCrypto wrapper
│   │   ├── src/
│   │   │   ├── index.ts            # Exports
│   │   │   ├── encryption/
│   │   │   │   ├── encryptMessage.ts
│   │   │   │   └── decryptMessage.ts
│   │   │   ├── identity/
│   │   │   │   ├── generateIdentity.ts
│   │   │   │   ├── fingerprint.ts
│   │   │   │   ├── keyStorage.ts
│   │   │   │   ├── qrExport.ts
│   │   │   │   └── qrImport.ts
│   │   │   └── utils/
│   │   │       └── keyConversion.ts
│   │   └── package.json
│   │
│   ├── p2p-networking/             # Transport & messaging
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── encryptedMessaging.ts
│   │   │   ├── messageQueue.ts
│   │   │   ├── bluetooth/
│   │   │   │   ├── discoverPeers.ts
│   │   │   │   ├── sendMessage.ts
│   │   │   │   └── receiveMessage.ts
│   │   │   └── testP2P.ts
│   │   └── package.json
│   │
│   ├── protocol/                   # Message protocol definitions
│   ├── shared-ui/                  # UI components (future)
│   ├── storage-layer/              # IndexedDB/SessionStorage
│   └── sync-engine/                # Message sync & queuing

├── package.json                    # Root workspace
└── README.md                       # This file
```

---

## 🛠 Technology Stack

| Layer               | Technology                                   | Purpose                                  |
| ------------------- | -------------------------------------------- | ---------------------------------------- |
| **Crypto**          | WebCrypto API (Ed25519, X25519, AES-256-GCM) | Encryption & signing (zero dependencies) |
| **Transport**       | Web Bluetooth API, BroadcastChannel          | P2P communication                        |
| **UI**              | Vanilla HTML5 + CSS Grid + JS                | Progressive Web App                      |
| **Storage**         | SessionStorage, IndexedDB (future)           | Session persistence                      |
| **Build**           | Vite                                         | Fast dev server & bundling               |
| **Runtime**         | Node.js 18+                                  | Development                              |
| **Browser Support** | Chrome 90+, Firefox 95+, Safari 14+          | Modern browsers only                     |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/mesh-comm-fixed.git
cd mesh-comm-fixed
npm install
```

### 2. Run Development Server

```bash
cd apps/pwa-client
npm run dev
# Opens http://localhost:5173
```

### 3. First Time Setup

1. **Generate Identity**: Click "Generate" in sidebar
   - Creates Ed25519 keypair (identity/signing)
   - Creates X25519 keypair (encryption)
   - Stores in sessionStorage (lost on browser close)

2. **Add a Peer**: Choose one of 4 methods:
   - **Bluetooth Scan**: Click "⟁ BT Scan" (Chrome only)
   - **QR Code**: Click "Share QR" → Peer scans with "⊞ QR"
   - **Manual Key**: Click "+ Add" → Paste peer's public key
   - **Same Browser**: Open a second tab → Auto-discovery via BroadcastChannel

3. **Send Message**: Select peer → Type → Press Enter or click send

---

## 📋 Complete Workflow

### Scenario 1: Two Devices via QR Code

#### Device A (Sender)

```
1. Generate Identity
   └─ Creates pubEd, privEd, pubX, privX
   └─ Stored in sessionStorage

2. Click "Share QR"
   └─ QR contains: { userId, pubEd, pubX }
   └─ Displayed on canvas (no external lib needed)

3. Device B scans QR
   └─ Extracts pubEd & pubX
```

#### Device B (Receiver)

```
1. Generate Identity
   └─ Creates its own keypair

2. Click "⊞ QR"
   └─ Paste Device A's JSON from QR

3. System auto-adds Device A as peer
   └─ Stores Device A's pubEd & pubX
   └─ Keys ready for encryption
```

#### Message Flow (Device A → Device B)

```
┌─────────────────────────────────────────┐
│ Device A: User types "Hello"            │
├─────────────────────────────────────────┤
│ sendMsg()                               │
│  ├─ Get plaintext: "Hello"              │
│  ├─ Encrypt via encryptMsg()            │
│  │  ├─ Import Device B's pubX           │
│  │  ├─ Import Device A's privX          │
│  │  ├─ ECDH → shared AES-256-GCM key   │
│  │  ├─ Generate random IV (12 bytes)    │
│  │  └─ AES-GCM encrypt → cipher + IV    │
│  ├─ Send encrypted payload              │
│  └─ addMsg(peerId, "Hello", true, true) │
│     (mine=true, encrypted=true)         │
└─────────────────────────────────────────┘
                    ↓
         [Network/Bluetooth]
                    ↓
┌─────────────────────────────────────────┐
│ Device B: Receive encrypted data        │
├─────────────────────────────────────────┤
│ onBTMsg() or BC.onmessage               │
│  ├─ Parse payload (cipher + IV)         │
│  ├─ Call recvPayload()                  │
│  ├─ Decrypt via decryptMsg()            │
│  │  ├─ Import Device A's pubX           │
│  │  ├─ Import Device B's privX          │
│  │  ├─ ECDH → same shared key           │
│  │  └─ AES-GCM decrypt → plaintext      │
│  └─ addMsg(peerId, "Hello", false, true)│
│     (mine=false, encrypted=true)        │
│  ├─ renderMsgs() updates chat UI        │
│  └─ user sees: "Hello" in chat          │
└─────────────────────────────────────────┘
```

### Scenario 2: Same Browser, Two Tabs

#### Tab 1

```
1. Generate Identity A
2. Messages auto-broadcast via BroadcastChannel
```

#### Tab 2

```
1. Generate Identity B (different keypair)
2. Tab 1 detects via BroadcastChannel 'presence' event
3. Peers auto-added, keys exchanged
4. Encryption active immediately
```

**Key Difference**: No manual setup needed; BroadcastChannel handles discovery.

### Scenario 3: Bluetooth (Chrome + Android)

#### Bluetooth Flow

```
┌──────────────┐
│  Device A    │
│ (BT Central) │
└──────────────┘
         │
    startBTScan()
         │
    bluetooth.requestDevice()
         │
    ┌────────────────┐
    │  Device B      │
    │ (BT Peripheral)│
    │ GATT Service   │
    │ UUID: 6e400001 │
    └────────────────┘
         │
    connectBT(device)
         │
    gatt.connect()
         ├─ getPrimaryService(BT_SVC)
         ├─ TX char (write): 6e400002
         ├─ RX char (notify): 6e400003
         │
    Send Handshake:
    TX ← { type: 'handshake', userId, pubEd, pubX }
         │
    RX → Receive Device B's handshake
         │
    Exchange keys, enable encryption
         │
    Send encrypted messages via TX
```

---

## 💻 Installation & Setup

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Browser**: Chrome 90+, Firefox 95+, Safari 14+

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/mesh-comm-fixed.git
cd mesh-comm-fixed
```

### Step 2: Install Dependencies

```bash
npm install
# Installs for root + all workspaces
```

### Step 3: Build Crypto & P2P Modules

```bash
npm run build -w=crypto-module
npm run build -w=p2p-networking
```

### Step 4: Run PWA Client

```bash
cd apps/pwa-client
npm run dev
```

Open browser → `http://localhost:5173`

### Step 5: Build for Production

```bash
cd apps/pwa-client
npm run build
# Outputs to dist/
```

---

## 🏗 Architecture & Core Modules

### Module 1: Crypto Module (`packages/crypto-module/`)

**Purpose**: WebCrypto wrapper for encryption, signing, and identity.

#### Key Files

| File                  | Function                                                                |
| --------------------- | ----------------------------------------------------------------------- |
| `generateIdentity.ts` | `genIdentity()` → Creates Ed25519 + X25519 keypairs                     |
| `encryptMessage.ts`   | `encryptMsg(plaintext, recipientPubX, senderPrivX)` → Encrypted payload |
| `decryptMessage.ts`   | `decryptMsg(payload, senderPubX, recipientPrivX)` → Plaintext           |
| `fingerprint.ts`      | Computes user ID from public key SHA-256 hash                           |
| `keyConversion.ts`    | b64e / b64d / hex conversion utilities                                  |

#### Example Usage

```typescript
// Generate identity
const id = await genIdentity();
// {
//   userId: "a1b2c3d4...",
//   pubEd: "base64-encoded...",
//   privEd: "base64-encoded...",
//   pubX: "base64-encoded...",
//   privX: "base64-encoded..."
// }

// Encrypt message
const encrypted = await encryptMsg("Hello", recipientPubX, senderPrivX);
// { cipher: "...", iv: "..." }

// Decrypt message
const decrypted = await decryptMsg(encrypted, senderPubX, recipientPrivX);
// "Hello"
```

### Module 2: P2P Networking (`packages/p2p-networking/`)

**Purpose**: Handle transport (Bluetooth, BroadcastChannel) and message flow.

#### Key Files

| File                    | Function                                          |
| ----------------------- | ------------------------------------------------- |
| `sendMessage.ts`        | Sends encrypted payload over transport            |
| `receiveMessage.ts`     | Receives, decrypts, and adds message to state     |
| `encryptedMessaging.ts` | High-level encrypted message API                  |
| `messageQueue.ts`       | Queue offline messages until peer online          |
| `discoverPeers.ts`      | Discovers peers via Bluetooth or BroadcastChannel |

#### Bluetooth Module

```typescript
// Start scan
await startBTScan();
// → Shows list of nearby MeshComm devices

// Connect to device
await connectBT(device);
// → Establishes GATT connection
// → Exchanges keys via handshake
// → Enables notifications on RX characteristic

// Send message
await sendMessage(peerId, encryptedPayload);
// → Writes to TX characteristic
```

#### BroadcastChannel Module

```typescript
// Initialize
initBC();
// → Creates new BroadcastChannel('meshcomm_v2')

// Broadcast presence
broadcastPresence();
// → Sends { type: 'presence', pubEd, pubX, userId }

// On message event
S.bc.onmessage = (e) => {
  // Handle 'presence' → auto-add peer
  // Handle 'message' → decrypt & add to chat
};
```

### Module 3: Storage Layer (PWA Client)

**Current**: SessionStorage (in-memory, cleared on browser close)

**Future**: IndexedDB for persistent storage across sessions

```typescript
// Save identity
function saveId() {
  sessionStorage.setItem("mc_id", JSON.stringify(S.id));
}

// Load identity
function loadId() {
  const id = JSON.parse(sessionStorage.getItem("mc_id"));
  S.id = id;
}

// Save peers & messages
function savePeers() {
  sessionStorage.setItem("mc_peers", JSON.stringify(S.peers));
}

// Load peers & messages
function loadPeers() {
  const peers = JSON.parse(sessionStorage.getItem("mc_peers"));
  S.peers = peers;
}
```

---

## 📡 API Reference

### State Object (`S`)

```typescript
const S = {
  id: {
    userId: string,
    pubEd: string, // Ed25519 public key (base64)
    privEd: string, // Ed25519 private key (base64)
    pubX: string, // X25519 public key (base64)
    privX: string, // X25519 private key (base64)
  },
  peers: {
    [peerId]: {
      name: string,
      pubEd: string, // Peer's Ed25519 public key
      pubX: string, // Peer's X25519 public key
      messages: Array, // [{ type, text, mine, encrypted, ts, read }]
      online: boolean,
      transport: string, // 'bluetooth' | 'qr' | 'manual' | 'broadcast'
      peerId: string,
    },
  },
  active: string | null, // Currently selected peer ID
  btDevice: BluetoothDevice,
  btChar: BluetoothRemoteGATTCharacteristic, // TX characteristic
  bc: BroadcastChannel, // For tab-to-tab communication
};
```

### Core Functions

#### Identity

```typescript
// Generate a new identity
async function doGenId(): Promise<void>;

// Render identity to UI
function renderId(): void;

// Save/load from sessionStorage
function saveId(): void;
function loadId(): void;
```

#### Peers

```typescript
// Add a new peer
function addPeer(
  name: string,
  pubEd: string,
  pubX: string,
  transport?: string,
  online?: boolean,
): string; // returns peerId

// Render peer list
function renderPeers(): void;

// Select peer for chat
function selectPeer(peerId: string): void;

// Remove peer
function doRemovePeer(): void;

// Show peer info modal
function showPeerInfo(): void;
```

#### Messages

```typescript
// Add system message
function sysMsg(peerId: string, text: string): void;

// Add user message
function addMsg(
  peerId: string,
  text: string,
  mine: boolean,
  encrypted: boolean,
): void;

// Render chat messages
function renderMsgs(peerId: string): void;

// Send message (encrypts & transmits)
async function sendMsg(): Promise<void>;
```

#### Bluetooth

```typescript
// Start scanning for devices
async function startBTScan(): Promise<void>;

// Stop scanning
function stopBTScan(): void;

// Connect to Bluetooth device
async function connectBT(device: BluetoothDevice): Promise<void>;

// Handle Bluetooth message
function onBTMsg(event: Event): void;

// Handle disconnect
function onBTDisc(): void;
```

#### BroadcastChannel

```typescript
// Initialize tab-to-tab communication
function initBC(): void;

// Broadcast presence to other tabs
function broadcastPresence(): void;
```

#### UI

```typescript
// Show chat or welcome panel
function showPanel(panelId: string): void;

// Open modal
function openModal(modalId: string): void;

// Close modal
function closeModal(modalId: string): void;

// Show toast notification
function toast(message: string, type?: "ok" | "er" | "in"): void;

// Copy element text to clipboard
function copyEl(elementId: string): void;
```

---

## 🔍 Data Flow Diagram

```
USER ↓
  │
  ├─→ Generate Identity
  │   └─ genIdentity() → pubEd, privEd, pubX, privX
  │   └─ saveId() → sessionStorage
  │
  ├─→ Add Peer (Method A: QR)
  │   ├─ Share QR: S.id → JSON → Canvas QR
  │   └─ Import QR: JSON → pubEd, pubX → addPeer()
  │
  ├─→ Send Message
  │   ├─ sendMsg() reads textarea
  │   ├─ encryptMsg(text, peerPubX, myPrivX)
  │   │  └─ ECDH(myPrivX, peerPubX) → shared key
  │   │  └─ AES-256-GCM encrypt → { cipher, iv }
  │   ├─ If BT: Write to TX characteristic
  │   ├─ If BC: S.bc.postMessage({ type: 'message', ... })
  │   └─ addMsg(peerId, text, true, true) → savePeers()
  │
  ├─→ Receive Message
  │   ├─ onBTMsg(event) or S.bc.onmessage
  │   ├─ recvPayload(peer, payload, wasEncrypted)
  │   ├─ decryptMsg(payload, peerPubX, myPrivX)
  │   └─ addMsg(peerId, text, false, true) → renderMsgs()
  │
  └─→ Render Chat
      ├─ renderMsgs(activeId) → .msgs container
      ├─ For each message: create .mg div
      └─ Display timestamp + encryption badge
```

---

## 🧪 Testing

### Run Crypto Tests

```bash
npm run test -w=crypto-module
# Tests: encryption, decryption, key generation
```

### Run P2P Tests

```bash
npm run test -w=p2p-networking
# Tests: Bluetooth discovery, message exchange
```

### Manual Testing (PWA Client)

**Test Case 1: Local Two-Tab Setup**

1. Open app in Tab 1 → Generate Identity A
2. Open app in Tab 2 → Generate Identity B
3. Both tabs should auto-discover (BroadcastChannel)
4. Send message from Tab 1 → Should appear in Tab 2
5. Verify encryption active (🔐 badge)

**Test Case 2: Bluetooth Simulation**

1. Click "⟁ BT Scan"
2. If Web Bluetooth unavailable → Shows 3 simulated devices
3. Click "Connect" on any device
4. Verify connection toast + peer added to sidebar

**Test Case 3: Manual Key Exchange**

1. Tab 1 → Click "⚙ My Keys" → Copy Ed25519 public key
2. Tab 2 → Click "+ Add" → Paste key
3. Both send/receive messages
4. Verify encryption badge

---

## 🐛 Troubleshooting

### Issue: "Message not displayed on receiver side"

**Symptoms**: Both peers online, message sent, but not received.

**Debug Steps**:

```javascript
// 1. Check console logs
F12 → Console → Look for "Received payload" or "Decrypt failed"

// 2. Verify peer keys
S.peers[activeId].pubEd  // Should be 44+ chars
S.peers[activeId].pubX   // Should be 44+ chars

// 3. Check if message added to state
S.peers[activeId].messages  // Should contain message object

// 4. Check renderMsgs is called
// Add log in renderMsgs() function
console.log('Rendering', S.peers[pid].messages);
```

**Common Causes**:

| Cause                   | Fix                                                   |
| ----------------------- | ----------------------------------------------------- |
| Keys not exchanged      | Ensure pubEd/pubX set via QR or import                |
| Transport disconnected  | For BT: check device still connected                  |
| Decryption error        | Verify peer's public key matches sender's private key |
| renderMsgs() not called | Check if S.active === peerId                          |
| Message in wrong peer   | Check peerId passed to addMsg()                       |

### Issue: Bluetooth not working

**Symptoms**: "Web Bluetooth not available" or connection fails.

**Requirements**:

- Chrome 90+ (stable)
- Physical Bluetooth device
- GATT server advertising UUIDs: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
- Permissions granted in browser

**Fix**:

```bash
# For Chrome Android
1. Go to chrome://flags
2. Search "Web Bluetooth"
3. Enable "Experimental Web Platform features"
4. Restart Chrome

# For macOS/Windows
1. Enable Bluetooth via System Preferences
2. Pair devices first (may help)
3. Click "⟁ BT Scan" in MeshComm
```

### Issue: Keys not persisting across refresh

**Expected**: SessionStorage cleared on browser close (by design).

**If needed: Use IndexedDB**:

```typescript
// Future enhancement
const db = await indexedDB.open("meshcomm", 1);
const store = db.createObjectStore("identity");
await store.put(S.id, "current");
```

### Issue: QR code not displaying

**Symptoms**: Canvas shows "Public Key Fingerprint" text instead of QR.

**Cause**: QRious library not loaded (CDN down).

**Fix**: QR fallback automatically creates fingerprint grid. For real QR:

1. Check CDN availability: `cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js`
2. Or host QRious locally

---

## 🔐 Security Notes

### Cryptographic Strength

| Component     | Algorithm                | Key Size | Standard   |
| ------------- | ------------------------ | -------- | ---------- |
| Identity      | Ed25519                  | 256 bits | RFC 8032   |
| Key Agreement | X25519 ECDH              | 256 bits | RFC 7748   |
| Encryption    | AES-256-GCM              | 256 bits | NIST       |
| Fingerprint   | SHA-256                  | 256 bits | FIPS 180-4 |
| Random IV     | Cryptographically Secure | 96 bits  | WebCrypto  |

### Threat Model

#### What MeshComm Protects Against

✅ **Eavesdropping**: All messages encrypted end-to-end  
✅ **Man-in-the-Middle**: Keys shared via QR (out-of-band verification)  
✅ **Replay Attacks**: Fresh IV (nonce) per message  
✅ **Forgery**: Ed25519 signing (future: message signing)

#### What MeshComm Does NOT Protect Against

❌ **Metadata**: Transport knows peer is online, not message content  
❌ **Device Compromise**: If browser/OS compromised, keys exposed  
❌ **Timing Attacks**: No constant-time operations implemented  
❌ **Key Deletion**: SessionStorage may be recoverable via memory dump

### Best Practices

- ✅ **Never share private keys** (Ed25519 or X25519)
- ✅ **Verify peer's public key** out-of-band before first message
- ✅ **Set strong device lock** (PIN/biometric)
- ✅ **Keep browser updated** (security patches)
- ✅ **Close tabs** after use (clears sessionStorage)
- ❌ **Don't** use on shared devices without clearing storage
- ❌ **Don't** share QR code publicly (contains public key)

### Future Security Enhancements

- [ ] Forward Secrecy (double ratchet / Signal protocol)
- [ ] Message Signing (via Ed25519)
- [ ] Key Fingerprint Verification UI
- [ ] Persistent Encryption Keys (IndexedDB with encryption)
- [ ] Trusted Device Pairing

---

## 📦 Deployment

### Deploy to GitHub Pages

```bash
cd apps/pwa-client
npm run build

# Manually push dist/ to gh-pages branch
# Or use workflow:
git checkout -b gh-pages
git add dist/
git commit -m "Deploy: v1.0"
git push origin gh-pages
```

### Deploy to Vercel

```bash
npm install -g vercel
cd apps/pwa-client
vercel
# Follow prompts, selects dist/ automatically
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
cd apps/pwa-client
netlify deploy --prod --dir=dist
```

### PWA Installation

Once deployed:

1. **Desktop (Chrome/Edge)**:
   - Click install icon in address bar
   - Or: Menu → "Install MeshComm"

2. **Mobile (Android)**:
   - Open in Chrome → Menu → "Install app"
   - Appears on home screen

3. **iOS**:
   - Safari → Share → "Add to Home Screen"
   - Limited Web Bluetooth support

---

## 🤝 Contributing

###Issues & Feature Requests

Found a bug? Have an idea?

1. Check existing issues
2. Open new issue with:
   - **Title**: Clear, one-line description
   - **Description**: Steps to reproduce + expected vs actual
   - **Environment**: Browser, OS, device type

### Pull Requests

1. Fork repository
2. Create feature branch: `git checkout -b feat/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feat/amazing-feature`
5. Open Pull Request

#### Code Style

- Use TypeScript (type safety)
- Follow ESLint rules (run `npm run lint`)
- Add JSDoc comments for public functions
- Test new features

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) file.

---

## 🙏 Acknowledgments

- **WebCrypto API**: Modern browser cryptography (zero dependencies)
- **Web Bluetooth API**: Peer discovery & communication
- **BroadcastChannel API**: Tab-to-tab messaging
- **Vite**: Lightning-fast build tool

---

## 📚 Further Reading

- [WebCrypto Standard](https://www.w3.org/TR/WebCryptoAPI/)
- [Ed25519 (RFC 8032)](https://tools.ietf.org/html/rfc8032)
- [X25519 (RFC 7748)](https://tools.ietf.org/html/rfc7748)
- [AES-GCM](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf)
- [Web Bluetooth Specification](https://webbluetoothcg.github.io/web-bluetooth/)

---

## 🗺️ Roadmap

### v1.0 (Current)

- [x] Core encryption (Ed25519, X25519, AES-256-GCM)
- [x] Bluetooth peer discovery
- [x] QR code key exchange
- [x] Manual key paste
- [x] Same-browser tab communication
- [x] Message history (session)

### v1.1 (Planned)

- [ ] Message signatures (Ed25519)
- [ ] Persistent storage (IndexedDB)
- [ ] Desktop app (Electron)
- [ ] Mobile app (React Native)

### v2.0 (Future)

- [ ] Group messaging
- [ ] Forward secrecy (double ratchet)
- [ ] File transfer
- [ ] Voice/video (WebRTC)
- [ ] Decentralized address book

---

## ❓ FAQ

**Q: Is my data ever sent to a server?**  
A: No. All communication is peer-to-peer. No servers involved.

**Q: Can I use MeshComm offline?**  
A: Yes, completely offline (after loading the app once).

**Q: Are my messages saved?**  
A: Only in sessionStorage (cleared on browser close). Future: optional persistent storage.

**Q: Can I decrypt messages after closing the browser?**  
A: No, keys are cleared from sessionStorage. You must regenerate identity and re-exchange keys.

**Q: Why no user accounts?**  
A: By design. No accounts = no server = no tracking. Trade-off: you manage your own identity.

**Q: What if I lose my private key?**  
A: Generate a new identity. Old peers won't recognize you. Exchange keys again.

**Q: Is it safe to use on public WiFi?**  
A: Yes. Messages are encrypted before leaving your device.

---

**Last Updated**: 8 March 2026  
**Version**: 1.0.0  
**Status**: Stable (Beta)

---

🎉 **Happy Encrypting!** 🎉

For questions or issues, open a GitHub Issue or contact the maintainers.
