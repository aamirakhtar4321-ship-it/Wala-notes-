/* ==================== NOTES WALLAH — SUPABASE (FIXED) ==================== */
/* Client must be window.sb — never name it "supabase" (clashes with CDN) */

const SUPABASE_URL = "https://xhgseosltqwxmmfsppbh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_QxUVn41IaxAawSiO50212Q_xCVLLtX6";

const ADMIN_EMAILS = ["aamirakhtar4321@gmail.com"];

window.sb = null;

(function () {
  try {
    var lib = window.supabase;
    if (!lib || typeof lib.createClient !== "function") {
      console.error("Supabase CDN not loaded");
      return;
    }
    window.sb = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    if (!window.sb || !window.sb.auth) {
      console.error("createClient failed");
      window.sb = null;
      return;
    }
    console.log("Supabase client ready");
  } catch (e) {
    console.error("Supabase init error", e);
    window.sb = null;
  }
})();
