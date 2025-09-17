import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Guitar as Hospital, BarChart3, Users, FileText, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Scene from '../components/3D/Scene';
import SearchOverlay from '../components/SearchOverlay';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchOverlay, setSearchOverlay] = useState({ isOpen: false, type: '' });

  const handleBoxClick = (boxType: string) => {
    let searchType = '';
    switch (boxType) {
      case 'search':
        searchType = 'Records';
        break;
      case 'directory':
        searchType = 'Hospitals';
        break;
      case 'analytics':
        searchType = 'Analytics';
        break;
    }
    setSearchOverlay({ isOpen: true, type: searchType });
  };

  const stats = user?.role === 'hospital' 
    ? [
        { icon: Users, label: 'Total Patients', value: '1,247', change: '+12%' },
        { icon: FileText, label: 'Records Today', value: '56', change: '+8%' },
        { icon: TrendingUp, label: 'Avg. Response', value: '2.3h', change: '-15%' },
      ]
    : [
        { icon: Hospital, label: 'Hospitals', value: '15', change: '+2' },
        { icon: FileText, label: 'My Records', value: '23', change: '+1' },
        { icon: Search, label: 'Recent Searches', value: '8', change: '+3' },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-black text-slate-800 mb-2">
                Welcome back, {user?.name?.split(' ')[0]}
              </h1>
              <p className="text-lg text-slate-600">
                {user?.role === 'hospital' 
                  ? 'Manage your hospital records and patient data' 
                  : 'Access your medical records and healthcare information'
                }
              </p>
            </div>
            
            <div className="mt-4 lg:mt-0">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
                {user?.role === 'hospital' ? (
                  <Hospital className="w-5 h-5 text-blue-600" />
                ) : (
                  <Users className="w-5 h-5 text-blue-600" />
                )}
                <span className="text-sm font-medium text-slate-700 capitalize">
                  {user?.role} Account
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
                <span className="text-sm text-slate-500 ml-2">from last month</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Dashboard Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">
              Interactive Dashboard
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Click on any of the 3D boxes below to access different features of the EMR system. 
              Each box represents a core functionality of the platform.
            </p>
          </div>

          {/* 3D Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-8"
          >
            <Suspense fallback={
              <div className="h-96 flex items-center justify-center bg-slate-50 rounded-xl">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading 3D Scene...</p>
                </div>
              </div>
            }>
              <Scene onBoxClick={handleBoxClick} />
            </Suspense>
          </motion.div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: 'Search Records',
                description: 'Find patient records, medical history, and diagnostic information',
                color: 'blue',
                action: () => handleBoxClick('search')
              },
              {
                icon: Hospital,
                title: 'Hospital Directory',
                description: 'Browse healthcare facilities, departments, and contact information',
                color: 'green',
                action: () => handleBoxClick('directory')
              },
              {
                icon: BarChart3,
                title: 'Analytics & Reports',
                description: 'View healthcare statistics, trends, and performance metrics',
                color: 'amber',
                action: () => handleBoxClick('analytics')
              }
            ].map((card, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={card.action}
                className={`text-left p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                  card.color === 'blue' 
                    ? 'border-blue-200 hover:border-blue-300 hover:bg-blue-50' 
                    : card.color === 'green'
                    ? 'border-green-200 hover:border-green-300 hover:bg-green-50'
                    : 'border-amber-200 hover:border-amber-300 hover:bg-amber-50'
                }`}
              >
                <div className={`inline-flex p-3 rounded-xl mb-4 ${
                  card.color === 'blue' 
                    ? 'bg-blue-100 text-blue-600' 
                    : card.color === 'green'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-amber-100 text-amber-600'
                }`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{card.title}</h3>
                <p className="text-slate-600 leading-relaxed">{card.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={searchOverlay.isOpen}
        onClose={() => setSearchOverlay({ isOpen: false, type: '' })}
        searchType={searchOverlay.type}
      />
    </div>
  );
}