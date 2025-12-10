import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB3vNxFx_EX3fVIk3ghtL8_pXcCYmgjl3c",
    authDomain: "rampup---backend.firebaseapp.com",
    projectId: "rampup---backend",
    storageBucket: "rampup---backend.firebasestorage.app",
    messagingSenderId: "378965390998",
    appId: "1:378965390998:web:45bb8a08dea15c7d0934b7",
    measurementId: "G-S29SZHW3FV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy };
