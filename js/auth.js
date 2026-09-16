/* ==================== NOTES WALLAH - AUTH LOGIC ==================== */
/* Note: This is temporary localStorage based auth.
   Real Firebase Auth will be added in Part 2.
*/

document.addEventListener('DOMContentLoaded', () => {

  // Form switching
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const goToSignup = document.getElementById('go-to-signup');
  const goToLogin = document.getElementById('go-to-login');

  goToSignup.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
  });

  goToLogin.addEventListener('click', () => {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
  });

  // ==================== LOGIN ====================
  document.getElementById('btn-login').addEventListener('click', () => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    // Temporary: Accept any email/password for demo
    // In Part 2 this will be real Firebase Auth
    AppState.user.email = email;
    AppState.user.name = email.split('@')[0]; // temporary name
    AppState.isLoggedIn = true;

    localStorage.setItem('nw_user', JSON.stringify(AppState.user));

    // Check if already onboarded
    if (localStorage.getItem('nw_onboarded') === 'true') {
      AppState.isOnboarded = true;
      showMainApp();
    } else {
      showOnboarding();
    }
  });

  // ==================== SIGNUP ====================
  document.getElementById('btn-signup').addEventListener('click', () => {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    if (!name || !email || !password) {
      alert('Please fill all fields');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    // Temporary signup
    AppState.user = {
      name: name,
      email: email,
      class: '',
      board: '',
      medium: '',
      language: ''
    };
    AppState.isLoggedIn = true;
    AppState.isOnboarded = false;

    localStorage.setItem('nw_user', JSON.stringify(AppState.user));
    localStorage.setItem('nw_onboarded', 'false');

    showOnboarding();
  });

  // ==================== GOOGLE BUTTONS (Placeholder) ====================
  document.getElementById('btn-google').addEventListener('click', () => {
    alert('Google Login will work after Firebase is connected in Part 2.\n\nFor now please use Email login.');
  });

  document.getElementById('btn-google-signup').addEventListener('click', () => {
    alert('Google Login will work after Firebase is connected in Part 2.\n\nFor now please use Email signup.');
  });

  // Forgot Password
  document.getElementById('forgot-password').addEventListener('click', () => {
    alert('Forgot Password will work after Firebase is connected in Part 2.');
  });

  // ==================== ONBOARDING COMPLETE ====================
  document.getElementById('btn-onboard-complete').addEventListener('click', () => {
    const name = document.getElementById('onboard-name').value.trim();
    const studentClass = document.getElementById('onboard-class').value;
    const board = document.getElementById('onboard-board').value;
    const medium = document.getElementById('onboard-medium').value;
    const language = document.getElementById('onboard-language').value;

    if (!name || !studentClass || !board || !medium) {
      alert('Please fill all required fields');
      return;
    }

    AppState.user.name = name;
    AppState.user.class = studentClass;
    AppState.user.board = board;
    AppState.user.medium = medium;
    AppState.user.language = language || 'English';
    AppState.isOnboarded = true;

    localStorage.setItem('nw_user', JSON.stringify(AppState.user));
    localStorage.setItem('nw_onboarded', 'true');

    showMainApp();
  });

});
