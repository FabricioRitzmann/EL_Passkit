import {
  addCustomer,
  addTemplate,
  bookPoints,
  getAllData,
  getDashboardStats,
  issuePass,
  upsertPasskitSettings,
} from './api.js';
import {
  fillDashboard,
  readPasskitSettingsFromForm,
  readTemplateDesignerValues,
  renderCustomerOptions,
  renderCustomers,
  renderPassList,
  renderPasskitSettings,
  renderTemplateOptions,
  showPassJson,
  updatePreview,
} from './ui.js';

const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const DEFAULT_PASSKIT_SETTINGS = {
  passTypeIdentifier: 'pass.el.promillo',
  teamIdentifier: 'ABCDE12345',
  organizationName: 'Egli+Vitali AG',
  logoText: 'EL Passkit',
  description: 'Digitale Kundenkarte',
  contactEmail: 'info@example.com',
};
let currentData = { customers: [], templates: [], passes: [], transactions: [], passkitSettings: null };

function setupNavigation() {
  navItems.forEach((button) => {
    button.addEventListener('click', () => {
      navItems.forEach((item) => item.classList.remove('active'));
      views.forEach((view) => view.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(button.dataset.view).classList.add('active');
    });
  });
}

function readForm(formId) {
  const form = document.getElementById(formId);
  return Object.fromEntries(new FormData(form));
}

function getSelectedPreviewContext() {
  const selectedTemplateId = document.getElementById('templatePreviewSelect').value || currentData.templates[0]?.id;
  const selectedCustomerId = document.getElementById('issueCustomerId').value || currentData.customers[0]?.id;
  const template = currentData.templates.find((entry) => entry.id === selectedTemplateId) || currentData.templates[0];
  const customer = currentData.customers.find((entry) => entry.id === selectedCustomerId) || currentData.customers[0];
  const pass = currentData.passes.find((entry) => entry.templateId === template?.id && entry.customerId === customer?.id) || null;
  return { template, customer, pass };
}

async function refreshUi() {
  currentData = await getAllData();

  fillDashboard(getDashboardStats(currentData));
  renderCustomers(currentData.customers);
  renderTemplateOptions(currentData.templates);
  renderCustomerOptions(currentData.customers);
  renderPasskitSettings(currentData.passkitSettings || DEFAULT_PASSKIT_SETTINGS);
  renderPassList(currentData.passes, currentData.customers, currentData.templates);

  const { template, customer, pass } = getSelectedPreviewContext();
  updatePreview(template, customer, pass);
}

async function handleAction(handler) {
  try {
    await handler();
  } catch (error) {
    console.error(error);
    const message = error?.message || 'Unbekannter Fehler';
    alert(`Aktion fehlgeschlagen: ${message}`);
  }
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function setupForms() {
  document.getElementById('customerForm').addEventListener('submit', (event) => {
    event.preventDefault();
    handleAction(async () => {
      await addCustomer(readForm('customerForm'));
      event.target.reset();
      await refreshUi();
    });
  });

  document.getElementById('templateForm').addEventListener('submit', (event) => {
    event.preventDefault();
    handleAction(async () => {
      await addTemplate(readTemplateDesignerValues());
      event.target.reset();
      await refreshUi();
    });
  });

  document.getElementById('issueForm').addEventListener('submit', (event) => {
    event.preventDefault();
    handleAction(async () => {
      const payload = readForm('issueForm');
      const settings = readPasskitSettingsFromForm() || DEFAULT_PASSKIT_SETTINGS;
      await issuePass({ ...payload, passTypeIdentifier: settings.passTypeIdentifier });
      event.target.reset();
      await refreshUi();
    });
  });

  document.getElementById('passkitSettingsForm').addEventListener('submit', (event) => {
    event.preventDefault();
    handleAction(async () => {
      await upsertPasskitSettings(readPasskitSettingsFromForm());
      await refreshUi();
      alert('Passkit-Parameter gespeichert.');
    });
  });

  document.getElementById('customersTableBody').addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;

    const action = target.dataset.action;
    const customerId = target.dataset.id;
    if (!action || !customerId) return;

    handleAction(async () => {
      const amount = action === 'plus' ? 10 : -10;
      await bookPoints(customerId, amount, `Manuelle Buchung (${amount > 0 ? '+' : ''}${amount})`);
      await refreshUi();
    });
  });

  document.getElementById('templatePreviewSelect').addEventListener('change', () => {
    const { template, customer, pass } = getSelectedPreviewContext();
    updatePreview(template, customer, pass);
  });

  document.getElementById('issueCustomerId').addEventListener('change', () => {
    const { template, customer, pass } = getSelectedPreviewContext();
    updatePreview(template, customer, pass);
  });

  document.getElementById('exportJson').addEventListener('click', () => {
    const { template, customer, pass } = getSelectedPreviewContext();
    showPassJson(template, customer, pass);
  });

  document.getElementById('downloadTemplateJson').addEventListener('click', () => {
    handleAction(async () => {
      const payload = readTemplateDesignerValues();
      downloadTextFile(`template-${payload.name || 'designer'}.json`, JSON.stringify(payload, null, 2));
    });
  });

  document.getElementById('closeJson').addEventListener('click', () => {
    document.getElementById('jsonDialog').close();
  });
}

setupNavigation();
setupForms();
handleAction(refreshUi);
