const PASS_STYLE_TO_SECTION_KEY = {
  storeCard: 'storeCard',
  coupon: 'coupon',
  eventTicket: 'eventTicket',
  generic: 'generic',
  boardingPass: 'boardingPass',
};

function parseJson(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function normalizeField(field, index) {
  return {
    key: field.key || `field_${index + 1}`,
    label: field.label || 'Feld',
    value: field.value ?? '',
    textAlignment: field.textAlignment || 'PKTextAlignmentLeft',
    changeMessage: field.changeMessage || null,
  };
}

export function buildPassJson(payload) {
  const settings = payload.settings || {};
  const passStyle = payload.passType || 'storeCard';
  const sectionKey = PASS_STYLE_TO_SECTION_KEY[passStyle] || 'generic';

  const primaryFields = parseJson(payload.primaryFields, []).map(normalizeField);
  const secondaryFields = parseJson(payload.secondaryFields, []).map(normalizeField);
  const auxiliaryFields = parseJson(payload.auxiliaryFields, []).map(normalizeField);
  const backFields = parseJson(payload.backFields, []).map(normalizeField);
  const locations = parseJson(payload.locations, []);
  const beacons = parseJson(payload.beacons, []);

  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: settings.passTypeIdentifier || 'pass.el.promillo',
    serialNumber: payload.serialNumber || payload.customerNumber,
    teamIdentifier: settings.teamIdentifier || 'ABCDE12345',
    organizationName: settings.organizationName || 'Egli+Vitali AG',
    description: settings.description || 'Digitale Kundenkarte',
    logoText: settings.logoText || 'EL Passkit',
    foregroundColor: hexToRgb(payload.foregroundColor),
    backgroundColor: hexToRgb(payload.backgroundColor),
    labelColor: hexToRgb(payload.labelColor),
    suppressStripShine: Boolean(payload.suppressStripShine),
    sharingProhibited: Boolean(payload.sharingProhibited),
    barcodes: [
      {
        format: payload.barcodeFormat || 'PKBarcodeFormatQR',
        message: payload.barcodeMessage || payload.customerNumber || payload.serialNumber || 'EL-PASS',
        messageEncoding: payload.barcodeEncoding || 'iso-8859-1',
        altText: payload.barcodeAltText || null,
      },
    ],
    [sectionKey]: {
      primaryFields,
      secondaryFields,
      auxiliaryFields,
      backFields,
    },
  };

  if (payload.relevantDate) passJson.relevantDate = payload.relevantDate;
  if (payload.expirationDate) passJson.expirationDate = payload.expirationDate;
  if (payload.authenticationToken) passJson.authenticationToken = payload.authenticationToken;
  if (payload.webServiceUrl) passJson.webServiceURL = payload.webServiceUrl;
  if (Array.isArray(locations) && locations.length) passJson.locations = locations;
  if (Array.isArray(beacons) && beacons.length) passJson.beacons = beacons;

  return passJson;
}

function hexToRgb(hex) {
  if (!hex) return 'rgb(255,255,255)';
  const clean = hex.replace('#', '');
  const bigint = Number.parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgb(${r},${g},${b})`;
}
