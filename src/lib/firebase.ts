import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

console.log("API KEY:", import.meta.env.VITE_FIREBASE_API_KEY);
console.log("PROJECT ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log("APP ID:", import.meta.env.VITE_FIREBASE_APP_ID);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let db: any = null;
let auth: any = null;
const isFirebaseConfigured = true;

try {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)';
  db = getFirestore(app, databaseId);
  auth = getAuth(app);
  console.log('[Firebase] ✅ Initialization successful');
} catch (error) {
  console.error('[Firebase] ❌ Initialization error:', error);
  auth = { currentUser: null };
}

export { db, auth, isFirebaseConfigured };

// Connectivity Test
async function testConnection() {
  if (!isFirebaseConfigured || !db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] 📡 Connection test successful');
  } catch (error: any) {
    if (error.message?.includes('the client is offline')) {
      console.warn("[Firebase] 📵 Client is offline or config is invalid.");
    }
  }
}

testConnection();
