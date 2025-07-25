# Local Notification Ionic App

This is a simple Ionic Angular app that allows users to schedule local notifications using Capacitor's `LocalNotifications` plugin.

---

## 🚀 Features

- Schedule local notifications by selecting a date and time
- Cancel scheduled notifications
- Auto-remove triggered notifications from the list
- Show upcoming notifications sorted in ascending order

---

## 📦 Project Setup

### 1. Install Dependencies
```bash
npm install
ionic build
npx cap sync android
sed -i 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' android/capacitor-cordova-android-plugins/build.gradle
cd android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
./gradlew assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk
