import { initializeApp } from 'firebase/app';
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

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)';

// Validation and logging
const requiredVars = ['apiKey', 'projectId', 'appId'] as const;
const missing = requiredVars.filter(key => !firebaseConfig[key]);

if (missing.length > 0) {
  console.error('[Firebase] ❌ Missing critical environment variables:', missing.map(m => `VITE_FIREBASE_${m.replace(/([A-Z])/g, '_$1').toUpperCase()}`));
} else {
  console.log('[Firebase] ✅ Critical configuration found.');
}

let app;
let db: any = null;
let auth: any = null;
let isFirebaseConfigured = false;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, databaseId);
    auth = getAuth(app);
    isFirebaseConfigured = true;
    console.log('[Firebase] 🚀 Initialization successful');
  } else {
    // Fallback auth to prevent crashing
    auth = { currentUser: null };
    console.warn('[Firebase] ⚠️ Running in unconfigured mode. Features requiring database will be disabled.');
  }
} catch (error) {
  console.error('[Firebase] ❌ Initialization error:', error);
  auth = { currentUser: null };
}

export { db, auth, isFirebaseConfigured };

// Connectivity Test
async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Connection test successful');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("[Firebase] Check your configuration or internet connection.");
    } else {
      console.warn("[Firebase] Connection test warning (possibly expected if rules are strict):", error);
    }
  }
}
testConnection();
