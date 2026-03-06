import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDD-gaBVfNuNO72Kd5K5QjW9Rz0BaRGpwY",
  authDomain: "inventory-eb89d.firebaseapp.com",
  databaseURL: "https://inventory-eb89d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "inventory-eb89d",
  storageBucket: "inventory-eb89d.firebasestorage.app",
  messagingSenderId: "112831552752",
  appId: "1:112831552752:web:4f20bd8fdcd93d6eb33635"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
