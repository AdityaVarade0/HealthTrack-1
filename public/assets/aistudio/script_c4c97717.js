const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "healthtrack_demo_v1";
let state = { user: null, medications: [], records: [], activity: [], authStatus: "loading", usingFirestore: false };
let toastTimer;

function loadState(){
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
    }
  } catch (error) {
    console.warn("Failed to load saved demo state.", error);
  }
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    user: state.user,
    medications: state.medications,
    records: state.records,
    activity: state.activity,
    authStatus: state.authStatus,
    usingFirestore: state.usingFirestore
  }));
}

function escapeHtml(value = ""){
  return String(value).replace(/[&<>\"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}

function showToast(message){
  const t = $("toast");
  if (!t) return;
  t.textContent = message;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

function timeLabel(time){
  if (!time) return "Time not set";
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${(h % 12) || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function dateLabel(value){
  return new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function todayKey(){
  return new Date().toISOString().slice(0, 10);
}

function currentUser(){
  return state.user;
}

function initials(name){
  return (name || "P").trim().split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase();
}

function updateIdentity(){
  const user = currentUser();
  if (!user) return;
  const displayName = user.name || user.email || "Patient";
  const patientLabel = user.email ? `Email: ${user.email}` : `Patient ID: ${user.patientId || user.id || "�"}`;
  $("sideName").textContent = displayName;
  $("sideId").textContent = patientLabel;
  $("sideAvatar").textContent = initials(displayName);
  $("topAvatar").textContent = initials(displayName);
  $("welcomeName").textContent = displayName.split(" ")[0];
}

function showApp(){
  const logged = !!state.user;
  $("authView").classList.toggle("hidden", logged);
  document.querySelectorAll(".sidebar .nav-item,.sidebar-bottom").forEach((el) => el.classList.toggle("hidden", !logged));
  document.querySelectorAll(".page").forEach((el) => el.classList.add("hidden"));
  $("topbar")?.classList.toggle("hidden", !logged);

  if (logged) {
    updateIdentity();
    navigate("dashboard");
    renderAll();
  } else {
    $("pageTitle").textContent = "Welcome";
  }
}

function navigate(page){
  if (!state.user) {
    $("authView").classList.remove("hidden");
    return;
  }

  const pages = ["dashboard", "medications", "health", "history"];
  if (!pages.includes(page)) return;

  document.querySelectorAll(".page").forEach((el) => el.classList.add("hidden"));
  $(page + "Page").classList.remove("hidden");
  document.querySelectorAll(".nav-item").forEach((b) => b.classList.toggle("active", b.dataset.page === page));

  const titles = {
    dashboard: "Dashboard",
    medications: "Medications",
    health: "Health records",
    history: "History & reminders"
  };

  $("pageTitle").textContent = titles[page];
  $("dateLabel").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }).toUpperCase();
}

function openModal(id){
  const modal = $(id);
  if (!modal) return;
  modal.classList.remove("hidden");
}

function closeModal(id){
  const modal = $(id);
  if (!modal) return;
  modal.classList.add("hidden");
}

function renderMedicationRow(m, compact = false){
  const taken = m.takenDate === todayKey();
  return `<div class="${compact ? "med-row" : "table-row"}"><div class="${compact ? "med-info" : ""}"><strong>${escapeHtml(m.name)}</strong><small>${escapeHtml(m.dosage)}${m.instructions ? " � " + escapeHtml(m.instructions) : ""}</small></div>${compact ? `<span class="time-chip">${timeLabel(m.time)}</span>` : `<div class="table-extra"><strong>${timeLabel(m.time)}</strong><small>Scheduled time</small></div><div><span class="count-chip">${taken ? "Taken today" : "Pending"}</span></div>`}<div class="${compact ? "" : "row-actions"}"><button class="${compact ? "status-btn" : "small-btn"} ${taken ? "taken" : ""}" data-take="${m.id}">${taken ? "? Taken" : "Mark taken"}</button>${compact ? "" : `<button class="small-btn delete" data-delete="${m.id}">Remove</button>`}</div></div>`;
}

function renderMeds(){
  $("medCount").textContent = state.medications.length;
  $("medPageCount").textContent = state.medications.length + " item" + (state.medications.length === 1 ? "" : "s");
  const taken = state.medications.filter((m) => m.takenDate === todayKey()).length;
  $("takenCount").innerHTML = `${taken} <em>/ ${state.medications.length}</em>`;
  $("takenProgress").style.width = (state.medications.length ? Math.round((taken / state.medications.length) * 100) : 0) + "%";
  $("dashboardMeds").innerHTML = state.medications.slice(0, 4).map((m) => renderMedicationRow(m, true)).join("");
  $("allMeds").innerHTML = state.medications.map((m) => renderMedicationRow(m, false)).join("");
  $("emptyMeds").classList.toggle("hidden", state.medications.length > 0);
  $("emptyAllMeds").classList.toggle("hidden", state.medications.length > 0);
  bindDynamicButtons();
}

function renderLatestReadings(){
  const r = state.records[0];
  if (!r) {
    $("latestReadings").innerHTML = '<div class="empty-state"><strong>No readings saved</strong><p>Add a health record to see your latest values.</p><button class="secondary" data-page="health">Add health record</button></div>';
    $("healthSummary").innerHTML = '<div class="empty-state"><strong>No latest reading</strong><p>Your latest saved values will appear here.</p></div>';
    return;
  }

  const values = [
    ["Blood pressure", r.bp || "�", ""],
    ["Blood sugar", r.sugar || "�", r.sugar ? "entered value" : ""],
    ["Weight", r.weight ? r.weight + " kg" : "�", ""]
  ];

  $("latestReadings").innerHTML = values.map((v) => `<div class="reading-row"><span class="reading-label">${v[0]}</span><strong class="reading-value">${escapeHtml(v[1])} <span class="reading-unit">${v[2]}</span></strong></div>`).join("");
  $("healthSummary").innerHTML = `<div class="summary-grid">${values.map((v) => `<div class="summary-tile"><span>${v[0]}</span><strong>${escapeHtml(v[1])}</strong><small>${v[2] || "Latest saved value"}</small></div>`).join("")}</div><div class="disclaimer">Last saved: ${dateLabel(r.date)}. Values are user-entered and have not been medically validated.</div>`;
}

function renderRecords(){
  $("recordCount").textContent = state.records.length;
  $("healthHistory").innerHTML = state.records.map((r) => `<div class="health-record"><div class="record-top"><strong>Health reading</strong><small>${dateLabel(r.date)}</small></div><div class="record-values">${r.bp ? `<span class="record-value">BP: <strong>${escapeHtml(r.bp)}</strong></span>` : ""}${r.sugar ? `<span class="record-value">Blood sugar: <strong>${escapeHtml(r.sugar)}</strong></span>` : ""}${r.weight ? `<span class="record-value">Weight: <strong>${escapeHtml(r.weight)} kg</strong></span>` : ""}${r.notes ? `<span class="record-value">Notes: <strong>${escapeHtml(r.notes)}</strong></span>` : ""}</div></div>`).join("");
  $("emptyHealthHistory").classList.toggle("hidden", state.records.length > 0);
}

function renderActivity(){
  $("activityList").innerHTML = state.activity.map((a) => `<div class="activity-item"><div class="activity-mark">${escapeHtml(a.icon || "?")}</div><div><strong>${escapeHtml(a.title)}</strong><p>${escapeHtml(a.description)}</p><small>${dateLabel(a.date)}</small></div></div>`).join("");
  $("emptyActivity").classList.toggle("hidden", state.activity.length > 0);
}

function renderAll(){
  renderMeds();
  renderLatestReadings();
  renderRecords();
  renderActivity();
}

function bindDynamicButtons(){
  document.querySelectorAll("[data-take]").forEach((b) => b.onclick = () => toggleTaken(b.dataset.take));
  document.querySelectorAll("[data-delete]").forEach((b) => b.onclick = () => deleteMedication(b.dataset.delete));
  document.querySelectorAll("[data-page]").forEach((b) => b.onclick = () => navigate(b.dataset.page));
  document.querySelectorAll("[data-open]").forEach((b) => b.onclick = () => openModal(b.dataset.open));
  document.querySelectorAll("[data-close]").forEach((b) => b.onclick = () => closeModal(b.dataset.close));
}

function persistUserData(){
  if (!state.user) return;
  const all = JSON.parse(localStorage.getItem("healthtrack_users_data") || "{}");
  all[state.user.id] = { medications: state.medications, records: state.records, activity: state.activity };
  localStorage.setItem("healthtrack_users_data", JSON.stringify(all));
}

function setAuthActionState(form, isLoading, label = "Please wait..."){
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;
  button.disabled = isLoading;
  button.dataset.originalText = button.dataset.originalText || button.textContent;
  button.textContent = isLoading ? label : button.dataset.originalText;
}

function mapFirebaseError(error){
  if (!error || !error.code) return "Authentication failed. Please try again.";
  const messages = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/email-already-in-use": "That email address is already in use.",
    "auth/weak-password": "Choose a stronger password with at least 6 characters.",
    "auth/user-not-found": "No account was found for that email.",
    "auth/wrong-password": "The email or password is incorrect.",
    "auth/too-many-requests": "Too many sign-in attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network error. Please check your connection and try again.",
    "auth/requires-recent-login": "Please sign in again to complete this action.",
    "auth/user-disabled": "This account has been disabled."
  };
  return messages[error.code] || error.message || "Authentication failed. Please try again.";
}

function firebaseReady(){
  return !!(window.firebase && window.HealthTrackFirebase && window.HealthTrackFirebase.isConfigured && window.HealthTrackFirebase.auth && window.HealthTrackFirebase.db && window.HealthTrackFirestore);
}

function normalizeFirestoreUser(user){
  if (!user) return null;
  return {
    uid: user.uid,
    id: user.uid,
    name: user.displayName || (user.email ? user.email.split("@")[0] : "Patient"),
    email: user.email || "",
    patientId: user.uid,
    phone: ""
  };
}

async function loadUserDataFromFirestore(){
  if (!firebaseReady() || !state.user || !state.user.uid) return;

  state.authStatus = "loading-data";

  try {
    const [profile, medications, records, activity] = await Promise.all([
      window.HealthTrackFirestore.getUserProfile(state.user.uid),
      window.HealthTrackFirestore.listMedications(state.user.uid),
      window.HealthTrackFirestore.listHealthRecords(state.user.uid),
      window.HealthTrackFirestore.listActivity(state.user.uid)
    ]);

    if (profile) {
      state.user.name = profile.displayName || state.user.name || "Patient";
      state.user.email = profile.email || state.user.email || "";
      state.user.phone = profile.phone || "";
    }

    state.medications = medications.map((item) => ({ ...item, takenDate: item.takenDate || null }));
    state.records = records.map((item) => ({ ...item }));
    state.activity = activity.map((item) => ({ ...item }));
    state.usingFirestore = true;
    renderAll();
  } catch (error) {
    console.warn("Failed to load Firestore data.", error);
    state.medications = [];
    state.records = [];
    state.activity = [];
    state.usingFirestore = true;
    renderAll();
    showToast("Could not load your saved data from Firestore. Please check the Firebase project setup.");
  }
}

async function ensureFirestoreUserProfile(user){
  if (!firebaseReady() || !user) return;
  try {
    await window.HealthTrackFirestore.ensureUserProfile(user.uid, {
      displayName: user.displayName || (user.email ? user.email.split("@")[0] : "Patient"),
      email: user.email || "",
      phone: "",
      role: "patient",
      status: "active"
    });
  } catch (error) {
    console.warn("Failed to create or sync Firestore user profile.", error);
  }
}

function setSignedOutState(){
  state = {
    user: null,
    medications: [],
    records: [],
    activity: [],
    authStatus: "signed-out",
    usingFirestore: false
  };
  showApp();
}

function clearCurrentUserMemory(){
  state.user = null;
  state.medications = [];
  state.records = [];
  state.activity = [];
  state.authStatus = "signed-out";
  state.usingFirestore = false;
}

async function handleFirebaseAuthState(user){
  if (!user) {
    setSignedOutState();
    return;
  }

  const normalized = normalizeFirestoreUser(user);
  if (state.user && state.user.uid === normalized.uid && state.authStatus !== "signed-out") {
    return;
  }

  clearCurrentUserMemory();
  state.user = normalized;
  state.authStatus = "loading-data";
  state.usingFirestore = true;
  showApp();

  await ensureFirestoreUserProfile(user);
  await loadUserDataFromFirestore();
}

function initializeFirebaseAuth(){
  if (!firebaseReady()) {
    state.authStatus = "setup-required";
    state.usingFirestore = false;
    showApp();
    showToast("Firebase Authentication is not configured yet. Create a Firebase project and complete the setup before using login or registration.");
    return;
  }

  const auth = window.HealthTrackFirebase.auth;
  auth.onAuthStateChanged((user) => {
    handleFirebaseAuthState(user).catch((error) => {
      console.warn("Auth state handling failed.", error);
      showToast("Authentication state could not be restored.");
    });
  });
}

function addLocalDemoMedication(med){
  state.medications.unshift({ ...med, id: Date.now() + Math.random(), takenDate: null, createdAt: new Date().toISOString() });
  state.activity.unshift({ id: Date.now() + Math.random(), title: "Medication added", description: `${med.name} � ${med.dosage} � ${timeLabel(med.time)}`, icon: "?", date: new Date().toISOString() });
  saveState();
  renderAll();
}

function addLocalDemoHealthRecord(record){
  state.records.unshift(record);
  state.activity.unshift({ id: Date.now() + Math.random(), title: "Health record saved", description: "A new health reading was added.", icon: "?", date: new Date().toISOString() });
  saveState();
  renderAll();
}

async function addMedication(med){
  if (!state.user && !firebaseReady()) {
    showToast("Please complete the Firebase setup before saving data.");
    return;
  }

  if (!state.user) {
    showToast("Please log in before adding a medication.");
    return;
  }

  if (firebaseReady()) {
    try {
      const item = {
        id: String(Date.now() + Math.random()),
        name: med.name,
        dosage: med.dosage,
        instructions: med.instructions || "",
        time: med.time,
        takenDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        patientUid: state.user.uid
      };

      await window.HealthTrackFirestore.addMedication(state.user.uid, item);
      await window.HealthTrackFirestore.recordMedicationLog(state.user.uid, item.id, "scheduled", { scheduledAt: item.createdAt, recordedAt: new Date().toISOString() });
      await window.HealthTrackFirestore.saveActivity(state.user.uid, {
        id: String(Date.now() + Math.random()),
        title: "Medication added",
        description: `${item.name} � ${item.dosage} � ${timeLabel(item.time)}`,
        icon: "?",
        createdAt: new Date().toISOString()
      });
      await loadUserDataFromFirestore();
      showToast("Medication saved.");
      return;
    } catch (error) {
      console.warn("Failed to save medication to Firestore.", error);
      showToast("Could not save medication. Please check the Firebase project setup.");
      return;
    }
  }

  addLocalDemoMedication(med);
  showToast("Medication saved.");
}

async function toggleTaken(id){
  const med = state.medications.find((m) => m.id === id);
  if (!med) return;

  if (firebaseReady() && state.user) {
    try {
      const wasTaken = med.takenDate === todayKey();
      const nextDate = wasTaken ? null : todayKey();
      const updated = { ...med, takenDate: nextDate, updatedAt: new Date().toISOString() };
      await window.HealthTrackFirestore.updateMedication(state.user.uid, id, { takenDate: nextDate, updatedAt: new Date().toISOString() });
      await window.HealthTrackFirestore.recordMedicationLog(state.user.uid, id, wasTaken ? "pending" : "taken", {
        scheduledAt: med.time || new Date().toISOString(),
        recordedAt: new Date().toISOString(),
        takenDate: nextDate
      });
      await window.HealthTrackFirestore.saveActivity(state.user.uid, {
        id: String(Date.now() + Math.random()),
        title: wasTaken ? "Medication marked pending" : "Medication marked as taken",
        description: `${med.name} � ${timeLabel(med.time)}`,
        icon: wasTaken ? "?" : "?",
        createdAt: new Date().toISOString()
      });
      await loadUserDataFromFirestore();
      showToast(wasTaken ? "Dose marked as pending." : "Dose marked as taken.");
      return;
    } catch (error) {
      console.warn("Failed to update medication status in Firestore.", error);
      showToast("Could not update the medication status.");
      return;
    }
  }

  const wasTaken = med.takenDate === todayKey();
  med.takenDate = wasTaken ? null : todayKey();
  state.activity.unshift({ id: Date.now() + Math.random(), title: wasTaken ? "Medication marked pending" : "Medication marked as taken", description: `${med.name} � ${timeLabel(med.time)}`, icon: wasTaken ? "?" : "?", date: new Date().toISOString() });
  saveState();
  renderAll();
  showToast(wasTaken ? "Dose marked as pending." : "Dose marked as taken.");
}

async function deleteMedication(id){
  const med = state.medications.find((m) => m.id === id);
  if (!med) return;
  if (!confirm(`Remove ${med.name} from your medication list?`)) return;

  if (firebaseReady() && state.user) {
    try {
      await window.HealthTrackFirestore.deleteMedication(state.user.uid, id);
      await window.HealthTrackFirestore.saveActivity(state.user.uid, {
        id: String(Date.now() + Math.random()),
        title: "Medication removed",
        description: med.name,
        icon: "-",
        createdAt: new Date().toISOString()
      });
      await loadUserDataFromFirestore();
      showToast("Medication removed.");
      return;
    } catch (error) {
      console.warn("Failed to delete medication in Firestore.", error);
      showToast("Could not remove the medication.");
      return;
    }
  }

  state.medications = state.medications.filter((m) => m.id !== id);
  state.activity.unshift({ id: Date.now() + Math.random(), title: "Medication removed", description: med.name, icon: "-", date: new Date().toISOString() });
  saveState();
  renderAll();
  showToast("Medication removed.");
}

async function saveHealthRecord(record){
  if (!state.user) {
    showToast("Please log in before saving a health record.");
    return;
  }

  if (firebaseReady()) {
    try {
      const item = {
        id: String(Date.now() + Math.random()),
        bp: record.bp,
        sugar: record.sugar,
        weight: record.weight,
        notes: record.notes,
        patientUid: state.user.uid,
        date: record.date,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await window.HealthTrackFirestore.saveHealthRecord(state.user.uid, item);
      await window.HealthTrackFirestore.saveActivity(state.user.uid, {
        id: String(Date.now() + Math.random()),
        title: "Health record saved",
        description: "A new health reading was added.",
        icon: "?",
        createdAt: new Date().toISOString()
      });
      await loadUserDataFromFirestore();
      showToast("Health record saved.");
      return;
    } catch (error) {
      console.warn("Failed to save health record in Firestore.", error);
      showToast("Could not save the health record. Please check the Firebase project setup.");
      return;
    }
  }

  addLocalDemoHealthRecord(record);
  showToast("Health record saved.");
}

async function clearActivityHistory(){
  if (!state.user && !firebaseReady()) {
    if (!state.activity.length) return;
    if (confirm("Clear all activity history?")) {
      state.activity = [];
      saveState();
      renderActivity();
      showToast("Activity history cleared.");
    }
    return;
  }

  if (!state.user) {
    showToast("Please log in before clearing activity.");
    return;
  }

  if (firebaseReady()) {
    try {
      const docs = await window.HealthTrackFirestore.listActivity(state.user.uid);
      const deletes = docs.map((item) => window.HealthTrackFirestore.deleteActivity(state.user.uid, item.id));
      await Promise.all(deletes);
      state.activity = [];
      renderActivity();
      showToast("Activity history cleared.");
      return;
    } catch (error) {
      console.warn("Failed to clear activity in Firestore.", error);
      showToast("Could not clear the activity history.");
      return;
    }
  }

  if (!state.activity.length) return;
  if (confirm("Clear all activity history?")) {
    state.activity = [];
    saveState();
    renderActivity();
    showToast("Activity history cleared.");
  }
}

function logActivity(title, description, icon = "?"){
  const entry = { id: Date.now() + Math.random(), title, description, icon, date: new Date().toISOString() };
  state.activity.unshift(entry);
  if (!firebaseReady()) {
    saveState();
  }
}

function persistUserData(){
  if (!state.user) return;
  const all = JSON.parse(localStorage.getItem("healthtrack_users_data") || "{}");
  all[state.user.id] = { medications: state.medications, records: state.records, activity: state.activity };
  localStorage.setItem("healthtrack_users_data", JSON.stringify(all));
}

function loadLocalDemoDataIfAvailable(){
  if (firebaseReady()) {
    return;
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    if (parsed && parsed.user) {
      state = { ...state, ...parsed };
    }
  } catch (error) {
    console.warn("Could not read demo state from localStorage.", error);
  }
}

$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!firebaseReady()) {
    showToast("Firebase Authentication is not configured yet. Complete the Firebase setup before logging in.");
    return;
  }

  const email = $("loginId").value.trim();
  const password = $("loginPassword").value;

  if (!email || !password) {
    showToast("Please enter both email and password.");
    return;
  }

  setAuthActionState(e.currentTarget, true, "Logging in...");

  try {
    const credential = await window.HealthTrackFirebase.auth.signInWithEmailAndPassword(email, password);
    state.user = normalizeFirestoreUser(credential.user);
    state.authStatus = "loading-data";
    showApp();
    await ensureFirestoreUserProfile(credential.user);
    await loadUserDataFromFirestore();
    showToast("Welcome back.");
  } catch (error) {
    showToast(mapFirebaseError(error));
  } finally {
    setAuthActionState(e.currentTarget, false);
  }
});

$("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!firebaseReady()) {
    showToast("Firebase Authentication is not configured yet. Complete the Firebase project setup before creating an account.");
    return;
  }

  const name = $("regName").value.trim();
  const email = $("regEmail").value.trim();
  const patientId = $("regId").value.trim();
  const password = $("regPassword").value;

  if (!name || !email || !password) {
    showToast("Please complete the required registration fields.");
    return;
  }

  setAuthActionState(e.currentTarget, true, "Creating account...");

  try {
    const credential = await window.HealthTrackFirebase.auth.createUserWithEmailAndPassword(email, password);
    if (credential.user && name) {
      await credential.user.updateProfile({ displayName: name });
    }

    const profile = {
      displayName: name,
      email,
      phone: $("regPhone").value.trim(),
      role: "patient",
      status: "active"
    };

    try {
      await window.HealthTrackFirestore.ensureUserProfile(credential.user.uid, profile);
    } catch (profileError) {
      console.warn("Account profile write failed after user creation.", profileError);
      try {
        await credential.user.delete();
      } catch (deleteError) {
        console.warn("Cleanup after failed profile creation also failed.", deleteError);
      }
      throw profileError;
    }

    state.user = normalizeFirestoreUser(credential.user);
    state.user.name = name;
    state.user.patientId = patientId || credential.user.uid;
    state.user.phone = profile.phone;
    state.authStatus = "loading-data";
    state.usingFirestore = true;
    showApp();
    await loadUserDataFromFirestore();
    showToast("Account created successfully.");
  } catch (error) {
    showToast(mapFirebaseError(error));
  } finally {
    setAuthActionState(e.currentTarget, false);
  }
});

