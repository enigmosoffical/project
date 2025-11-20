import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import Repository from './components/Repository';
import PaperDashboard from './components/PaperDashboard';
import AdminPanel from './components/AdminPanel';
import Layout from './components/Layout';
import AuthPage from './components/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import AnalysisPage from './components/AnalysisPage';
import SplashPage from './components/SplashPage';
import SplashGate from './components/SplashGate';
import RequireAppAuth from './components/RequireAppAuth';

function App() {

  // Simple render with error boundary
  try {
    return (
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/splash" element={<SplashPage />} />
          
          {/* Admin route - has its own auth */}
          <Route path="/admin" element={<AdminPanel />} />
          
          {/* App routes require auth */}
          <Route path="/" element={
            <RequireAppAuth>
              <Layout>
                <SplashGate><HomePage /></SplashGate>
              </Layout>
            </RequireAppAuth>
          } />
          <Route path="/repository" element={
            <RequireAppAuth>
              <Layout>
                <Repository />
              </Layout>
            </RequireAppAuth>
          } />
          <Route path="/dashboard" element={
            <RequireAppAuth>
              <Layout>
                <ProtectedRoute><PaperDashboard /></ProtectedRoute>
              </Layout>
            </RequireAppAuth>
          } />
          <Route path="/analysis" element={
            <RequireAppAuth>
              <Layout>
                <AnalysisPage />
              </Layout>
            </RequireAppAuth>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    );
  } catch (err) {
    console.error('App rendering error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    
    // Fallback UI
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
          <p className="text-gray-700 mb-4">
            {errorMessage}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

export default App;