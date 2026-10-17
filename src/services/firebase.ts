// src/services/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración oficial de Firebase para el proyecto leaguer-2ed58
const firebaseConfig = {
  apiKey: "AIzaSyB_Xg-izwjWwpfDvNsEr6vkocE41lwDaoY",
  authDomain: "leaguer-2ed58.firebaseapp.com",
  projectId: "leaguer-2ed58",
  storageBucket: "leaguer-2ed58.appspot.com",
  messagingSenderId: "282705391182",
  appId: "1:282705391182:web:d95251f84ecfd860985d1f"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

const firebaseServices = { db, storage, app };
export default firebaseServices;
