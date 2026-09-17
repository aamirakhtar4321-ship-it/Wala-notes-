/* ==================== FIREBASE CONFIG & INIT ==================== */

const firebaseConfig = {
  apiKey: "AIzaSyDb-pqTuhDcv3F7heNkpQbu2WtJB0-sK5s",
  authDomain: "notes-wallah-5a325.firebaseapp.com",
  projectId: "notes-wallah-5a325",
  storageBucket: "notes-wallah-5a325.firebasestorage.app",
  messagingSenderId: "225175338742",
  appId: "1:225175338742:web:c3356213df5dad4ac2b6d7",
  measurementId: "G-G78ZKYVHF5"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch((error) => console.error("Persistence error:", error));

console.log("Firebase initialized successfully");

// Storage (for product images - admin upload later)
const storage = firebase.storage ? firebase.storage() : null;

