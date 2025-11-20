import React from 'react';
import { motion } from 'framer-motion';
import { FileX, Search } from 'lucide-react';

interface EmptyStateProps {
  searchQuery?: string;
  selectedStream?: string;
}

export default function EmptyState({ searchQuery, selectedStream }: EmptyStateProps) {
  const getMessage = () => {
    if (searchQuery && selectedStream) {
      return `No papers found for "${searchQuery}" in ${selectedStream}`;
    } else if (searchQuery) {
      return `No papers found for "${searchQuery}"`;
    } else if (selectedStream) {
      return `No papers available for ${selectedStream} yet`;
    } else {
      return "No papers available yet";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Animated Icon */}
      <motion.div
        className="relative mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Main Icon Container */}
        <motion.div
          className="relative w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-lg"
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Sad Paper Icon */}
          <motion.div
            className="relative"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FileX className="w-16 h-16 text-gray-400" />
            
            {/* Animated Eyes */}
            <motion.div
              className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2"
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            >
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            </motion.div>
          </motion.div>

          {/* Floating Particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-200 rounded-full"
              style={{
                top: `${20 + i * 20}%`,
                left: `${10 + i * 30}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </motion.div>

        {/* Search Icon for Search Results */}
        {searchQuery && (
          <motion.div
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <Search className="w-4 h-4 text-blue-600" />
          </motion.div>
        )}
      </motion.div>

      {/* Message */}
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {getMessage()}
        </h3>
        <p className="text-gray-500 leading-relaxed">
          {searchQuery || selectedStream 
            ? "Try adjusting your search criteria or check back later."
            : "Papers will appear here once they are uploaded to the system."
          }
        </p>
      </motion.div>

      {/* Animated Dots */}
      <motion.div
        className="flex space-x-2 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-gray-300 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}