import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBeuaD1H6LFvp8CY_jMvGZPj3pXDbzMsqk",
  authDomain: "paycheck-planner-51688.firebaseapp.com",
  projectId: "paycheck-planner-51688",
  storageBucket: "paycheck-planner-51688.firebasestorage.app",
  messagingSenderId: "1099364596381",
  appId: "1:1099364596381:web:175e72a6c53da4106cb274"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  
  if (error.code) {
    switch (error.code) {
      case 'permission-denied':
        return 'You don\'t have permission to perform this action';
      case 'not-found':
        return 'The requested resource was not found';
      case 'already-exists':
        return 'This resource already exists';
      case 'failed-precondition':
        return 'Operation failed due to the current system state';
      case 'resource-exhausted':
        return 'Request quota has been exceeded';
      case 'cancelled':
        return 'Operation was cancelled';
      case 'data-loss':
        return 'Unrecoverable data loss or corruption';
      case 'unknown':
        return 'Unknown error occurred';
      case 'invalid-argument':
        return 'Invalid argument provided';
      case 'deadline-exceeded':
        return 'Operation deadline exceeded';
      case 'unauthenticated':
        return 'User is not authenticated';
      default:
        return error.message || 'An unexpected error occurred';
    }
  }

  return error.message || 'An unexpected error occurred';
};