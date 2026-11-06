import QRCode from "qrcode";

export function ticketQr(token) {
  return QRCode.toDataURL(token, {
    width: 280,
    margin: 1,
    errorCorrectionLevel: "H",
  });
}