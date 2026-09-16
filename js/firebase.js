/* ==================== FIREBASE CONFIG & INIT ==================== */

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDb-pqTuhDcv3F7heNkpQbu2WtJB0-sK5s",
  authDomain: "notes-wallah-5a325.firebaseapp.com",
  projectId: "notes-wallah-5a325",
  storageBucket: "notes-wallah-5a325.firebasestorage.app",
  messagingSenderId: "225175338742",
  appId: "1:225175338742:web:c3356213df5dad4ac2b6d7",
  measurementId: "G-G78ZKYVHF5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Services
const auth = firebase.auth();
const db = firebase.firestore();

// Set persistence so user stays logged in
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch((error) => {
    console.error("Persistence error:", error);
  });

console.log("Firebase initialized successfully");
