import { BookOpen, Home, Pill, Settings, Users } from "lucide-react";

export const Sidebar: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({ 
  activeTab, 
  setActiveTab 
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'patient-records', label: 'Patient Records', icon: Users },
    { id: 'dual-codes', label: 'Dual Coding', icon: BookOpen },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen border-r">
      <nav className="mt-8">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`hover:cursor-pointer w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    activeTab === item.id
                      ? 'bg-green-100 text-green-700 border-r-2 border-green-500'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};