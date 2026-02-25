import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDQ1HZ5Y2BUZlCzKxHU0Qe0MxZnIdoeVCs",
  authDomain: "mini-hackathon-cf22c.firebaseapp.com",
  projectId: "mini-hackathon-cf22c",
  storageBucket: "mini-hackathon-cf22c.firebasestorage.app",
  messagingSenderId: "122704461347",
  appId: "1:122704461347:web:320fed94dbdcfab1687b96",
  measurementId: "G-4XKJNX3RFX",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
