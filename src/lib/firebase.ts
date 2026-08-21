/**
 * -----------------------------------------------------------------------------
 * Firebase client SDK initialization
 * -----------------------------------------------------------------------------
 * Initializes the Firebase JS SDK for client-side analytics. It exists to
 * guarantee a single app instance across the React tree (Firebase throws if
 * `initializeApp` is called twice) and to safely no-op on the server or in
 * browsers where analytics is unsupported (e.g. extensions, blocked storage).
 *
 * Client components import `app`/`analytics` from here; config comes from
 * NEXT_PUBLIC_* env vars so it is inlined into the browser bundle.
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Public (browser-safe) Firebase project configuration.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Reuse the existing app instance if one was already initialized (HMR, RSC rerenders).
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Analytics only works in supported browsers; resolve to null otherwise so
// callers can simply guard with a falsy check instead of try/catch.
export const analytics = typeof window !== "undefined"
    ? isSupported().then((supported) => (supported ? getAnalytics(app) : null))
    : null;