$("medicationForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const med = {
    name: $("medicineName").value.trim(),
    dosage: $("medicineDosage").value.trim(),
    time: $("medicineTime").value,
    instructions: $("medicineInstructions").value.trim()
  };

  if (!med.name || !med.dosage || !med.time) {
    showToast("Please complete the required medication fields.");
    return;
  }

  const submitButton = e.currentTarget.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Saving...";
  }

  try {
    await addMedication(med);
    e.target.reset();
    closeModal("medicationModal");
  } catch (error) {
    console.warn("Medication save failed.", error);
    showToast("Medication could not be saved.");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Save medication";
    }
  }
});

$("healthForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const record = {
    bp: $("bpInput").value.trim(),
    sugar: $("sugarInput").value.trim(),
    weight: $("weightInput").value.trim(),
    notes: $("healthNotes").value.trim(),
    date: new Date().toISOString()
  };

  if (!record.bp && !record.sugar && !record.weight) {
    showToast("Enter at least one health reading.");
    return;
  }

  const submitButton = e.currentTarget.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Saving...";
  }

  try {
    await saveHealthRecord(record);
    e.target.reset();
  } catch (error) {
    console.warn("Health record save failed.", error);
    showToast("Health record could not be saved.");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Save health record ?";
    }
  }
});

