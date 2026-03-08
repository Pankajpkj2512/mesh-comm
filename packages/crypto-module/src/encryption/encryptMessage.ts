import sodium from "libsodium-wrappers-sumo";

export async function encryptMessage(
  message: string,
  recipientPub: Uint8Array,
  senderPriv: Uint8Array,
) {
  await sodium.ready;
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  const cipher = sodium.crypto_box_easy(
    message,
    nonce,
    recipientPub,
    senderPriv,
  );
  return {
    cipher: sodium.to_base64(cipher, sodium.base64_variants.ORIGINAL),
    nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL),
  };
}
