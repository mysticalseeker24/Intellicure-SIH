import { User, Mail, Phone, Calendar, MapPin, Heart, Edit } from "lucide-react";

export const PatientProfile: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <User className="h-8 w-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Profile Picture and Basic Info */}
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Rajesh Kumar</h3>
              <p className="text-gray-600">Patient ID: ABHA-1234567890</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">rajesh.kumar@email.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">+91 98765 43210</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium">15 March 1980</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">123, Green Park, New Delhi - 110016</p>
                </div>
              </div>
            </div>
          </div>

          {/* Health Information */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-4">Health Information</h4>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Blood Type</h5>
                  <p className="text-gray-600">O+</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Allergies</h5>
                  <p className="text-gray-600">Penicillin, Dust</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Chronic Conditions</h5>
                  <p className="text-gray-600">Diabetes Type 2, Hypertension</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Emergency Contact</h5>
                  <p className="text-gray-600">Priya Sharma - +91 87654 32109 (Spouse)</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Insurance Information</h4>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Heart className="h-5 w-5 text-blue-600" />
                  <h5 className="font-medium text-gray-900">ABHA Health Card</h5>
                </div>
                <p className="text-sm text-gray-600">Card Number: 1234-5678-9012-3456</p>
                <p className="text-sm text-gray-600">Valid until: 31 Dec 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Medical History Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold mb-4">Recent Medical History</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium">General Checkup</h4>
              <p className="text-sm text-gray-600">Dr. Arvind Gupta - AIIMS Delhi</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">15 Sep 2024</p>
              <p className="text-sm text-green-600">Completed</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium">Blood Sugar Test</h4>
              <p className="text-sm text-gray-600">Dr. Meera Nair - Apollo Chennai</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">10 Sep 2024</p>
              <p className="text-sm text-green-600">Completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
