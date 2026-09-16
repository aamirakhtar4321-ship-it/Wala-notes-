/* ==================== NOTES WALLAH - MAIN APP ==================== */

const AppState = {
  isLoggedIn: false,
  isOnboarded: false,
  user: {
    name: '',
    email: '',
    class: '',
    board: '',
    medium: '',
    language: ''
  },
  darkMode: false,
  splashDone: false   // important flag to stop splash looping
};

const splashScreen = document.getElementById('splash-screen');
const authScreen = document.getElementById('auth-screen');
const onboardingScreen = document.getElementById('onboarding-screen');
const mainApp = document.getElementById('main-app');

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();

  // Minimum 1.8 second splash, then listen to auth
  setTimeout(() => {
    startAuthListener();
  }, 1800);
});

function startAuthListener() {
  auth.onAuthStateChanged(async (user) => {
    // Splash only hide once
    if (!AppState.splashDone) {
      hideSplash();
      AppState.splashDone = true;
    }

    if (user) {
      try {
        const doc = await db.collection('users').doc(user.uid).get();

        if (doc.exists) {
          const data = doc.data();
          AppState.user = {
            name: data.name || user.displayName || '',
            email: data.email || user.email,
            class: data.class || '',
            board: data.board || '',
            medium: data.medium || '',
            language: data.language || ''
          };
          AppState.isLoggedIn = true;

          if (data.onboarded === true) {
            AppState.isOnboarded = true;
            showMainApp();
          } else {
            showOnboarding();
          }
        } else {
          // Auth user exists but no Firestore profile yet
          AppState.user = {
            name: user.displayName || '',
            email: user.email || '',
            class: '',
            board: '',
            medium: '',
            language: ''
          };
          showOnboarding();
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // Even if Firestore fails, still show main if we have basic user info
        AppState.user = {
          name: user.displayName || user.email?.split('@')[0] || 'Student',
          email: user.email || '',
          class: '',
          board: '',
          medium: '',
          language: ''
        };
        showOnboarding();
      }
    } else {
      // Not logged in
      AppState.isLoggedIn = false;
      AppState.isOnboarded = false;
      showAuth();
    }
  });
}

function hideSplash() {
  if (!splashScreen) return;
  splashScreen.classList.add('fade-out');
  setTimeout(() => {
    splashScreen.classList.add('hidden');
  }, 400);
}

function showAuth() {
  if (authScreen) authScreen.classList.remove('hidden');
  if (onboardingScreen) onboardingScreen.classList.add('hidden');
  if (mainApp) mainApp.classList.add('hidden');
}

function showOnboarding() {
  if (authScreen) authScreen.classList.add('hidden');
  if (onboardingScreen) onboardingScreen.classList.remove('hidden');
  if (mainApp) mainApp.classList.add('hidden');

  if (AppState.user.name) {
    const nameInput = document.getElementById('onboard-name');
    if (nameInput) nameInput.value = AppState.user.name;
  }
}

function showMainApp() {
  if (authScreen) authScreen.classList.add('hidden');
  if (onboardingScreen) onboardingScreen.classList.add('hidden');
  if (mainApp) mainApp.classList.remove('hidden');

  updateHomeUI();
  updateAccountUI();
}

// ==================== UI UPDATES ====================
function updateHomeUI() {
  const hour = new Date().getHours();
  let greeting = 'Good Morning';
  if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
  else if (hour >= 17) greeting = 'Good Evening';

  const greetingEl = document.getElementById('greeting-text');
  if (greetingEl) {
    greetingEl.textContent = `${greeting}, ${AppState.user.name || 'Student'}`;
  }

  const info = [];
  if (AppState.user.class) info.push(`Class ${AppState.user.class}`);
  if (AppState.user.board) info.push(AppState.user.board);
  if (AppState.user.medium) info.push(AppState.user.medium);

  const infoEl = document.getElementById('student-info');
  if (infoEl) {
    infoEl.textContent = info.join(' · ') || 'Complete your profile';
  }
}

function updateAccountUI() {
  const nameEl = document.getElementById('profile-name');
  const emailEl = document.getElementById('profile-email');
  const classEl = document.getElementById('profile-class');

  if (nameEl) nameEl.textContent = AppState.user.name || 'Student Name';
  if (emailEl) emailEl.textContent = AppState.user.email || 'email@example.com';

  const info = [];
  if (AppState.user.class) info.push(`Class ${AppState.user.class}`);
  if (AppState.user.board) info.push(AppState.user.board);
  if (AppState.user.medium) info.push(AppState.user.medium);
  if (classEl) classEl.textContent = info.join(' · ') || 'Not set';
}

// ==================== THEME ====================
function loadTheme() {
  const saved = localStorage.getItem('nw_darkmode');
  if (saved === 'true') {
    AppState.darkMode = true;
    document.body.classList.add('dark-mode');
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) toggle.checked = true;
  }
}

function toggleDarkMode() {
  AppState.darkMode = !AppState.darkMode;
  document.body.classList.toggle('dark-mode', AppState.darkMode);
  localStorage.setItem('nw_darkmode', AppState.darkMode);
}

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('dark-mode-toggle');
  if (toggle) {
    toggle.addEventListener('change', toggleDarkMode);
  }
});

// ==================== LOGOUT ====================
async function logout() {
  try {
    await auth.signOut();
    AppState.isLoggedIn = false;
    AppState.isOnboarded = false;
    AppState.user = { name: '', email: '', class: '', board: '', medium: '', language: '' };
    showAuth();
  } catch (error) {
    console.error('Logout error:', error);
    alert('Logout failed. Please try again.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', logout);
  }
});
