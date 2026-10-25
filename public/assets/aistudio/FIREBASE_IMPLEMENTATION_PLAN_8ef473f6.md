# HealthTrack Firebase Implementation Plan

## 1. Scope and current project status

This document is a planning document only. It does not modify the existing application code or enable any Firebase resources.

The project was inspected directly as a static browser application. The current project structure contains:

- `index.html` — frontend UI and page layout
- `style.css` — page styling and design system
- `script.js` — client-side application behavior
- `README.txt` — usage documentation

Current findings from the inspected source:

- The app is a frontend-only prototype.
- There is no backend server, API, or database.
- There is no Firebase setup currently configured.
- User data is stored in browser `localStorage`.
- Registration/login is a browser-only flow using local patient ID/password data.
- The app supports medication tracking, health record entries, and dashboard/history views in the browser.
- Reminder/activity text is demonstration-only and not connected to real notifications.

This plan keeps the current experience and user interface intact wherever practical while preparing the project for a Firebase-backed architecture.

---

## 2. Goal

Migrate the existing HealthTrack front-end prototype into a secure full-stack-style web app using Firebase as the primary backend, without changing the current UI structure during the planning phase.

The target architecture is:

- Frontend: existing HTML/CSS/JavaScript
- Authentication: Firebase Authentication
- Database: Firestore
- Optional trusted server logic: Cloud Functions (only if needed later)
- Optional push notifications: Firebase Cloud Messaging
- Optional hosting: Firebase Hosting

Important constraints:

- Do not invent Firebase credentials, project IDs, or configuration values.
- Do not enable billing.
- Do not deploy any Firebase service.
- Do not modify existing application files during this plan.
- Do not install packages.

---

## 3. Existing files vs proposed additions

### Existing files (do not modify in this phase)

- `index.html`
- `style.css`
- `script.js`
- `README.txt`

These files are part of the current app and must remain as-is until the project is explicitly approved for code migration.

### Proposed files to create later (not yet implemented)

These are the files planned for creation in a later implementation phase. They are listed here for design and planning purposes only.

1. `firebase.js` or `firebase-config.js`
   - Purpose: initialize Firebase app, auth, and Firestore clients.
   - Responsibility: keep Firebase configuration separate from UI logic.

2. `firebase-config.example.js` or `.env.example`
   - Purpose: contain placeholder Firebase configuration values.
   - Responsibility: document required environment settings without exposing real secrets.

3. `firestore.rules`
   - Purpose: define Firestore security rules for authenticated access.
   - Responsibility: prevent unauthorized access to patient health data.

4. `firestore.indexes.json` (only if needed later)
   - Purpose: define composite indexes when Firestore queries require them.
   - Responsibility: support complex retrievals without excessive reads.

5. `firebase.json` (only if hosting or emulator config is later added)
   - Purpose: define hosting and emulator configuration.
   - Responsibility: support local development and deployment setup.

6. `emulators.json` or equivalent emulator config
   - Purpose: run Firebase Authentication and Firestore locally.
   - Responsibility: support local safe testing without live cloud resources.

7. Rule tests or emulator tests
   - Purpose: verify unauthorized users cannot read or write patient data.
   - Responsibility: enforce minimum security before production access.

8. Optional Cloud Functions TypeScript files
   - Purpose: trusted server-side logic for reminder processing, notifications, or validation.
   - Responsibility: handle sensitive operations if Blaze billing is approved later.

---

## 4. Firebase architecture plan

### Frontend

The current app has a browser-only UI with a patient dashboard, medication forms, health tracking forms, and history views. The frontend should remain structurally the same while Firebase replaces localStorage for real authentication and persistence.

### Backend services

Planned Firebase services:

- Firebase Authentication
  - email/password sign-up and login
  - logout
  - auth state monitoring
  - account creation and login validation

- Cloud Firestore
  - patient/user profiles
  - medications
  - health records
  - activity history

- Firebase Cloud Messaging (optional future feature)
  - push notifications for reminders
  - not part of initial free-tier milestone

- Firebase Hosting (optional later)
  - static hosting for the front-end if needed

- Cloud Functions (optional future, separate phase)
  - trusted background tasks and notification logic
  - usually requires Blaze billing

### Why Firebase is suitable for this project

- It matches the current single-page static app style.
- It replaces the insecure browser-only login model.
- It provides built-in user identity management.
- It stores patient data in a real database with security controls.
- It can support future reminder delivery without rewriting the app architecture.

---

## 5. Authentication flow design

### Initial authentication method

Email and password authentication via Firebase Authentication will be used initially.

### Why not keep the current patient ID/password localStorage model

The current code uses browser localStorage to store account data and patient records. That is not real authentication because:

