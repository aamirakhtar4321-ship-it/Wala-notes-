/* ==================== NOTES WALLAH - MAIN APP ==================== */

// App State (temporary - will move to Firebase in Part 2)
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
  // Load saved theme
  loadTheme();

  // Show splash for 2 seconds then decide where to go
  setTimeout(() => {
    hideSplash();
    checkAuthState();
  }, 2000);
});

function hideSplash() {
  splashScreen.classList.add('fade-out');
  setTimeout(() => {
    splashScreen.classList.add('hidden');
  }, 500);
}

function checkAuthState() {
  // Temporary logic (Firebase will replace this in Part 2)
  const savedUser = localStorage.getItem('nw_user');
  
  if (savedUser) {
    AppState.user = JSON.parse(savedUser);
    AppState.isLoggedIn = true;
    AppState.isOnboarded = localStorage.getItem('nw_onboarded') === 'true';

    if (AppState.isOnboarded) {
      showMainApp();
    } else {
      showOnboarding();
    }
  } else {
    showAuth();
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

  // Pre-fill name if available
  if (AppState.user.name) {
    document.getElementById('onboard-name').value = AppState.user.name;
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

  document.getElementById('greeting-text').textContent = `${greeting}, ${AppState.user.name || 'Student'}`;
  
  const info = [];
  if (AppState.user.class) info.push(`Class ${AppState.user.class}`);
  if (AppState.user.board) info.push(AppState.user.board);
  if (AppState.user.medium) info.push(AppState.user.medium);
  
  document.getElementById('student-info').textContent = info.join(' · ') || 'Complete your profile';
}

function updateAccountUI() {
  document.getElementById('profile-name').textContent = AppState.user.name || 'Student Name';
  document.getElementById('profile-email').textContent = AppState.user.email || 'email@example.com';
  
  const info = [];
  if (AppState.user.class) info.push(`Class ${AppState.user.class}`);
  if (AppState.user.board) info.push(AppState.user.board);
  if (AppState.user.medium) info.push(AppState.user.medium);
  document.getElementById('profile-class').textContent = info.join(' · ') || 'Not set';
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

// Dark mode toggle listener
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('dark-mode-toggle');
  if (toggle) {
    toggle.addEventListener('change', toggleDarkMode);
  }
});

// ==================== LOGOUT ====================
function logout() {
  localStorage.removeItem('nw_user');
  localStorage.removeItem('nw_onboarded');
  AppState.isLoggedIn = false;
  AppState.isOnboarded = false;
  AppState.user = { name: '', email: '', class: '', board: '', medium: '', language: '' };
  showAuth();
}

document.addEventListener('DOMContentLoaded', () => {
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', logout);
  }
});
