import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDocFromServer, collection, addDoc, getDocs, query, where, orderBy, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with experimental long polling to improve connectivity in proxied environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId);

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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  const errorString = JSON.stringify(errInfo);
  console.error('Firestore Error: ', errorString);
  throw new Error(errorString);
}
