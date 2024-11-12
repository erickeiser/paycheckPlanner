import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBrvuv2a-a0sFL9mqshTpbAQ0-AHJoZCsQ",
  authDomain: "paycheck-planner-8decd.firebaseapp.com",
  projectId: "paycheck-planner-8decd",
  storageBucket: "paycheck-planner-8decd.firebasestorage.app",
  messagingSenderId: "442522974633",
  appId: "1:442522974633:web:5e4a1d9ba05adeeff42cb8",
  measurementId: "G-M5FPEGWFZ4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);