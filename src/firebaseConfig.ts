import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if API key is provided
export const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY !== "YOUR_API_KEY";

let auth: any = null;
let googleProvider: any = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase initialization failed", error);
  }
}

export { auth, googleProvider };

export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured || !auth) {
    console.warn("Firebase is not configured. Falling back to Demo Login.");
    // Return a mock user for demo purposes
    return {
      uid: "demo_user_123",
      email: "demo@example.com",
      displayName: "Demo User",
      phoneNumber: "+91 99999 99999"
    };
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/unauthorized-domain') {
      const domain = window.location.hostname;
      console.error(`Unauthorized domain: ${domain}. Please add this domain to your Firebase Console > Authentication > Settings > Authorized domains.`);
      
      // Automatic fallback to demo mode to unblock the user, but with a clear warning
      console.warn("Falling back to Demo Mode due to unauthorized domain.");
      alert("Authorization not working or connected. Using Demo Mode.");
      return {
        uid: "demo_user_123",
        email: "demo@example.com",
        displayName: "Demo User (Domain Fallback)",
        phoneNumber: "+91 99999 99999"
      };
    }
    console.error("Error signing in with Google", error);
    throw error;
  }
};