- it is not protected by server-side validation
- it is not a secure way to validate identity
- it does not separate users safely
- it exposes plaintext-stored account data in the browser
- it gives no backend-level authorization model

### Proposed login flow

1. User enters email and password in the existing login form.
2. Frontend calls Firebase Authentication `signInWithEmailAndPassword`.
3. Firebase validates credentials.
4. App listens for `onAuthStateChanged`.
5. Once authenticated, app loads the current user’s data from Firestore.
6. Frontend updates dashboard, medication view, and health pages.
7. Logout calls `signOut()` and clears the current app state.

### Proposed registration flow

1. User enters name, email, password, and patient information in the current registration form.
2. Frontend calls `createUserWithEmailAndPassword`.
3. Firebase creates the user account.
4. The app stores a user profile document in Firestore.
5. The app loads the patient’s own records only.

### Auth state handling

The app must observe authentication state correctly so that:

- logged-out users see the login/register screen
- logged-in users see dashboard pages
- user data only loads after auth succeeds
- logout updates the UI immediately

---

## 6. Firestore schema strategy

The schema should be patient-oriented and secure. The current app mainly stores:

- user data
- medication list
- health records
- activity log

The planned Firestore structure is below.

### Proposed collection structure

```text
users/
  {uid}/
    profile:
      displayName
      email
      role
      createdAt
      updatedAt
      status

patients/
  {uid}/
    medications/
      {medicationId}
        name
        dosage
        instructions
        time
        isActive
        createdAt
        updatedAt

    healthRecords/
      {recordId}
        recordType
        bloodPressure
        bloodSugar
        weight
        notes
        recordedAt
        createdBy
        patientUid

    medicationLogs/
      {logId}
        medicationId
        scheduledAt
        status
        recordedAt
        patientUid

    activity/
      {activityId}
        title
        description
        icon
        createdAt

accessGrants/
  {grantId}
    patientUid
    grantedToUid
    grantedByUid
    role
    createdAt
    expiresAt (optional)

notifications/
  {notificationId}
    recipientUid
    message
    kind
    createdAt
    readAt
```

### Field design decisions

- Use Firestore document IDs for medication and health record items instead of inventing unstable IDs.
- Use server timestamps where possible to avoid client clock manipulation.
- Keep data types consistent: strings for text, timestamps for time values, booleans for active state.
- Do not allow arbitrary role changes from the client.
- Use the authenticated Firebase UID as the trusted owner field.

### Why this layout matches the app

The current app already thinks in terms of a logged-in patient owning:

- medication list
- health records
- reminder/activity history

That aligns naturally with a per-user Firestore document model.

---

## 7. Security rules strategy (mandatory)

Before real user data is accessed, secure Firestore rules must be written and validated.

### Core principles

- Unauthenticated users cannot access protected patient data.
- A user can access only their own records unless a specific authorization rule is granted.
- Clients cannot alter their own role to doctor or admin via unrestricted profile updates.
- Access grants must be explicit.
- Notification documents must not leak another user’s data.

### Example rule strategy

The final implementation should enforce rules like these, using Firestore rules language:

- Only authenticated users may read/write their own profile.
- Only authenticated users may read/write their own `medications`, `healthRecords`, and `activity` documents.
- A user may not read another user’s records.
- Role changes are restricted to trusted server-side logic, not direct client writes.
- Access grants are only valid when they are explicitly authorized.

### Safety rule

The following pattern must never be used in production:

```js
allow read, write: if true;
```

This would allow anyone to read patient information and compromise privacy.

### Required validation before production access

- Authorized patient can read their own records.
- Unauthorized user cannot read or write any protected record.
- A logged-out user cannot access the database.
- A client cannot escalate privileges.
- Data access is denied by default unless explicitly allowed.

### Emulator testing plan

A security test suite should verify:

- patient can read their own medication records
- patient cannot read another patient’s records
- logged-out user gets denied
- user cannot modify their own role in profile
- access grant documents require explicit authorization

---

## 8. Migration plan from localStorage

The current app stores app data in browser `localStorage` using multiple keys and a single shared app state. This must be replaced gradually and carefully.

### Current storage pattern found in source

The current app stores:

- `healthtrack_demo_v1` — general app state
- `healthtrack_accounts` — account objects
- `healthtrack_users_data` — per-user health data

This means that users are not truly authenticated and records are not separated by a real identity system.

### Migration path

Phase 1: Authentication migration
- Keep existing forms
- Replace `localStorage` login logic with Firebase Auth
- Add `onAuthStateChanged` handling

Phase 2: Profile migration
- Create and store a user profile document in Firestore
- Use Firebase UID as the stable identity
- Remove local account storage logic

