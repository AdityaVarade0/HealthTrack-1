/**
 * HealthTrack Data Models & Type Definitions
 */

export interface UserProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  patientId: string;
  role: 'patient' | 'doctor' | 'admin';
  birthDate?: string;
  bloodType?: string;
  heightCm?: number;
  weightKg?: number;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  primaryDoctor?: {
    name: string;
    clinic: string;
    phone?: string;
  };
  reminderEnabled: boolean;
  reminderSound: boolean;
  createdAt: string;
}

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'bedtime' | 'custom';

export interface Medication {
  id: string;
  patientUid: string;
  name: string;
  dosage: string;
  time: string; // "08:00" format (24h)
  timeSlot?: TimeSlot;
  instructions?: string;
  frequency: 'daily' | 'twice_daily' | 'as_needed' | 'weekly';
  colorTag?: string; // e.g. 'purple', 'mint', 'blue', 'peach'
  pillsRemaining?: number;
  refillReminder?: boolean;
  takenDate: string | null; // "YYYY-MM-DD" if taken today
  lastTakenTime?: string | null; // ISO timestamp
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HealthRecord {
  id: string;
  patientUid: string;
  date: string; // ISO timestamp
  bp?: string; // "120/80"
  systolic?: number;
  diastolic?: number;
  sugar?: string | number; // mg/dL
  sugarContext?: 'fasting' | 'post_meal' | 'random';
  weight?: string | number; // kg
  pulse?: number; // bpm
  temperature?: number; // °C or °F
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityItem {
  id: string;
  patientUid: string;
  title: string;
  description: string;
  icon: string;
  type?: 'medication' | 'health_record' | 'reminder' | 'profile';
  date: string; // ISO timestamp
  createdAt?: string;
}

export interface MedicationLog {
  id: string;
  patientUid: string;
  medicationId: string;
  medicationName: string;
  status: 'taken' | 'skipped' | 'missed';
  scheduledAt: string;
  recordedAt: string;
  notes?: string;
}

export type PageType = 'dashboard' | 'medications' | 'health' | 'history' | '3d_lab' | 'assistant';
