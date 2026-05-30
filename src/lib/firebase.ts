import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate environment variables and log missing ones clearly
const requiredKeys = ["apiKey", "projectId", "appId"] as const;
const missingConfigKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingConfigKeys.length > 0) {
  console.error(`[Firebase Configuration Error] Missing critical env variables: ${missingConfigKeys.map(k => `VITE_FIREBASE_${k.toUpperCase()}`).join(", ")}`);
} else {
  console.log("[Firebase] Environment variables validated successfully.");
}

console.log("firebaseConfig:", firebaseConfig);

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
console.log("Firestore Database:", "(default)");
export const db = getFirestore(app);
export const isFirebaseConfigured = true;

export default app;
