import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Firebase web configuration. These values identify the Firebase project and
// are safe to expose to the browser; access is governed by Firestore rules.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "document-planner.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "document-planner",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "document-planner.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "713420393238",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:713420393238:web:a3c71cb22f873a0d179e37",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-7T5N5VK4LQ",
};

// Reuse the existing app during hot reloads instead of initializing twice.
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Only initialize analytics in the browser and if supported
export async function getAnalyticsIfSupported() {
  if (typeof window === "undefined") return null;
  try {
    return (await isSupported()) ? getAnalytics(app) : null;
  } catch {
    return null;
  }
}
