<div align="center">
  <img src="public/favicon.svg" alt="Study Hub Logo" width="120" height="120">
  
  # 📚 Study Hub
  **Your Ultimate Student Companion**
  
  [![Build Status](https://img.shields.io/github/actions/workflow/status/MightyFardin/Study-Hub/build-apk.yml?branch=main&label=Build%20APK&style=for-the-badge)](https://github.com/MightyFardin/Study-Hub/actions)
  [![Version](https://img.shields.io/github/package-json/v/MightyFardin/Study-Hub?style=for-the-badge&color=blue)](https://github.com/MightyFardin/Study-Hub/releases)
  
  <p align="center">
    Manage your courses, track attendance, calculate your CGPA, and organize your notes seamlessly in one powerful, beautifully designed application.
  </p>
</div>

---

## ✨ Features

- **📊 Dashboard & Analytics:** Get a bird's eye view of your upcoming classes, assignments, and overall attendance.
- **📅 Smart Timetable:** Manage your weekly class schedule with intuitive time slots and automatic next-class alerts.
- **✅ Attendance Tracking:** Keep precise logs of your attendance for each course. Never fall below your required percentage again!
- **🧮 CGPA Calculator:** Easily calculate your current semester GPA and cumulative CGPA.
- **📝 Course Notes:** Write, organize, and store your study materials with full Markdown support.
- **⏰ Pomodoro Timer:** Boost your productivity with an integrated Pomodoro timer.
- **🃏 Flashcards:** Create interactive flashcards to test your knowledge before exams.
- **📱 Cross-Platform:** Built as a Progressive Web App (PWA) and Android app using Capacitor, meaning it works flawlessly on any device.

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MightyFardin/Study-Hub.git
   cd Study-Hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   *The app will be available at http://localhost:5173*

## 📱 Android Build

To build the Android APK locally:

```bash
# Build the web assets
npm run build

# Sync assets to Capacitor Android project
npx cap sync android

# Build the APK using Gradle
cd android
./gradlew assembleDebug
```
*Your APK will be available in `android/app/build/outputs/apk/debug/`*

## 🛠 Tech Stack

- **Frontend Framework:** React 18
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Icons:** Lucide React
- **Build Tool:** Vite
- **Mobile Wrapper:** Capacitor v8
- **Backend/Database:** Firebase (Auth, Firestore, Storage)

## 🎨 Design System

Study Hub utilizes a modern, sleek interface with support for both Light and Dark modes. It features responsive layouts that look great on both desktop and mobile screens.

---
<div align="center">
  <i>Developed with ❤️ for students everywhere.</i>
</div>
