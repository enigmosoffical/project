import React, { useState, useEffect } from 'react';
import { getSearchSuggestions } from '../lib/openrouter';

interface SearchSuggestionsProps {
  query: string;
  onSuggestionClick: (suggestion: string) => void;
}

export default function SearchSuggestions({ query, onSuggestionClick }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length > 2) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const suggestions = await getSearchSuggestions(query);
      setSuggestions(suggestions.slice(0, 3)); // Limit to 3 suggestions
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  if (!query.trim() || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {loading ? (
        <div className="p-4 text-center text-gray-500">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      ) : (
        <ul className="py-2">
          {suggestions.map((suggestion, index) => (
            <li 
              key={index} 
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
              onClick={() => onSuggestionClick(suggestion)}
            >
              <span className="text-gray-700">{suggestion}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}