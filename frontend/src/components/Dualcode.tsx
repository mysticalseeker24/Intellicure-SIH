import { useState } from "react";
import type { DualCode } from "../types/types";
import { Brain } from "lucide-react";

export const DualCodingPage: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [dualCodes, setDualCodes] = useState<DualCode[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setDualCodes([
        {
          namasteCode: 'AY-089',
          namasteDescription: 'Vata-Pitta Dosha Imbalance with Digestive Symptoms',
          icdCode: 'K30',
          icdDescription: 'Functional dyspepsia',
          confidence: 0.92
        },
        {
          namasteCode: 'SI-124',
          namasteDescription: 'Agni Mandya (Digestive Fire Imbalance)',
          icdCode: 'K59.0',
          icdDescription: 'Constipation',
          confidence: 0.87
        }
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Dual Coding Assistant</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Symptoms or Diagnosis
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe patient symptoms, condition, or traditional diagnosis..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={4}
            />
          </div>
          
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-green-600 hover:cursor-pointer text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Brain className="h-4 w-4 " />
            )}
            <span>{loading ? 'Processing...' : 'Generate Dual Codes'}</span>
          </button>
        </div>
      </div>

      {dualCodes.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-bold mb-6">AI-Generated Dual Codes</h3>
          <div className="space-y-4">
            {dualCodes.map((code, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-semibold">Mapping Suggestion {index + 1}</h4>
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {Math.round(code.confidence * 100)}% confidence
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-3 rounded">
                    <h5 className="font-medium text-orange-800 mb-2">NAMASTE (AYUSH)</h5>
                    <p className="text-sm font-mono text-orange-700">{code.namasteCode}</p>
                    <p className="text-sm mt-1">{code.namasteDescription}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <h5 className="font-medium text-blue-800 mb-2">ICD-11 (Biomedicine)</h5>
                    <p className="text-sm font-mono text-blue-700">{code.icdCode}</p>
                    <p className="text-sm mt-1">{code.icdDescription}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200">
                    Suggest Alternative
                  </button>
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                    Save Mapping
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
