import {
  addCustomer,
  addTemplate,
  bookPoints,
  getAllData,
  getDashboardStats,
  issuePass,
} from "./api.js";
import {
  fillDashboard,
  renderCustomerOptions,
  renderCustomers,
  renderTemplateOptions,
  showPassJson,
  updatePreview,
} from "./ui.js";

const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");

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

function refreshUi() {
  const data = getAllData();
  fillDashboard(getDashboardStats());
  renderCustomers(data.customers);
  renderTemplateOptions(data.templates);
  renderCustomerOptions(data.customers);

  const selectedTemplateId = document.getElementById("templatePreviewSelect").value || data.templates[0]?.id;
  const previewTemplate = data.templates.find((template) => template.id === selectedTemplateId) || data.templates[0];
  const previewCustomer = data.customers[0];
  updatePreview(previewTemplate, previewCustomer);
}

function setupForms() {
  document.getElementById("customerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    addCustomer(readForm("customerForm"));
    event.target.reset();
    refreshUi();
  });

  document.getElementById("templateForm").addEventListener("submit", (event) => {
    event.preventDefault();
    addTemplate(readForm("templateForm"));
    event.target.reset();
    refreshUi();
  });

  document.getElementById("issueForm").addEventListener("submit", (event) => {
    event.preventDefault();
    issuePass(readForm("issueForm"));
    event.target.reset();
    refreshUi();
  });

  document.getElementById("customersTableBody").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;

    const action = target.dataset.action;
    const customerId = target.dataset.id;
    if (!action || !customerId) return;

    const amount = action === "plus" ? 10 : -10;
    bookPoints(customerId, amount, `Manuelle Buchung (${amount > 0 ? "+" : ""}${amount})`);
    refreshUi();
  });

  document.getElementById("templatePreviewSelect").addEventListener("change", () => {
    const data = getAllData();
    const templateId = document.getElementById("templatePreviewSelect").value;
    const template = data.templates.find((entry) => entry.id === templateId) || data.templates[0];
    updatePreview(template, data.customers[0]);
  });

  document.getElementById("exportJson").addEventListener("click", () => {
    const data = getAllData();
    const templateId = document.getElementById("templatePreviewSelect").value;
    const template = data.templates.find((entry) => entry.id === templateId) || data.templates[0];
    showPassJson(template, data.customers[0]);
  });

  document.getElementById("closeJson").addEventListener("click", () => {
    document.getElementById("jsonDialog").close();
  });
}

setupNavigation();
setupForms();
refreshUi();
