# Notes Wallah - Part 1

Clean educational web app foundation.

## Tech Stack
- HTML
- CSS
- JavaScript (Vanilla)
- No frameworks
- Firebase will be added in Part 2

## Features in Part 1
- Professional Splash Screen
- Login / Signup UI
- Continue with Google button (placeholder)
- Onboarding (Name, Class, Board, Medium, Language)
- Bottom Navigation (Home, Study, Test, Challenges, Account)
- Home screen with greeting + Quick Access
- Account page with Dark Mode toggle
- Dark Mode support
- Mobile-first responsive design
- Navy + Gold + Cream brand colors

## How to Run
1. Download all files
2. Open `index.html` in any modern browser
3. Or upload the whole folder to GitHub and use GitHub Pages / Netlify

## Temporary Auth
Currently using localStorage for demo.
Real Firebase Authentication will come in **Part 2**.

## Folder Structure
```
notes-wallah/
├── index.html
├── css/
│   ├── style.css
│   └── auth.css
├── js/
│   ├── app.js
│   ├── auth.js
│   └── navigation.js
├── assets/          (put logo here later)
└── README.md
```

## Next: Part 2
- Connect real Firebase (Auth + Firestore)
- Google Login working
- Save user profile in Firestore
- Subjects & Chapters from database
