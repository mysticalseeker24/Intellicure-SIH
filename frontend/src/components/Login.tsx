import { Heart } from "lucide-react";
import { useState } from "react";
import { postJSON } from "../api/ApiClient";

export const LoginPage: React.FC<{ onLogin: (user: any) => void }> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Login flow with role
      const resp = await postJSON("/api/login", { 
        username: formData.email, // Using email as username for backend compatibility
        password: formData.password,
        role: selectedRole
      });
      
      // Store token
      localStorage.setItem("access_token", resp.access_token || resp.token || "demo-token");
      
      onLogin({ 
        name: resp.name || resp.username || formData.name || (selectedRole === 'patient' ? 'Patient User' : 'Dr. Amit Patel'),
        email: formData.email,
        role: resp.role || selectedRole,
        user_id: resp.user_id
      });
    } catch (err) {
      console.error("Login failed", err);
      setError("Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Heart className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">IntelliCure</h1>
          <p className="text-gray-600 mt-2">Intelligent Healthcare Solutions</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Role Selection */}
        {!selectedRole ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center text-gray-700">Choose Your Role</h3>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setSelectedRole('patient')}
                className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Patient</h4>
                    <p className="text-sm text-gray-600">Access your health records and get intelligent diagnosis assistance</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedRole('doctor')}
                className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Hospital/Doctor</h4>
                    <p className="text-sm text-gray-600">Access intelligent hospital management features and patient records</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Back button */}
            <button
              onClick={() => setSelectedRole(null)}
              className="mb-4 text-green-600 hover:text-green-800 text-sm flex items-center"
            >
              ← Back to role selection
            </button>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Logging in as: <span className="font-semibold capitalize">{selectedRole}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full hover:cursor-pointer bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : null}
                <span>{loading ? 'Signing in...' : `Login as ${selectedRole}`}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};