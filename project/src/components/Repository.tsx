import { useState, useEffect } from 'react';
import { Filter, Search, Download, Eye, Grid, List, RefreshCw } from 'lucide-react';
import { mockPapers } from '../data/mockData';
import { FilterState, PYQPaper } from '../types';

export default function Repository() {
  const [filters, setFilters] = useState<FilterState>({
    examType: '',
    subject: '',
    year: '',
    difficulty: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [papers, setPapers] = useState<PYQPaper[]>(mockPapers);
  const [loading, setLoading] = useState(false);
  const [usingFirebase, setUsingFirebase] = useState(false);

  // Track download
  const trackDownload = async (paperId: string, paperTitle: string) => {
    try {
      const { supabase } = await import('../lib/supabase');
      if (!supabase) return;

      await (supabase as any)
        .from('downloads')
        .insert({
          paper_id: paperId,
          user_email: null, // Can be updated if you have user context
          downloaded_at: new Date().toISOString()
        });

      console.log('📊 Download tracked for:', paperTitle);
    } catch (error) {
      console.error('Error tracking download:', error);
    }
  };

  // Load papers from Supabase
  useEffect(() => {
    loadPapers();
  }, []);

  const loadPapers = async () => {
    try {
      setLoading(true);
      const { supabase } = await import('../lib/supabase');
      
      if (!supabase) {
        setPapers(mockPapers);
        setUsingFirebase(false);
        return;
      }

      // Load streams for mapping
      const { data: streamsData } = await supabase
        .from('streams')
        .select('*');

      const streamsById: Record<string, string> = {};
      (streamsData || []).forEach((stream: any) => {
        streamsById[stream.id] = String(stream.name);
      });

      // Load papers
      const { data: papersData, error } = await supabase
        .from('papers')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      
      if (papersData && papersData.length > 0) {
        const supabasePapers: PYQPaper[] = papersData.map((data: any) => {
          const streamName = streamsById[data.stream_id] || 'General';
          
          return {
            id: String(data.id),
            title: String(data.title || 'Untitled Paper'),
            examType: streamName,
            subject: String(data.subject || ''),
            year: Number(data.year || new Date().getFullYear()),
            downloadUrl: String(data.file_url || '#'),
            viewUrl: String(data.file_url || '#'),
            tags: [],
            difficulty: 'Medium' as const,
            downloads: 0,
            size: '',
          };
        });
        
        setPapers(supabasePapers);
        setUsingFirebase(true);
      } else {
        // Keep mock data if Supabase is empty
        setPapers(mockPapers);
        setUsingFirebase(false);
      }
    } catch (error) {
      console.error('Error loading papers from Supabase:', error);
      // Fall back to mock data on error
      setPapers(mockPapers);
      setUsingFirebase(false);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredPapers = papers.filter(paper => {
    const matchesSearch = searchQuery === '' || 
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.examType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesExam = filters.examType === '' || paper.examType === filters.examType;
    const matchesSubject = filters.subject === '' || paper.subject === filters.subject;
    const matchesYear = filters.year === '' || paper.year.toString() === filters.year;
    const matchesDifficulty = filters.difficulty === '' || paper.difficulty === filters.difficulty;

    return matchesSearch && matchesExam && matchesSubject && matchesYear && matchesDifficulty;
  });

  const examTypes = ['JEE (Main & Advanced)', 'NEET', 'CBSE Board', 'GATE'];
  const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English'];
  const years = ['2024', '2023', '2022', '2021', '2020'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const PaperCard = ({ paper }: { paper: PYQPaper }) => (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{paper.title}</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {paper.examType}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              {paper.subject}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              paper.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
              paper.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {paper.difficulty}
            </span>
          </div>
        </div>
        <span className="text-sm text-gray-500 font-medium">{paper.year}</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {paper.tags.map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {paper.downloads > 0 && <span>{paper.downloads.toLocaleString()} downloads</span>}
          {paper.size && <span>{paper.size}</span>}
        </div>
        <div className="flex space-x-2">
          <a
            href={paper.viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackDownload(paper.id, paper.title)}
            className="inline-flex items-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>View</span>
          </a>
          <a
            href={paper.downloadUrl}
            download
            onClick={() => trackDownload(paper.id, paper.title)}
            className="inline-flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PYQ Repository</h1>
          <p className="text-gray-600">Browse and download Previous Year Question papers</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Filter className="h-5 w-5" />
                </button>
              </div>

              <div className={`space-y-6 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search papers..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Exam Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
                  <select
                    value={filters.examType}
                    onChange={(e) => setFilters(prev => ({ ...prev, examType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Exams</option>
                    {examTypes.map(exam => (
                      <option key={exam} value={exam}>{exam}</option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={filters.subject}
                    onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    value={filters.year}
                    onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Years</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setFilters({ examType: '', subject: '', year: '', difficulty: '' });
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {filteredPapers.length} papers found
                </h3>
                {usingFirebase && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                    Live data from Supabase
                  </p>
                )}
                <p className="text-gray-600 text-sm mt-1">
                  {searchQuery && `Results for "${searchQuery}"`}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {loading && (
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                )}
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Results */}
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' 
                : 'space-y-4'
            }`}>
              {filteredPapers.map(paper => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>

            {/* Empty State */}
            {filteredPapers.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No papers found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                <button
                  onClick={() => {
                    setFilters({ examType: '', subject: '', year: '', difficulty: '' });
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}