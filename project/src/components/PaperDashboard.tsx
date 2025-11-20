import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Eye, Calendar, BookOpen, Filter, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import EmptyState from './EmptyState';

type UIPaper = {
  id: string;
  title: string;
  stream: string; // mapped from exam_type
  file_url: string;
  created_at: string; // mapped from uploaded_at
};

export default function PaperDashboard() {
  const [papers, setPapers] = useState<UIPaper[]>([]);
  const [filteredPapers, setFilteredPapers] = useState<UIPaper[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [loading, setLoading] = useState(true);
  const [streamCounts, setStreamCounts] = useState<Record<string, number>>({});
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // Fetch papers from Supabase
  const fetchPapers = async () => {
    try {
      if (!supabase) {
        setSupabaseError('Supabase is not configured. Please check your environment variables.');
        setLoading(false);
        return;
      }

      setLoading(true);
      const client = supabase; // non-null after early return
      // Try primary table: pyq_papers
      let transformed: UIPaper[] = [];
      let errMsg: string | null = null;

      const tryFetch = async (table: string) => {
        const { data, error } = await client
          .from(table)
          .select('*')
          .order('uploaded_at', { ascending: false });
        if (error) return { rows: null as any, error };
        return { rows: data as any[], error: null as any };
      };

      // Attempt pyq_papers
      let { rows, error: e1 } = await tryFetch('pyq_papers');
      if (e1) {
        // Fallback to pyq_papers_v2
        const res2 = await tryFetch('pyq_papers_v2');
        rows = res2.rows;
        if (res2.error) {
          errMsg = res2.error.message;
        }
      }

      if (rows && Array.isArray(rows)) {
        transformed = rows.map((r: any, idx: number) => {
          const exam = r.exam_type ?? 'General';
          const subj = r.subject ?? '';
          const year = r.year ?? '';
          const title = `${exam}${subj ? ' ' + subj : ''}${year ? ' ' + year : ''}`.trim();
          return {
            id: String(r.id ?? idx),
            title,
            stream: String(exam),
            file_url: String(r.file_url ?? ''),
            created_at: String(r.uploaded_at ?? new Date().toISOString()),
          } as UIPaper;
        });
      }

      if (!transformed.length && errMsg) {
        setSupabaseError(errMsg);
        return;
      }

      setPapers(transformed);
    } catch (error) {
      console.error('Error:', error);
      setSupabaseError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchPapers();

    // Optional: subscribe to changes on both tables if Realtime is enabled
    if (supabase) {
      const client = supabase;
      const channel = client
        .channel('pyq_papers_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pyq_papers' }, () => fetchPapers())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pyq_papers_v2' }, () => fetchPapers())
        .subscribe();
      return () => { channel.unsubscribe(); };
    }
  }, []);

  // Calculate stream counts
  useEffect(() => {
    const counts: Record<string, number> = {};
    papers.forEach(paper => {
      counts[paper.stream] = (counts[paper.stream] || 0) + 1;
    });
    setStreamCounts(counts);
  }, [papers]);

  // Filter papers based on search and stream
  useEffect(() => {
    let filtered = papers;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(paper =>
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.stream.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected stream
    if (selectedStream) {
      filtered = filtered.filter(paper => paper.stream === selectedStream);
    }

    setFilteredPapers(filtered);
  }, [papers, searchQuery, selectedStream]);

  // Get unique streams
  const uniqueStreams = Array.from(new Set(papers.map(paper => paper.stream))).sort();

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle file view/download
  const handleViewFile = (fileUrl: string, title: string) => {
    window.open(fileUrl, '_blank');
  };

  // Handle retry
  const handleRetry = () => {
    setSupabaseError(null);
    fetchPapers();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-lg text-gray-600">Loading papers...</span>
        </motion.div>
      </div>
    );
  }

  // Show error message if Supabase is not configured
  if (supabaseError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-lg border border-red-200"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration Error</h2>
            <p className="text-gray-600 mb-6">
              {supabaseError}
            </p>
            <div className="bg-red-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-red-700">
                <strong>Solution:</strong> Please check your <code className="bg-red-100 px-1 rounded">.env</code> file and ensure the Supabase URL and anonymous key are properly configured.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Retry
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Paper Dashboard</h1>
          <p className="text-gray-600">Real-time tracking of uploaded papers</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Total Papers */}
          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Papers</p>
                <p className="text-2xl font-bold text-gray-900">{papers.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>

          {/* Stream Counts */}
          {Object.entries(streamCounts).slice(0, 3).map(([stream, count], index) => (
            <motion.div
              key={stream}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => setSelectedStream(selectedStream === stream ? '' : stream)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stream}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  selectedStream === stream ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or stream..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Stream Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white min-w-[200px]"
              >
                <option value="">All Streams</option>
                {uniqueStreams.map(stream => (
                  <option key={stream} value={stream}>
                    {stream} ({streamCounts[stream]})
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedStream) && (
              <motion.button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStream('');
                }}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Papers Grid */}
        <AnimatePresence mode="wait">
          {filteredPapers.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState searchQuery={searchQuery} selectedStream={selectedStream} />
            </motion.div>
          ) : (
            <motion.div
              key="papers"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredPapers.map((paper, index) => (
                <motion.div
                  key={paper.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  {/* Paper Header */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {paper.title}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {paper.stream}
                    </span>
                  </div>

                  {/* Paper Meta */}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(paper.created_at)}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={() => handleViewFile(paper.file_url, paper.title)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </motion.button>
                    <motion.button
                      onClick={() => handleViewFile(paper.file_url, paper.title)}
                      className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}