import { DEFAULT_DATA, STORAGE_KEY } from "./config.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
    return clone(DEFAULT_DATA);
  }

  return { ...clone(DEFAULT_DATA), ...JSON.parse(raw) };
}

function writeData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getAllData() {
  return readData();
}

export function addCustomer(payload) {
  const data = readData();
  const customer = {
    id: crypto.randomUUID(),
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    customerNumber: payload.customerNumber,
    points: Number(payload.points || 0),
    status: payload.status || "Basic",
    createdAt: new Date().toISOString(),
  };

  data.customers.push(customer);
  writeData(data);
  return customer;
}

export function addTemplate(payload) {
  const data = readData();
  const template = {
    id: crypto.randomUUID(),
    name: payload.name,
    passType: payload.passType,
    backgroundColor: payload.backgroundColor,
    foregroundColor: payload.foregroundColor,
    labelColor: payload.labelColor,
    barcodeFormat: payload.barcodeFormat,
  };

  data.templates.push(template);
  writeData(data);
  return template;
}

export function issuePass(payload) {
  const data = readData();
  const pass = {
    id: crypto.randomUUID(),
    customerId: payload.customerId,
    templateId: payload.templateId,
    serialNumber: payload.serialNumber,
    status: "active",
    downloads: 0,
    createdAt: new Date().toISOString(),
    expiresAt: payload.expiresAt || null,
  };

  data.passes.push(pass);
  writeData(data);
  return pass;
}

export function bookPoints(customerId, amount, reason) {
  const data = readData();
  const customer = data.customers.find((entry) => entry.id === customerId);
  if (!customer) return null;

  customer.points += amount;

  data.transactions.push({
    id: crypto.randomUUID(),
    customerId,
    amount,
    reason,
    createdAt: new Date().toISOString(),
  });

  writeData(data);
  return customer;
}

export function getDashboardStats() {
  const data = readData();
  const activeCards = data.passes.filter((pass) => pass.status === "active").length;
  const totalDownloads = data.passes.reduce((sum, pass) => sum + pass.downloads, 0);
  const expiringSoon = data.passes.filter((pass) => {
    if (!pass.expiresAt) return false;
    const expireDate = new Date(pass.expiresAt);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + 30);
    return expireDate <= threshold;
  }).length;

  return {
    activeCards,
    totalDownloads,
    expiringSoon,
    customerCount: data.customers.length,
  };
}
