import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function NavigationSplash() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show splash on every route change (except initial mount we can still show briefly)
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 700);
    return () => clearTimeout(t);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600">
      <div className="text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/15 backdrop-blur rounded-2xl">
            <span className="text-white text-3xl font-bold">SP</span>
          </div>
        </div>
        <h1 className="text-white text-3xl font-semibold">SmartPYQ</h1>
        <div className="flex justify-center space-x-2 mt-4">
          <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
          <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
        </div>
      </div>
    </div>
  );
}
