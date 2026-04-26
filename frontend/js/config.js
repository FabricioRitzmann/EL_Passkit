export const STORAGE_KEY = "el_passkit_data_v1";

export const DEFAULT_TEMPLATE = {
  id: crypto.randomUUID(),
  name: "Standard Gold",
  passType: "storeCard",
  backgroundColor: "#1e1e1e",
  foregroundColor: "#ffffff",
  labelColor: "#b4b4b4",
  barcodeFormat: "PKBarcodeFormatQR",
};

export const DEFAULT_DATA = {
  customers: [
    {
      id: crypto.randomUUID(),
      firstName: "Max",
      lastName: "Muster",
      email: "max@example.com",
      customerNumber: "EV-000123",
      points: 250,
      status: "Gold",
      createdAt: new Date().toISOString(),
    },
  ],
  templates: [DEFAULT_TEMPLATE],
  passes: [],
  transactions: [],
};
