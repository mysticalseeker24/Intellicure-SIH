import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Guitar as Hospital, User, Activity, Shield, Search, BarChart3 } from 'lucide-react';



export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-800">Intellicure</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <motion.h1 
                  className="text-5xl lg:text-6xl font-black text-slate-800 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Modern Healthcare
                  <span className="text-blue-600 block">Directory System</span>
                </motion.h1>
                <motion.p 
                  className="text-xl text-slate-600 mt-6 leading-relaxed font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  IntelliCure bridges the gap between traditional and modern medicine by mapping NAMASTE AYUSH codes with ICD-11 standards. Designed for hospitals across disciplines, it ensures that Ayurveda, Siddha and Unani diagnoses can seamlessly coexist with biomedical records. 
                </motion.p>
              </div>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link 
                  to="/login?role=hospital"
                  className="group flex items-center justify-center space-x-3 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Hospital className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>Hospital Login</span>
                </Link>
                
                <Link 
                  to="/login?role=patient"
                  className="group flex items-center justify-center space-x-3 px-8 py-4 bg-white text-slate-800 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all hover:scale-105 shadow-lg hover:shadow-xl border-2 border-slate-200"
                >
                  <User className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>Patient Login</span>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="relative"
            >
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-slate-200/50">
                <div className="grid grid-cols-2 gap-6">
                  <motion.div 
                    className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring" }}
                  >
                    <Search className="w-8 h-8 mb-3" />
                    <h3 className="font-bold text-lg">Smart Search</h3>
                    <p className="text-blue-100 text-sm">Find records instantly</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", delay: 0.1 }}
                  >
                    <Shield className="w-8 h-8 mb-3" />
                    <h3 className="font-bold text-lg">Secure Access</h3>
                    <p className="text-green-100 text-sm">HIPAA compliant</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <BarChart3 className="w-8 h-8 mb-3" />
                    <h3 className="font-bold text-lg">Analytics</h3>
                    <p className="text-amber-100 text-sm">Data insights</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", delay: 0.3 }}
                  >
                    <Activity className="w-8 h-8 mb-3" />
                    <h3 className="font-bold text-lg">Real-time</h3>
                    <p className="text-purple-100 text-sm">Live updates</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

    {/* Footer Section */}
<motion.footer 
  className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-slate-300 pt-16 pb-10 mt-20 overflow-hidden"
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
>
  {/* Subtle background texture */}
  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/geometry.png')]"></div>
  
  <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-4 gap-12 z-10">
    
    {/* Logo + About */}
    <div className="col-span-2 space-y-6">
      <div className="flex items-center space-x-3">
        <Activity className="w-8 h-8 text-blue-400" />
        <span className="text-2xl font-bold text-white">Intellicure</span>
      </div>
      <p className="text-slate-400 max-w-md">
        Bridging modern medicine and AYUSH systems with ICD-11 compliance. 
        Secure, intelligent, and patient-centered healthcare solutions.
      </p>
    </div>

    {/* Quick Links */}
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
      <ul className="space-y-3">
        <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
        <li><Link to="/features" className="hover:text-blue-400 transition-colors">Features</Link></li>
        <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
        <li><Link to="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
      </ul>
    </div>

    {/* Contact Info */}
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Get in Touch</h3>
      <ul className="space-y-3 text-slate-400">
        <li className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-blue-400" />
          <span>Mishra farmaciie</span>
        </li>
        <li className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <span>696969</span>
        </li>
        <li className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <span>Gorakhpur, India</span>
        </li>
      </ul>
    </div>
  </div>

  {/* Bottom Bar */}
  <div className="relative mt-16 pt-6 border-t border-slate-700/50 text-center text-sm color: #1d4ed8">
    <p>© {new Date().getFullYear()} IntelliCure. All rights reserved.</p>
  </div>

  {/* Decorative blurred circles */}
  <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
  <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-600 rounded-full blur-3xl opacity-20"></div>
</motion.footer>


    </div>
  );
}