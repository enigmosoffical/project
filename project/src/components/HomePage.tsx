import React, { useState } from 'react';
import { Search, ArrowRight, TrendingUp, Clock, Download, Sparkles, BookOpen, Users } from 'lucide-react';
import { quickLinks } from '../data/mockData';
import SearchSuggestions from './SearchSuggestions';
import ThreeHero from './ThreeHero';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const stats = [
    { label: 'PYQ Papers', value: '10,000+', icon: Download },
    { label: 'Students Helped', value: '50,000+', icon: TrendingUp },
    { label: 'Years Covered', value: '15+', icon: Clock }
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // In a real app, this would trigger the search
      console.log('Searching for:', searchQuery);
      // For now, we'll just log it
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-teal-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* ThreeJS Background */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <ThreeHero />
        </div>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-100 rounded-full opacity-20 animate-float animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-blue-200 rounded-full opacity-10 animate-float animation-delay-500"></div>
          <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-teal-200 rounded-full opacity-15 animate-float animation-delay-1500"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl mb-8 animate-bounce shadow-lg">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in-up">
            Find Any
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600 block mt-2 animate-fade-in-up animation-delay-200">
              PYQ in Seconds
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
            Smart, organized access to Previous Year Questions. Reduce exam stress with intelligent search and insights.
          </p>

          {/* Search Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative">
            <div className="space-y-6">
              {/* Search Filters */}
              <div className="flex flex-wrap gap-3 justify-center mb-6">
                {['all', 'jee', 'neet', 'cbse', 'gate'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      selectedFilter === filter
                        ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    {filter.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by subject, year, or exam (e.g., 'JEE Physics 2024')"
                  className="w-full pl-12 pr-32 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 focus:shadow-lg"
                />
                <button 
                  onClick={handleSearch}
                  className="absolute inset-y-0 right-0 mr-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 flex items-center space-x-2 transform hover:scale-105 shadow-lg"
                >
                  <span>Search</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <SearchSuggestions query={searchQuery} onSuggestionClick={handleSuggestionClick} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
              <h2 className="text-3xl font-bold text-gray-900">Most Searched</h2>
              <Sparkles className="w-6 h-6 text-teal-600 animate-pulse animation-delay-500" />
            </div>
            <p className="text-lg text-gray-600">Quick access to popular exam papers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up animation-delay-300">
            {quickLinks.map((link, index) => (
              <a
                key={index}
                href={link.link}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 100 + 500}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-teal-600 transition-all duration-200">
                    {link.name}
                  </h3>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-all duration-200 group-hover:translate-x-1" />
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">{link.count}</span> papers available
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-10 animate-float animation-delay-1000"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-teal-200 rounded-full opacity-10 animate-float animation-delay-2000"></div>
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Students</h2>
            <p className="text-lg text-gray-600">Join thousands of students who've aced their exams</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up animation-delay-300">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center animate-fade-in-up transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 200 + 500}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full mb-4 shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce" style={{ animationDelay: `${index * 300}ms` }}>
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        {/* Subtle animated background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100 via-transparent to-teal-100 animate-pulse"></div>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SmartPYQ?</h2>
            <p className="text-lg text-gray-600">Features designed for efficient exam preparation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up animation-delay-300">
            {[
              {
                title: 'Smart Search',
                description: 'Find papers instantly with intelligent filters and search suggestions',
                icon: '🔍',
                gradient: 'from-blue-500 to-blue-600'
              },
              {
                title: 'High-Frequency Topics',
                description: 'Identify repeated questions and focus on what matters most',
                icon: '📊',
                gradient: 'from-teal-500 to-teal-600'
              },
              {
                title: 'AI Assistant',
                description: 'Get instant help and insights from our smart chatbot',
                icon: '🤖',
                gradient: 'from-purple-500 to-purple-600'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="text-center p-6 rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg animate-fade-in-up group"
                style={{ animationDelay: `${index * 200 + 500}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 text-white text-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}