import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { LoginPage } from "./components/Login";
import { LandingPage } from "./components/LandingPage";
import { PrescriptionPage } from "./components/Prescription";
import { DualCodingPage } from "./components/Dualcode";
import { PatientRecordsPage } from "./components/PatientRec";

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setCurrentView('app');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'patient-records':
        return <PatientRecordsPage />;
      case 'dual-codes':
        return <DualCodingPage />;
      case 'prescriptions':
        return <PrescriptionPage />;
      default:
        return <Dashboard />;
    }
  };

  if (currentView === 'landing') {
    return <LandingPage onGetStarted={() => setCurrentView('login')} />;
  }

  if (currentView === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
       
  );
};

export default MainApp;