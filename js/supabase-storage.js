/* ==================== SUPABASE — STORAGE ONLY ==================== */
/* Auth / Firestore / Login = Firebase. Only images use Supabase Storage. */

// PASTE YOUR SUPABASE KEYS HERE (Project Settings → API)
const SUPABASE_URL = "https://xhgseosltqwxmmfsppbh.supabase.co";           // https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = "sb_publishable_QxUVn41IaxAawSiO50212Q_xCVLLtX6"; // anon public key

let supabaseStorage = null;

function initSupabaseStorage() {
  if (supabaseStorage) return supabaseStorage;
  if (!window.supabase) {
    console.warn("Supabase SDK not loaded");
    return null;
  }
  if (!SUPABASE_URL || SUPABASE_URL.includes("YOUR_")) {
    console.warn("Supabase URL not configured");
    return null;
  }
  supabaseStorage = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseStorage;
}

/**
 * Upload image file to Supabase Storage bucket "shop"
 * Returns public URL string or throws
 */
async function uploadShopImage(file, folder) {
  const client = initSupabaseStorage();
  if (!client) {
    throw new Error("Supabase Storage not configured. Put URL + anon key in js/supabase-storage.js");
  }
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }

  // Compress-ish: reject huge files
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image too large (max 5MB). Compress and try again.");
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = (folder || "products") + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;

  const { data, error } = await client.storage.from("shop").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type
  });

  if (error) throw error;

  const { data: pub } = client.storage.from("shop").getPublicUrl(path);
  if (!pub || !pub.publicUrl) throw new Error("Could not get public URL");
  return pub.publicUrl;
}
