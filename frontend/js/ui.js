import { buildPassJson } from './walletEditor.js';
import { renderPassPreview } from './previewRenderer.js';

export function fillDashboard(stats) {
  document.getElementById('activeCards').textContent = String(stats.activeCards);
  document.getElementById('lastDownloads').textContent = String(stats.totalDownloads);
  document.getElementById('expiringSoon').textContent = String(stats.expiringSoon);
  document.getElementById('customerCount').textContent = String(stats.customerCount);
}

export function renderCustomers(customers) {
  const body = document.getElementById('customersTableBody');
  body.innerHTML = '';

  customers.forEach((customer) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${customer.customerNumber}</td>
      <td>${customer.firstName} ${customer.lastName}</td>
      <td>${customer.email || '-'}</td>
      <td>${customer.points}</td>
      <td>${customer.status}</td>
      <td>
        <button data-action="plus" data-id="${customer.id}" class="table-btn">+10</button>
        <button data-action="minus" data-id="${customer.id}" class="table-btn">-10</button>
      </td>
    `;
    body.appendChild(row);
  });
}

export function renderTemplateOptions(templates) {
  const templateSelect = document.getElementById('issueTemplateId');
  const editorSelect = document.getElementById('templatePreviewSelect');
  templateSelect.innerHTML = '';
  editorSelect.innerHTML = '';

  templates.forEach((template) => {
    templateSelect.add(new Option(template.name, template.id));
    editorSelect.add(new Option(template.name, template.id));
  });
}

export function renderCustomerOptions(customers) {
  const customerSelect = document.getElementById('issueCustomerId');
  customerSelect.innerHTML = '';

  customers.forEach((customer) => {
    customerSelect.add(new Option(`${customer.customerNumber} - ${customer.firstName} ${customer.lastName}`, customer.id));
  });
}

export function updatePreview(template, customer, pass) {
  renderPassPreview({ template, customer, pass });
}

function parseFieldText(value, label) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    throw new Error(`${label} enthält kein gültiges JSON-Array.`);
  }
}

export function readTemplateDesignerValues() {
  const form = document.getElementById('templateForm');
  return {
    ...Object.fromEntries(new FormData(form)),
    primaryFields: parseFieldText(form.elements.primaryFields.value, 'Primary Fields'),
    secondaryFields: parseFieldText(form.elements.secondaryFields.value, 'Secondary Fields'),
    auxiliaryFields: parseFieldText(form.elements.auxiliaryFields.value, 'Auxiliary Fields'),
    backFields: parseFieldText(form.elements.backFields.value, 'Back Fields'),
    locations: parseFieldText(form.elements.locations.value, 'Locations'),
    beacons: parseFieldText(form.elements.beacons.value, 'Beacons'),
  };
}

export function showPassJson(template, customer, pass = null) {
  const settings = readPasskitSettingsFromForm();
  const json = buildPassJson({
    passType: template.passType,
    customerName: `${customer.firstName} ${customer.lastName}`,
    customerNumber: customer.customerNumber,
    serialNumber: pass?.serialNumber || customer.customerNumber,
    points: customer.points,
    status: customer.status,
    foregroundColor: template.foregroundColor,
    backgroundColor: template.backgroundColor,
    labelColor: template.labelColor,
    barcodeFormat: template.barcodeFormat,
    barcodeMessage: template.barcodeMessage,
    logoText: template.logoText,
    suppressStripShine: template.suppressStripShine,
    sharingProhibited: template.sharingProhibited,
    primaryFields: JSON.stringify(template.primaryFields || []),
    secondaryFields: JSON.stringify(template.secondaryFields || []),
    auxiliaryFields: JSON.stringify(template.auxiliaryFields || []),
    backFields: JSON.stringify(template.backFields || []),
    locations: JSON.stringify(template.locations || []),
    beacons: JSON.stringify(template.beacons || []),
    settings,
  });

  document.getElementById('jsonOutput').textContent = JSON.stringify(json, null, 2);
  document.getElementById('jsonDialog').showModal();
}

export function renderPasskitSettings(settings) {
  if (!settings) return;

  const form = document.getElementById('passkitSettingsForm');
  if (!form) return;

  form.elements.passTypeIdentifier.value = settings.passTypeIdentifier;
  form.elements.teamIdentifier.value = settings.teamIdentifier;
  form.elements.organizationName.value = settings.organizationName;
  form.elements.logoText.value = settings.logoText;
  form.elements.description.value = settings.description;
  form.elements.contactEmail.value = settings.contactEmail;
}

export function readPasskitSettingsFromForm() {
  const form = document.getElementById('passkitSettingsForm');
  if (!form) return null;

  return {
    passTypeIdentifier: form.elements.passTypeIdentifier.value,
    teamIdentifier: form.elements.teamIdentifier.value,
    organizationName: form.elements.organizationName.value,
    logoText: form.elements.logoText.value,
    description: form.elements.description.value,
    contactEmail: form.elements.contactEmail.value,
  };
}

export function renderPassList(passes, customers, templates) {
  const body = document.getElementById('passesTableBody');
  body.innerHTML = '';

  passes.forEach((pass) => {
    const customer = customers.find((entry) => entry.id === pass.customerId);
    const template = templates.find((entry) => entry.id === pass.templateId);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${pass.serialNumber}</td>
      <td>${customer ? `${customer.firstName} ${customer.lastName}` : '-'}</td>
      <td>${template?.name || '-'}</td>
      <td>${pass.status}</td>
      <td>${pass.expiresAt ? new Date(pass.expiresAt).toLocaleDateString('de-CH') : '-'}</td>
    `;
    body.appendChild(row);
  });
}
