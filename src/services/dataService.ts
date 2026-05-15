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
  deleteDoc,
  serverTimestamp,
  type DocumentData
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from '../lib/firebase';
import { UserProfile, Listing, Message, Chat, Area, UserRole } from '../types';

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
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
    } catch (error) {
      handleFirestoreError(error, 'get', `users/${uid}`);
      return null;
    }
  },

  async createProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
    try {
      checkConfig();
      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, {
        ...profile,
        uid,
        acceptedTerms: false,
        role: profile.role || 'finder',
        createdAt: serverTimestamp(),
      });
      console.log('[Users] Profile created in Firestore for:', uid);
    } catch (error) {
      handleFirestoreError(error, 'write', `users/${uid}`);
    }
  },

  async updateProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      checkConfig();
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, updates);
      console.log('[Users] Profile updated in Firestore for:', uid);
    } catch (error) {
      handleFirestoreError(error, 'update', `users/${uid}`);
    }
  },

  listenToProfile(uid: string, callback: (profile: UserProfile | null) => void) {
    if (!isFirebaseConfigured || !db) {
      console.warn('[Firebase] Profile listener skipped: Firebase not configured');
      return () => {};
    }
    try {
      const docRef = doc(db, 'users', uid);
      return onSnapshot(docRef, (doc) => {
        callback(doc.exists() ? (doc.data() as UserProfile) : null);
      }, (error) => {
        handleFirestoreError(error, 'listen', `users/${uid}`);
      });
    } catch (error) {
      handleFirestoreError(error, 'listen-init', `users/${uid}`);
      return () => {};
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      checkConfig();
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      handleFirestoreError(error, 'list', 'users');
      return [];
    }
  }
};

export const areaService = {
  async addArea(area: Omit<Area, 'id'>): Promise<string> {
    try {
      checkConfig();
      // Check for duplicates
      const q = query(
        collection(db, 'areas'), 
        where('city', '==', area.city), 
        where('areaName', '==', area.areaName)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        throw new Error('Area already exists in this city');
      }

      const docRef = await addDoc(collection(db, 'areas'), {
        ...area,
        createdAt: new Date().toISOString()
      });
      console.log('[Areas] New area added:', area.areaName);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'write', 'areas');
      throw error;
    }
  },

  listenToAreas(callback: (areas: Area[]) => void) {
    if (!isFirebaseConfigured || !db) return () => {};
    try {
      const q = query(collection(db, 'areas'), orderBy('city'), orderBy('areaName'));
      return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Area)));
      }, (error) => {
        handleFirestoreError(error, 'list', 'areas');
      });
    } catch (error) {
      handleFirestoreError(error, 'list-init', 'areas');
      return () => {};
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

  async deleteListing(listingId: string) {
    try {
      checkConfig();
      await deleteDoc(doc(db, 'listings', listingId));
    } catch (error) {
      handleFirestoreError(error, 'delete', 'listings');
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
