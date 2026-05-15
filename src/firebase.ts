import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDocFromServer, collection, addDoc, getDocs, query, where, orderBy, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings optimized for connectivity
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

let isConnected = true;
const listeners: ((status: boolean) => void)[] = [];

export const onConnectionChange = (callback: (status: boolean) => void) => {
  listeners.push(callback);
  callback(isConnected);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
};

const updateConnectionStatus = (status: boolean) => {
  if (isConnected !== status) {
    isConnected = status;
    listeners.forEach(l => l(status));
  }
};

// Simple connection test with better diagnostics
async function testConnection() {
  try {
    // Try to get a document from the server to verify connectivity
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connected successfully.");
    updateConnectionStatus(true);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline') || error.message.includes('unavailable')) {
        console.warn("Firestore is currently unreachable. The app will continue in offline mode and sync when the connection is restored.");
        updateConnectionStatus(false);
      } else {
        console.error("Firestore initialization error:", error.message);
      }
    }
  }
}
testConnection();

export const logout = async () => {
  try {
    await signOut(auth);
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
