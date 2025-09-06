import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore, connectFirestoreEmulator, enableNetwork } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC806ychAM-QALsQb0p__vNZuFB6lRU-Dg",
  authDomain: "scribly-25a1d.firebaseapp.com",
  projectId: "scribly-25a1d",
  storageBucket: "scribly-25a1d.appspot.com",
  messagingSenderId: "811129718824",
  appId: "1:811129718824:web:5ab513ce99fae4a7c00d1d",
  measurementId: "G-DEET4HHWRZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);

// Configure auth settings
provider.setCustomParameters({
  prompt: "select_account"
});

// Enable network persistence
auth.useDeviceLanguage();

// Helper function to wait for authentication state to be determined
export const waitForAuth = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Helper function to ensure user is authenticated before Firestore operations
export const ensureAuth = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        reject(new Error('User not authenticated. Please sign in.'));
      }
    });
  });
};

// Helper function to get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return auth.currentUser !== null;
};

export default app;