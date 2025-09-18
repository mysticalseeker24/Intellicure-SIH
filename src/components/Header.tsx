import { Heart, LogOut } from "lucide-react";

export const Header: React.FC<{ user: any; onLogout: () => void }> = ({ user, onLogout }) => (
  <header className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center">
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