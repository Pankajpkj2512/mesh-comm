import sodium from "libsodium-wrappers-sumo";

export async function decryptMessage(
  encrypted: { cipher: string; nonce: string },
  recipientPriv: Uint8Array,
  senderPub: Uint8Array,
) {
  await sodium.ready;
  const cipher = sodium.from_base64(
    encrypted.cipher,
    sodium.base64_variants.ORIGINAL,
  );
  const nonce = sodium.from_base64(
    encrypted.nonce,
    sodium.base64_variants.ORIGINAL,
  );
  const decrypted = sodium.crypto_box_open_easy(
    cipher,
    nonce,
    senderPub,
    recipientPriv,
  );
  return new TextDecoder().decode(decrypted);
}
