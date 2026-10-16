// src/services/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración de compatibilidad para el SDK de Firebase
// Evita errores de tipo en tiempo de ejecución mientras se termina la migración hacia MongoDB API
const firebaseConfig = {
  apiKey: "AIzaSyMockKeyForPristineCompatibilityOnly",
  authDomain: "pristine-app.firebaseapp.com",
  projectId: "pristine-app",
  storageBucket: "pristine-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

const firebaseServices = { db, storage };
export default firebaseServices;
