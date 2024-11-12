import { useState, useEffect } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Sign up error:', err);
      let message = 'An error occurred during sign up';
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      }
      setError(message);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Sign in error:', err);
      let message = 'An error occurred during sign in';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Invalid email or password';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later';
      }
      setError(message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
      setError('An error occurred during sign out');
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut
  };
}