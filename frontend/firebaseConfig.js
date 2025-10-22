import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC68J4sOSjjBbyynViwMuIRGEgBgHnRfWQ",
    authDomain: "delivery-web-app-90fc8.firebaseapp.com",
    projectId: "delivery-web-app-90fc8",
    storageBucket: "delivery-web-app-90fc8.firebasestorage.app",
    messagingSenderId: "379488235599",
    appId: "1:379488235599:web:497ee3e50fa981d9da3a3a",
  };

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
// const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
// export { auth, provider };