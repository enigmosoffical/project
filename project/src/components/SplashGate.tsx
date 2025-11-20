import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SplashGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const seen = localStorage.getItem('smartpyq_splash_seen') === '1';
    if (!seen && location.pathname === '/') {
      navigate('/splash', { replace: true, state: { from: '/' } });
    }
  }, [location.pathname, navigate]);

  return <>{children}</>;
}
