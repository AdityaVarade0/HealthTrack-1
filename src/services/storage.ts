import { UserProfile, Medication, HealthRecord, ActivityItem, MedicationLog } from '../types/healthtrack';
import { getTodayKey } from '../utils/healthCalculations';

const CURRENT_USER_KEY = 'healthtrack_current_user';
const USERS_LIST_KEY = 'healthtrack_accounts';
const USER_DATA_PREFIX = 'healthtrack_data_';

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'demo_sarah',
    uid: 'demo_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    phone: '(555) 234-5678',
    patientId: 'HT-1088',
    role: 'patient',
    birthDate: '1984-05-14',
    bloodType: 'A+',
    heightCm: 168,
    weightKg: 64.5,
    allergies: ['Penicillin', 'Sulfa drugs'],
    emergencyContact: {
      name: 'Mark Jenkins',
      relationship: 'Spouse',
      phone: '(555) 876-5432',
    },
    primaryDoctor: {
      name: 'Dr. Evelyn Vance, MD',
      clinic: 'Pinecrest Family Health Center',
      phone: '(555) 345-6789',
    },
    reminderEnabled: true,
    reminderSound: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'demo_alex',
    uid: 'demo_alex',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    phone: '(555) 987-6543',
    patientId: 'HT-2041',
    role: 'patient',
    birthDate: '1979-11-28',
    bloodType: 'O+',
    heightCm: 175,
    weightKg: 78.2,
    allergies: ['Latex'],
    emergencyContact: {
      name: 'Sofia Rivera',
      relationship: 'Sister',
      phone: '(555) 654-3210',
    },
    primaryDoctor: {
      name: 'Dr. Marcus Chen, MD',
      clinic: 'Metropolitan Endocrinology & Vitals',
      phone: '(555) 432-1098',
    },
    reminderEnabled: true,
    reminderSound: true,
    createdAt: '2026-01-15T09:30:00.000Z',
  },
];

