# 🤖 ARcade XR - Android App Setup, Build & Release Guide

This document describes how ARcade XR is packaged as a native Android app using **Capacitor**, how web assets are synchronized into the Android project, and how to build, test, and install production-ready APKs with zero warnings and errors.

---

## 🏗️ Architecture & Branch Strategy

```
main (Web App) ───────────────────────────► Vercel (https://arcade-xr.vercel.app)
  │
  │ (git pull origin main / npm run sync:web)
  ▼
android (Android App Shell)
  ├── src/ index.html (Shared web code & 3D WebXR engine)
  ├── capacitor.config.json (Capacitor bridge config)
  └── android/ (Native Android Studio / Gradle project)
        ├── app/src/main/
        │     ├── AndroidManifest.xml (Camera, Audio & hardware feature declarations)
        │     ├── res/ (Cyberpunk colors, adaptive icons with monochrome support)
        │     └── assets/public/ (Auto-synced production web bundle)
        ├── build.gradle (AGP 8.13.2 & Google Services 4.6.0)
        └── variables.gradle (Android SDK 36, AndroidX dependencies)
```

1. **`main` branch**: Contains the pure web app, deployed to Vercel and web portals.
2. **`android` branch**: Houses the Capacitor bridge and native `android/` project shell.
3. The native app loads the Vite production bundle (`dist/`) inside a secure Android WebView (`https://localhost`) with camera, WebGL, Web Audio, and WebXR access.

---

## ⚡ Quick Start: Building the APK

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v20/v26)
- **Java Development Kit**: JDK 17 or JDK 21
- **Android SDK**: API 34+ (compileSdk: 36, minSdk: 24)
- **Android Studio**: Android Studio Ladybug / Meerkat or later (optional, for GUI workflows)

### 2. Generate APK via CLI
From the root repository directory:
```bash
# 1. Build web bundle and sync assets into Android project
npm run android:sync

# 2. Build Debug APK (Signed with default debug key, ready to install immediately)
npm run android:build

# Or build Release APK (Optimized via R8/ProGuard)
npm run android:build:release
```

Or using Gradle directly from the `android/` directory:
```bash
cd android
./gradlew assembleDebug    # Generates debug APK
./gradlew assembleRelease  # Generates release APK
./gradlew testDebugUnitTest # Runs automated unit tests
```

---

## 📦 APK Output Locations

| Build Variant | Output Path | Description |
| :--- | :--- | :--- |
| **Debug APK** | `android/app/build/outputs/apk/debug/app-debug.apk` | Signed with standard debug keystore. **Directly installable** on any phone/headset. |
| **Release APK** | `android/app/build/outputs/apk/release/app-release.apk` | Optimized with ProGuard/R8 and **pre-signed with project release keystore**. **Directly installable** on your phone! |

---

## 📲 Installing the APK on a Device

### Option A: Using ADB (Android Debug Bridge)
Connect your Android phone or Meta Quest via USB with USB Debugging enabled:
```bash
# Verify device is detected
adb devices

# Install release APK
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Or install debug APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

> **Note on signature mismatch**: If your phone already had an older build installed signed with a different key, run `adb uninstall com.koushikroy.arcadexr` (or uninstall via your phone's app settings) before installing the new build.

### Option B: Sideloading via Direct Download / Transfer
1. Copy `app-release.apk` (or `app-debug.apk`) to your phone via USB cable, Google Drive, or local file server.
2. Open your phone's File Manager and tap `app-release.apk`.
3. Allow "Install unknown apps" if prompted, then tap **Install**.

### Option C: Run Directly from Android Studio
1. Open the project in Android Studio:
   ```bash
   npm run android:open
   ```
2. Select your connected device or emulator in the toolbar.
3. Click the green **Run (▶)** button (`Shift + F10`).

---

## 🛠️ Handy NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run android:sync` | Builds current web bundle (`dist/`) and syncs into Android assets. |
| `npm run android:build` | Syncs web assets and compiles installable `app-debug.apk`. |
| `npm run android:build:release` | Syncs web assets and compiles installable, optimized `app-release.apk`. |
| `npm run android:open` | Automatically detects Android Studio path and opens `android/`. |
| `npm run android:run` | Builds, syncs, and deploys directly to connected device. |
| `npm run sync:web` | Pulls latest commits from `origin/main`, builds, and syncs into Android. |

---

## 🔒 Permissions & Security Configuration

The Android Manifest (`android/app/src/main/AndroidManifest.xml`) is configured with:
- **`CAMERA`**: Required by Google MediaPipe Vision for real-time 3D hand joint tracking.
- **`INTERNET`**: Required to fetch MediaPipe model weights and WASM bundles.
- **`RECORD_AUDIO` & `MODIFY_AUDIO_SETTINGS`**: Enables real-time procedural Web Audio sound synthesis.
- **`androidScheme: "https"`**: Serves local assets under `https://localhost` so browser security models grant permission for `getUserMedia()`, WebGL, and WebXR.
- **Optional Camera Features (`android:required="false"`)**: Ensures the app installs on devices lacking front autofocus or specialized camera modules.

---

## 🎨 Adaptive Icons & Theming

- **Modern Adaptive Icons**: Configured in `res/mipmap-anydpi-v26/` with `<adaptive-icon>` including `<monochrome>` elements for Android 13+ themed home screens.
- **Cyberpunk Color Palette**: Configured in `res/values/colors.xml`:
  - `colorPrimary`: `#00f0ff` (Neon Cyan)
  - `colorPrimaryDark`: `#0a0b10` (Deep Space Obsidian)
  - `colorAccent`: `#ff0055` (Holographic Pink)

---

## 🧪 Testing & Verification

Automated unit tests verify Android app ID resolution and basic math invariants:
```bash
cd android
./gradlew testDebugUnitTest
```
All inspections and builds are verified with zero errors and zero warnings.
