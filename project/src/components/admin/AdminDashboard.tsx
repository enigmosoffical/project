import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, Database, Users, TrendingUp, Download, Eye, Calendar } from 'lucide-react';
import { AdminStats } from '../../types/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadDashboardStats();
  }, [timeRange]);

  const loadDashboardStats = async () => {
    // Mock data - replace with actual Supabase calls
    const mockStats: AdminStats = {
      total_papers: 1247,
      total_subjects: 89,
      total_field_types: 5,
      total_field_values: 45,
      recent_uploads: 23,
      popular_subjects: [
        {
          subject: {
            id: '1',
            name: 'Data Structures and Algorithms',
            code: 'CS301',
            description: '',
            credits: 4,
            is_active: true,
            metadata: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          paper_count: 156
        },
        {
          subject: {
            id: '2',
            name: 'Database Management Systems',
            code: 'CS401',
            description: '',
            credits: 3,
            is_active: true,
            metadata: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          paper_count: 134
        }
      ]
    };

    setStats(mockStats);
  };

  const statCards = [
    {
      title: 'Total Papers',
      value: stats?.total_papers || 0,
      icon: FileText,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Subjects',
      value: stats?.total_subjects || 0,
      icon: Users,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      change: '+5%',
      changeType: 'positive' as const
    },
    {
      title: 'Field Types',
      value: stats?.total_field_types || 0,
      icon: Database,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
      change: '+2%',
      changeType: 'positive' as const
    },
    {
      title: 'Recent Uploads',
      value: stats?.recent_uploads || 0,
      icon: TrendingUp,
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
      change: '+18%',
      changeType: 'positive' as const
    }
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'upload',
      title: 'New paper uploaded: Database Systems Final Exam 2024',
      time: '2 hours ago',
      icon: FileText
    },
    {
      id: '2',
      type: 'field',
      title: 'New field type added: Specialization',
      time: '5 hours ago',
      icon: Database
    },
    {
      id: '3',
      type: 'subject',
      title: 'Subject updated: Machine Learning Fundamentals',
      time: '1 day ago',
      icon: Users
    }
  ];

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Overview of your SmartPYQ admin panel</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {card.value.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    card.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {card.change}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Subjects */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Popular Subjects</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {stats.popular_subjects.map((item, index) => (
              <div key={item.subject.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.subject.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.subject.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">{item.paper_count}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">papers</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <activity.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/upload"
            className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">Upload New Paper</span>
          </a>
          
          <a
            href="/admin/fields"
            className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
          >
            <Database className="w-5 h-5" />
            <span className="font-medium">Manage Fields</span>
          </a>
          
          <a
            href="/admin/subjects"
            className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Manage Subjects</span>
          </a>
        </div>
      </div>
    </div>
  );
}