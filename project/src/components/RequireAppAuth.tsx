import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function RequireAppAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthed(!!user);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  if (checking) {
    // Lightweight gate while checking
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur">
        <div className="animate-pulse text-gray-700">Loading…</div>
      </div>
    );
  }

  if (!authed) {
    // Force visiting auth before accessing the site
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
