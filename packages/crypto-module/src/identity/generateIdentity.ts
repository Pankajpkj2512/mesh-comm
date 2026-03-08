import sodium from "libsodium-wrappers-sumo";

export type UserIdentity = {
  userId: string;
  publicKey: string;
  privateKey: string;
};

export async function generateIdentity(): Promise<UserIdentity> {
  await sodium.ready;

  const keyPair = sodium.crypto_sign_keypair();

  const userId = sodium.to_base64(
    sodium.crypto_generichash(16, keyPair.publicKey),
    sodium.base64_variants.ORIGINAL, // ✅ Use ORIGINAL, not URL
  );

  return {
    userId,
    publicKey: sodium.to_base64(
      keyPair.publicKey,
      sodium.base64_variants.ORIGINAL,
    ), // ✅ standard Base64
    privateKey: sodium.to_base64(
      keyPair.privateKey,
      sodium.base64_variants.ORIGINAL,
    ), // ✅ standard Base64
  };
}
