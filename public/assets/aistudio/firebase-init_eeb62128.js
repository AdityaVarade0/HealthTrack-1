(function () {
  function isPlaceholderValue(value) {
    return typeof value === "string" && value.toUpperCase().startsWith("REPLACE_");
  }

  function hasPlaceholderConfig(config) {
    if (!config) return true;
    return Object.values(config).some((value) => value === undefined || value === null || isPlaceholderValue(value));
  }

  window.HealthTrackFirebase = {
    initialized: false,
    app: null,
    auth: null,
    db: null,
    config: null,
    isConfigured: false
  };

  const config = window.__FIREBASE_CONFIG__ || null;
  if (!config || hasPlaceholderConfig(config)) {
    console.warn(
      "Firebase has not been configured. Copy firebase-config.example.js to firebase-config.js and add your actual Firebase web values before enabling authentication or Firestore."
    );
    return;
  }

  if (!window.firebase) {
    console.warn(
      "Firebase SDK is not loaded yet. Include the Firebase compatibility SDK scripts before firebase-init.js."
    );
    return;
  }

  if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(config);
  }

  window.HealthTrackFirebase = {
    initialized: true,
    app: firebase.app(),
    auth: firebase.auth(),
    db: firebase.firestore(),
    config: config,
    isConfigured: true
  };

  console.info("Firebase initialization scaffold loaded. Real project configuration is required before enabling auth and Firestore access.");
})();