$("clearHistory").addEventListener("click", async () => {
  if (!state.activity.length) return;
  if (confirm("Clear all activity history?")) {
    await clearActivityHistory();
  }
});

$("logoutBtn").addEventListener("click", async () => {
  if (firebaseReady()) {
    try {
      await window.HealthTrackFirebase.auth.signOut();
    } catch (error) {
      console.warn("Logout failed.", error);
      showToast("Log out could not complete.");
    }
  }
  clearCurrentUserMemory();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: null, medications: [], records: [], activity: [], authStatus: "signed-out", usingFirestore: false }));
  showApp();
  showToast("You have logged out.");
});

document.querySelectorAll("[data-page]").forEach((b) => b.addEventListener("click", () => navigate(b.dataset.page)));
document.querySelectorAll("[data-auth]").forEach((b) => b.addEventListener("click", () => {
  document.querySelectorAll("[data-auth]").forEach((x) => x.classList.toggle("selected", x === b));
  const reg = b.dataset.auth === "register";
  $("registerForm").classList.toggle("hidden", !reg);
  $("loginForm").classList.toggle("hidden", reg);
}));

loadState();
loadLocalDemoDataIfAvailable();
showApp();

if (firebaseReady()) {
  initializeFirebaseAuth();
} else {
  state.authStatus = "setup-required";
  state.usingFirestore = false;
  showToast("Firebase Authentication is not configured yet. Complete the Firebase project setup before using login or registration.");
}

bindDynamicButtons();
