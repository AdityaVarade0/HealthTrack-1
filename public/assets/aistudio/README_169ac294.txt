# HealthTrack Website Demo

## Run
1. Download and extract `HealthTrackWebsite.zip`.
2. Open `index.html` in a modern browser (Chrome, Edge, or Firefox).
3. Choose **Create account**, create a demo patient ID and password, then use the dashboard.

No Node.js or database setup is required for this prototype.

## Included features
- Patient registration and login by Patient ID/password
- Add and remove medication entries
- Mark medication as taken for the current day
- Record blood pressure, blood sugar, weight, and notes
- Review saved health readings and activity history
- Responsive dashboard for desktop and mobile
- Data saved in the browser's localStorage

## Important limitations
This is a frontend prototype based on the supplied HealthTrack Java console examples. It does not yet connect to a Java backend or database. The login is only a local demonstration, and passwords are stored in browser storage; do not use real personal or medical information. Reminder alerts are shown only inside the website. It does not send SMS/email or contact a doctor/family member. For a real deployment, connect a Java backend (for example, Spring Boot), a database, secure password hashing, HTTPS, access controls, and a notification provider.

## Firebase setup status (Phase A: scaffolding only)
This project is still in the pre-integration phase. The files below are setup scaffolding only and do NOT create a live Firebase project or connect the app to Firebase yet.

### Required prerequisites
- A modern browser
- A Firebase project created in the Google Firebase Console (manual step outside this repo)
- Access to a Firebase web configuration object for the project
- Optional: Firebase CLI if you want to run the local emulators later

### Required manual steps before enabling Firebase
1. Create a Firebase project in the Firebase Console.
2. Enable Firebase Authentication and use Email/Password sign-in.
3. Create a Firestore database in native mode.
4. Copy `firebase-config.example.js` to `firebase-config.js`.
5. Replace all placeholder values with your actual Firebase project configuration.
6. Keep the Firebase compatibility SDK scripts in the HTML before the app script when you are ready to connect the app.
7. Configure Firestore Security Rules after the project is active and validated.

### Files added for Firebase setup foundation
- `firebase-config.example.js` — placeholder Firebase web configuration template; replace values when a real project is available.
- `firebase-init.js` — safe Firebase initialization scaffold compatible with plain HTML/JavaScript projects. It only initializes if a valid config is present.
- `firestore-service.js` — Firestore helper module that wraps the authenticated user's data access model. It is structured for later use when a real Firebase project is configured.
- `firestore.rules` — restrictive default rules that deny access until explicit authenticated-user rules are implemented and tested.
- `firebase.json` — minimal local emulator configuration for Firestore/Auth UI without requiring a deployed project.

### Important notes
- Do not commit real Firebase credentials or project values.
- Do not enable billing or deploy any Firebase services during this phase.
- The application remains a local browser-only prototype until the Firebase project is configured and the app is intentionally connected.
- The Firestore service file is safe by default: it rejects operations until a valid Firebase project and Firestore configuration are available.

### Optional local emulator command (requires Firebase CLI)
If Firebase CLI is installed, the emulator can be started with:

```bash
firebase emulators:start --only auth,firestore
```

This is a recommendation only and depends on the Firebase CLI being available on your machine. No CLI installation is performed by this repository.

## Free API assessment (future reference only)
The following services are relevant to future HealthTrack enhancements, but none are integrated in this phase:

### Firebase services
- Firebase Authentication: appropriate for user account management and login.
- Cloud Firestore: appropriate for patient data, medication records, and health history.
- Firebase Cloud Messaging: possible future push notification service, but not required for this version.
- Official documentation: https://firebase.google.com/docs
- Pricing: Firebase free-tier and Spark options vary by service and are subject to current provider terms. Cloud Functions and some backend services may require a paid plan.

### Medicine and health data APIs
- Reputable medicine or public health information APIs can be considered later if a specific requirement needs, for example, medicine lookup or verified dosing guidance.
- These APIs usually require an API key and often require a backend for safe handling and rate-limit control.
- They are not necessary for the current local prototype and should be deferred unless a real product requirement is approved.

### Notification APIs
- Email, SMS, and WhatsApp notification providers often require an API key and a trusted backend.
- They may offer free tiers, but quotas are usually limited and may not be suitable for healthcare alerts without additional compliance planning.
- These providers should be deferred unless there is a clear product need and explicit approval.

### Important rule
Do not integrate an external API simply because it is available. Only add a provider when it solves a real feature requirement and can be used safely within the approved free setup.
