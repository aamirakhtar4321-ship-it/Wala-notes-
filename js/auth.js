/* ==================== NOTES WALLAH - FIREBASE AUTH ==================== */

document.addEventListener('DOMContentLoaded', () => {

  // Form switching
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  document.getElementById('go-to-signup').addEventListener('click', () => {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
  });

  document.getElementById('go-to-login').addEventListener('click', () => {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
  });

  // ==================== EMAIL LOGIN ====================
  document.getElementById('btn-login').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('btn-login');

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Logging in...';

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      // onAuthStateChanged will handle the rest
      console.log('Email login success:', userCredential.user.email);
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      let message = 'Login failed. Please try again.';

      if (error.code === 'auth/user-not-found') message = 'No account found with this email. Please sign up first.';
      else if (error.code === 'auth/wrong-password') message = 'Wrong password. Please try again.';
      else if (error.code === 'auth/invalid-email') message = 'Invalid email address.';
      else if (error.code === 'auth/too-many-requests') message = 'Too many failed attempts. Try again later.';
      else if (error.code === 'auth/invalid-credential') message = 'Wrong email or password.';
      else if (error.code === 'auth/network-request-failed') message = 'Network error. Check your internet.';
      else message = 'Error: ' + (error.message || 'Unknown error');

      alert(message);
      btn.disabled = false;
      btn.textContent = 'Login';
    }
  });

  // ==================== EMAIL SIGNUP ====================
  document.getElementById('btn-signup').addEventListener('click', async () => {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const btn = document.getElementById('btn-signup');

    if (!name || !email || !password) {
      alert('Please fill all fields');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Creating account...';

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await user.updateProfile({ displayName: name });

      // Create Firestore profile
      await db.collection('users').doc(user.uid).set({
        name: name,
        email: email,
        class: '',
        board: '',
        medium: '',
        language: '',
        onboarded: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Try sending verification email (optional)
      try { await user.sendEmailVerification(); } catch(e) {}

      alert('Account created successfully!');
      // onAuthStateChanged will take user to onboarding

    } catch (error) {
      console.error('Signup error:', error.code, error.message);
      let message = 'Signup failed.';
      if (error.code === 'auth/email-already-in-use') message = 'This email is already registered. Please login.';
      else if (error.code === 'auth/invalid-email') message = 'Invalid email address.';
      else if (error.code === 'auth/weak-password') message = 'Password is too weak (min 6 characters).';
      else if (error.code === 'auth/network-request-failed') message = 'Network error. Check your internet.';
      else message = error.message || 'Unknown error';
      alert(message);
    }

    btn.disabled = false;
    btn.textContent = 'Create Account';
  });

  // ==================== GOOGLE LOGIN ====================
  async function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await auth.signInWithPopup(provider);
      // onAuthStateChanged will handle everything after this
    } catch (error) {
      console.error('Google Login Error:', error.code, error.message);

      if (error.code === 'auth/popup-closed-by-user') return;
      if (error.code === 'auth/cancelled-popup-request') return;

      let message = 'Google login failed.';
      if (error.code === 'auth/popup-blocked') {
        message = 'Popup blocked! Please allow popups for this site and try again.';
      } else if (error.code === 'auth/unauthorized-domain') {
        message = 'Domain not allowed.\n\nGo to Firebase Console → Authentication → Settings → Authorized domains\nand add "localhost"';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Check your internet connection.';
      } else {
        message = error.message || 'Unknown error';
      }
      alert(message);
    }
  }

  document.getElementById('btn-google').addEventListener('click', googleLogin);
  document.getElementById('btn-google-signup').addEventListener('click', googleLogin);

  // ==================== FORGOT PASSWORD ====================
  document.getElementById('forgot-password').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    if (!email) {
      alert('Please enter your email first');
      return;
    }
    try {
      await auth.sendPasswordResetEmail(email);
      alert('Password reset link sent to your email.');
    } catch (error) {
      alert('Failed to send reset email. Check if the email is registered.');
    }
  });

  // ==================== ONBOARDING COMPLETE ====================
  document.getElementById('btn-onboard-complete').addEventListener('click', async () => {
    const name = document.getElementById('onboard-name').value.trim();
    const studentClass = document.getElementById('onboard-class').value;
    const board = document.getElementById('onboard-board').value;
    const medium = document.getElementById('onboard-medium').value;
    const language = document.getElementById('onboard-language').value;
    const btn = document.getElementById('btn-onboard-complete');

    if (!name || !studentClass || !board || !medium) {
      alert('Please fill all required fields');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Session expired. Please login again.');
        showAuth();
        return;
      }

      await db.collection('users').doc(user.uid).set({
        name: name,
        email: user.email,
        class: studentClass,
        board: board,
        medium: medium,
        language: language || 'English',
        onboarded: true,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      AppState.user = {
        name,
        email: user.email,
        class: studentClass,
        board,
        medium,
        language: language || 'English'
      };
      AppState.isOnboarded = true;

      showMainApp();

    } catch (error) {
      console.error('Profile save error:', error);
      let msg = 'Failed to save profile.\n\n';
      if (error.code) msg += 'Code: ' + error.code + '\n';
      if (error.message) msg += error.message;
      else msg += 'Check internet or Firestore rules.';
      alert(msg);
    }

    btn.disabled = false;
    btn.textContent = 'Continue';
  });
});
