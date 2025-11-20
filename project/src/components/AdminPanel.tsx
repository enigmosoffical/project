import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Upload, 
  LogOut, 
  BookOpen, 
  Database, 
  FileText,
  AlertCircle,
  CheckCircle,
  Loader,
  Eye,
  Download,
  BarChart3,
  TrendingUp,
  Activity,
  Users
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { supabase } from '../lib/supabase';
import { isUserAdmin } from '../lib/userRoles';
import UserManagement from './UserManagement';

interface Stream {
  id: string;
  name: string;
  created_at: string;
}

interface Paper {
  id: string;
  title: string;
  stream_id: string;
  subject: string;
  year: number;
  file_url: string;
  file_path?: string;
  created_at: string;
  streams?: { name: string };
}

interface User {
  uid: string;
  email: string | null;
}

interface AnalyticsData {
  totalPapers: number;
  totalStreams: number;
  totalDownloads: number;
  recentDownloads: Array<{
    paper_title: string;
    downloaded_at: string;
    user_email?: string;
  }>;
  topPapers: Array<{
    paper_title: string;
    download_count: number;
  }>;
}

export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'streams' | 'upload' | 'papers' | 'users'>('analytics');
  
  // Auth states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  // Stream states
  const [streams, setStreams] = useState<Stream[]>([]);
  const [newStreamName, setNewStreamName] = useState('');
  const [streamLoading, setStreamLoading] = useState(false);
  
  // Paper states
  const [papers, setPapers] = useState<Paper[]>([]);
  const [paperForm, setPaperForm] = useState({
    title: '',
    stream_id: '',
    subject: '',
    year: new Date().getFullYear(),
    file: null as File | null
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Analytics states
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalPapers: 0,
    totalStreams: 0,
    totalDownloads: 0,
    recentDownloads: [],
    topPapers: []
  });
  
  // Message state
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check auth status on mount
  useEffect(() => {
    const checkAdminAccess = async (currentUser: any) => {
      if (currentUser && currentUser.email) {
        const isAdmin = await isUserAdmin(currentUser.email);
        
        if (isAdmin) {
          setUser({ uid: currentUser.uid, email: currentUser.email });
        } else {
          setUser(null);
          // Non-admin user tried to access, sign them out
          await signOut(auth);
          setMessage({ type: 'error', text: 'Access denied. Admin only.' });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, checkAdminAccess);
    return () => unsubscribe();
  }, []);

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadStreams();
      loadPapers();
      loadAnalytics();
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setMessage(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user has admin role in Supabase
      const isAdmin = await isUserAdmin(email);
      if (!isAdmin) {
        await signOut(auth);
        throw new Error('Access denied. This panel is for administrators only.');
      }
      const firebaseUser = userCredential.user;
      setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
      showMessage('Successfully logged in!', 'success');
    } catch (error) {
      console.error('Login error:', error);
      showMessage((error as Error).message || 'Login failed', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      showMessage('Successfully logged out!', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      showMessage((error as Error).message || 'Logout failed', 'error');
    }
  };

  // Sign up function - only for initial admin account creation
  // Uncomment and use once to create the admin account, then comment it back
  /* 
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setMessage(null);

    try {
      // Only allow admin email to sign up
      if (!isAdminEmail(email)) {
        throw new Error('Access denied. Admin account already exists. Contact system administrator.');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
      showMessage('Account created successfully!', 'success');
    } catch (error) {
      console.error('Sign up error:', error);
      showMessage((error as Error).message || 'Failed to create account', 'error');
    } finally {
      setAuthLoading(false);
    }
  };
  */

  const loadStreams = async () => {
    try {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('streams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const list: Stream[] = (data || []).map((d: any) => ({
        id: String(d.id),
        name: String(d.name),
        created_at: String(d.created_at)
      }));
      
      setStreams(list);
    } catch (error) {
      console.error('Error loading streams:', error);
    }
  };

  const loadPapers = async () => {
    try {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('papers')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      
      const list: Paper[] = (data || []).map((d: any) => ({
        id: String(d.id),
        title: String(d.title),
        stream_id: String(d.stream_id),
        subject: String(d.subject),
        year: Number(d.year),
        file_url: String(d.file_url),
        file_path: String(d.file_path || ''),
        created_at: String(d.uploaded_at)
      }));
      
      // Attach stream names locally
      const byId = Object.fromEntries(streams.map(s => [s.id, s]));
      const enriched = list.map(p => ({ ...p, streams: byId[p.stream_id] ? { name: byId[p.stream_id].name } : undefined }));
      setPapers(enriched);
    } catch (error) {
      console.error('Error loading papers:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      if (!supabase) return;

      // Get total counts
      const { count: paperCount } = await supabase
        .from('papers')
        .select('*', { count: 'exact', head: true });

      const { count: streamCount } = await supabase
        .from('streams')
        .select('*', { count: 'exact', head: true });

      const { count: downloadCount } = await (supabase as any)
        .from('downloads')
        .select('*', { count: 'exact', head: true });

      // Get recent downloads with paper info
      const { data: recentDownloadsData } = await (supabase as any)
        .from('downloads')
        .select(`
          downloaded_at,
          user_email,
          papers!inner(title)
        `)
        .order('downloaded_at', { ascending: false })
        .limit(10);

      const recentDownloads = (recentDownloadsData || []).map((d: any) => ({
        paper_title: d.papers?.title || 'Unknown',
        downloaded_at: d.downloaded_at,
        user_email: d.user_email
      }));

      // Get top papers by download count
      const { data: topPapersData } = await (supabase as any)
        .from('downloads')
        .select(`
          paper_id,
          papers!inner(title)
        `);

      // Count downloads per paper
      const downloadsByPaper: Record<string, { title: string; count: number }> = {};
      (topPapersData || []).forEach((d: any) => {
        const title = d.papers?.title || 'Unknown';
        if (!downloadsByPaper[d.paper_id]) {
          downloadsByPaper[d.paper_id] = { title, count: 0 };
        }
        downloadsByPaper[d.paper_id].count++;
      });

      const topPapers = Object.values(downloadsByPaper)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(p => ({
          paper_title: p.title,
          download_count: p.count
        }));

      setAnalytics({
        totalPapers: paperCount || 0,
        totalStreams: streamCount || 0,
        totalDownloads: downloadCount || 0,
        recentDownloads,
        topPapers
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleAddStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreamName.trim()) return;

    setStreamLoading(true);
    setMessage(null);

    try {
      if (!supabase) throw new Error('Supabase is not configured');

      const { error } = await (supabase as any)
        .from('streams')
        .insert({
          name: newStreamName.trim(),
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setNewStreamName('');
      await loadStreams();
      await loadAnalytics();
      showMessage('Stream added successfully!', 'success');
    } catch (error) {
      showMessage((error as Error).message || 'Failed to add stream', 'error');
    } finally {
      setStreamLoading(false);
    }
  };

  const handleDeleteStream = async (streamId: string, streamName: string) => {
    if (!confirm(`Are you sure you want to delete "${streamName}"? This will also delete all papers in this stream.`)) {
      return;
    }

    try {
      if (!supabase) throw new Error('Supabase is not configured');

      // Get papers to delete their files
      const { data: papers } = await supabase
        .from('papers')
        .select('file_path')
        .eq('stream_id', streamId);

      // Delete storage files
      if (papers && papers.length > 0) {
        const filePaths = papers.map((p: any) => p.file_path).filter(Boolean);
        if (filePaths.length > 0) {
          await supabase.storage
            .from('pyq-papers')
            .remove(filePaths);
        }
      }

      // Delete papers
      await supabase
        .from('papers')
        .delete()
        .eq('stream_id', streamId);

      // Delete stream
      const { error } = await supabase
        .from('streams')
        .delete()
        .eq('id', streamId);

      if (error) throw error;

      await loadStreams();
      await loadPapers();
      await loadAnalytics();
      showMessage('Stream deleted successfully!', 'success');
    } catch (error) {
      showMessage((error as Error).message || 'Failed to delete stream', 'error');
    }
  };

  const handleUploadPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 Form submitted:', paperForm);
    
    if (!paperForm.title.trim()) {
      showMessage('Please enter a paper title', 'error');
      return;
    }
    
    if (!paperForm.stream_id) {
      showMessage('Please select a stream', 'error');
      return;
    }
    
    if (!paperForm.subject.trim()) {
      showMessage('Please enter a subject', 'error');
      return;
    }
    
    if (!paperForm.file) {
      showMessage('Please select a PDF file', 'error');
      return;
    }

    if (paperForm.file.type !== 'application/pdf') {
      showMessage('Please select a PDF file only', 'error');
      return;
    }

    setUploadLoading(true);
    setMessage(null);

    try {
      const file = paperForm.file!;
      
      if (!supabase) {
        throw new Error('Supabase is not configured');
      }

      console.log('🚀 Starting Supabase upload...');
      console.log('📁 File details:', { name: file.name, type: file.type, size: file.size });
      console.log('📊 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `papers/${paperForm.stream_id}/${fileName}`;
      
      console.log('📂 Upload path:', filePath);
      console.log('🗂️ Using bucket: pyq-papers');
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pyq-papers')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        });
      
      console.log('✅ Upload response:', { data: uploadData, error: uploadError });

      if (uploadError) {
        console.error('❌ Upload error details:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pyq-papers')
        .getPublicUrl(filePath);

      // Insert paper metadata into Supabase
      const { error: insertError } = await (supabase as any)
        .from('papers')
        .insert({
          title: paperForm.title.trim(),
          stream_id: paperForm.stream_id,
          subject: paperForm.subject.trim(),
          year: paperForm.year,
          file_url: publicUrl,
          file_path: filePath,
          uploaded_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Reset form
      setPaperForm({
        title: '',
        stream_id: '',
        subject: '',
        year: new Date().getFullYear(),
        file: null
      });

      await loadPapers();
      await loadAnalytics();
      showMessage('Paper uploaded successfully!', 'success');
    } catch (error) {
      showMessage((error as Error).message || 'Failed to upload paper', 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleDeletePaper = async (paper: Paper) => {
    if (!confirm(`Delete paper "${paper.title}"? This cannot be undone.`)) return;
    try {
      if (!supabase) throw new Error('Supabase is not configured');

      // Delete storage file
      if (paper.file_path) {
        await supabase.storage
          .from('pyq-papers')
          .remove([paper.file_path]);
      }

      // Delete database record
      const { error } = await supabase
        .from('papers')
        .delete()
        .eq('id', paper.id);

      if (error) throw error;

      await loadPapers();
      await loadAnalytics();
      showMessage('Paper deleted successfully!', 'success');
    } catch (error) {
      showMessage((error as Error).message || 'Failed to delete paper', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-lg text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Login form
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">🔒 Admin Panel</h1>
            <p className="text-gray-600 font-semibold">Administrator Access Only</p>
            <p className="text-xs text-gray-500 mt-1">Authorized personnel only</p>
          </div>

          {message && (
            <div className={`flex items-center space-x-3 p-4 rounded-lg mb-6 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {authLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 text-center">
              <strong>Security Notice:</strong> This panel is restricted to authorized administrators only. 
              Unauthorized access attempts are logged.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main admin panel
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">SmartPYQ Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div className={`flex items-center space-x-3 p-4 rounded-lg mb-6 animate-fade-in ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'analytics', name: 'Analytics', icon: BarChart3 },
              { id: 'streams', name: 'Manage Streams', icon: Database },
              { id: 'upload', name: 'Upload Papers', icon: Upload },
              { id: 'papers', name: 'View Papers', icon: FileText },
              { id: 'users', name: 'User Management', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'analytics' | 'streams' | 'upload' | 'papers' | 'users')}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Papers</p>
                    <p className="text-3xl font-bold mt-2">{analytics.totalPapers}</p>
                  </div>
                  <FileText className="w-12 h-12 text-blue-200 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Streams</p>
                    <p className="text-3xl font-bold mt-2">{analytics.totalStreams}</p>
                  </div>
                  <Database className="w-12 h-12 text-purple-200 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Downloads</p>
                    <p className="text-3xl font-bold mt-2">{analytics.totalDownloads}</p>
                    {analytics.totalDownloads > 0 && (
                      <p className="text-xs text-green-100 mt-1">All time</p>
                    )}
                  </div>
                  <Download className="w-12 h-12 text-green-200 opacity-80" />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Activity className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="space-y-3">
                  {papers.slice(0, 5).map((paper) => (
                    <div key={paper.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{paper.title}</p>
                        <p className="text-xs text-gray-500">{paper.subject} • {paper.year}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(paper.created_at)}</p>
                      </div>
                    </div>
                  ))}
                  {papers.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No papers uploaded yet</p>
                  )}
                </div>
              </div>

              {/* Top Papers */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Most Popular Papers</h3>
                </div>
                <div className="space-y-3">
                  {analytics.topPapers.length > 0 ? (
                    analytics.topPapers.map((paper, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg border border-green-100">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{paper.paper_title}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Download className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-600">{paper.download_count}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No downloads yet</p>
                      <p className="text-sm text-gray-400 mt-1">Downloads will appear here once users start accessing papers</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stream Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Papers by Stream</h3>
              </div>
              <div className="space-y-3">
                {streams.map((stream) => {
                  const streamPapers = papers.filter(p => p.stream_id === stream.id);
                  const percentage = analytics.totalPapers > 0 ? (streamPapers.length / analytics.totalPapers) * 100 : 0;
                  return (
                    <div key={stream.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">{stream.name}</span>
                        <span className="text-gray-600">{streamPapers.length} papers ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {streams.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No streams created yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Streams Tab */}
        {activeTab === 'streams' && (
          <div className="space-y-8">
            {/* Add Stream Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Stream</h2>
              <form onSubmit={handleAddStream} className="flex gap-4">
                <input
                  type="text"
                  value={newStreamName}
                  onChange={(e) => setNewStreamName(e.target.value)}
                  placeholder="Enter stream name (e.g., NEET, JEE, Diploma)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={streamLoading}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {streamLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Add Stream</span>
                </button>
              </form>
            </div>

            {/* Streams List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Existing Streams</h2>
              {streams.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No streams added yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Stream Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Created At</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {streams.map((stream) => (
                        <tr key={stream.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{stream.name}</td>
                          <td className="py-3 px-4 text-gray-600">{formatDate(stream.created_at)}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteStream(stream.id, stream.name)}
                              className="inline-flex items-center space-x-1 px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Upload New Paper</h2>
            <form onSubmit={handleUploadPaper} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paper Title *
                  </label>
                  <input
                    type="text"
                    value={paperForm.title}
                    onChange={(e) => setPaperForm({ ...paperForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter paper title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stream *
                  </label>
                  <select
                    value={paperForm.stream_id}
                    onChange={(e) => setPaperForm({ ...paperForm, stream_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Stream</option>
                    {streams.map((stream) => (
                      <option key={stream.id} value={stream.id}>
                        {stream.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={paperForm.subject}
                    onChange={(e) => setPaperForm({ ...paperForm, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter subject name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    value={paperForm.year}
                    onChange={(e) => setPaperForm({ ...paperForm, year: parseInt(e.target.value) })}
                    min="2000"
                    max="2030"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF File *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPaperForm({ ...paperForm, file: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploadLoading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  <span>Upload Paper</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Papers Tab */}
        {activeTab === 'papers' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Uploaded Papers</h2>
            {papers.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No papers uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {papers.map((paper) => (
                  <div key={paper.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-900 mb-2">{paper.title}</h3>
                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      <p><span className="font-medium">Stream:</span> {paper.streams?.name}</p>
                      <p><span className="font-medium">Subject:</span> {paper.subject}</p>
                      <p><span className="font-medium">Year:</span> {paper.year}</p>
                      <p><span className="font-medium">Uploaded:</span> {formatDate(paper.created_at)}</p>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={paper.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </a>
                      <a
                        href={paper.file_url}
                        download
                        className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </a>
                      <button
                        onClick={() => handleDeletePaper(paper)}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && <UserManagement />}
      </div>
    </div>
  );
}