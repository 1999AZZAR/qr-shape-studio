import QRCode from "qrcode";
import type { ErrorCorrection } from "./types";

export function encodeQRCode(data: string, errorCorrection: ErrorCorrection): boolean[][] {
  const qr = QRCode.create(data, {
    errorCorrectionLevel: errorCorrection,
  });

  const count = qr.modules.size;

  return Array.from({ length: count }, (_, row) =>
    Array.from({ length: count }, (_, column) => Boolean(qr.modules.get(row, column))),
  );
}
