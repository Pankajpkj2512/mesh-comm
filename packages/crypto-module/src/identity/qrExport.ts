import QRCode from "qrcode";
import { UserIdentity } from "./generateIdentity";

// BUG #7 FIX: Actually generate a QR data URL instead of returning plain JSON
// BUG #8 FIX: Removed duplicate qrImport.ts — importIdentityFromQR lives here only

export async function exportIdentityToQR(identity: UserIdentity): Promise<string> {
  const publicData = { userId: identity.userId, publicKey: identity.publicKey };
  // Generate a real base64 QR image data URL
  return await QRCode.toDataURL(JSON.stringify(publicData));
}

export async function importIdentityFromQR(
  qrData: string,
): Promise<{ userId: string; publicKey: string }> {
  const parsed = JSON.parse(qrData);
  if (!parsed.userId || !parsed.publicKey) throw new Error("Invalid QR data");
  return parsed;
}

// Kept for backward compatibility — points to importIdentityFromQR
export const importContactFromQR = importIdentityFromQR;
