import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Ensure onComplete is called even if there are issues with the fade out animation
      setTimeout(() => {
        try {
          onComplete();
        } catch (error) {
          console.error('Error in onComplete callback:', error);
          // Fallback: set isVisible to false to hide splash screen
          setIsVisible(false);
        }
      }, 500); // Wait for fade out animation
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [onComplete]);

  // Add a safety mechanism to ensure the splash screen doesn't block the app indefinitely
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (isVisible) {
        console.warn('Splash screen timeout - forcing completion');
        setIsVisible(false);
        try {
          onComplete();
        } catch (error) {
          console.error('Error in onComplete callback:', error);
        }
      }
    }, 5000); // 5 second safety timeout

    return () => clearTimeout(safetyTimer);
  }, [isVisible, onComplete]);

  // Additional safety check to ensure splash screen doesn't block indefinitely
  if (!isVisible) {
    try {
      onComplete();
    } catch (error) {
      console.error('Error in onComplete callback:', error);
    }
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="text-center">
        {/* Animated Logo */}
        <div className="mb-8 relative">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 animate-bounce">
            <BookOpen className="h-12 w-12 text-white animate-pulse" />
          </div>
          
          {/* Ripple Effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 border-4 border-white/30 rounded-full animate-ping"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-white/20 rounded-full animate-ping animation-delay-300"></div>
          </div>
        </div>

        {/* Brand Name with Typewriter Effect */}
        <div className="mb-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 animate-fade-in-up">
            Smart<span className="text-teal-200">PYQ</span>
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-white to-teal-200 mx-auto rounded-full animate-expand"></div>
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-white/90 font-light animate-fade-in-up animation-delay-500">
          Find Any PYQ in Seconds
        </p>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2 mt-8 animate-fade-in-up animation-delay-700">
          <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce animation-delay-200"></div>
          <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce animation-delay-400"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-white/30 rounded-full animate-float"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-teal-200/40 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute bottom-32 left-32 w-2 h-2 bg-white/20 rounded-full animate-float animation-delay-1500"></div>
        <div className="absolute bottom-20 right-20 w-4 h-4 bg-blue-200/30 rounded-full animate-float animation-delay-2000"></div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/5 to-transparent transform rotate-12"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-transparent via-white/5 to-transparent transform -rotate-12"></div>
      </div>
    </div>
  );
}