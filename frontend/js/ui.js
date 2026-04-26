import { buildPassJson } from "./walletEditor.js";

export function fillDashboard(stats) {
  document.getElementById("activeCards").textContent = String(stats.activeCards);
  document.getElementById("lastDownloads").textContent = String(stats.totalDownloads);
  document.getElementById("expiringSoon").textContent = String(stats.expiringSoon);
  document.getElementById("customerCount").textContent = String(stats.customerCount);
}

export function renderCustomers(customers) {
  const body = document.getElementById("customersTableBody");
  body.innerHTML = "";

  customers.forEach((customer) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${customer.customerNumber}</td>
      <td>${customer.firstName} ${customer.lastName}</td>
      <td>${customer.email || "-"}</td>
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
  const templateSelect = document.getElementById("issueTemplateId");
  const editorSelect = document.getElementById("templatePreviewSelect");
  templateSelect.innerHTML = "";
  editorSelect.innerHTML = "";

  templates.forEach((template) => {
    const option = new Option(template.name, template.id);
    const previewOption = new Option(template.name, template.id);
    templateSelect.add(option);
    editorSelect.add(previewOption);
  });
}

export function renderCustomerOptions(customers) {
  const customerSelect = document.getElementById("issueCustomerId");
  customerSelect.innerHTML = "";

  customers.forEach((customer) => {
    customerSelect.add(new Option(`${customer.customerNumber} - ${customer.firstName} ${customer.lastName}`, customer.id));
  });
}

export function updatePreview(template, customer) {
  if (!template || !customer) return;

  const passPreview = document.getElementById("passPreview");
  passPreview.style.background = template.backgroundColor;
  passPreview.style.color = template.foregroundColor;
  document.querySelectorAll(".label").forEach((label) => {
    label.style.color = template.labelColor;
  });

  document.getElementById("previewName").textContent = `${customer.firstName} ${customer.lastName}`;
  document.getElementById("previewCustomerNumber").textContent = customer.customerNumber;
  document.getElementById("previewPoints").textContent = customer.points;
  document.getElementById("previewStatus").textContent = customer.status;
}

export function showPassJson(template, customer) {
  const json = buildPassJson({
    passType: template.passType,
    customerName: `${customer.firstName} ${customer.lastName}`,
    customerNumber: customer.customerNumber,
    points: customer.points,
    status: customer.status,
    foregroundColor: template.foregroundColor,
    backgroundColor: template.backgroundColor,
    labelColor: template.labelColor,
    barcodeFormat: template.barcodeFormat,
  });

  document.getElementById("jsonOutput").textContent = JSON.stringify(json, null, 2);
  document.getElementById("jsonDialog").showModal();
}
