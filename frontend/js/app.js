import { buildPassJson } from "./walletEditor.js";

const state = {
  cards: [
    { status: "active", downloads: 23, expiresAt: "2026-05-10" },
    { status: "active", downloads: 11, expiresAt: "2026-07-01" },
    { status: "blocked", downloads: 3, expiresAt: "2026-04-29" },
  ],
};

const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");
const form = document.getElementById("walletForm");
const passPreview = document.getElementById("passPreview");

navItems.forEach((button) => {
  button.addEventListener("click", () => {
    navItems.forEach((item) => item.classList.remove("active"));
    views.forEach((view) => view.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(button.dataset.view).classList.add("active");
  });
});

function updateDashboard() {
  const active = state.cards.filter((c) => c.status === "active").length;
  const downloads = state.cards.reduce((sum, c) => sum + c.downloads, 0);
  const soon = state.cards.filter((c) => new Date(c.expiresAt) <= new Date("2026-05-26")).length;

  document.getElementById("activeCards").textContent = String(active);
  document.getElementById("lastDownloads").textContent = String(downloads);
  document.getElementById("expiringSoon").textContent = String(soon);
}

function getFormData() {
  return Object.fromEntries(new FormData(form));
}

function updatePreview() {
  const data = getFormData();
  document.getElementById("previewName").textContent = data.customerName;
  document.getElementById("previewCustomerNumber").textContent = data.customerNumber;
  document.getElementById("previewPoints").textContent = data.points;
  document.getElementById("previewStatus").textContent = data.status;
  passPreview.style.background = data.backgroundColor;
  passPreview.style.color = data.foregroundColor;
  document.querySelectorAll(".label").forEach((label) => {
    label.style.color = data.labelColor;
  });
}

form.addEventListener("input", updatePreview);

document.getElementById("exportJson").addEventListener("click", () => {
  const json = buildPassJson(getFormData());
  document.getElementById("jsonOutput").textContent = JSON.stringify(json, null, 2);
  document.getElementById("jsonDialog").showModal();
});

document.getElementById("closeJson").addEventListener("click", () => {
  document.getElementById("jsonDialog").close();
});

updateDashboard();
updatePreview();
