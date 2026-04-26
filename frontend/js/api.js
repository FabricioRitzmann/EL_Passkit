import { getSupabaseClient } from "./supabaseClient.js";

function mapCustomer(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    customerNumber: row.customer_number,
    points: row.points ?? 0,
    status: row.status ?? "Basic",
    createdAt: row.created_at,
  };
}

function mapTemplate(row) {
  return {
    id: row.id,
    name: row.name,
    passType: row.pass_type,
    backgroundColor: row.background_color,
    foregroundColor: row.foreground_color,
    labelColor: row.label_color,
    barcodeFormat: row.barcode_format ?? "PKBarcodeFormatQR",
  };
}

function mapPass(row) {
  return {
    id: row.id,
    customerId: row.customer_id,
    templateId: row.template_id,
    serialNumber: row.serial_number,
    status: row.status,
    downloads: row.downloads ?? 0,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

function mapTransaction(row) {
  return {
    id: row.id,
    customerId: row.customer_id,
    amount: row.amount,
    reason: row.reason,
    createdAt: row.created_at,
  };
}

function mapPasskitSettings(row) {
  return {
    id: row.id,
    passTypeIdentifier: row.pass_type_identifier,
    teamIdentifier: row.team_identifier,
    organizationName: row.organization_name,
    logoText: row.logo_text,
    description: row.description,
    contactEmail: row.contact_email,
  };
}

async function runQuery(builder) {
  const { data, error } = await builder;
  if (error) throw error;
  return data;
}

export async function getAllData() {
  const supabase = await getSupabaseClient();
  const passkitSettingsPromise = (async () => {
    try {
      return await runQuery(supabase.from("passkit_settings").select("*").order("updated_at", { ascending: false }).limit(1));
    } catch (error) {
      if (error?.code === "42P01") return [];
      throw error;
    }
  })();

  const [customers, templates, passes, transactions, passkitSettingsRows] = await Promise.all([
    runQuery(supabase.from("customers").select("*").order("created_at", { ascending: true })),
    runQuery(supabase.from("wallet_templates").select("*").order("created_at", { ascending: true })),
    runQuery(supabase.from("wallet_passes").select("*").order("created_at", { ascending: false })),
    runQuery(supabase.from("point_transactions").select("*").order("created_at", { ascending: false })),
    passkitSettingsPromise,
  ]);

  return {
    customers: customers.map(mapCustomer),
    templates: templates.map(mapTemplate),
    passes: passes.map(mapPass),
    transactions: transactions.map(mapTransaction),
    passkitSettings: passkitSettingsRows[0] ? mapPasskitSettings(passkitSettingsRows[0]) : null,
  };
}

export async function addCustomer(payload) {
  const supabase = await getSupabaseClient();
  const [row] = await runQuery(
    supabase
      .from("customers")
      .insert({
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email || null,
        customer_number: payload.customerNumber,
        points: Number(payload.points || 0),
        status: payload.status || "Basic",
      })
      .select()
  );

  return mapCustomer(row);
}

export async function addTemplate(payload) {
  const supabase = await getSupabaseClient();
  const [row] = await runQuery(
    supabase
      .from("wallet_templates")
      .insert({
        name: payload.name,
        pass_type: payload.passType,
        background_color: payload.backgroundColor,
        foreground_color: payload.foregroundColor,
        label_color: payload.labelColor,
        barcode_format: payload.barcodeFormat,
      })
      .select()
  );

  return mapTemplate(row);
}

export async function issuePass(payload) {
  const supabase = await getSupabaseClient();
  const [row] = await runQuery(
    supabase
      .from("wallet_passes")
      .insert({
        customer_id: payload.customerId,
        template_id: payload.templateId,
        serial_number: payload.serialNumber,
        pass_type_identifier: payload.passTypeIdentifier || "pass.el.promillo",
        status: "active",
        barcode_value: payload.serialNumber,
        expires_at: payload.expiresAt || null,
      })
      .select()
  );

  return mapPass(row);
}

export async function upsertPasskitSettings(payload) {
  const supabase = await getSupabaseClient();
  let existingRows = [];
  try {
    existingRows = await runQuery(supabase.from("passkit_settings").select("id").order("updated_at", { ascending: false }).limit(1));
  } catch (error) {
    if (error?.code === "42P01") {
      throw new Error(
        "Die Tabelle passkit_settings fehlt. Bitte zuerst die Migration backend/supabase/migrations/2026-04-26_passkit_settings.sql ausführen."
      );
    }
    throw error;
  }
  const existing = existingRows[0];

  const writePayload = {
    pass_type_identifier: payload.passTypeIdentifier,
    team_identifier: payload.teamIdentifier,
    organization_name: payload.organizationName,
    logo_text: payload.logoText,
    description: payload.description,
    contact_email: payload.contactEmail,
  };

  const [row] = existing
    ? await runQuery(supabase.from("passkit_settings").update(writePayload).eq("id", existing.id).select())
    : await runQuery(supabase.from("passkit_settings").insert(writePayload).select());

  return mapPasskitSettings(row);
}

export async function bookPoints(customerId, amount, reason) {
  const supabase = await getSupabaseClient();

  await runQuery(
    supabase.from("point_transactions").insert({
      customer_id: customerId,
      amount,
      reason,
    })
  );

  const [customer] = await runQuery(supabase.from("customers").select("*").eq("id", customerId).limit(1));
  return customer ? mapCustomer(customer) : null;
}

export function getDashboardStats(data) {
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
