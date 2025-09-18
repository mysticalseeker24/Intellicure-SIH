import { BookOpen, Brain, Database, Heart, Hospital, Pill, Shield, TrendingUp, UserCheck, Zap } from "lucide-react";

export const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">AYUSH Bridge</span>
          </div>
          <button
            onClick={onGetStarted}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </header>

      <main className="py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Bridging Traditional & Modern Medicine
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Seamlessly integrate AYUSH (Ayurveda, Yoga, Unani, Siddha, Homeopathy) 
            with biomedicine using dual coding standards for comprehensive healthcare.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-green-600 text-white px-8 py-3 rounded-md text-lg hover:bg-green-700 transition-colors"
          >
            Start Your Journey
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Brain className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">AI-Powered Mapping</h3>
            <p className="text-gray-600">
              Advanced AI maps AYUSH diagnoses to ICD-11 codes automatically, 
              ensuring accurate dual coding.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Shield className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">FHIR R4 Compliant</h3>
            <p className="text-gray-600">
              Built on FHIR R4 standards for seamless integration with existing 
              EMR/EHR systems.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Zap className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Offline First</h3>
            <p className="text-gray-600">
              Works in rural areas with poor connectivity, syncing when 
              connection is restored.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <UserCheck className="h-6 w-6 text-green-600" />
                <span>ABHA ID Integration</span>
              </div>
              <div className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6 text-green-600" />
                <span>Dual Coding (NAMASTE + ICD-11)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Hospital className="h-6 w-6 text-green-600" />
                <span>Multi-Hospital Network</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <span>Research Analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <Pill
                 className="h-6 w-6 text-green-600" />
                <span>Integrated Prescriptions</span>
              </div>
              <div className="flex items-center space-x-3">
                <Database className="h-6 w-6 text-green-600" />
                <span>Secure Data Management</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
);
