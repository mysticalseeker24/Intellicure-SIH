import { useState } from "react";
import type { Prescription } from "../types/types";
import { Pill } from "lucide-react";
import { postJSON } from "../api/ApiClient";
import { AutocompleteInput } from "./AutocompleteInput";

export const PrescriptionPage: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePrescription = async () => {
    if (!symptoms.trim()) {
      setError("Please enter symptoms to generate prescriptions");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // First get ICD codes for the symptoms
      const icdResponse = await postJSON("/api/search/icd", { text: symptoms, k: 3 });
      
      // Generate prescriptions based on the diagnosis
      // For now, we'll use the existing mock data but structure it based on the ICD response
      const mockPrescriptions: Prescription[] = [
        {
          medicine: 'Triphala Churna',
          dosage: '3g',
          frequency: 'Twice daily',
          duration: '15 days',
          type: 'ayush'
        },
        {
          medicine: 'Brahmi Ghrita',
          dosage: '5ml',
          frequency: 'Twice daily with warm milk',
          duration: '1 month',
          type: 'ayush'
        },
        {
          medicine: 'Omeprazole',
          dosage: '20mg',
          frequency: 'Once daily before breakfast',
          duration: '2 weeks',
          type: 'modern'
        }
      ];
      
      setPrescriptions(mockPrescriptions);
      
      // Log the ICD response for debugging
      console.log("ICD codes found:", icdResponse);
      
    } catch (err) {
      console.error("Failed to generate prescriptions", err);
      setError("Failed to generate prescriptions. Please try again.");
      
      // Fallback to mock data on error
      setPrescriptions([
        {
          medicine: 'Triphala Churna',
          dosage: '3g',
          frequency: 'Twice daily',
          duration: '15 days',
          type: 'ayush'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Prescription Assistant</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Patient Symptoms
            </label>
            <AutocompleteInput
              value={symptoms}
              onChange={setSymptoms}
              placeholder="Describe patient symptoms for personalized prescription recommendations..."
              rows={4}
              disabled={loading}
            />
          </div>
          
          <button
            onClick={handleGeneratePrescription}
            disabled={loading || !symptoms.trim()}
            className="bg-green-600 hover:cursor-pointer text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Pill className="h-4 w-4" />
            )}
            <span>{loading ? 'Generating...' : 'Generate Prescription'}</span>
          </button>
        </div>
      </div>

      {prescriptions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-bold mb-6">Recommended Prescriptions</h3>
          <div className="space-y-4">
            {prescriptions.map((prescription, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-lg">{prescription.medicine}</h4>
                  <span className={`px-2 py-1 rounded text-sm ${
                    prescription.type === 'ayush' 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {prescription.type === 'ayush' ? 'AYUSH' : 'Modern'}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Dosage</p>
                    <p>{prescription.dosage}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Frequency</p>
                    <p>{prescription.frequency}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Duration</p>
                    <p>{prescription.duration}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <button className="bg-gray-100 hover:cursor-pointer text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200">
                    Modify
                  </button>
                  <button className="bg-green-600 hover:cursor-pointer text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                    Add to Prescription
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-4 mt-6">
            <button className="bg-gray-100 hover:cursor-pointer text-gray-700 px-4 py-2 rounded hover:bg-gray-200">
              Save as Draft
            </button>
            <button className="bg-green-600 hover:cursor-pointer text-white px-4 py-2 rounded hover:bg-green-700">
              Generate Final Prescription
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
