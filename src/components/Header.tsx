import { Heart, LogOut, Menu, X } from "lucide-react";

interface HeaderProps {
  user: any;
  onLogout: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onToggleSidebar, sidebarOpen }) => (
  <header className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center space-x-3">
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">IntelliCure</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
          <button
            onClick={onLogout}
            className="hover:cursor-pointer text-gray-500 hover:text-gray-700 p-2 rounded-md"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </header>
);