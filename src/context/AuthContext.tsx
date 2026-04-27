import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { OperationType, handleFirestoreError } from '../lib/utils';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isPortalAccess: boolean;
  loading: boolean;
  mainPassword: string;
  setPortalAccess: (access: boolean) => void;
  adminLogin: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPortalAccess, setIsPortalAccess] = useState(() => {
    return localStorage.getItem('unity_portal_access') === 'true';
  });
  const [mainPassword, setMainPassword] = useState('unity2025');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync portal access with local storage
    localStorage.setItem('unity_portal_access', String(isPortalAccess));
  }, [isPortalAccess]);

  useEffect(() => {
    // Listen to settings
    const unsubSettings = onSnapshot(doc(db, 'configs', 'settings'), (snap) => {
      if (snap.exists()) {
        setMainPassword(snap.data().mainPassword || 'unity2025');
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'configs/settings');
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Hardcoded admin check to match firestore.rules
        if (user.email === 'kazih6684@gmail.com') {
          setIsAdmin(true);
        } else {
          const adminDoc = await getDoc(doc(db, 'configs', 'admin'));
          if (adminDoc.exists()) {
            const adminEmails = adminDoc.data().adminEmails || [];
            setIsAdmin(adminEmails.includes(user.email));
          }
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubSettings();
    };
  }, []);

  const adminLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Admin Login Failed', error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setIsPortalAccess(false);
    localStorage.removeItem('unity_portal_access');
  };

  const setPortalAccess = async (access: boolean) => {
    if (access && !user) {
      try {
        await signInAnonymously(auth);
      } catch (error: any) {
        if (error.code === 'auth/admin-restricted-operation') {
          console.warn('Anonymous Authentication is not enabled in Firebase Console. Please enable it to allow guest bookings.');
        } else {
          console.error('Anonymous Sign-in failed', error);
        }
      }
    }
    setIsPortalAccess(access);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      isPortalAccess, 
      loading, 
      mainPassword, 
      setPortalAccess,
      adminLogin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
