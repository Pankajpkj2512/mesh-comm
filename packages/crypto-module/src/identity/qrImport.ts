export type ImportedContact = {
  userId: string;
  publicKey: string;
};

export function importContactFromQR(qrData: string): ImportedContact {
  const obj = JSON.parse(qrData);
  if (!obj.userId || !obj.publicKey) throw new Error("Invalid contact QR");
  return { userId: obj.userId, publicKey: obj.publicKey };
}
