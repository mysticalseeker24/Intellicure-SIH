import { Heart } from "lucide-react";
import { useState } from "react";
import { postJSON } from "../api/ApiClient";

export const LoginPage: React.FC<{ onLogin: (user: any) => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'doctor'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        // Login flow
        const resp = await postJSON("/api/login", { 
          username: formData.email, // Using email as username for backend compatibility
          password: formData.password 
        });
        
        // Store token
        localStorage.setItem("access_token", resp.access_token || resp.token || "demo-token");
        
        onLogin({ 
          name: resp.username || formData.name || 'Dr. Amit Patel',
          email: formData.email,
          role: formData.role
        });
      } else {
        // Registration flow (mock for now)
        setError("Registration not implemented yet. Please use login.");
      }
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
          <h1 className="text-2xl font-bold text-gray-900">AYUSH Bridge</h1>
          <p className="text-gray-600 mt-2">Integrating Traditional & Modern Medicine</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 hover:cursor-pointer py-2 text-center rounded-l-md ${
              isLogin ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 hover:cursor-pointer text-center rounded-r-md ${
              !isLogin ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Register
          </button>
        </div> */}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          )}

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

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full hover:cursor-pointer px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
            <div> {isLogin ? <span>New User? <a onClick={() => setIsLogin(false)} className="hover:cursor-pointer text-green-600">Register</a></span>  
            : <span>Already a User? <a onClick={() => setIsLogin(true)} className="hover:cursor-pointer text-green-600">Login</a></span>}</div>
          <button
            type="submit"
            disabled={loading}
            className="w-full hover:cursor-pointer bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : null}
            <span>{loading ? 'Signing in...' : (isLogin ? 'Login' : 'Register')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};