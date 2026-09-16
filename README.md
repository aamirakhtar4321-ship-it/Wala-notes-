# Notes Wallah - Part 2

Firebase Auth + Google Login + Firestore connected.

## What is working now

- Real Email + Password Login / Signup
- Continue with Google (Firebase Google Sign-In)
- Forgot Password
- User profile saved in Firestore (`users` collection)
- Onboarding data saved permanently
- Session stays logged in (even after refresh)
- Logout works
- Dark Mode
- Bottom Navigation

## Important Firebase Console Setup (Do these)

1. **Authentication → Sign-in method**
   - Enable **Email/Password**
   - Enable **Google**

2. **Authentication → Settings → Authorized domains**
   - Add `localhost`
   - Add your domain if you deploy (e.g. github.io or netlify.app)

3. **Firestore Database**
   - Create database in **test mode** for now (or add proper rules later)
   - Collection `users` will be created automatically

## How to Test

1. Open `index.html` in browser (or use Live Server)
2. Create account with Email or use Google Login
3. Complete Onboarding
4. Check Firebase Console → Authentication (users should appear)
5. Check Firestore → `users` collection

## Folder Structure

```
notes-wallah/
├── index.html
├── css/
│   ├── style.css
│   └── auth.css
├── js/
│   ├── firebase.js      ← Firebase config + init
│   ├── app.js
│   ├── auth.js
│   └── navigation.js
├── assets/
└── README.md
```

## Next: Part 3
- Study section (Subjects + Chapters from Firestore)
- Chapter detail page
- Ebook links
- Pro Notes structure (with Ad placeholder)
