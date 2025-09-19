import { useState, useEffect, useRef } from "react";
import { postJSON } from "../api/ApiClient";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  disabled?: boolean;
}

interface Suggestion {
  text: string;
  confidence: number;
  type: 'namaste' | 'icd' | 'general';
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  placeholder = "Enter symptoms or diagnosis...",
  className = "",
  rows = 4,
  disabled = false
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce search requests
  useEffect(() => {
    if (!value.trim() || value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        // Get ICD suggestions from backend
        const response = await postJSON("/api/search/icd", { text: value, k: 5 });
        
        const newSuggestions: Suggestion[] = [];
        
        // Add ICD suggestions
        if (response.candidates) {
          response.candidates.forEach((candidate: any) => {
            if (candidate.icd_description) {
              newSuggestions.push({
                text: candidate.icd_description,
                confidence: candidate.score || 0.8,
                type: 'icd'
              });
            }
            if (candidate.namaste_term) {
              newSuggestions.push({
                text: candidate.namaste_term,
                confidence: candidate.score || 0.7,
                type: 'namaste'
              });
            }
          });
        }

        // Add some general suggestions based on common symptoms
        const commonSymptoms = [
          'headache', 'fever', 'cough', 'chest pain', 'abdominal pain',
          'nausea', 'vomiting', 'diarrhea', 'constipation', 'fatigue',
          'dizziness', 'shortness of breath', 'joint pain', 'back pain'
        ];

        commonSymptoms.forEach(symptom => {
          if (symptom.toLowerCase().includes(value.toLowerCase()) || 
              value.toLowerCase().includes(symptom.toLowerCase())) {
            newSuggestions.push({
              text: symptom,
              confidence: 0.6,
              type: 'general'
            });
          }
        });

        // Remove duplicates and sort by confidence
        const uniqueSuggestions = newSuggestions
          .filter((suggestion, index, self) => 
            index === self.findIndex(s => s.text === suggestion.text)
          )
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 8);

        setSuggestions(uniqueSuggestions);
        setShowSuggestions(uniqueSuggestions.length > 0);
      } catch (error) {
        console.error("Failed to get suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    onChange(suggestion.text);
    setShowSuggestions(false);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'icd':
        return '🏥';
      case 'namaste':
        return '🌿';
      default:
        return '💡';
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'icd':
        return 'border-blue-200 bg-blue-50';
      case 'namaste':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${className}`}
        rows={rows}
        disabled={disabled}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
      />
      
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent" />
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${getSuggestionColor(suggestion.type)}`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{suggestion.text}</p>
                  <p className="text-xs text-gray-500">
                    {suggestion.type.toUpperCase()} • {Math.round(suggestion.confidence * 100)}% match
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
