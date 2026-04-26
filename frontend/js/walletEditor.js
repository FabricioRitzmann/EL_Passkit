export function buildPassJson(formData) {
  return {
    formatVersion: 1,
    passTypeIdentifier: "pass.ch.eglivitali.customer",
    serialNumber: formData.customerNumber,
    teamIdentifier: "ABCDE12345",
    organizationName: "Egli+Vitali AG",
    description: "Digitale Kundenkarte",
    logoText: "Egli+Vitali AG",
    foregroundColor: hexToRgb(formData.foregroundColor),
    backgroundColor: hexToRgb(formData.backgroundColor),
    labelColor: hexToRgb(formData.labelColor),
    [formData.passType]: {
      primaryFields: [{ key: "name", label: "Kunde", value: formData.customerName }],
      secondaryFields: [{ key: "points", label: "Punkte", value: String(formData.points) }],
      auxiliaryFields: [{ key: "status", label: "Status", value: formData.status }],
      backFields: [{ key: "contact", label: "Kontakt", value: "info@eglivitali.ch" }],
    },
    barcodes: [
      {
        format: formData.barcodeFormat,
        message: formData.customerNumber,
        messageEncoding: "iso-8859-1",
      },
    ],
  };
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = Number.parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgb(${r},${g},${b})`;
}
