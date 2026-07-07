"use strict";
// src/lib/firebase.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.db = exports.auth = exports.app = void 0;
var async_storage_1 = require("@react-native-async-storage/async-storage");
var app_1 = require("firebase/app");
var auth_1 = require("firebase/auth");
var firestore_1 = require("firebase/firestore");
var storage_1 = require("firebase/storage");
// ✅ Firebase Config
var firebaseConfig = {
    apiKey: "AIzaSyAUEbZmesvFJu8qe4Yy2isHe-0_HS1Yi9s",
    authDomain: "luwas-966e2.firebaseapp.com",
    projectId: "luwas-966e2",
    storageBucket: "luwas-966e2.firebasestorage.app",
    messagingSenderId: "1030258873457",
    appId: "1:1030258873457:web:3b471adcef0e08029d77d0",
    measurementId: "G-N4DPJNE1CK",
};
// ✅ Initialize app (prevent double init)
var app = !(0, app_1.getApps)().length ? (0, app_1.initializeApp)(firebaseConfig) : (0, app_1.getApp)();
exports.app = app;
// ✅ Initialize Auth with safe persistence
var auth;
try {
    exports.auth = auth = (0, auth_1.initializeAuth)(app, {
        persistence: (0, auth_1.getReactNativePersistence)(async_storage_1.default),
    });
}
catch (error) {
    // This runs when Auth is already initialized (during Fast Refresh or HMR)
    if (error.code === "auth/already-initialized") {
        exports.auth = auth = (0, auth_1.getAuth)(app);
    }
    else {
        console.error("🔥 Firebase Auth init error:", error);
        exports.auth = auth = (0, auth_1.getAuth)(app);
    }
}
// ✅ Firestore & Storage (these can be initialized multiple times safely)
var db = (0, firestore_1.getFirestore)(app);
exports.db = db;
var storage = (0, storage_1.getStorage)(app);
exports.storage = storage;
