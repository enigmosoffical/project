import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserRole } from '../lib/userRoles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async (user: any) => {
      if (user) {
        setAuthed(true);
        
        if (adminOnly && user.email) {
          const role = await getUserRole(user.email);
          setIsAdmin(role === 'admin');
        }
      } else {
        setAuthed(false);
        setIsAdmin(false);
      }
      setChecking(false);
    };

    const unsub = onAuthStateChanged(auth, checkAuth);
    return () => unsub();
  }, [adminOnly]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">Checking authentication...</div>
    );
  }

  if (!authed) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
