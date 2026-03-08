import sodium from "libsodium-wrappers-sumo";

export async function fingerprint(publicKeyBase64: string): Promise<string> {
  await sodium.ready;
  const pubKey = sodium.from_base64(publicKeyBase64);
  return sodium.to_hex(sodium.crypto_generichash(8, pubKey)); // short 8-byte fingerprint
}
