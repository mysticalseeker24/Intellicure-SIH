import { BookOpen, Brain, Hospital, Pill, Plus, Search, Users } from "lucide-react";

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-gray-600">Patients Registered</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">3,891</p>
              <p className="text-gray-600">Dual Codes Generated</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <Hospital className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-gray-600">Connected Hospitals</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">New patient record added</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Dual code mapping completed</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Prescription generated</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Search className="h-5 w-5 text-green-600 mb-2" />
              <p className="text-sm font-medium">Search Patient</p>
            </button>
            <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Plus className="h-5 w-5 text-green-600 mb-2" />
              <p className="text-sm font-medium">Add Record</p>
            </button>
            <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Brain className="h-5 w-5 text-green-600 mb-2" />
              <p className="text-sm font-medium">Generate Codes</p>
            </button>
            <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Pill className="h-5 w-5 text-green-600 mb-2" />
              <p className="text-sm font-medium">Create Prescription</p>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold mb-4">Integration Status</h3>
        <div className="space-y-4">
          <div className="flex justify-between-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>ABHA ID Service</span>
            </div>
            <span className="text-green-700 text-sm">Connected</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>FHIR R4 API</span>
            </div>
            <span className="text-green-700 text-sm">Active</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>AI Mapping Service</span>
            </div>
            <span className="text-yellow-700 text-sm">Syncing</span>
          </div>
        </div>
      </div>
    </div>
  );
};
