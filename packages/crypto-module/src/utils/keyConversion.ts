import sodium from "libsodium-wrappers-sumo";

export async function convertEd25519ToCurve25519(
  edKey: string,
  type: "public" | "private",
) {
  await sodium.ready;

  if (!edKey) throw new Error("Ed25519 key is null or undefined");

  const keyBytes = sodium.from_base64(edKey, sodium.base64_variants.ORIGINAL);

  if (type === "public") {
    if (keyBytes.length !== 32) throw new Error("Public key must be 32 bytes");
    return sodium.crypto_sign_ed25519_pk_to_curve25519(keyBytes);
  } else {
    if (keyBytes.length !== 64) throw new Error("Private key must be 64 bytes");
    return sodium.crypto_sign_ed25519_sk_to_curve25519(keyBytes);
  }
}
