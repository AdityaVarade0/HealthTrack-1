import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Medication, HealthRecord, ActivityItem, UserProfile } from '../types/healthtrack';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with firestoreDatabaseId
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logOutFirebase(): Promise<void> {
  await signOut(auth);
}

// Connection test
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore client is offline or initializing.');
      return false;
    }
    // Any other response means we connected to Firestore
    return true;
  }
}

// User Profile
export async function syncUserProfileToFirestore(user: UserProfile): Promise<void> {
  const userDocRef = doc(db, 'users', user.uid);
  await setDoc(
    userDocRef,
    {
      uid: user.uid,
      displayName: user.name,
      email: user.email,
      phone: user.phone || '',
      patientId: user.patientId || '',
      role: user.role || 'patient',
      status: 'active',
      reminderEnabled: user.reminderEnabled ?? true,
      reminderSound: user.reminderSound ?? true,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

// Real-time listener for Medications
export function subscribeToMedications(
  patientUid: string,
  onUpdate: (meds: Medication[]) => void
): () => void {
  const colRef = collection(db, 'patients', patientUid, 'medications');
  const q = query(colRef, orderBy('time', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const meds: Medication[] = [];
      snapshot.forEach((d) => {
        meds.push({ id: d.id, ...(d.data() as Omit<Medication, 'id'>) });
      });
      onUpdate(meds);
    },
    (err) => {
      console.warn('Medications snapshot error:', err);
    }
  );
}

export async function saveMedicationToFirestore(
  patientUid: string,
  medication: Medication
): Promise<void> {
  const medRef = doc(db, 'patients', patientUid, 'medications', medication.id);
  await setDoc(medRef, medication, { merge: true });
}

export async function deleteMedicationFromFirestore(
  patientUid: string,
  medicationId: string
): Promise<void> {
  const medRef = doc(db, 'patients', patientUid, 'medications', medicationId);
  await deleteDoc(medRef);
}

// Real-time listener for Health Records
export function subscribeToHealthRecords(
  patientUid: string,
  onUpdate: (records: HealthRecord[]) => void
): () => void {
  const colRef = collection(db, 'patients', patientUid, 'healthRecords');
  const q = query(colRef, orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const recs: HealthRecord[] = [];
      snapshot.forEach((d) => {
        recs.push({ id: d.id, ...(d.data() as Omit<HealthRecord, 'id'>) });
      });
      onUpdate(recs);
    },
    (err) => {
      console.warn('Health records snapshot error:', err);
    }
  );
}

export async function saveHealthRecordToFirestore(
  patientUid: string,
  record: HealthRecord
): Promise<void> {
  const recRef = doc(db, 'patients', patientUid, 'healthRecords', record.id);
  await setDoc(recRef, record, { merge: true });
}

export async function deleteHealthRecordFromFirestore(
  patientUid: string,
  recordId: string
): Promise<void> {
  const recRef = doc(db, 'patients', patientUid, 'healthRecords', recordId);
  await deleteDoc(recRef);
}

// Real-time listener for Activity Log
export function subscribeToActivity(
  patientUid: string,
  onUpdate: (activity: ActivityItem[]) => void
): () => void {
  const colRef = collection(db, 'patients', patientUid, 'activity');
  const q = query(colRef, orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ActivityItem[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<ActivityItem, 'id'>) });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('Activity snapshot error:', err);
    }
  );
}

export async function saveActivityToFirestore(
  patientUid: string,
  item: ActivityItem
): Promise<void> {
  const actRef = doc(db, 'patients', patientUid, 'activity', item.id);
  await setDoc(actRef, item, { merge: true });
}

export async function clearActivityInFirestore(patientUid: string, activityList: ActivityItem[]): Promise<void> {
  const promises = activityList.map((item) =>
    deleteDoc(doc(db, 'patients', patientUid, 'activity', item.id))
  );
  await Promise.all(promises);
}
