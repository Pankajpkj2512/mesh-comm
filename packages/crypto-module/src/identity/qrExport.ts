import QRCode from "qrcode";
import { UserIdentity } from "./generateIdentity";

export async function exportIdentityToQR(
  identity: UserIdentity,
): Promise<string> {
  const publicData = { userId: identity.userId, publicKey: identity.publicKey };
  return JSON.stringify(publicData); // simplified for testing
}

export async function importIdentityFromQR(
  qrData: string,
): Promise<{ userId: string; publicKey: string }> {
  const parsed = JSON.parse(qrData);
  if (!parsed.userId || !parsed.publicKey) throw new Error("Invalid QR data");
  return parsed;
}
