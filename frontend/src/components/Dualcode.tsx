import { useState } from "react";
import type { DualCode } from "../types/types";
import { Brain, Mic, Volume2 } from "lucide-react";
import { postJSON, postAudio, postTTS, playAudioFromBase64 } from "../api/ApiClient";
import { AutocompleteInput } from "./AutocompleteInput";

export const DualCodingPage: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [dualCodes, setDualCodes] = useState<DualCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const handleSearch = async () => {
    if (!symptoms.trim()) {
      setError("Please enter symptoms or diagnosis");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const resp = await postJSON("/api/search/icd", { text: symptoms, k: 5 });
      
      // Map server candidates to DualCode type
      const codes = (resp.candidates || []).map((c: any) => ({
        namasteCode: c.namaste_code || c.namaste?.code || "",
        namasteDescription: c.namaste_term || c.namaste?.display || "",
        icdCode: c.icd_code || c.icd?.code || c.icd_term || "",
        icdDescription: c.icd_description || c.icd?.description || "",
        confidence: c.score ?? c.confidence ?? 0
      }));
      
      setDualCodes(codes);
    } catch (err) {
      console.error("Search failed", err);
      setError("Search failed. Please try again.");
      setDualCodes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Voice input not supported in this browser");
      return;
    }

    setRecording(true);
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        
        try {
          const result = await postAudio(audioBlob as any);
          setSymptoms(result.transcript);
          setRecording(false);
        } catch (err) {
          console.error("Speech-to-text failed", err);
          setError("Voice input failed. Please try typing instead.");
          setRecording(false);
        }
      };

      mediaRecorder.start();
      
      // Stop recording after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 5000);
      
    } catch (err) {
      console.error("Microphone access failed", err);
      setError("Microphone access denied. Please enable microphone permissions.");
      setRecording(false);
    }
  };

  const handleVoiceOutput = async () => {
    if (!symptoms.trim()) {
      setError("No text to convert to speech");
      return;
    }

    setAudioEnabled(true);
    try {
      const result = await postTTS(symptoms);
      playAudioFromBase64(result.audio_base64);
    } catch (err) {
      console.error("Text-to-speech failed", err);
      setError("Voice output failed. Please try again.");
    } finally {
      setAudioEnabled(false);
    }
  };

  const saveMapping = async (namasteCode: string, namasteDisplay: string, icdCode: string, icdDisplay: string, abhaId: string = "ABHA-0001") => {
    const bundle = {
      resourceType: "Bundle",
      type: "transaction",
      entry: [
        {
          resource: {
            resourceType: "Condition",
            clinicalStatus: { 
              coding: [{ 
                system: "http://terminology.hl7.org/CodeSystem/condition-clinical", 
                code: "active" 
              }] 
            },
            code: {
              coding: [
                { 
                  system: "https://example.org/fhir/CodeSystem/namaste", 
                  code: namasteCode, 
                  display: namasteDisplay 
                },
                { 
                  system: "https://id.who.int/icd/entity", 
                  code: icdCode, 
                  display: icdDisplay 
                }
              ]
            },
            subject: { reference: `Patient/${abhaId}` }
          },
          request: { method: "POST", url: "Condition" }
        }
      ]
    };
    
    try {
      const result = await postJSON("/fhir/bundle/ingest", bundle);
      console.log("Saved mapping", result);
      setError(null);
      // Optionally show success message or update UI
    } catch (e) {
      console.error("Save mapping failed", e);
      setError("Failed to save mapping. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Dual Coding Assistant</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Symptoms or Diagnosis
            </label>
            <div className="relative">
              <AutocompleteInput
                value={symptoms}
                onChange={setSymptoms}
                placeholder="Describe patient symptoms, condition, or traditional diagnosis..."
                className="pr-20"
                rows={4}
                disabled={loading}
              />
              <div className="absolute bottom-2 right-2 flex space-x-1">
                <button
                  onClick={handleVoiceInput}
                  disabled={recording || loading}
                  className={`p-2 rounded-md transition-colors ${
                    recording 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Voice Input"
                >
                  <Mic className="h-4 w-4" />
                </button>
                <button
                  onClick={handleVoiceOutput}
                  disabled={audioEnabled || loading}
                  className={`p-2 rounded-md transition-colors ${
                    audioEnabled 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Voice Output"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSearch}
            disabled={loading || !symptoms.trim()}
            className="bg-green-600 hover:cursor-pointer text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Brain className="h-4 w-4" />
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
                  <button 
                    onClick={() => handleSearch()} // Re-search for alternatives
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200"
                  >
                    Suggest Alternative
                  </button>
                  <button 
                    onClick={() => saveMapping(code.namasteCode, code.namasteDescription, code.icdCode, code.icdDescription)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
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
