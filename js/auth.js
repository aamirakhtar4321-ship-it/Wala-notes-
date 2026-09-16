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
      const user = userCredential.user;
      await handleSuccessfulLogin(user);

    } catch (error) {
      console.error(error);
      let message = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found') message = 'No account found with this email.';
      if (error.code === 'auth/wrong-password') message = 'Incorrect password.';
      if (error.code === 'auth/invalid-email') message = 'Invalid email address.';
      if (error.code === 'auth/too-many-requests') message = 'Too many attempts. Try again later.';
      if (error.code === 'auth/invalid-credential') message = 'Invalid email or password.';
      alert(message);
    }

    btn.disabled = false;
    btn.textContent = 'Login';
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

      // Update display name
      await user.updateProfile({ displayName: name });

      // Send verification email
      try {
        await user.sendEmailVerification();
      } catch (e) {
        console.log('Verification email error:', e);
      }

      // Create user document in Firestore
      await db.collection('users').doc(user.uid).set({
        name: name,
        email: email,
        class: '',
        board: '',
        medium: '',
        language: '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        onboarded: false
      });

      alert('Account created successfully!');

      AppState.user = { name, email, class: '', board: '', medium: '', language: '' };
      showOnboarding();

    } catch (error) {
      console.error(error);
      let message = 'Signup failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') message = 'This email is already registered.';
      if (error.code === 'auth/invalid-email') message = 'Invalid email address.';
      if (error.code === 'auth/weak-password') message = 'Password is too weak.';
      alert(message);
    }

    btn.disabled = false;
    btn.textContent = 'Create Account';
  });

  // ==================== GOOGLE LOGIN ====================
  async function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
      const result = await auth.signInWithPopup(provider);
      const user = result.user;
      await handleSuccessfulLogin(user);

    } catch (error) {
      console.error('Google Login Error:', error);

      if (error.code === 'auth/popup-closed-by-user') {
        return; // user closed popup
      }

      let message = 'Google login failed. Please try again.';
      if (error.code === 'auth/popup-blocked') {
        message = 'Popup blocked by browser. Please allow popups for this site.';
      }
      if (error.code === 'auth/unauthorized-domain') {
        message = 'Domain not authorized. Go to Firebase Console → Authentication → Settings → Authorized domains and add your domain (and localhost).';
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
      console.error(error);
      alert('Failed to send reset email. Check if the email is correct.');
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
      console.error(error);
      alert('Failed to save profile. Please try again.');
    }

    btn.disabled = false;
    btn.textContent = 'Continue';
  });

});

// ==================== HANDLE SUCCESSFUL LOGIN ====================
async function handleSuccessfulLogin(user) {
  try {
    const docRef = db.collection('users').doc(user.uid);
    const doc = await docRef.get();

    if (!doc.exists) {
      // New user (usually Google)
      await docRef.set({
        name: user.displayName || '',
        email: user.email,
        photoURL: user.photoURL || '',
        class: '',
        board: '',
        medium: '',
        language: '',
        onboarded: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      AppState.user = {
        name: user.displayName || '',
        email: user.email,
        class: '',
        board: '',
        medium: '',
        language: ''
      };
      showOnboarding();
      return;
    }

    const data = doc.data();

    AppState.user = {
      name: data.name || user.displayName || '',
      email: data.email || user.email,
      class: data.class || '',
      board: data.board || '',
      medium: data.medium || '',
      language: data.language || ''
    };

    if (data.onboarded === true) {
      AppState.isOnboarded = true;
      showMainApp();
    } else {
      showOnboarding();
    }

  } catch (error) {
    console.error('Error handling login:', error);
    alert('Something went wrong. Please try again.');
  }
}
