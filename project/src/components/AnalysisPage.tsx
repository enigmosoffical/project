import React, { useState } from 'react';
import PYQPatternAnalysis from './PYQPatternAnalysis';

export default function AnalysisPage() {
  const [examType, setExamType] = useState('JEE (Main & Advanced)');
  const [subject, setSubject] = useState('Physics');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PYQ Pattern Analysis</h1>
          <p className="text-gray-600">Choose an exam and subject to analyze trends.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>JEE (Main & Advanced)</option>
                <option>NEET</option>
                <option>CBSE Board</option>
                <option>GATE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Mathematics</option>
                <option>Biology</option>
                <option>Computer Science</option>
                <option>English</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Analyze</button>
          </div>
        </form>

        {submitted && (
          <PYQPatternAnalysis examType={examType} subject={subject} />
        )}
      </div>
    </div>
  );
}
