// Firebase Configuration
// This file contains Firebase project configuration and initialization

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

/**
 * Firebase Configuration
 *
 * To setup:
 * 1. Create Firebase project at https://console.firebase.google.com/
 * 2. Go to Project Settings > General
 * 3. Add web app and copy configuration
 * 4. Add values to .env.local:
 *    NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
 *    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
 *    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
 *    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
 *    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
 *    NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
 *    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id (optional)
 * 5. Update public/firebase-messaging-sw.js with same values
 */
export const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Validate Firebase configuration
 * @returns true if all required fields are present
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
}

/**
 * VAPID Key for Web Push (from Firebase Console > Cloud Messaging > Web Push certificates)
 * Add to .env.local as NEXT_PUBLIC_FIREBASE_VAPID_KEY
 */
export const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';
