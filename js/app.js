/* ==================== MAIN APP — SUPABASE ==================== */

const AppState = {
  isLoggedIn: false,
  isOnboarded: false,
  isAdmin: false,
  user: { name: '', email: '', class: '', board: '', medium: '', language: '', id: '' },
  darkMode: false,
  splashDone: false
};

const splashScreen = document.getElementById('splash-screen');
const authScreen = document.getElementById('auth-screen');
const onboardingScreen = document.getElementById('onboarding-screen');
const mainApp = document.getElementById('main-app');

document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  setTimeout(() => startAuth(), 1600);
});

async function startAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  await handleSession(session);
  supabase.auth.onAuthStateChange(async (event, session) => {
    await handleSession(session);
  });
}

async function handleSession(session) {
  if (!AppState.splashDone) {
    hideSplash();
    AppState.splashDone = true;
  }

  if (session && session.user) {
    const u = session.user;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .maybeSingle();

      if (profile) {
        AppState.user = {
          id: u.id,
          name: profile.name || u.user_metadata?.name || '',
          email: profile.email || u.email,
          class: profile.class || '',
          board: profile.board || '',
          medium: profile.medium || '',
          language: profile.language || ''
        };
        AppState.isAdmin = !!(profile.is_admin) || ADMIN_EMAILS.includes((u.email || '').toLowerCase());
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
          name: u.user_metadata?.name || u.user_metadata?.full_name || '',
          email: u.email,
          class: '', board: '', medium: '', language: ''
        };
        AppState.isAdmin = ADMIN_EMAILS.includes((u.email || '').toLowerCase());
        showOnboarding();
      }
    } catch (e) {
      console.error(e);
      AppState.user = { id: u.id, name: '', email: u.email, class: '', board: '', medium: '', language: '' };
      AppState.isAdmin = ADMIN_EMAILS.includes((u.email || '').toLowerCase());
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
  if (!splashScreen) return;
  splashScreen.classList.add('fade-out');
  setTimeout(() => splashScreen.classList.add('hidden'), 400);
}
function showAuth() {
  authScreen?.classList.remove('hidden');
  onboardingScreen?.classList.add('hidden');
  mainApp?.classList.add('hidden');
}
function showOnboarding() {
  authScreen?.classList.add('hidden');
  onboardingScreen?.classList.remove('hidden');
  mainApp?.classList.add('hidden');
  const el = document.getElementById('onboard-name');
  if (el && AppState.user.name) el.value = AppState.user.name;
}
function showMainApp() {
  authScreen?.classList.add('hidden');
  onboardingScreen?.classList.add('hidden');
  mainApp?.classList.remove('hidden');
  updateHomeUI();
  updateAccountUI();
}
function updateHomeUI() {
  const hour = new Date().getHours();
  let g = 'Good Morning';
  if (hour >= 12 && hour < 17) g = 'Good Afternoon';
  else if (hour >= 17) g = 'Good Evening';
  const el = document.getElementById('greeting-text');
  if (el) el.textContent = `${g}, ${AppState.user.name || 'Student'}`;
  const info = [];
  if (AppState.user.class) info.push(`Class ${AppState.user.class}`);
  if (AppState.user.board) info.push(AppState.user.board);
  if (AppState.user.medium) info.push(AppState.user.medium);
  const infoEl = document.getElementById('student-info');
  if (infoEl) infoEl.textContent = info.join(' · ') || 'Complete your profile';
}
function updateAccountUI() {
  const n = document.getElementById('profile-name');
  const e = document.getElementById('profile-email');
  const c = document.getElementById('profile-class');
  if (n) n.textContent = AppState.user.name || 'Student';
  if (e) e.textContent = AppState.user.email || '';
  const info = [];
  if (AppState.user.class) info.push(`Class ${AppState.user.class}`);
  if (AppState.user.board) info.push(AppState.user.board);
  if (c) c.textContent = info.join(' · ') || 'Not set';
  // Show/hide shop admin
  const adminBtn = document.getElementById('btn-shop-admin');
  if (adminBtn) adminBtn.style.display = AppState.isAdmin ? '' : 'none';
}
function loadTheme() {
  if (localStorage.getItem('nw_darkmode') === 'true') {
    AppState.darkMode = true;
    document.body.classList.add('dark-mode');
    const t = document.getElementById('dark-mode-toggle');
    if (t) t.checked = true;
  }
}
function toggleDarkMode() {
  AppState.darkMode = !AppState.darkMode;
  document.body.classList.toggle('dark-mode', AppState.darkMode);
  localStorage.setItem('nw_darkmode', AppState.darkMode);
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('dark-mode-toggle')?.addEventListener('change', toggleDarkMode);
  document.getElementById('btn-logout')?.addEventListener('click', logout);
});
async function logout() {
  await supabase.auth.signOut();
  AppState.isLoggedIn = false;
  AppState.isOnboarded = false;
  AppState.isAdmin = false;
  AppState.user = { name: '', email: '', class: '', board: '', medium: '', language: '', id: '' };
  showAuth();
}
