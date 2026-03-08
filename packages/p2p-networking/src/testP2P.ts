// packages/p2p-networking/src/testP2P.ts
import { generateIdentity } from "../../crypto-module/src/identity/generateIdentity";
import { encryptMessage } from "../../crypto-module/src/encryption/encryptMessage";

import { decryptMessage } from "../../crypto-module/src/encryption/decryptMessage";
import { convertEd25519ToCurve25519 } from "../../crypto-module/src/utils/keyConversion";
import {
  exportIdentityToQR,
  importIdentityFromQR,
} from "../../crypto-module/src/identity/qrExport";

// Simulated Bluetooth functions
import { discoverPeers } from "./bluetooth/discoverPeers";
import { sendMessage as bluetoothSend } from "./bluetooth/sendMessage";
import { receiveMessage as bluetoothReceive } from "./bluetooth/receiveMessage";

async function testMessaging() {
  // 1️⃣ Generate identities
  const alice = await generateIdentity();
  const bob = await generateIdentity();

  console.log("Alice Identity:", alice);
  console.log("Bob Identity:", bob);

  // 2️⃣ Simulate QR exchange
  const bobQR = await exportIdentityToQR(bob);
  const bobPublicFromQR = (await importIdentityFromQR(bobQR)).publicKey;

  const aliceQR = await exportIdentityToQR(alice);
  const alicePublicFromQR = (await importIdentityFromQR(aliceQR)).publicKey;

  // 3️⃣ Convert keys to Curve25519
  const alicePrivCurve = await convertEd25519ToCurve25519(
    alice.privateKey,
    "private",
  );
  const bobPubCurve = await convertEd25519ToCurve25519(
    bobPublicFromQR,
    "public",
  );

  const message = "Hello Bob! Are you online?";

  // 4️⃣ Encrypt message
  const encryptedPayload = await encryptMessage(
    message,
    bobPubCurve,
    alicePrivCurve,
  );
  console.log("Encrypted message:", encryptedPayload);

  // 5️⃣ Discover peers (simulated)
  const peers = await discoverPeers();
  console.log("Discovered peers:", peers);

  // 6️⃣ Send message via simulated Bluetooth
  const sentPayload = await bluetoothSend("Alice", "Bob", encryptedPayload);

  // 7️⃣ Bob prepares keys for decryption
  const bobPrivCurve = await convertEd25519ToCurve25519(
    bob.privateKey,
    "private",
  );
  const alicePubCurve = await convertEd25519ToCurve25519(
    alicePublicFromQR,
    "public",
  );

  // 8️⃣ Receive and decrypt message
  const decrypted = await bluetoothReceive(
    "Bob",
    "Alice",
    sentPayload,
    bobPrivCurve,
    alicePubCurve,
  );
  console.log("Decrypted message:", decrypted);
}

// Run the test
testMessaging();
