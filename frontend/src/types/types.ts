export interface Patient {
  id: string;
  abhaId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  lastVisit: string;
}

export interface HealthRecord {
  id: string;
  date: string;
  hospital: string;
  doctor: string;
  namasteCode: string;
  namasteDescription: string;
  icdCode: string;
  icdDescription: string;
  prescription: string[];
  vitals: {
    bp: string;
    pulse: string;
    temp: string;
    weight: string;
  };
}

export interface DualCode {
  namasteCode: string;
  namasteDescription: string;
  icdCode: string;
  icdDescription: string;
  confidence: number;
}

export interface Prescription {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  type: 'ayush' | 'modern';
}

// Sample data
export const samplePatients: Patient[] = [
  {
    id: '1',
    abhaId: '12-3456-7890-1234',
    name: 'Rajesh Kumar',
    age: 45,
    gender: 'Male',
    phone: '+91 9876543210',
    lastVisit: '2024-09-15'
  },
  {
    id: '2',
    abhaId: '98-7654-3210-9876',
    name: 'Priya Sharma',
    age: 32,
    gender: 'Female',
    phone: '+91 8765432109',
    lastVisit: '2024-09-10'
  }
];

export const sampleHealthRecords: HealthRecord[] = [
  {
    id: '1',
    date: '2024-09-15',
    hospital: 'AIIMS Delhi',
    doctor: 'Dr. Arvind Gupta',
    namasteCode: 'AY-001',
    namasteDescription: 'Vata Dosha Imbalance - Neurological',
    icdCode: 'G93.9',
    icdDescription: 'Disorder of brain, unspecified',
    prescription: ['Brahmi Ghrita 5ml BD', 'Saraswatarishta 15ml BD'],
    vitals: {
      bp: '140/90',
      pulse: '78',
      temp: '98.6°F',
      weight: '70kg'
    }
  },
  {
    id: '2',
    date: '2024-08-20',
    hospital: 'Apollo Chennai',
    doctor: 'Dr. Meera Nair',
    namasteCode: 'SI-045',
    namasteDescription: 'Kapha-Pitta Prakruti - Digestive',
    icdCode: 'K59.0',
    icdDescription: 'Constipation',
    prescription: ['Triphala Churna 3g BD', 'Abhayarishta 10ml BD'],
    vitals: {
      bp: '120/80',
      pulse: '72',
      temp: '98.4°F',
      weight: '68kg'
    }
  }
];