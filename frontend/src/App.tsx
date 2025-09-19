import { useEffect, useState, useCallback } from "react";
import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { LoginPage } from "./components/Login";
import { LandingPage } from "./components/LandingPage";
import { PrescriptionPage } from "./components/Prescription";
import { DualCodingPage } from "./components/Dualcode";
import { PatientRecordsPage } from "./components/PatientRec";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { getAuthToken } from "./api/ApiClient";

// Wrapper for LandingPage to use navigation
const LandingPageWithNav = () => {
  const navigate = useNavigate();
  return <LandingPage onGetStarted={() => navigate("/login")} />;
};

const MainApp: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing authentication token
    const token = getAuthToken();
    if (token) {
      // If token exists, set a default user (you could fetch user profile here)
      setUser({
        name: 'Dr. Amit Patel',
        email: 'doctor@example.com',
        role: 'doctor'
      });
    }
    
    // Set initial route based on current path
    const path = window.location.pathname;
    if (path === '/' || path === '') {
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Close sidebar on escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleLogin = useCallback((userData: any) => {
    setUser(userData);
    setSidebarOpen(false);
    navigate("/dashboard");
  }, [navigate]);

  const handleLogout = useCallback(() => {
    // Clear authentication token
    localStorage.removeItem("access_token");
    setUser(null);
    setSidebarOpen(false);
    navigate("/login");
  }, [navigate]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<LandingPageWithNav />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route
          path="*"
          element={
            user ? (
              <>
                <Header 
                  user={user} 
                  onLogout={handleLogout}
                  onToggleSidebar={toggleSidebar}
                  sidebarOpen={sidebarOpen}
                />
                <div className="flex">
                  {/* Single responsive sidebar component */}
                  <RouterBasedSidebar 
                    isOpen={sidebarOpen} 
                    onClose={closeSidebar}
                  />
                  
                  <main className={`flex-1 p-6 transition-all duration-300 ${
                    sidebarOpen ? 'md:ml-0' : ''
                  }`}>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/patient-records" element={<PatientRecordsPage />} />
                      <Route path="/dual-codes" element={<DualCodingPage />} />
                      <Route path="/prescriptions" element={<PrescriptionPage />} />
                      <Route path="/settings" element={
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                          <h2 className="text-2xl font-bold">Settings</h2>
                          <p className="text-gray-600 mt-2">Settings page coming soon...</p>
                        </div>
                      } />
                    </Routes>
                  </main>
                </div>
              </>
            ) : <LoginPage onLogin={handleLogin} />
          }
        />
      </Routes>
    </div>
  );
};

// Optimized router-based sidebar component
interface RouterBasedSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const RouterBasedSidebar: React.FC<RouterBasedSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTabFromPath = useCallback((path: string) => {
    if (path.includes('patient-records')) return 'patient-records';
    if (path.includes('dual-codes')) return 'dual-codes';
    if (path.includes('prescriptions')) return 'prescriptions';
    if (path.includes('settings')) return 'settings';
    return 'dashboard';
  }, []);

  const tabToRoute: Record<string, string> = {
    'dashboard': '/dashboard',
    'patient-records': '/patient-records',
    'dual-codes': '/dual-codes',
    'prescriptions': '/prescriptions',
    'settings': '/settings',
  };

  const activeTab = getActiveTabFromPath(location.pathname);

  const handleTabClick = useCallback((tab: string) => {
    if (tab in tabToRoute) {
      navigate(tabToRoute[tab]);
      onClose(); // Always close on navigation for better UX
    }
  }, [navigate, onClose, tabToRoute]);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}
      
      {/* Sidebar container */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:shadow-none 
        flex flex-col
      `}>
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 ">
          <span className="font-bold text-lg text-gray-900">Menu</span>
          <button 
            onClick={onClose} 
            className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Sidebar content */}
        <Sidebar activeTab={activeTab} setActiveTab={handleTabClick} />
      </div>
    </>
  );
};



export default MainApp;