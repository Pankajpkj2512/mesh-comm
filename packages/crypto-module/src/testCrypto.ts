import { generateIdentity } from "./identity/generateIdentity.js";
import { encryptMessage } from "./encryption/encryptMessage.js";
import { decryptMessage } from "./encryption/decryptMessage.js";

async function testMessaging() {
  const alice = await generateIdentity();
  const bob = await generateIdentity();

  const plaintext = "Hello Bob, this is Alice!";
  const encrypted = await encryptMessage(
    alice.privateKey,
    bob.publicKey,
    plaintext,
  );
  console.log("Encrypted:", encrypted);

  const decrypted = await decryptMessage(
    alice.publicKey,
    bob.privateKey,
    encrypted,
  );
  console.log("Decrypted:", decrypted);
}

testMessaging();