export const INITIAL_MEDS_SARAH: Medication[] = [
  {
    id: 'med-1',
    patientUid: 'demo_sarah',
    name: 'Lisinopril',
    dosage: '10 mg',
    time: '08:00',
    timeSlot: 'morning',
    instructions: 'Take 1 tablet every morning with water for blood pressure.',
    frequency: 'daily',
    colorTag: 'purple',
    pillsRemaining: 26,
    refillReminder: true,
    takenDate: getTodayKey(),
    lastTakenTime: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    isActive: true,
    createdAt: '2026-02-01T08:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-2',
    patientUid: 'demo_sarah',
    name: 'Vitamin D3 + K2',
    dosage: '2000 IU',
    time: '08:30',
    timeSlot: 'morning',
    instructions: 'Take with breakfast containing healthy fats.',
    frequency: 'daily',
    colorTag: 'mint',
    pillsRemaining: 45,
    refillReminder: false,
    takenDate: getTodayKey(),
    lastTakenTime: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    isActive: true,
    createdAt: '2026-02-01T08:30:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-3',
    patientUid: 'demo_sarah',
    name: 'Omega-3 Fish Oil',
    dosage: '1000 mg',
    time: '12:30',
    timeSlot: 'afternoon',
    instructions: 'Take with lunch.',
    frequency: 'daily',
    colorTag: 'blue',
    pillsRemaining: 18,
    refillReminder: true,
    takenDate: null,
    isActive: true,
    createdAt: '2026-02-01T12:30:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-4',
    patientUid: 'demo_sarah',
    name: 'Magnesium Glycinate',
    dosage: '200 mg',
    time: '21:00',
    timeSlot: 'bedtime',
    instructions: 'Take 30 minutes before bed with a small sip of water.',
    frequency: 'daily',
    colorTag: 'peach',
    pillsRemaining: 32,
    refillReminder: false,
    takenDate: null,
    isActive: true,
    createdAt: '2026-02-01T21:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_RECORDS_SARAH: HealthRecord[] = [
  {
    id: 'rec-1',
    patientUid: 'demo_sarah',
    date: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    bp: '118/76',
    systolic: 118,
    diastolic: 76,
    sugar: '92',
    sugarContext: 'fasting',
    weight: 64.5,
    pulse: 68,
    notes: 'Morning routine measurement. Felt well-rested after 8 hours sleep.',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rec-2',
    patientUid: 'demo_sarah',
    date: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    bp: '122/78',
    systolic: 122,
    diastolic: 78,
    sugar: '95',
    sugarContext: 'fasting',
    weight: 64.8,
    pulse: 72,
    notes: 'Checked before coffee. Slight afternoon walk completed.',
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rec-3',
    patientUid: 'demo_sarah',
    date: new Date(Date.now() - 52 * 3600 * 1000).toISOString(),
    bp: '124/80',
    systolic: 124,
    diastolic: 80,
    sugar: '98',
    sugarContext: 'fasting',
    weight: 65.0,
    pulse: 74,
    notes: 'Evening reading after light yoga.',
    createdAt: new Date(Date.now() - 52 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rec-4',
    patientUid: 'demo_sarah',
    date: new Date(Date.now() - 76 * 3600 * 1000).toISOString(),
    bp: '119/77',
    systolic: 119,
    diastolic: 77,
    sugar: '94',
    sugarContext: 'fasting',
    weight: 65.1,
    pulse: 70,
    notes: 'Baseline check.',
    createdAt: new Date(Date.now() - 76 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_ACTIVITY_SARAH: ActivityItem[] = [
  {
    id: 'act-1',
    patientUid: 'demo_sarah',
    title: 'Medication dose taken',
    description: 'Vitamin D3 + K2 (2000 IU) marked as taken at 8:32 AM.',
    icon: '✓',
    type: 'medication',
    date: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-2',
    patientUid: 'demo_sarah',
    title: 'Medication dose taken',
    description: 'Lisinopril (10 mg) marked as taken at 8:02 AM.',
    icon: '✓',
    type: 'medication',
    date: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-3',
    patientUid: 'demo_sarah',
    title: 'Health record logged',
    description: 'BP 118/76 mmHg and Fasting Glucose 92 mg/dL recorded.',
    icon: '♡',
    type: 'health_record',
    date: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-4',
    patientUid: 'demo_sarah',
    title: 'Reminder scheduled',
    description: 'Midday Omega-3 dose reminder set for 12:30 PM.',
    icon: '⏰',
    type: 'reminder',
    date: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
];

export interface UserDataset {
  medications: Medication[];
  records: HealthRecord[];
  activity: ActivityItem[];
  medicationLogs: MedicationLog[];
}

class HealthTrackStorage {
  public getUsers(): UserProfile[] {
    try {
      const stored = localStorage.getItem(USERS_LIST_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed reading users from localStorage', e);
    }
    // Default seed
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(DEMO_USERS));
    return DEMO_USERS;
  }

  public saveUser(user: UserProfile) {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.uid === user.uid);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));

    // If this is currently active user, update active user
    const current = this.getCurrentUser();
    if (current && current.uid === user.uid) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
  }

  public getCurrentUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed reading active user', e);
    }
    // By default, start with the rich demo user Sarah Jenkins so the user sees a complete, pristine working dashboard immediately
    const users = this.getUsers();
    const defaultUser = users[0] || DEMO_USERS[0];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
    this.ensureUserData(defaultUser.uid);
    return defaultUser;
  }

  public setCurrentUser(user: UserProfile | null) {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      this.ensureUserData(user.uid);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }

  public getUserData(uid: string): UserDataset {
    try {
      const stored = localStorage.getItem(`${USER_DATA_PREFIX}${uid}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed reading user data', e);
    }

    return this.ensureUserData(uid);
  }

  public ensureUserData(uid: string): UserDataset {
    const key = `${USER_DATA_PREFIX}${uid}`;
    try {
      const existing = localStorage.getItem(key);
      if (existing) {
        return JSON.parse(existing);
      }
    } catch {}

    let initialData: UserDataset;
    if (uid === 'demo_sarah') {
      initialData = {
        medications: INITIAL_MEDS_SARAH,
        records: INITIAL_RECORDS_SARAH,
        activity: INITIAL_ACTIVITY_SARAH,
        medicationLogs: [],
      };
    } else if (uid === 'demo_alex') {
      initialData = {
        medications: [
          {
            id: 'med-alex-1',
            patientUid: 'demo_alex',
            name: 'Metformin',
            dosage: '500 mg',
            time: '08:00',
            timeSlot: 'morning',
            instructions: 'Take with breakfast to minimize upset stomach.',
            frequency: 'twice_daily',
            colorTag: 'mint',
            pillsRemaining: 40,
            refillReminder: true,
            takenDate: getTodayKey(),
            isActive: true,
            createdAt: '2026-02-05T08:00:00.000Z',
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'med-alex-2',
            patientUid: 'demo_alex',
            name: 'Atorvastatin',
            dosage: '20 mg',
            time: '20:30',
            timeSlot: 'bedtime',
            instructions: 'Take in the evening before sleep.',
            frequency: 'daily',
            colorTag: 'purple',
            pillsRemaining: 28,
            refillReminder: false,
            takenDate: null,
            isActive: true,
            createdAt: '2026-02-05T20:30:00.000Z',
            updatedAt: new Date().toISOString(),
          },
        ],
        records: [
          {
            id: 'rec-alex-1',
            patientUid: 'demo_alex',
            date: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
            bp: '126/82',
            systolic: 126,
            diastolic: 82,
            sugar: '112',
            sugarContext: 'fasting',
            weight: 78.2,
            pulse: 74,
            notes: 'Fasting reading before breakfast.',
            createdAt: new Date().toISOString(),
          },
        ],
        activity: [
          {
            id: 'act-alex-1',
            patientUid: 'demo_alex',
            title: 'Account created',
            description: 'Patient wellness profile initialized.',
            icon: '✦',
            type: 'profile',
            date: new Date().toISOString(),
          },
        ],
        medicationLogs: [],
      };
    } else {
      initialData = {
        medications: [],
        records: [],
        activity: [
          {
            id: 'act-new',
            patientUid: uid,
            title: 'Welcome to HealthTrack',
            description: 'Your personal health and medication workspace is ready.',
            icon: '✦',
            type: 'profile',
            date: new Date().toISOString(),
          },
        ],
        medicationLogs: [],
      };
    }

    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }

  public saveUserData(uid: string, data: Partial<UserDataset>) {
    const current = this.getUserData(uid);
    const updated = { ...current, ...data };
    localStorage.setItem(`${USER_DATA_PREFIX}${uid}`, JSON.stringify(updated));
  }

  public resetAllToDemo() {
    localStorage.clear();
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(DEMO_USERS));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(DEMO_USERS[0]));
    this.ensureUserData('demo_sarah');
    this.ensureUserData('demo_alex');
  }
}

export const healthStorage = new HealthTrackStorage();
