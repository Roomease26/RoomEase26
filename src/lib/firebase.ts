import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validation of required keys
const requiredKeys = ['apiKey', 'projectId', 'appId'] as const;
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

let db: any = null;
let auth: any = null;
let isFirebaseConfigured = false;

if (missingKeys.length > 0) {
  console.warn(`[Firebase] ⚠️ Missing critical configuration keys: ${missingKeys.join(', ')}`);
  console.warn('[Firebase] Features requiring database will be disabled.');
  // Mock auth to prevent immediate crashes in components
  auth = { currentUser: null };
} else {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)';
    db = getFirestore(app, databaseId);
    auth = getAuth(app);
    isFirebaseConfigured = true;
    console.log('[Firebase] ✅ Initialization successful');
  } catch (error) {
    console.error('[Firebase] ❌ Initialization error:', error);
    auth = { currentUser: null };
  }
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