Phase 3: Medication migration
- Move medication arrays from `localStorage` to Firestore documents
- Load medications from Firestore for the current authenticated user
- Save changes back to Firestore

Phase 4: Health records migration
- Move health data from localStorage to Firestore
- Keep the existing UI structure for a smooth user experience

Phase 5: Activity and reminders
- Replace in-browser activity storage with Firestore documents
- Keep the summary and history views the same

Phase 6: Cleanup and security hardening
- Remove all legacy localStorage writes for user data
- Keep only ephemeral non-sensitive UI state locally if needed

### Important rule

This migration should not happen in a single destructive switch. The app should be updated gradually, with validation after each step.

---

## 9. Testing strategy

Testing is required before allowing any real patient data access.

### Required test categories

1. Authentication tests
   - valid registration
   - valid login
   - invalid login
   - logout state updates
   - duplicate submission prevention
   - error message display

2. Firestore security rule tests
   - authorized access granted
   - unauthorized read denied
   - unauthorized write denied
   - cross-user access denied
   - role escalation denied

3. Data flow tests
   - add medication as authenticated user
   - save health record as authenticated user
   - fetch current user’s records only
   - update existing entry
   - delete medication with confirmation flow

4. UI tests
   - hidden pages when logged out
   - dashboard displays user name and data after auth
   - app updates after data changes

### Preferred local testing method

Use the Firebase Local Emulator Suite instead of live services for development and local validation.

This is preferred because:

- it avoids live cloud cost exposure
- it allows safe local validation
- it supports Auth and Firestore rule testing
- it reduces risk during development

---

## 10. Free-tier and pricing constraints

### Preferred starting plan

The project should target Firebase Spark / free-tier development where possible.

### However, free-tier limitations must be understood

The following services may require a paid Firebase plan depending on current Firebase pricing and service conditions:

- Cloud Functions deployment
- some notification features
- certain high-volume operations or quotas
- certain platform features over time

### Specific caution

Cloud Functions generally require a paid plan. If the project later needs:

- scheduled reminders
- background medication-check logic
- server-side notification sending
- trusted authorization checks that cannot run in the browser

then that feature should be planned as a separate paid phase and approved before deployment.

### Required rule

No feature should be described as “free forever” without verification from current official Firebase documentation.

---

## 11. Features that may require Blaze billing later

These features are not required for the initial implementation and should be treated as optional separate phases:

- Cloud Functions for reminder logic
- scheduled medication checks
- server-side push notifications
- backend validation beyond Firestore rules
- automated email or SMS notifications
- complex background processing or data aggregation

These features may also require additional provider configuration and should not be enabled without explicit approval.

---

## 12. Risks and non-goals in the current phase

### Non-goals for this planning document

- Do not enable Firebase services.
- Do not create a live Firebase project.
- Do not deploy to hosting.
- Do not install packages.
- Do not touch existing app logic.
- Do not write production-grade Firestore rules without validation.

### Main risks in the project today

- localStorage-based authentication is not secure
- patient data is not server-protected
- no authorization layer exists
- data is not separated by real user identity
- reminder text is not a real notification system
- there is no database or backend

---

## 13. Proposed implementation phases

### Phase A — Planning and safe setup

- confirm Firebase project creation later
- create config template
- prepare Firestore rules
- design user/device security model

### Phase B — Authentication foundation

- Firebase Auth email/password setup
- login and registration migration
- auth state UI handling
- logout handling

### Phase C — Firestore data model

- user profile document
- medication collection
- health record collection
- activity log collection

### Phase D — Data migration

- replace `localStorage` data writes with Firestore writes
- preserve UI behavior
- verify user-specific isolation

### Phase E — Security validation

- Firestore emulator tests
- unauthorized access denial checks
- role escalation prevention

### Phase F — Optional reminder features

- only if billing is approved
- only after secure core is working

---

## 14. Decision summary

The safest, cheapest, and most appropriate first Firebase implementation is:

- Firebase Authentication with email/password
- Cloud Firestore for patient data
- strict Firestore rules
- local Firebase Emulator Suite for testing
- no Cloud Functions yet unless a specific reminder or server-side workflow is approved
- no paid plan enabled during planning or implementation

This approach keeps the current app functional and secure enough to evolve without introducing a destructive rewrite.

---

## 15. Final implementation status of this document

This document is a planning artifact only. It is not a runtime deployment, and it does not modify the working application.

Current status:

- Implementation started: No
- Firebase production access created: No
- Billing enabled: No
- Existing app files modified: No
- New planning file created: This document is the planned project governance file for the migration

This file is intentionally limited to planning and architecture design to satisfy the requirement to preserve existing project code while preparing for a Firebase migration.
