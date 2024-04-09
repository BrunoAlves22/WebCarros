import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB2_48aK1aKQqYxl4P9xa4jxqfg3DROK4w",
  authDomain: "web-carros-9ba65.firebaseapp.com",
  projectId: "web-carros-9ba65",
  storageBucket: "web-carros-9ba65.appspot.com",
  messagingSenderId: "82179564027",
  appId: "1:82179564027:web:59a309f14398a2252b2b5e",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
