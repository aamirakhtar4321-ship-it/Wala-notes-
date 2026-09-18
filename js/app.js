/* ==================== MAIN APP — SAFE SPLASH ==================== */

const AppState = {
  isLoggedIn: false,
  isOnboarded: false,
  isAdmin: false,
  user: { name: "", email: "", class: "", board: "", medium: "", language: "", id: "" },
  darkMode: false,
  splashDone: false
};

document.addEventListener("DOMContentLoaded", function () {
  try { loadTheme(); } catch (e) {}

  // Leave splash after 1.6s
  setTimeout(function () {
    startAuth().catch(function (err) {
      console.error(err);
      forceShowAuth();
    });
  }, 1600);

  // Absolute safety — never stick on splash more than 3.5s
  setTimeout(function () {
    if (!AppState.splashDone) forceShowAuth();
  }, 3500);
});

async function startAuth() {
  if (!window.sb || !window.sb.auth) {
    console.warn("Supabase not configured — showing login");
    forceShowAuth();
    showKeysWarning();
    return;
  }
  try {
    var res = await window.sb.auth.getSession();
    var session = res && res.data ? res.data.session : null;
    await handleSession(session);
    window.sb.auth.onAuthStateChange(function (event, session) {
      handleSession(session).catch(function (e) { console.error(e); });
    });
  } catch (e) {
    console.error("startAuth", e);
    forceShowAuth();
  }
}

function forceShowAuth() {
  hideSplash();
  AppState.splashDone = true;
  showAuth();
}

function showKeysWarning() {
  setTimeout(function () {
    var box = document.querySelector(".auth-header p");
    if (box) {
      box.textContent = "Supabase keys missing — js/supabase.js me URL + key paste karo";
      box.style.color = "#c62828";
    }
  }, 100);
}

async function handleSession(session) {
  if (!AppState.splashDone) {
    hideSplash();
    AppState.splashDone = true;
  }

  if (session && session.user) {
    var u = session.user;
    try {
      var result = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .maybeSingle();
      var profile = result ? result.data : null;

      if (profile) {
        AppState.user = {
          id: u.id,
          name: profile.name || (u.user_metadata && u.user_metadata.name) || "",
          email: profile.email || u.email || "",
          class: profile.class || "",
          board: profile.board || "",
          medium: profile.medium || "",
          language: profile.language || ""
        };
        AppState.isAdmin =
          !!profile.is_admin ||
          ADMIN_EMAILS.indexOf((u.email || "").toLowerCase()) !== -1;
        AppState.isLoggedIn = true;
        if (profile.onboarded) {
          AppState.isOnboarded = true;
          showMainApp();
        } else {
          showOnboarding();
        }
      } else {
        AppState.user = {
          id: u.id,
          name: (u.user_metadata && (u.user_metadata.name || u.user_metadata.full_name)) || "",
          email: u.email || "",
          class: "",
          board: "",
          medium: "",
          language: ""
        };
        AppState.isAdmin = ADMIN_EMAILS.indexOf((u.email || "").toLowerCase()) !== -1;
        showOnboarding();
      }
    } catch (e) {
      console.error(e);
      AppState.user = {
        id: u.id,
        name: "",
        email: u.email || "",
        class: "",
        board: "",
        medium: "",
        language: ""
      };
      AppState.isAdmin = ADMIN_EMAILS.indexOf((u.email || "").toLowerCase()) !== -1;
      showOnboarding();
    }
  } else {
    AppState.isLoggedIn = false;
    AppState.isOnboarded = false;
    AppState.isAdmin = false;
    showAuth();
  }
}

function hideSplash() {
  var el = document.getElementById("splash-screen");
  if (!el) return;
  el.classList.add("fade-out");
  setTimeout(function () {
    el.classList.add("hidden");
    el.style.display = "none";
  }, 300);
}

function showAuth() {
  var a = document.getElementById("auth-screen");
  var o = document.getElementById("onboarding-screen");
  var m = document.getElementById("main-app");
  if (a) a.classList.remove("hidden");
  if (o) o.classList.add("hidden");
  if (m) m.classList.add("hidden");
}

function showOnboarding() {
  var a = document.getElementById("auth-screen");
  var o = document.getElementById("onboarding-screen");
  var m = document.getElementById("main-app");
  if (a) a.classList.add("hidden");
  if (o) o.classList.remove("hidden");
  if (m) m.classList.add("hidden");
  var el = document.getElementById("onboard-name");
  if (el && AppState.user.name) el.value = AppState.user.name;
}

function showMainApp() {
  var a = document.getElementById("auth-screen");
  var o = document.getElementById("onboarding-screen");
  var m = document.getElementById("main-app");
  if (a) a.classList.add("hidden");
  if (o) o.classList.add("hidden");
  if (m) m.classList.remove("hidden");
  try {
    updateHomeUI();
    updateAccountUI();
  } catch (e) {}
}

function updateHomeUI() {
  var hour = new Date().getHours();
  var g = "Good Morning";
  if (hour >= 12 && hour < 17) g = "Good Afternoon";
  else if (hour >= 17) g = "Good Evening";
  var el = document.getElementById("greeting-text");
  if (el) el.textContent = g + ", " + (AppState.user.name || "Student");
  var info = [];
  if (AppState.user.class) info.push("Class " + AppState.user.class);
  if (AppState.user.board) info.push(AppState.user.board);
  if (AppState.user.medium) info.push(AppState.user.medium);
  var infoEl = document.getElementById("student-info");
  if (infoEl) infoEl.textContent = info.join(" · ") || "Complete your profile";
}

function updateAccountUI() {
  var n = document.getElementById("profile-name");
  var e = document.getElementById("profile-email");
  var c = document.getElementById("profile-class");
  if (n) n.textContent = AppState.user.name || "Student";
  if (e) e.textContent = AppState.user.email || "";
  var info = [];
  if (AppState.user.class) info.push("Class " + AppState.user.class);
  if (AppState.user.board) info.push(AppState.user.board);
  if (c) c.textContent = info.join(" · ") || "Not set";
  var adminBtn = document.getElementById("btn-shop-admin");
  if (adminBtn) adminBtn.style.display = AppState.isAdmin ? "" : "none";
}

function loadTheme() {
  if (localStorage.getItem("nw_darkmode") === "true") {
    AppState.darkMode = true;
    document.body.classList.add("dark-mode");
    var t = document.getElementById("dark-mode-toggle");
    if (t) t.checked = true;
  }
}

function toggleDarkMode() {
  AppState.darkMode = !AppState.darkMode;
  document.body.classList.toggle("dark-mode", AppState.darkMode);
  localStorage.setItem("nw_darkmode", AppState.darkMode);
}

document.addEventListener("DOMContentLoaded", function () {
  var t = document.getElementById("dark-mode-toggle");
  if (t) t.addEventListener("change", toggleDarkMode);
  var lo = document.getElementById("btn-logout");
  if (lo) lo.addEventListener("click", logout);
});

async function logout() {
  try {
    if (window.sb) await window.sb.auth.signOut();
  } catch (e) {}
  AppState.isLoggedIn = false;
  AppState.isOnboarded = false;
  AppState.isAdmin = false;
  AppState.user = { name: "", email: "", class: "", board: "", medium: "", language: "", id: "" };
  showAuth();
}
