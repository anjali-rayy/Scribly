import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

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

export default app;