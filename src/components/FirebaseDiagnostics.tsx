import React, { useState, useEffect } from 'react';
import { getApp } from 'firebase/app';
import { collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, listAll } from 'firebase/storage';
import { db } from '../lib/firebase';
import { areaService } from '../services/dataService';
import { Area } from '../types';

export default function FirebaseDiagnostics() {
  const [firebaseConnected, setFirebaseConnected] = useState<'Yes' | 'No' | 'Loading'>('Loading');
  const [firestoreConnected, setFirestoreConnected] = useState<'Yes' | 'No' | 'Loading'>('Loading');
  const [storageConnected, setStorageConnected] = useState<'Yes' | 'No' | 'Loading'>('Loading');
  const [regionsLoadedCount, setRegionsLoadedCount] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [allAreas, setAllAreas] = useState<Area[]>([]);
  const [snapshotSize, setSnapshotSize] = useState<number | null>(null);
  const [firstDocData, setFirstDocData] = useState<any>(null);
  const [totalFetchedCount, setTotalFetchedCount] = useState<number | null>(null);

  // Load configs
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const runDiagnostics = async () => {
    console.log("--- STARTING FIREBASE DIAGNOSTICS REPORT ---");

    // 1. Firebase initialization status
    console.log("Firebase Initialization Status:", {
      apiKey: firebaseConfig.apiKey ? "PRESENT" : "MISSING",
      projectId: firebaseConfig.projectId ? "PRESENT" : "MISSING",
      appId: firebaseConfig.appId ? "PRESENT" : "MISSING",
      authDomain: firebaseConfig.authDomain ? "PRESENT" : "MISSING",
      storageBucket: firebaseConfig.storageBucket ? "PRESENT" : "MISSING",
      messagingSenderId: firebaseConfig.messagingSenderId ? "PRESENT" : "MISSING"
    });

    // 2. Print: console.log("Firebase Config", firebaseConfig)
    console.log("Firebase Config", firebaseConfig);

    // 5. Verify environment variables
    console.log("Environment Variables Checks:", {
      VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || "UNDEFINED",
      VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || "UNDEFINED",
      VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || "UNDEFINED",
      VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "UNDEFINED",
      VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "UNDEFINED",
      VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "UNDEFINED"
    });

    // Check Firebase base connection
    try {
      const app = getApp();
      if (app && firebaseConfig.projectId) {
        setFirebaseConnected('Yes');
        console.log("Firebase App initialized successfully:", app.name);
      } else {
        setFirebaseConnected('No');
      }
    } catch (e: any) {
      console.error("Firebase App initialization failed:", e);
      setFirebaseConnected('No');
    }

    // 3. Verify Firestore connection:
    //    - Read from areas collection
    //    - Log number of documents returned
    try {
      setFirestoreConnected('Loading');
      const areasSnapshot = await getDocs(collection(db, 'areas'));
      const docCount = areasSnapshot.size;
      setRegionsLoadedCount(docCount);
      setFirestoreConnected('Yes');
      console.log("Firestore Connected successfully. Number of area documents returned:", docCount);
    } catch (error: any) {
      setFirestoreConnected('No');
      console.error("Firestore error", error);
    }

    // 4. Verify Storage connection:
    //    - Attempt to access storage bucket
    //    - Log storage bucket name
    //    - Log any permission errors
    try {
      setStorageConnected('Loading');
      const storage = getStorage();
      const bucketName = storage.app.options.storageBucket || "n/a";
      console.log("Attempting to access Storage bucket:", bucketName);
      
      // Access storage root list
      const storageRef = ref(storage);
      await listAll(storageRef);
      setStorageConnected('Yes');
      console.log("Storage Connected successfully.");
    } catch (error: any) {
      // Accessing root of a bucket might fail due to listAll restrictions,
      // but we treat this as permission/auth issue and log the error.
      console.error("Firestore error", error);
      if (error && error.code !== 'storage/unauthorized') {
        setStorageConnected('Yes');
      } else {
        setStorageConnected('No');
      }
    }

    console.log("--- END FIREBASE DIAGNOSTICS REPORT ---");
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  useEffect(() => {
    const unsubscribe = areaService.listenToAreas((fetched) => {
      setAllAreas(fetched);
      setSnapshotSize(fetched.length);
      setTotalFetchedCount(fetched.length);
      setFirstDocData(fetched.length > 0 ? fetched[0] : null);
    });
    return () => unsubscribe();
  }, []);

  // Only render on development environment
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div id="firebase-diagnostics-container" className="fixed bottom-4 right-4 z-[9999] font-sans">
      {/* Mini Toggle Button */}
      {!isOpen && (
        <button
          id="firebase-diagnostics-toggle-btn"
          onClick={() => setIsOpen(true)}
          className="bg-[#5469D4] hover:bg-[#4353B2] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-1.5 transition-all duration-200 border border-[#4353B2]/20 cursor-pointer"
        >
          <span>🛠️</span>
          <span>Firebase Diagnostics</span>
        </button>
      )}

      {/* Main Panel */}
      {isOpen && (
        <div id="firebase-diagnostics-panel" className="bg-white rounded-3xl p-5 shadow-2xl border border-[#E3E8EE] w-72 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between border-b border-[#F4F6F8] pb-2.5">
            <span className="text-xs font-bold text-[#1A1F36] uppercase tracking-wider flex items-center gap-1.5">
              <span>🛠️</span> Diagnostics Panel
            </span>
            <button
              id="firebase-diagnostics-close-btn"
              onClick={() => setIsOpen(false)}
              className="text-[#697386] hover:text-[#1A1F36] text-sm font-semibold p-1 hover:bg-[#F4F6F8] rounded-lg transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#1A1F36] border-b border-[#F7F9FC] pb-1.5">
              <span className="text-[#697386] font-medium">Firebase Connected:</span>
              <span id="diagnostics-firebase-status" className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                firebaseConnected === 'Yes' ? 'bg-[#33CC66]/10 text-[#33CC66]' :
                firebaseConnected === 'No' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
              }`}>
                {firebaseConnected}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-[#1A1F36] border-b border-[#F7F9FC] pb-1.5">
              <span className="text-[#697386] font-medium">Firestore Connected:</span>
              <span id="diagnostics-firestore-status" className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                firestoreConnected === 'Yes' ? 'bg-[#33CC66]/10 text-[#33CC66]' :
                firestoreConnected === 'No' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
              }`}>
                {firestoreConnected}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-[#1A1F36] border-b border-[#F7F9FC] pb-1.5">
              <span className="text-[#697386] font-medium">Storage Connected:</span>
              <span id="diagnostics-storage-status" className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                storageConnected === 'Yes' ? 'bg-[#33CC66]/10 text-[#33CC66]' :
                storageConnected === 'No' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
              }`}>
                {storageConnected}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-[#1A1F36] border-b border-[#F7F9FC] pb-1.5">
              <span className="text-[#697386] font-medium">Areas Loaded Count:</span>
              <span id="diagnostics-areas-count" className="font-mono font-bold text-[#1A1F36] bg-[#F4F6F8] px-2 py-0.5 rounded-lg border border-[#E3E8EE] text-[11px]">
                {regionsLoadedCount === null ? "0" : regionsLoadedCount}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-[#1A1F36] border-b border-[#F7F9FC] pb-1.5">
              <span className="text-[#697386] font-medium">Snapshot Size:</span>
              <span id="diagnostics-snapshot-size" className="font-mono font-bold text-blue-600 bg-[#E5F1FF] px-2 py-0.5 rounded-lg border border-[#B3D7FF] text-[11px]">
                {snapshotSize !== null ? snapshotSize : "0"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-[#1A1F36] border-b border-[#F7F9FC] pb-1.5">
              <span className="text-[#697386] font-medium">Total Fetched Count:</span>
              <span id="diagnostics-fetched-count" className="font-mono font-bold text-indigo-600 bg-[#EBF0FF] px-2 py-0.5 rounded-lg border border-[#C2D1FF] text-[11px]">
                {totalFetchedCount !== null ? totalFetchedCount : "0"}
              </span>
            </div>

            <div className="text-xs text-[#1A1F36] border-b border-[#F7F9FC] pb-1.5 space-y-1">
              <span className="text-[#697386] font-medium block">First Document Data:</span>
              <pre id="diagnostics-first-doc" className="text-[9px] font-mono bg-[#F4F6F8] p-2 rounded-xl border border-[#D3DBE6] overflow-x-auto max-h-20 whitespace-pre-wrap break-all">
                {firstDocData ? JSON.stringify(firstDocData, null, 2) : "No documents loaded / empty."}
              </pre>
            </div>

            {allAreas.length > 0 && (
              <div id="diagnostics-unfiltered-first-10-areas" className="mt-3 pt-3 border-t border-[#F4F6F8] space-y-1.5">
                <span className="text-[10px] font-bold text-[#4F5B66] uppercase tracking-wider block">First 10 Areas Documents (No Filter)</span>
                <div className="max-h-36 overflow-y-auto space-y-1 bg-[#F4F6F8] p-2 rounded-2xl border border-[#D3DBE6]">
                  {allAreas.slice(0, 10).map((a, idx) => (
                    <div key={a.id || idx} className="text-[10px] font-mono text-[#1A1F36] border-b border-[#E3E8EE] last:border-b-0 pb-1 mb-1 last:pb-0 last:mb-0">
                      <div><strong className="text-[#697386]">ID:</strong> <span className="break-all">{a.id}</span></div>
                      <div><strong className="text-[#697386]">Name:</strong> {a.areaName}</div>
                      <div><strong className="text-[#697386]">City:</strong> {a.city}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            id="firebase-diagnostics-run-btn"
            onClick={runDiagnostics}
            className="w-full bg-[#E5F1FF] hover:bg-[#D4E8FF] text-[#0066CC] font-bold text-[11px] py-2 rounded-xl transition-colors border border-[#0066CC]/10 cursor-pointer"
          >
            🔄 Run Full Inspection
          </button>
        </div>
      )}
    </div>
  );
}
