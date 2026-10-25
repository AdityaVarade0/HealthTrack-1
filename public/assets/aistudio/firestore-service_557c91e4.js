(function () {
  function getDb() {
    if (!window.HealthTrackFirebase || !window.HealthTrackFirebase.isConfigured || !window.HealthTrackFirebase.db) {
      throw new Error("Firebase Firestore is not configured. Add a valid Firebase web configuration before using Firestore.");
    }
    return window.HealthTrackFirebase.db;
  }

  function getServerTimestamp() {
    if (window.firebase && window.firebase.firestore && window.firebase.firestore.FieldValue) {
      return window.firebase.firestore.FieldValue.serverTimestamp();
    }
    return new Date().toISOString();
  }

  function normalizeUserProfile(uid, profile = {}) {
    return {
      uid,
      displayName: profile.displayName || profile.name || "Patient",
      email: profile.email || "",
      phone: profile.phone || "",
      role: profile.role || "patient",
      status: profile.status || "active",
      updatedAt: getServerTimestamp(),
      createdAt: profile.createdAt || getServerTimestamp()
    };
  }

  function asArray(snapshot) {
    return snapshot.docs ? snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) : [];
  }

  const FirestoreService = {
    ensureUserProfile(uid, profile = {}) {
      if (!uid) return Promise.reject(new Error("A valid Firebase UID is required to create the user profile."));
      const db = getDb();
      const userDoc = db.collection("users").doc(uid);
      const payload = normalizeUserProfile(uid, profile);
      return userDoc.set(payload, { merge: true });
    },

    getUserProfile(uid) {
      if (!uid) return Promise.reject(new Error("A valid Firebase UID is required to load the user profile."));
      const db = getDb();
      return db.collection("users").doc(uid).get().then(doc => (doc.exists ? { id: doc.id, ...doc.data() } : null));
    },

    listMedications(uid) {
      if (!uid) return Promise.reject(new Error("A valid Firebase UID is required to list medications."));
      const db = getDb();
      return db.collection("patients").doc(uid).collection("medications").orderBy("createdAt", "desc").get().then(asArray);
    },

    addMedication(uid, medication) {
      if (!uid) return Promise.reject(new Error("A valid Firebase UID is required to add a medication."));
      if (!medication || !medication.name || !medication.dosage || !medication.time) {
        return Promise.reject(new Error("Medication name, dosage, and time are required."));
      }
      const db = getDb();
      const id = medication.id || (Date.now() + Math.random()).toString();
      const payload = {
        ...medication,
        id,
        isActive: medication.isActive !== false,
        createdAt: medication.createdAt || getServerTimestamp(),
        updatedAt: getServerTimestamp()
      };
      return db.collection("patients").doc(uid).collection("medications").doc(id).set(payload, { merge: true });
    },

    updateMedication(uid, medicationId, changes = {}) {
      if (!uid || !medicationId) return Promise.reject(new Error("A valid UID and medication ID are required."));
      const db = getDb();
      return db.collection("patients").doc(uid).collection("medications").doc(medicationId).update({
        ...changes,
        updatedAt: getServerTimestamp()
      });
    },

    deleteMedication(uid, medicationId) {
      if (!uid || !medicationId) return Promise.reject(new Error("A valid UID and medication ID are required."));
      const db = getDb();
      return db.collection("patients").doc(uid).collection("medications").doc(medicationId).delete();
    },

    saveHealthRecord(uid, record) {
      if (!uid) return Promise.reject(new Error("A valid Firebase UID is required to save a health record."));
      const db = getDb();
      const id = record.id || (Date.now() + Math.random()).toString();
      const payload = {
        ...record,
        id,
        patientUid: uid,
        createdAt: record.createdAt || getServerTimestamp(),
        updatedAt: getServerTimestamp()
      };
      return db.collection("patients").doc(uid).collection("healthRecords").doc(id).set(payload, { merge: true });
    },

    listHealthRecords(uid) {
      if (!uid) return Promise.reject(new Error("A valid Firebase UID is required to list health records."));
      const db = getDb();
      return db.collection("patients").doc(uid).collection("healthRecords").orderBy("createdAt", "desc").get().then(asArray);
    },

    saveActivity(uid, activity) {
      if (!uid) return Promise.reject(new Error("A valid Firebase UID is required to save activity."));
      const db = getDb();
      const id = activity.id || (Date.now() + Math.random()).toString();
      const payload = {
        ...activity,
        id,
        patientUid: uid,
        createdAt: activity.createdAt || getServerTimestamp()
      };
      return db.collection("patients").doc(uid).collection("activity").doc(id).set(payload, { merge: true });
    },

    listActivity(uid) {
      if (!uid) return Promise.reject(new Error("A valid Firebase UID is required to list activity."));
      const db = getDb();
      return db.collection("patients").doc(uid).collection("activity").orderBy("createdAt", "desc").get().then((snapshot) => asArray(snapshot).filter((item) => !item.deleted));
    },

    deleteActivity(uid, activityId) {
      if (!uid || !activityId) return Promise.reject(new Error("A valid UID and activity ID are required."));
      const db = getDb();
      return db.collection("patients").doc(uid).collection("activity").doc(activityId).delete();
    },

    recordMedicationLog(uid, medicationId, status, metadata = {}) {
      if (!uid || !medicationId) return Promise.reject(new Error("A valid UID and medication ID are required."));
      const db = getDb();
      const id = (Date.now() + Math.random()).toString();
      const payload = {
        patientUid: uid,
        medicationId,
        status,
        createdAt: getServerTimestamp(),
        ...metadata
      };
      return db.collection("patients").doc(uid).collection("medicationLogs").doc(id).set(payload, { merge: true });
    }
  };

  window.HealthTrackFirestore = FirestoreService;
})();
