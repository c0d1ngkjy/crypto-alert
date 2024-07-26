import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyB0n4-2hGsHU4eQAKWaEsYU8lfRcsGzRrs",
  authDomain: "cryptolert-946b0.firebaseapp.com",
  projectId: "cryptolert-946b0",
  storageBucket: "cryptolert-946b0.appspot.com",
  messagingSenderId: "85483920473",
  appId: "1:85483920473:web:414341fe8de38f0a8f6548",
  measurementId: "G-ZYWJ66X6HZ"
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db }
