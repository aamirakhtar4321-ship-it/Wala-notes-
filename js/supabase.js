/* ==================== NOTES WALLAH — FULL SUPABASE ==================== */
/* Auth + Database + Storage — Firebase removed */

// ========== PASTE YOUR SUPABASE KEYS ==========
const SUPABASE_URL = "https://xhgseosltqwxmmfsppbh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_QxUVn41IaxAawSiO50212Q_xCVLLtX6";
// ==============================================

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Primary admin email (also set is_admin=true in profiles table)
const ADMIN_EMAILS = ["aamirakhtar4321@gmail.com"];

console.log("Supabase ready");

