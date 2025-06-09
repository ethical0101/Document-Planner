// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "document-planner.firebaseapp.com",
  projectId: "document-planner",
  storageBucket: "document-planner.appspot.com",
  messagingSenderId: "713420393238",
  appId: "1:713420393238:web:a3c71cb22f873a0d179e37",
  measurementId: "G-7T5N5VK4LQ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Only initialize analytics in the browser and if supported
export async function getAnalyticsIfSupported() {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    try {
      const supported = await isSupported();
      if (supported) {
        return getAnalytics(app);
      }
    } catch (e) {
      // Analytics not supported or failed to initialize
      return null;
    }
  }
  return null;
}
