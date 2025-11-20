import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SplashScreen from './SplashScreen';

export default function SplashPage() {
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation() as any;
  const backTo = location.state?.from || '/';

  const onComplete = useCallback(() => {
    try {
      localStorage.setItem('smartpyq_splash_seen', '1');
    } catch {}
    setDone(true);
  }, []);

  useEffect(() => {
    if (done) {
      navigate(backTo, { replace: true });
    }
  }, [done, backTo, navigate]);

  return <SplashScreen onComplete={onComplete} />;
}
