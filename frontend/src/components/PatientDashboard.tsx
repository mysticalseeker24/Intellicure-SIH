import { Heart, Stethoscope, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <Heart className="h-8 w-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Welcome to Your Health Portal</h2>
        </div>
        <p className="text-gray-600">
          Access your health records, get AI-powered diagnosis assistance, and manage your health information securely.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <Stethoscope className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Quick Diagnosis</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Get AI-powered diagnosis assistance for your symptoms using both traditional AYUSH and modern medicine approaches.
          </p>
          <button 
            onClick={() => navigate('/diagnosis')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Start Diagnosis
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Health Records</h3>
          </div>
          <p className="text-gray-600 mb-4">
            View your complete health history, prescriptions, and medical records from all connected hospitals.
          </p>
          <button 
            onClick={() => navigate('/profile')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            View Records
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm">Diagnosis completed for headache symptoms</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm">New prescription added to your records</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm">Health checkup scheduled</p>
              <p className="text-xs text-gray-500">3 days ago</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold mb-4">Health Status</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">Good</div>
            <div className="text-sm text-gray-600">Overall Health</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">2</div>
            <div className="text-sm text-gray-600">Active Prescriptions</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">5</div>
            <div className="text-sm text-gray-600">Total Visits</div>
          </div>
        </div>
      </div>
    </div>
  );
};
