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
import { db, auth } from '../lib/firebase';
import { UserProfile, Listing, Message, Chat } from '../types';

// Error Handler
const handleFirestoreError = (error: any, operation: string, path: string | null) => {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operation,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    }
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

export const userService = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    try {
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
      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, {
        ...profile,
        uid,
        acceptedTerms: false,
        role: profile.role || 'user',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, 'write', `users/${uid}`);
    }
  },

  async updateProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, updates);
    } catch (error) {
      handleFirestoreError(error, 'update', `users/${uid}`);
    }
  },

  listenToProfile(uid: string, callback: (profile: UserProfile | null) => void) {
    const docRef = doc(db, 'users', uid);
    return onSnapshot(docRef, (doc) => {
      callback(doc.exists() ? (doc.data() as UserProfile) : null);
    }, (error) => {
      handleFirestoreError(error, 'listen', `users/${uid}`);
    });
  },

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      handleFirestoreError(error, 'list', 'users');
      return [];
    }
  }
};

export const listingService = {
  async createListing(listing: Omit<Listing, 'id'>): Promise<string> {
    try {
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
    const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing)));
    }, (error) => {
      handleFirestoreError(error, 'list', 'listings');
    });
  }
};

export const paymentService = {
  async recordPayment(payment: any): Promise<void> {
    try {
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
      const querySnapshot = await getDocs(collection(db, 'payments'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, 'list', 'payments');
      return [];
    }
  }
};
