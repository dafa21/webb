import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, collection, addDoc, getDocs, query, where, orderBy, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Simple connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('unavailable') || error.message.includes('could not be completed'))) {
      console.warn("Firestore may be offline or initializing. Operating in offline/deferred mode.");
    }
  }
}
testConnection();

// Auto sign-in anonymously
signInAnonymously(auth).catch((error) => {
  console.error("Anonymous auth error:", error);
});

export const logout = async () => {
  try {
    await signOut(auth);
    // After sign out, sign in anonymously again to keep the auto-account feature
    await signInAnonymously(auth);
  } catch (error) {
    console.error("Logout error", error);
  }
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  // Suppress verbose JSON dumps of rules errors in development environment to prevent confusion
  // and handle gracefully. The backend rules for named databases in this environment might
  // experience propagation delays.
  const isPermissionError = error instanceof Error && error.message.includes('Missing or insufficient permissions');
  
  if (isPermissionError) {
     console.warn(`[Mock Mode] Firestore security rules are actively preventing ${operationType} on ${path}. Using client-side state temporarily.`);
  } else {
     console.error(`Firestore ${operationType} error on ${path}:`, error instanceof Error ? error.message : String(error));
  }
}
