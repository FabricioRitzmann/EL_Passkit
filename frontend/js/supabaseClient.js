import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

let cachedClient = null;
let cachedConfig = null;

async function readCredentials() {
  if (cachedConfig) return cachedConfig;

  const response = await fetch("../supabase.credentials.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("supabase.credentials.json konnte nicht geladen werden");
  }

  const json = await response.json();
  if (!json.supabaseUrl || !json.supabaseAnonKey) {
    throw new Error("Supabase Credentials sind unvollständig");
  }

  cachedConfig = {
    url: json.supabaseUrl,
    anonKey: json.supabaseAnonKey,
  };

  return cachedConfig;
}

export async function getSupabaseClient() {
  if (cachedClient) return cachedClient;

  const config = await readCredentials();
  cachedClient = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}
