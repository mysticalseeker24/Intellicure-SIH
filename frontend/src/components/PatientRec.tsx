import { Download, Eye, Pill, Search } from "lucide-react";
import { useState } from "react";
import { sampleHealthRecords, samplePatients, type HealthRecord, type Patient } from "../types/types";
import { getJSON } from "../api/ApiClient";

export const PatientRecordsPage: React.FC = () => {
  const [searchAbha, setSearchAbha] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchAbha.trim()) {
      setError("Please enter an ABHA ID");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Fetch patient info
      const patient = await getJSON(`/api/patient/${encodeURIComponent(searchAbha)}`);
      
      // Map backend response to frontend Patient type
      const mappedPatient: Patient = {
        id: patient.id || patient.abha_id || searchAbha,
        abhaId: patient.abha_id || searchAbha,
        name: patient.name || "Unknown",
        age: patient.age || 0,
        gender: patient.gender || "Unknown",
        phone: patient.phone || "N/A",
        lastVisit: patient.last_visit || patient.lastVisit || "N/A"
      };
      
      setSelectedPatient(mappedPatient);
      
      // Fetch patient history
      try {
        const history = await getJSON(`/api/patient/${encodeURIComponent(searchAbha)}/history`);
        
        // Map backend history to frontend HealthRecord type
        const mappedRecords: HealthRecord[] = (history.history || []).map((record: any) => ({
          id: record.id || record.patient_reference || "",
          date: record.created_at || record.date || new Date().toISOString(),
          hospital: record.hospital || "Unknown Hospital",
          doctor: record.doctor || "Unknown Doctor",
          namasteCode: record.namaste_code || "",
          namasteDescription: record.namaste_display || record.namaste_description || "",
          icdCode: record.icd_code || "",
          icdDescription: record.icd_display || record.icd_description || "",
          prescription: record.prescription || [],
          vitals: record.vitals || {
            bp: "N/A",
            pulse: "N/A", 
            temp: "N/A",
            weight: "N/A"
          }
        }));
        
        setHealthRecords(mappedRecords);
      } catch (historyError) {
        console.warn("Could not fetch patient history:", historyError);
        setHealthRecords([]);
      }
      
    } catch (err) {
      console.error("Patient lookup failed", err);
      setError("Patient not found. Please check the ABHA ID and try again.");
      setSelectedPatient(null);
      setHealthRecords([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Patient Records</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <div className="flex space-x-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter ABHA ID
            </label>
            <input
              type="text"
              value={searchAbha}
              onChange={(e) => setSearchAbha(e.target.value)}
              placeholder="12-3456-7890-1234"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading || !searchAbha.trim()}
              className="bg-green-600 hover:cursor-pointer text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
        </div>

        {selectedPatient && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-2">Patient Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p><strong>Name:</strong> {selectedPatient.name}</p>
                <p><strong>ABHA ID:</strong> {selectedPatient.abhaId}</p>
                <p><strong>Age:</strong> {selectedPatient.age}</p>
              </div>
              <div>
                <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                <p><strong>Last Visit:</strong> {selectedPatient.lastVisit}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {healthRecords.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-bold mb-6">Health Records History</h3>
          <div className="space-y-4">
            {healthRecords.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">{record.hospital}</h4>
                    <p className="text-gray-600">{record.doctor}</p>
                    <p className="text-sm text-gray-500">{record.date}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-green-600 hover:text-green-800">
                      <Eye className="h-4 w-4 hover:cursor-pointer" />
                    </button>
                    <button className="text-green-600 hover:text-green-800">
                      <Download className="h-4 w-4 hover:cursor-pointer" />
                    </button>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-orange-50 p-3 rounded">
                    <h5 className="font-medium text-orange-800">AYUSH Diagnosis</h5>
                    <p className="text-sm text-orange-700">{record.namasteCode}</p>
                    <p className="text-sm">{record.namasteDescription}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <h5 className="font-medium text-blue-800">ICD-11 Diagnosis</h5>
                    <p className="text-sm text-blue-700">{record.icdCode}</p>
                    <p className="text-sm">{record.icdDescription}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Prescriptions</h5>
                    <ul className="text-sm space-y-1">
                      {record.prescription.map((med, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <Pill className="h-3 w-3 text-green-600" />
                          <span>{med}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Vitals</h5>
                    <div className="text-sm space-y-1">
                      <p><strong>BP:</strong> {record.vitals.bp}</p>
                      <p><strong>Pulse:</strong> {record.vitals.pulse} bpm</p>
                      <p><strong>Temperature:</strong> {record.vitals.temp}</p>
                      <p><strong>Weight:</strong> {record.vitals.weight}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
