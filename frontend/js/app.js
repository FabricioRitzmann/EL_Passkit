import {
  addCustomer,
  addTemplate,
  bookPoints,
  getAllData,
  getDashboardStats,
  issuePass,
  upsertPasskitSettings,
} from "./api.js";
import {
  fillDashboard,
  readPasskitSettingsFromForm,
  renderCustomerOptions,
  renderCustomers,
  renderPasskitSettings,
  renderTemplateOptions,
  showPassJson,
  updatePreview,
} from "./ui.js";

const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");
const DEFAULT_PASSKIT_SETTINGS = {
  passTypeIdentifier: "pass.el.promillo",
  teamIdentifier: "ABCDE12345",
  organizationName: "Egli+Vitali AG",
  logoText: "EL Passkit",
  description: "Digitale Kundenkarte",
  contactEmail: "info@example.com",
};
let currentData = { customers: [], templates: [], passes: [], transactions: [], passkitSettings: null };

function setupNavigation() {
  navItems.forEach((button) => {
    button.addEventListener("click", () => {
      navItems.forEach((item) => item.classList.remove("active"));
      views.forEach((view) => view.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(button.dataset.view).classList.add("active");
    });
  });
}

function readForm(formId) {
  const form = document.getElementById(formId);
  return Object.fromEntries(new FormData(form));
}

async function refreshUi() {
  currentData = await getAllData();

  fillDashboard(getDashboardStats(currentData));
  renderCustomers(currentData.customers);
  renderTemplateOptions(currentData.templates);
  renderCustomerOptions(currentData.customers);
  renderPasskitSettings(currentData.passkitSettings || DEFAULT_PASSKIT_SETTINGS);

  const selectedTemplateId = document.getElementById("templatePreviewSelect").value || currentData.templates[0]?.id;
  const previewTemplate =
    currentData.templates.find((template) => template.id === selectedTemplateId) || currentData.templates[0];
  const previewCustomer = currentData.customers[0];
  updatePreview(previewTemplate, previewCustomer);
}

async function handleAction(handler) {
  try {
    await handler();
  } catch (error) {
    console.error(error);
    const message = error?.message || "Unbekannter Fehler";
    alert(`Aktion fehlgeschlagen: ${message}`);
  }
}

function setupForms() {
  document.getElementById("customerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    handleAction(async () => {
      await addCustomer(readForm("customerForm"));
      event.target.reset();
      await refreshUi();
    });
  });

  document.getElementById("templateForm").addEventListener("submit", (event) => {
    event.preventDefault();
    handleAction(async () => {
      await addTemplate(readForm("templateForm"));
      event.target.reset();
      await refreshUi();
    });
  });

  document.getElementById("issueForm").addEventListener("submit", (event) => {
    event.preventDefault();
    handleAction(async () => {
      const payload = readForm("issueForm");
      const settings = readPasskitSettingsFromForm() || DEFAULT_PASSKIT_SETTINGS;
      await issuePass({ ...payload, passTypeIdentifier: settings.passTypeIdentifier });
      event.target.reset();
      await refreshUi();
    });
  });

  document.getElementById("passkitSettingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    handleAction(async () => {
      await upsertPasskitSettings(readPasskitSettingsFromForm());
      await refreshUi();
      alert("Passkit-Parameter gespeichert.");
    });
  });

  document.getElementById("customersTableBody").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;

    const action = target.dataset.action;
    const customerId = target.dataset.id;
    if (!action || !customerId) return;

    handleAction(async () => {
      const amount = action === "plus" ? 10 : -10;
      await bookPoints(customerId, amount, `Manuelle Buchung (${amount > 0 ? "+" : ""}${amount})`);
      await refreshUi();
    });
  });

  document.getElementById("templatePreviewSelect").addEventListener("change", () => {
    const templateId = document.getElementById("templatePreviewSelect").value;
    const template = currentData.templates.find((entry) => entry.id === templateId) || currentData.templates[0];
    updatePreview(template, currentData.customers[0]);
  });

  document.getElementById("exportJson").addEventListener("click", () => {
    const templateId = document.getElementById("templatePreviewSelect").value;
    const template = currentData.templates.find((entry) => entry.id === templateId) || currentData.templates[0];
    showPassJson(template, currentData.customers[0]);
  });

  document.getElementById("closeJson").addEventListener("click", () => {
    document.getElementById("jsonDialog").close();
  });
}

setupNavigation();
setupForms();
handleAction(refreshUi);
