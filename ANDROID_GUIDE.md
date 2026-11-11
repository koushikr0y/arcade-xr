# 🤖 ARcade XR - Android App Setup & Workflow Guide

This document describes how ARcade XR is packaged as a native Android app using **Capacitor** on the `android` branch, and how changes made in the web app (`main` branch) automatically flow into the Android build.

---

## 🏗️ Architecture & Branch Strategy

```
main (Web App) ───────────────────────────► Vercel (https://arcade-xr.vercel.app)
  │
  │ (git pull origin main / npm run sync:web)
  ▼
android (Android App Shell)
  ├── src/ index.html (Shared web code)
  ├── capacitor.config.json (Capacitor bridge config)
  └── android/ (Native Android Studio project)
        └── app/src/main/
              ├── AndroidManifest.xml (Camera & Audio permissions)
              └── assets/public/ (Auto-synced production web bundle)
```

1. **`main` branch**: Contains the pure web app, deployed to Vercel and web portals.
2. **`android` branch**: Contains the Capacitor bridge and the native `android/` project shell.
3. The native Android app loads the local Vite production bundle (`dist/`) inside a secure Android WebView with full camera, WebGL, and Web Audio access.

---

## ⚡ The Sync Workflow (Web ➔ Android)

Whenever you make changes, bugfixes, or new games on the web app (`main` branch):

### 1. In terminal, switch to the `android` branch:
```bash
git checkout android
```

### 2. Run the automated sync command:
```bash
npm run sync:web
```

**What this one command does automatically:**
1. Pulls and merges the latest commits from `origin/main`.
2. Installs any new npm packages if dependencies changed.
3. Compiles the production web bundle (`npm run build`).
4. Syncs the compiled assets into `android/app/src/main/assets/public/` (`npx cap sync android`).

Your Android project is now completely updated with your latest web changes!

---

## 🛠️ Handy NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run sync:web` | **Pulls latest `main`**, builds web bundle, and syncs into Android. |
| `npm run android:sync` | Builds current local web bundle and syncs into Android (without pulling git). |
| `npm run android:open` | Opens the project in **Android Studio**. |
| `npm run android:run` | Builds, syncs, and deploys directly to a connected Android device or emulator. |

---

## 📱 Opening & Building in Android Studio

### Prerequisites
- [Android Studio](https://developer.android.com/studio) installed.
- Android SDK Platform 34 or 35 + JDK 17+.

### Open Project
```bash
npm run android:open
```
*(Automatically detects Android Studio in standard Linux locations like `/opt/android-studio/bin/studio` or `/usr/local/android-studio/bin/studio`, or respects `CAPACITOR_ANDROID_STUDIO_PATH` if set).*

*Or open the `android/` folder directly inside Android Studio.*

### Build APK
1. In Android Studio, go to **Build ➔ Build Bundle(s) / APK(s) ➔ Build APK(s)**.
2. Once built, click **locate** in the popup to find `app-debug.apk`.
3. Transfer and install on any Android phone (or test directly via USB debugging).

---

## 🔒 Permissions & Capabilities Configured

The Android Manifest (`android/app/src/main/AndroidManifest.xml`) is configured with:
- **`CAMERA`**: Required by MediaPipe AI Vision for dual-hand tracking.
- **`INTERNET`**: Required to fetch MediaPipe model tasks and WASM files.
- **`RECORD_AUDIO` & `MODIFY_AUDIO_SETTINGS`**: Enables real-time procedural Web Audio sound effects.
- **`androidScheme: "https"`**: Ensures local assets run under `https://localhost` so browser security policies allow `getUserMedia()` and WebGL.
