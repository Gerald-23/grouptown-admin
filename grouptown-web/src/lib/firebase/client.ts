import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

import firebaseConfig, { hasFirebaseConfig } from './config';

export function getFirebaseApp() {
  if (!hasFirebaseConfig()) {
    return null;
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getDb() {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

export function getAuthClient() {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export function getStorageClient() {
  const app = getFirebaseApp();
  return app ? getStorage(app) : null;
}

export function getFunctionsClient() {
  const app = getFirebaseApp();
  return app ? getFunctions(app) : null;
}
