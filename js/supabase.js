/* ==================== NOTES WALLAH — SUPABASE ==================== */

// ========== PASTE YOUR REAL KEYS HERE ==========
const SUPABASE_URL = "https://xhgseosltqwxmmfsppbh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_QxUVn41IaxAawSiO50212Q_xCVLLtX6";
// ===============================================

const ADMIN_EMAILS = ["aamirakhtar4321@gmail.com"];

let supabase = null;

(function initSupabase() {
  try {
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      console.error("Supabase SDK missing");
      return;
    }
    if (
      !SUPABASE_URL ||
      SUPABASE_URL.indexOf("YOUR_") !== -1 ||
      !SUPABASE_ANON_KEY ||
      SUPABASE_ANON_KEY.indexOf("YOUR_") !== -1
    ) {
      console.warn("Paste real Supabase URL + anon key in js/supabase.js");
      return;
    }
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase OK");
  } catch (e) {
    console.error("Supabase init failed", e);
    supabase = null;
  }
})();
