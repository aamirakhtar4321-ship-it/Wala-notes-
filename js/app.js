/* ==================== NOTES WALLAH - MAIN APP ==================== */

// App State
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
  darkMode: false
};

// DOM Elements
const splashScreen = document.getElementById('splash-screen');
const authScreen = document.getElementById('auth-screen');
const onboardingScreen = document.getElementById('onboarding-screen');
const mainApp = document.getElementById('main-app');

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();

  // Wait for Firebase Auth to be ready
  auth.onAuthStateChanged(async (user) => {
    // Hide splash after first auth check
    hideSplash();

    if (user) {
      // User is signed in
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
          // User exists in Auth but no Firestore doc
          AppState.user = {
            name: user.displayName || '',
            email: user.email,
            class: '',
            board: '',
            medium: '',
            language: ''
          };
          showOnboarding();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        showAuth();
      }
    } else {
      // No user
      showAuth();
    }
  });
});

function hideSplash() {
  if (splashScreen && !splashScreen.classList.contains('fade-out')) {
    splashScreen.classList.add('fade-out');
    setTimeout(() => {
      splashScreen.classList.add('hidden');
    }, 500);
  }
}

function showAuth() {
  authScreen.classList.remove('hidden');
  onboardingScreen.classList.add('hidden');
  mainApp.classList.add('hidden');
}

function showOnboarding() {
  authScreen.classList.add('hidden');
  onboardingScreen.classList.remove('hidden');
  mainApp.classList.add('hidden');

  if (AppState.user.name) {
    const nameInput = document.getElementById('onboard-name');
    if (nameInput) nameInput.value = AppState.user.name;
  }
}

function showMainApp() {
  authScreen.classList.add('hidden');
  onboardingScreen.classList.add('hidden');
  mainApp.classList.remove('hidden');

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
