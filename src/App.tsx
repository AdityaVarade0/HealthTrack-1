/**
 * HealthTrack - Patient Wellness & Medication Management Dashboard
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PageType, UserProfile, Medication, HealthRecord, ActivityItem } from './types/healthtrack';
import { healthStorage } from './services/storage';
import { soundService } from './utils/audio';
import { getTodayKey, formatTime12h } from './utils/healthCalculations';

// Components
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Toast, ToastMessage } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { MedicationsView } from './components/MedicationsView';
import { HealthRecordsView } from './components/HealthRecordsView';
import { HistoryRemindersView } from './components/HistoryRemindersView';
import { ThreeScene } from './components/ThreeScene';
import { GeminiChatbot } from './components/GeminiChatbot';
import { MedicationModal } from './components/MedicationModal';
import { MissedDoseAlertModal } from './components/MissedDoseAlertModal';
import { PatientProfileModal } from './components/PatientProfileModal';
import { ReportModal } from './components/ReportModal';
import { FirebaseStatusModal } from './components/FirebaseStatusModal';

// Firebase Services
import {
  subscribeToMedications,
  saveMedicationToFirestore,
  deleteMedicationFromFirestore,
  subscribeToHealthRecords,
  saveHealthRecordToFirestore,
  deleteHealthRecordFromFirestore,
  subscribeToActivity,
  saveActivityToFirestore,
  clearActivityInFirestore,
  syncUserProfileToFirestore,
  testFirestoreConnection,
} from './services/firebase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => healthStorage.getCurrentUser());
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  // User-specific datasets
  const [medications, setMedications] = useState<Medication[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [addMedModalOpen, setAddMedModalOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] = useState<Medication | null>(null);
  const [missedDoseModalOpen, setMissedDoseModalOpen] = useState(false);
  const [missedDoseMed, setMissedDoseMed] = useState<Medication | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [firebaseModalOpen, setFirebaseModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load active user's dataset on user change and bind Firestore real-time sync
  useEffect(() => {
    if (!currentUser) {
      setMedications([]);
      setRecords([]);
      setActivity([]);
      return;
    }

    // 1. Initial fast load from local cache
    const data = healthStorage.getUserData(currentUser.uid);
    setMedications(data.medications || []);
    setRecords(data.records || []);
    setActivity(data.activity || []);

    // 2. Attach real-time Firestore listeners
    let unsubMeds: (() => void) | undefined;
    let unsubRecords: (() => void) | undefined;
    let unsubActivity: (() => void) | undefined;

    try {
      unsubMeds = subscribeToMedications(currentUser.uid, (remoteMeds) => {
        if (remoteMeds && remoteMeds.length > 0) {
          setMedications(remoteMeds);
          healthStorage.saveUserData(currentUser.uid, { medications: remoteMeds });
        }
      });

      unsubRecords = subscribeToHealthRecords(currentUser.uid, (remoteRecs) => {
        if (remoteRecs && remoteRecs.length > 0) {
          setRecords(remoteRecs);
          healthStorage.saveUserData(currentUser.uid, { records: remoteRecs });
        }
      });

      unsubActivity = subscribeToActivity(currentUser.uid, (remoteActs) => {
        if (remoteActs && remoteActs.length > 0) {
          setActivity(remoteActs);
          healthStorage.saveUserData(currentUser.uid, { activity: remoteActs });
        }
      });
    } catch (e) {
      console.warn('Firestore live listener initialization:', e);
    }

    return () => {
      unsubMeds?.();
      unsubRecords?.();
      unsubActivity?.();
    };
  }, [currentUser?.uid]);

  // Sync dataset changes back to storage and Firestore
  const syncUserData = (
    newMeds: Medication[],
    newRecords: HealthRecord[],
    newActivity: ActivityItem[]
  ) => {
    if (!currentUser) return;
    setMedications(newMeds);
    setRecords(newRecords);
    setActivity(newActivity);
    healthStorage.saveUserData(currentUser.uid, {
      medications: newMeds,
      records: newRecords,
      activity: newActivity,
    });
  };

  const handleToggleMedicationTaken = (id: string) => {
    if (!currentUser) return;
    const today = getTodayKey();
    const med = medications.find((m) => m.id === id);
    if (!med) return;

    const wasTaken = med.takenDate === today;
    const nextTakenDate = wasTaken ? null : today;
    const lastTakenTime = wasTaken ? null : new Date().toISOString();

    let pillsRemaining = med.pillsRemaining;
    if (!wasTaken && pillsRemaining !== undefined && pillsRemaining > 0) {
      pillsRemaining -= 1;
    } else if (wasTaken && pillsRemaining !== undefined) {
      pillsRemaining += 1;
    }

    const updatedMed: Medication = {
      ...med,
      takenDate: nextTakenDate,
      lastTakenTime,
      pillsRemaining,
      updatedAt: new Date().toISOString(),
    };

    const newMeds = medications.map((m) => (m.id === id ? updatedMed : m));

    const newActivityItem: ActivityItem = {
      id: `act_${Date.now()}`,
      patientUid: currentUser.uid,
      title: wasTaken ? 'Medication marked pending' : 'Medication dose taken',
      description: wasTaken
        ? `${med.name} (${med.dosage}) reset to pending schedule.`
        : `${med.name} (${med.dosage}) marked as taken at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      icon: wasTaken ? '◷' : '✓',
      type: 'medication',
      date: new Date().toISOString(),
    };

    const newActivity = [newActivityItem, ...activity];
    syncUserData(newMeds, records, newActivity);

    // Persist to Cloud Firestore
    saveMedicationToFirestore(currentUser.uid, updatedMed).catch(console.warn);
    saveActivityToFirestore(currentUser.uid, newActivityItem).catch(console.warn);

    if (!wasTaken && currentUser.reminderSound) {
      soundService.playSuccessTone();
    }

    addToast(
      wasTaken ? `${med.name} marked as pending.` : `${med.name} marked as taken. Good job!`,
      wasTaken ? 'info' : 'success'
    );
  };

  const handleSaveMedication = (
    medData: Omit<Medication, 'id' | 'patientUid' | 'takenDate' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    if (!currentUser) return;

    let newMeds: Medication[];
    let title: string;
    let desc: string;
    let targetMed: Medication;

    if (editId) {
      targetMed = {
        ...(medications.find((m) => m.id === editId) as Medication),
        ...medData,
        updatedAt: new Date().toISOString(),
      };
      newMeds = medications.map((m) => (m.id === editId ? targetMed : m));
      title = 'Medication updated';
      desc = `${medData.name} (${medData.dosage}) schedule updated to ${formatTime12h(medData.time)}.`;
    } else {
      targetMed = {
        id: `med_${Date.now()}`,
        patientUid: currentUser.uid,
        ...medData,
        takenDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newMeds = [targetMed, ...medications];
      title = 'Medication added';
      desc = `${medData.name} (${medData.dosage}) prescribed for ${formatTime12h(medData.time)}.`;
    }

    const newActivityItem: ActivityItem = {
      id: `act_${Date.now()}`,
      patientUid: currentUser.uid,
      title,
      description: desc,
      icon: '✚',
      type: 'medication',
      date: new Date().toISOString(),
    };

    syncUserData(newMeds, records, [newActivityItem, ...activity]);
    saveMedicationToFirestore(currentUser.uid, targetMed).catch(console.warn);
    saveActivityToFirestore(currentUser.uid, newActivityItem).catch(console.warn);

    setAddMedModalOpen(false);
    setMedicationToEdit(null);

    if (currentUser.reminderSound) {
      soundService.playSuccessTone();
    }
    addToast(editId ? 'Medication plan updated.' : 'Medication added to schedule.');
  };

  const handleDeleteMedication = (id: string) => {
    if (!currentUser) return;
    const med = medications.find((m) => m.id === id);
    if (!med) return;

    if (!window.confirm(`Are you sure you want to remove ${med.name} from your medications?`)) {
      return;
    }

    const newMeds = medications.filter((m) => m.id !== id);
    const newActivityItem: ActivityItem = {
      id: `act_${Date.now()}`,
      patientUid: currentUser.uid,
      title: 'Medication removed',
      description: `${med.name} was removed from your active medication list.`,
      icon: '—',
      type: 'medication',
      date: new Date().toISOString(),
    };

    syncUserData(newMeds, records, [newActivityItem, ...activity]);
    deleteMedicationFromFirestore(currentUser.uid, id).catch(console.warn);
    saveActivityToFirestore(currentUser.uid, newActivityItem).catch(console.warn);

    addToast(`${med.name} removed from list.`, 'info');
  };

  const handleSaveHealthRecord = (
    recData: Omit<HealthRecord, 'id' | 'patientUid' | 'createdAt'>
  ) => {
    if (!currentUser) return;

    const newRecord: HealthRecord = {
      id: `rec_${Date.now()}`,
      patientUid: currentUser.uid,
      ...recData,
      createdAt: new Date().toISOString(),
    };

    const newRecords = [newRecord, ...records];
    const details = [
      recData.bp ? `BP ${recData.bp} mmHg` : '',
      recData.sugar ? `Glucose ${recData.sugar} mg/dL` : '',
      recData.weight ? `Weight ${recData.weight} kg` : '',
    ]
      .filter(Boolean)
      .join(', ');

    const newActivityItem: ActivityItem = {
      id: `act_${Date.now()}`,
      patientUid: currentUser.uid,
      title: 'Health record logged',
      description: details ? `Logged: ${details}` : 'New health reading saved.',
      icon: '♡',
      type: 'health_record',
      date: new Date().toISOString(),
    };

    syncUserData(medications, newRecords, [newActivityItem, ...activity]);
    saveHealthRecordToFirestore(currentUser.uid, newRecord).catch(console.warn);
    saveActivityToFirestore(currentUser.uid, newActivityItem).catch(console.warn);

    if (currentUser.reminderSound) {
      soundService.playSuccessTone();
    }
    addToast('Health reading saved to your record.');
  };

  const handleDeleteHealthRecord = (id: string) => {
    if (!currentUser) return;
    if (!window.confirm('Delete this health record?')) return;

    const newRecords = records.filter((r) => r.id !== id);
    syncUserData(medications, newRecords, activity);
    deleteHealthRecordFromFirestore(currentUser.uid, id).catch(console.warn);
    addToast('Health record removed.', 'info');
  };

  const handleClearActivity = () => {
    if (!currentUser || activity.length === 0) return;
    if (!window.confirm('Clear all activity logs for this patient profile?')) return;

    const oldActivity = [...activity];
    syncUserData(medications, records, []);
    clearActivityInFirestore(currentUser.uid, oldActivity).catch(console.warn);
    addToast('Activity history cleared.', 'info');
  };

  const handleSimulateMissedDose = (med: Medication) => {
    setMissedDoseMed(med);
    setMissedDoseModalOpen(true);
    soundService.playReminderChime();
  };

  const handleTakeMissedDose = (medId: string) => {
    handleToggleMedicationTaken(medId);
    setMissedDoseModalOpen(false);
  };

  const handleSkipMissedDose = (medId: string) => {
    if (!currentUser) return;
    const med = medications.find((m) => m.id === medId);
    if (!med) return;

    const newActivityItem: ActivityItem = {
      id: `act_${Date.now()}`,
      patientUid: currentUser.uid,
      title: 'Medication dose skipped',
      description: `${med.name} (${med.dosage}) scheduled for ${formatTime12h(med.time)} was logged as skipped per patient.`,
      icon: '⏰',
      type: 'reminder',
      date: new Date().toISOString(),
    };

    syncUserData(medications, records, [newActivityItem, ...activity]);
    setMissedDoseModalOpen(false);
    addToast(`${med.name} logged as skipped for today.`, 'info');
  };

  const handleTriggerTestChime = () => {
    soundService.playReminderChime();
    addToast('Gentle reminder chime sounded.', 'info');
  };

  const handleToggleReminderSound = () => {
    if (!currentUser) return;
    const nextSound = !currentUser.reminderSound;
    const updated: UserProfile = { ...currentUser, reminderSound: nextSound };
    setCurrentUser(updated);
    healthStorage.saveUser(updated);
    if (nextSound) {
      soundService.playSuccessTone();
    }
    addToast(nextSound ? 'Reminder sound enabled.' : 'Reminder sound muted.', 'info');
  };

  const handleSwitchUser = (user: UserProfile) => {
    healthStorage.setCurrentUser(user);
    setCurrentUser(user);
    addToast(`Switched to ${user.name}'s workspace.`);
  };

  const handleSaveProfile = (updatedUser: UserProfile) => {
    healthStorage.saveUser(updatedUser);
    setCurrentUser(updatedUser);
    addToast('Patient profile updated successfully.');
  };

  const handleResetDemoData = () => {
    healthStorage.resetAllToDemo();
    const fresh = healthStorage.getCurrentUser();
    setCurrentUser(fresh);
    addToast('Demo sample data restored.', 'info');
  };

  const handleLogout = () => {
    healthStorage.setCurrentUser(null);
    setCurrentUser(null);
    addToast('Logged out of HealthTrack.', 'info');
  };

  const handleAuthSuccess = (user: UserProfile) => {
    healthStorage.saveUser(user);
    healthStorage.setCurrentUser(user);
    setCurrentUser(user);
    setAuthModalOpen(false);
    addToast(`Welcome to HealthTrack, ${user.name}!`);
  };

  const todayKey = getTodayKey();
  const takenCount = medications.filter((m) => m.takenDate === todayKey).length;
  const pendingCount = medications.length - takenCount;

  // If user signed out, show full auth modal view
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4">
        <AuthModal
          isOpen={true}
          isDismissable={false}
          onSuccess={handleAuthSuccess}
        />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenReport={() => setReportModalOpen(true)}
        onOpenFirebaseModal={() => setFirebaseModalOpen(true)}
        takenCount={takenCount}
        totalMeds={medications.length}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          currentPage={currentPage}
          currentUser={currentUser}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenProfile={() => setProfileModalOpen(true)}
          onSwitchUser={handleSwitchUser}
          onOpenNewUserAuth={() => setAuthModalOpen(true)}
          onTriggerTestReminder={handleTriggerTestChime}
          pendingCount={pendingCount}
        />

        <main className="flex-1 px-4 sm:px-8 max-w-7xl w-full mx-auto">
          {currentPage === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              medications={medications}
              records={records}
              onNavigate={setCurrentPage}
              onOpenAddMedication={() => {
                setMedicationToEdit(null);
                setAddMedModalOpen(true);
              }}
              onToggleMedicationTaken={handleToggleMedicationTaken}
              onOpenReport={() => setReportModalOpen(true)}
            />
          )}

          {currentPage === 'medications' && (
            <MedicationsView
              medications={medications}
              onOpenAddModal={() => {
                setMedicationToEdit(null);
                setAddMedModalOpen(true);
              }}
              onOpenEditModal={(med) => {
                setMedicationToEdit(med);
                setAddMedModalOpen(true);
              }}
              onDeleteMedication={handleDeleteMedication}
              onToggleTaken={handleToggleMedicationTaken}
              onSimulateMissedDose={handleSimulateMissedDose}
            />
          )}

          {currentPage === 'health' && (
            <HealthRecordsView
              currentUser={currentUser}
              records={records}
              onSaveRecord={handleSaveHealthRecord}
              onDeleteRecord={handleDeleteHealthRecord}
            />
          )}

          {currentPage === 'history' && (
            <HistoryRemindersView
              activity={activity}
              currentUser={currentUser}
              onClearHistory={handleClearActivity}
              onTriggerTestChime={handleTriggerTestChime}
              onToggleReminderSound={handleToggleReminderSound}
            />
          )}

          {currentPage === '3d_lab' && (
            <div className="space-y-4 pb-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#172b4d] tracking-tight">
                    3D Precision Capsule & Anatomy Lab
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6b778c] mt-0.5">
                    Interactive Three.js procedural multi-part capsule assembly, PBR studio lighting, and vitals resonance.
                  </p>
                </div>
              </div>
              <ThreeScene activeVitalFocus="general" />
            </div>
          )}

          {currentPage === 'assistant' && (
            <div className="space-y-4 pb-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#172b4d] tracking-tight">
                    AI MedAssist Companion
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6b778c] mt-0.5">
                    Multi-turn clinical pharmacotherapy advisor with live Google Search Grounding for verified drug and vital guidance.
                  </p>
                </div>
              </div>
              <GeminiChatbot
                currentUser={currentUser}
                medications={medications}
                records={records}
              />
            </div>
          )}
        </main>

        {/* Global Footer */}
        <footer className="mt-auto border-t border-[#e8edf4] px-4 sm:px-8 py-5 text-xs text-[#8b96aa] flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl w-full mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#172b4d]">HealthTrack</span>
            <span>• Patient Wellness & Medication Suite</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Personal Health Portal</span>
            <span>•</span>
            <button
              onClick={() => setFirebaseModalOpen(true)}
              className="text-[#6558d3] hover:underline font-semibold"
            >
              Firestore & Security Architecture
            </button>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <MedicationModal
        isOpen={addMedModalOpen}
        onClose={() => {
          setAddMedModalOpen(false);
          setMedicationToEdit(null);
        }}
        onSave={handleSaveMedication}
        medicationToEdit={medicationToEdit}
      />

      <MissedDoseAlertModal
        isOpen={missedDoseModalOpen}
        medication={missedDoseMed}
        onClose={() => setMissedDoseModalOpen(false)}
        onTakeNow={handleTakeMissedDose}
        onSkipDose={handleSkipMissedDose}
      />

      <PatientProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={currentUser}
        onSaveProfile={handleSaveProfile}
        onResetDemoData={handleResetDemoData}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        currentUser={currentUser}
        medications={medications}
        records={records}
      />

      <FirebaseStatusModal
        isOpen={firebaseModalOpen}
        onClose={() => setFirebaseModalOpen(false)}
      />

      {/* Dynamic Toast Feedback */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
