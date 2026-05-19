import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const isFirebaseConfigured = true;

console.log('[Firebase] ✅ Initialization successful');

// Connectivity Test
async function testConnection() {
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
