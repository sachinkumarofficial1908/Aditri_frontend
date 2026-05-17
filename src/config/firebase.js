import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const env = typeof process !== 'undefined' ? process.env || {} : {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyBXR9eyU3PjAqn-z6K6Kc7F1ajR0hq85vE',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'aditriconstructions-cb325.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'aditriconstructions-cb325',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'aditriconstructions-cb325.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '971441577401',
  appId: env.VITE_FIREBASE_APP_ID || '1:971441577401:web:3ecaa7f8a4964497202a68',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-7RK8234ZY3',
};

let firebaseAuth;

export const getFirebaseAuth = () => {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(`Firebase is missing required config: ${missingKeys.join(', ')}`);
  }

  if (!firebaseAuth) {
    const app = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(app);
  }

  return firebaseAuth;
};
