/* ==================== AUTH — SUPABASE ==================== */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  document.getElementById('go-to-signup')?.addEventListener('click', () => {
    loginForm?.classList.add('hidden');
    signupForm?.classList.remove('hidden');
  });
  document.getElementById('go-to-login')?.addEventListener('click', () => {
    signupForm?.classList.add('hidden');
    loginForm?.classList.remove('hidden');
  });

  document.getElementById('btn-login')?.addEventListener('click', async () => {
    if (!supabase) { alert('Supabase keys missing.\njs/supabase.js me URL + anon key paste karo'); return; }
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('btn-login');
    if (!email || !password) { alert('Email aur password daalo'); return; }
    btn.disabled = true; btn.textContent = 'Logging in...';
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      let m = error.message || 'Login failed';
      if (m.includes('Invalid login')) m = 'Wrong email or password';
      alert(m);
      btn.disabled = false; btn.textContent = 'Login';
    }
  });

  document.getElementById('btn-signup')?.addEventListener('click', async () => {
    if (!supabase) { alert('Supabase keys missing.\njs/supabase.js me URL + anon key paste karo'); return; }
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const btn = document.getElementById('btn-signup');
    if (!name || !email || !password) { alert('Sab fields bharo'); return; }
    if (password.length < 6) { alert('Password min 6 characters'); return; }
    btn.disabled = true; btn.textContent = 'Creating...';
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name } }
      });
      if (error) throw error;
      if (data.user) {
        const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name, email,
          onboarded: false,
          is_admin: isAdmin
        });
      }
      alert('Account ban gaya! Agar email confirm maange to check karo.');
    } catch (error) {
      alert(error.message || 'Signup failed');
    }
    btn.disabled = false; btn.textContent = 'Create Account';
  });

  async function googleLogin() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + window.location.pathname }
      });
      if (error) throw error;
    } catch (error) {
      alert(error.message || 'Google login failed');
    }
  }
  document.getElementById('btn-google')?.addEventListener('click', googleLogin);
  document.getElementById('btn-google-signup')?.addEventListener('click', googleLogin);

  document.getElementById('forgot-password')?.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    if (!email) { alert('Pehle email likho'); return; }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname
      });
      if (error) throw error;
      alert('Password reset link email pe bhej diya');
    } catch (e) {
      alert(e.message || 'Failed');
    }
  });

  document.getElementById('btn-onboard-complete')?.addEventListener('click', async () => {
    const name = document.getElementById('onboard-name').value.trim();
    const studentClass = document.getElementById('onboard-class').value;
    const board = document.getElementById('onboard-board').value;
    const medium = document.getElementById('onboard-medium').value;
    const language = document.getElementById('onboard-language')?.value || 'English';
    const btn = document.getElementById('btn-onboard-complete');
    if (!name || !studentClass || !board || !medium) {
      alert('Required fields bharo'); return;
    }
    btn.disabled = true; btn.textContent = 'Saving...';
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert('Session expired'); showAuth(); return; }
      const isAdmin = ADMIN_EMAILS.includes((user.email || '').toLowerCase());
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name, email: user.email,
        class: studentClass, board, medium, language,
        onboarded: true,
        is_admin: isAdmin,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      AppState.user = { id: user.id, name, email: user.email, class: studentClass, board, medium, language };
      AppState.isOnboarded = true;
      AppState.isAdmin = isAdmin;
      showMainApp();
    } catch (error) {
      alert('Profile save failed:\n' + (error.message || error));
    }
    btn.disabled = false; btn.textContent = 'Continue';
  });
});
