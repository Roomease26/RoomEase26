import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
  type DocumentData
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from '../lib/firebase';
import { UserProfile, Listing, Message, Chat } from '../types';

// Error Handler
const handleFirestoreError = (error: any, operation: string, path: string | null) => {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operation,
    path,
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
    }
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  // Don't re-throw, just let the caller handle null/[]
};

const checkConfig = () => {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured. Please check your environment variables.');
  }
};

export const userService = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    try {
      checkConfig();
      const docRef = doc(db, 'Users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
    } catch (error) {
      handleFirestoreError(error, 'get', `Users/${uid}`);
      return null;
    }
  },

  async createProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
    try {
      checkConfig();
      const docRef = doc(db, 'Users', uid);
      await setDoc(docRef, {
        ...profile,
        uid,
        acceptedTerms: false,
        role: profile.role || 'user',
        createdAt: serverTimestamp(),
      });
      console.log('[Users] Profile created in Firestore for:', uid);
    } catch (error) {
      handleFirestoreError(error, 'write', `Users/${uid}`);
    }
  },

  async updateProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      checkConfig();
      const docRef = doc(db, 'Users', uid);
      await updateDoc(docRef, updates);
      console.log('[Users] Profile updated in Firestore for:', uid);
    } catch (error) {
      handleFirestoreError(error, 'update', `Users/${uid}`);
    }
  },

  listenToProfile(uid: string, callback: (profile: UserProfile | null) => void) {
    if (!isFirebaseConfigured || !db) {
      console.warn('[Firebase] Profile listener skipped: Firebase not configured');
      return () => {};
    }
    try {
      const docRef = doc(db, 'Users', uid);
      return onSnapshot(docRef, (doc) => {
        callback(doc.exists() ? (doc.data() as UserProfile) : null);
      }, (error) => {
        handleFirestoreError(error, 'listen', `Users/${uid}`);
      });
    } catch (error) {
      handleFirestoreError(error, 'listen-init', `Users/${uid}`);
      return () => {};
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      checkConfig();
      const querySnapshot = await getDocs(collection(db, 'Users'));
      return querySnapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      handleFirestoreError(error, 'list', 'Users');
      return [];
    }
  }
};

export const listingService = {
  async createListing(listing: Omit<Listing, 'id'>): Promise<string> {
    try {
      checkConfig();
      const docRef = await addDoc(collection(db, 'listings'), {
        ...listing,
        createdAt: new Date().toISOString(), // Keeping string format as per blueprint
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'write', 'listings');
      return '';
    }
  },

  listenToListings(callback: (listings: Listing[]) => void) {
    if (!isFirebaseConfigured || !db) {
      console.warn('[Firebase] Listings listener skipped: Firebase not configured');
      return () => {};
    }
    try {
      const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing)));
      }, (error) => {
        handleFirestoreError(error, 'list', 'listings');
      });
    } catch (error) {
      handleFirestoreError(error, 'list-init', 'listings');
      return () => {};
    }
  }
};

export const paymentService = {
  async recordPayment(payment: any): Promise<void> {
    try {
      checkConfig();
      await addDoc(collection(db, 'payments'), {
        ...payment,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, 'write', 'payments');
    }
  },

  async getAllPayments(): Promise<any[]> {
    try {
      checkConfig();
      const querySnapshot = await getDocs(collection(db, 'payments'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, 'list', 'payments');
      return [];
    }
  }
};
