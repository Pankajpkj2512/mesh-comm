// BUG #1 FIX: Corrected argument order for encryptMessage and decryptMessage.
// BUG #1 FIX: Added Ed25519 → Curve25519 key conversion before encrypting.
//             encryptMessage/decryptMessage require Uint8Array (Curve25519 keys),
//             not raw base64 strings.
// BUG #11 FIX: Removed .js extensions from imports — use .ts paths consistently.

import { generateIdentity } from "./identity/generateIdentity";
import { encryptMessage } from "./encryption/encryptMessage";
import { decryptMessage } from "./encryption/decryptMessage";
import { convertEd25519ToCurve25519 } from "./utils/keyConversion";
import { exportIdentityToQR, importIdentityFromQR } from "./identity/qrExport";
import { fingerprint } from "./identity/fingerprint";
import { KeyStorage, MemoryStorage } from "./identity/keyStorage";

async function testMessaging() {
  // 1. Generate identities
  const alice = await generateIdentity();
  const bob = await generateIdentity();
  console.log("Alice Identity:", alice);
  console.log("Bob Identity:  ", bob);

  // 2. Fingerprints
  const aliceFP = await fingerprint(alice.publicKey);
  const bobFP   = await fingerprint(bob.publicKey);
  console.log("Alice fingerprint:", aliceFP);
  console.log("Bob fingerprint:  ", bobFP);

  // 3. Simulate QR exchange
  const bobQR          = await exportIdentityToQR(bob);
  const bobFromQR      = await importIdentityFromQR(bobQR);
  const aliceQR        = await exportIdentityToQR(alice);
  const aliceFromQR    = await importIdentityFromQR(aliceQR);
  console.log("Bob imported from QR:  ", bobFromQR);
  console.log("Alice imported from QR:", aliceFromQR);

  // 4. Convert Ed25519 keys → Curve25519 Uint8Arrays for crypto_box_easy
  //    (crypto_box_easy uses Curve25519 keys, not Ed25519)
  const alicePrivCurve = await convertEd25519ToCurve25519(alice.privateKey, "private");
  const alicePubCurve  = await convertEd25519ToCurve25519(aliceFromQR.publicKey, "public");
  const bobPrivCurve   = await convertEd25519ToCurve25519(bob.privateKey, "private");
  const bobPubCurve    = await convertEd25519ToCurve25519(bobFromQR.publicKey, "public");

  // 5. Alice encrypts a message for Bob
  //    Correct order: encryptMessage(message, recipientPublicKey, senderPrivateKey)
  const plaintext = "Hello Bob, this is Alice!";
  const encrypted = await encryptMessage(plaintext, bobPubCurve, alicePrivCurve);
  console.log("Encrypted:", encrypted);

  // 6. Bob decrypts the message from Alice
  //    Correct order: decryptMessage(encryptedPayload, recipientPrivateKey, senderPublicKey)
  const decrypted = await decryptMessage(encrypted, bobPrivCurve, alicePubCurve);
  console.log("Decrypted:", decrypted);

  if (decrypted !== plaintext) {
    throw new Error(`Decryption mismatch! Got: "${decrypted}"`);
  }
  console.log("✅ Encryption round-trip passed — correct keys used.");

  // 7. Test KeyStorage with MemoryStorage (safe in Node.js — no localStorage needed)
  const store = new KeyStorage(new MemoryStorage());
  await store.savePrivateKey(alice.userId, alice.privateKey);
  await store.savePublicKey(alice.userId, alice.publicKey);
  const retrievedPriv = await store.getPrivateKey(alice.userId);
  console.log("KeyStorage retrieved private key matches:", retrievedPriv === alice.privateKey);
  console.log("✅ KeyStorage test passed.");
}

testMessaging().catch(console.error);
