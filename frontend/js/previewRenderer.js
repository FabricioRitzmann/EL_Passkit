function joinFieldValues(fields = []) {
  if (!Array.isArray(fields) || !fields.length) return '-';
  return fields
    .map((field) => `${field.label}: ${field.value}`)
    .join(' · ');
}

export function renderPassPreview({ template, customer, pass }) {
  if (!template || !customer) return;

  const passPreview = document.getElementById('passPreview');
  passPreview.style.background = template.backgroundColor;
  passPreview.style.color = template.foregroundColor;
  passPreview.style.borderColor = template.labelColor;

  document.getElementById('previewLogoText').textContent = template.logoText || 'EL Passkit';
  document.getElementById('previewName').textContent = `${customer.firstName} ${customer.lastName}`;
  document.getElementById('previewCustomerNumber').textContent = customer.customerNumber;
  document.getElementById('previewPoints').textContent = String(customer.points ?? 0);
  document.getElementById('previewStatus').textContent = customer.status || 'Basic';
  document.getElementById('previewTemplateType').textContent = template.passType || 'storeCard';
  document.getElementById('previewPrimaryFields').textContent = joinFieldValues(template.primaryFields);
  document.getElementById('previewSecondaryFields').textContent = joinFieldValues(template.secondaryFields);
  document.getElementById('previewAuxFields').textContent = joinFieldValues(template.auxiliaryFields);

  const barcodeValue = pass?.serialNumber || template.barcodeMessage || customer.customerNumber;
  document.getElementById('previewBarcode').textContent = barcodeValue;
}
