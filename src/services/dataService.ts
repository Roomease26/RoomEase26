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
import { UserProfile, Listing, Message, Chat, Area, UserRole, City } from '../types';

// Error Handler
const handleFirestoreError = (error: any, operation: string, path: string | null) => {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType: operation,
    path,
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous
    }
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

const checkConfig = () => {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured. Please check your environment variables.');
  }
};

export const userService = {
  async getProfileByPhone(phone: string): Promise<UserProfile | null> {
    try {
      checkConfig();
      const q = query(collection(db, 'users'), where('phone', '==', phone));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      return querySnapshot.docs[0].data() as UserProfile;
    } catch (error) {
      handleFirestoreError(error, 'query', 'users(phone)');
      return null;
    }
  },

  async getProfileByUid(uid: string): Promise<UserProfile | null> {
    try {
      checkConfig();
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) return docSnap.data() as UserProfile;
      
      // Fallback: search by uid field if docId is not uid
      const q = query(collection(db, 'users'), where('uid', '==', uid));
      const qSnap = await getDocs(q);
      return qSnap.empty ? null : (qSnap.docs[0].data() as UserProfile);
    } catch (error) {
      handleFirestoreError(error, 'get', `users/${uid}`);
      return null;
    }
  },

  async getProfile(uidOrPhone: string): Promise<UserProfile | null> {
    // Attempt doc fetch first
    let profile = await this.getProfileByUid(uidOrPhone);
    if (!profile && uidOrPhone.length >= 10) {
      profile = await this.getProfileByPhone(uidOrPhone);
    }
    return profile;
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
      // Use setDoc with merge instead of updateDoc for better reliability
      await setDoc(docRef, updates, { merge: true });
      console.log('[Users] Profile updated in Firestore for:', uid);
    } catch (error) {
      handleFirestoreError(error, 'update', `users/${uid}`);
      throw error;
    }
  },

  listenToProfile(uid: string, callback: (profile: UserProfile | null) => void) {
    if (!isFirebaseConfigured || !db) {
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
  async addArea(area: any): Promise<string> {
    try {
      checkConfig();
      
      const docRef = await addDoc(collection(db, 'areas'), {
        city: area.city,
        areaName: area.areaName
      });
      
      console.log("Area saved", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Firestore error", error);
      handleFirestoreError(error, 'write', 'areas');
      throw error;
    }
  },

  async getAllAreas(): Promise<Area[]> {
    try {
      checkConfig();
      const querySnapshot = await getDocs(collection(db, 'areas'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Area));
    } catch (error) {
      console.error("Firestore error", error);
      throw error;
    }
  },

  listenToAreas(callback: (areas: Area[]) => void) {
    if (!isFirebaseConfigured || !db) return () => {};
    try {
      console.log("Collection path:", "areas");
      console.log("Collection queried:", "areas");
      const q = query(collection(db, 'areas'));
      return onSnapshot(q, (snapshot) => {
        console.log("Snapshot size:", snapshot.size);

        snapshot.forEach((doc) => {
          console.log("DOC ID:", doc.id);
          console.log("DOC DATA:", doc.data());
        });

        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Area));

        // Sort mapped areas alphabetically by city, then by areaName in JavaScript to avoid composite index requirements
        fetched.sort((a, b) => {
          const cityCompare = (a.city || '').localeCompare(b.city || '');
          if (cityCompare !== 0) return cityCompare;
          return (a.areaName || '').localeCompare(b.areaName || '');
        });

        console.log("Fetched array:", fetched);
        callback(fetched);
      }, (error) => {
        console.error('firestore list areas failed', error);
        handleFirestoreError(error, 'list', 'areas');
      });
    } catch (error) {
      console.error('firestore list areas init failed', error);
      handleFirestoreError(error, 'list-init', 'areas');
      return () => {};
    }
  },

  listenToAreasByCity(city: City, callback: (areas: Area[]) => void) {
    if (!isFirebaseConfigured || !db) return () => {};
    try {
      console.log("Querying areas for city:", city);
      const q = query(collection(db, 'areas'), where('city', '==', city));
      return onSnapshot(q, (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Area));
        // Sort mapped areas alphabetically by areaName in JavaScript to avoid index requirements
        fetched.sort((a, b) => (a.areaName || '').localeCompare(b.areaName || ''));
        console.log("Areas returned:", fetched);
        if (fetched.length === 0) {
          console.warn("No areas found for city:", city);
        }
        callback(fetched);
      }, (error) => {
        console.error('firestore list areas by city failed', city, error);
        handleFirestoreError(error, 'list', 'areas');
      });
    } catch (error) {
      console.error('firestore list areas by city init failed', city, error);
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
