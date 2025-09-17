import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, Calendar, Guitar as Hospital, FileText } from 'lucide-react';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchType: string;
}

interface SearchResult {
  id: string;
  type: 'patient' | 'hospital' | 'record';
  title: string;
  subtitle: string;
  details: string;
  date?: string;
}

export default function SearchOverlay({ isOpen, onClose, searchType }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim() && isOpen) {
      searchData(query);
    } else {
      setResults([]);
    }
  }, [query, isOpen]);

  const searchData = async (searchQuery: string) => {
    setLoading(true);
    try {
      // Search across all endpoints
      const [patients, hospitals, records] = await Promise.all([
        fetch('http://localhost:3001/patients').then(r => r.json()),
        fetch('http://localhost:3001/hospitals').then(r => r.json()),
        fetch('http://localhost:3001/records').then(r => r.json())
      ]);

      const searchResults: SearchResult[] = [];

      // Search patients
      patients.forEach((patient: any) => {
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        if (fullName.includes(searchQuery.toLowerCase()) || 
            patient.email.toLowerCase().includes(searchQuery.toLowerCase())) {
          searchResults.push({
            id: patient.id,
            type: 'patient',
            title: `${patient.firstName} ${patient.lastName}`,
            subtitle: patient.email,
            details: `DOB: ${patient.dateOfBirth} | ${patient.bloodType}`,
          });
        }
      });

      // Search hospitals
      hospitals.forEach((hospital: any) => {
        if (hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hospital.address.toLowerCase().includes(searchQuery.toLowerCase())) {
          searchResults.push({
            id: hospital.id,
            type: 'hospital',
            title: hospital.name,
            subtitle: hospital.address,
            details: `${hospital.beds} beds | Rating: ${hospital.rating}/5`,
          });
        }
      });

      // Search records
      records.forEach((record: any) => {
        if (record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.physician.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.department.toLowerCase().includes(searchQuery.toLowerCase())) {
          searchResults.push({
            id: record.id,
            type: 'record',
            title: record.diagnosis,
            subtitle: `${record.physician} - ${record.department}`,
            details: record.treatment,
            date: record.date,
          });
        }
      });

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'patient': return <User className="w-5 h-5 text-blue-500" />;
      case 'hospital': return <Hospital className="w-5 h-5 text-green-500" />;
      case 'record': return <FileText className="w-5 h-5 text-amber-500" />;
      default: return <Search className="w-5 h-5" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Search {searchType}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${searchType}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                autoFocus
              />
            </div>

            <div className="overflow-y-auto max-h-96">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((result) => (
                    <motion.div
                      key={result.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        {getIcon(result.type)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800">{result.title}</h3>
                          <p className="text-slate-600 text-sm">{result.subtitle}</p>
                          <p className="text-slate-500 text-sm mt-1">{result.details}</p>
                          {result.date && (
                            <div className="flex items-center mt-2 text-xs text-slate-400">
                              <Calendar className="w-3 h-3 mr-1" />
                              {result.date}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className="text-center py-12 text-slate-500">
                  No results found for "{query}"
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  Start typing to search...
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}