import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, BookOpen, Home, Library, BarChart3, Settings } from 'lucide-react';
import ChatBot from './ChatBot';
import NavigationSplash from './NavigationSplash';

interface LayoutProps {
  children: ReactNode;
  currentPage?: string;
}

export default function Layout({ children, currentPage = 'home' }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', to: '/', icon: Home, current: location.pathname === '/' },
    { name: 'Repository', to: '/repository', icon: Library, current: location.pathname.startsWith('/repository') },
    { name: 'Analysis', to: '/analysis', icon: BarChart3, current: location.pathname.startsWith('/analysis') },
    { name: 'Dashboard', to: '/dashboard', icon: BarChart3, current: location.pathname.startsWith('/dashboard') },
    { name: 'Admin', to: '/admin', icon: Settings, current: location.pathname.startsWith('/admin') }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">SmartPYQ</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`flex items-center space-x-3 px-3 py-3 text-base font-medium rounded-md transition-colors ${
                    item.current
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">SmartPYQ</span>
              </div>
              <p className="text-gray-600 mb-4 max-w-md">
                Find any Previous Year Question paper in seconds. Smart, organized, and stress-free exam preparation.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/repository" className="text-gray-600 hover:text-blue-600 transition-colors">All Papers</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Popular Exams</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 mt-8">
            <p className="text-center text-gray-500 text-sm">
              2024 SmartPYQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Global ChatBot widget */}
      <ChatBot />

      {/* Route-change Splash Overlay */}
      <NavigationSplash />
    </div>
  );
}