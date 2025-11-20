import React, { useState, useEffect } from 'react';
import { analyzePYQPatterns } from '../lib/openrouter';
import { TrendingUp, Loader2 } from 'lucide-react';

interface PYQPatternAnalysisProps {
  examType: string;
  subject: string;
}

export default function PYQPatternAnalysis({ examType, subject }: PYQPatternAnalysisProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (examType && subject) {
      fetchAnalysis();
    }
  }, [examType, subject]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzePYQPatterns(examType, subject);
      setAnalysis(result || null);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError('Failed to load analysis. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Analyzing PYQ patterns...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={fetchAnalysis}
            className="mt-3 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">PYQ Pattern Analysis</h3>
      </div>
      
      <div className="prose prose-sm max-w-none">
        {analysis.split('\n').map((line, index) => {
          if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.')) {
            return <p key={index} className="font-medium text-gray-800">{line}</p>;
          }
          if (line.trim() === '') {
            return <br key={index} />;
          }
          return <p key={index} className="text-gray-700">{line}</p>;
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          <span className="font-medium">Tip:</span> Use these insights to prioritize your study topics and understand exam trends.
        </p>
      </div>
    </div>
  );
}