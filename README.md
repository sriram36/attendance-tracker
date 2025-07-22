📊✏️ Attendance Tracker
Tired of last-minute math trying to figure out if you can skip that 8 AM class?
Say goodbye to messy spreadsheets! This simple, sleek attendance tracker is your new semester sidekick.

✨ Features
✅ Automatic Daily Schedule
Displays only today's classes based on your weekly routine—no more confusion.

👆 One-Tap Tracking
Mark yourself Present or Absent with a single click. Saved instantly!

📈 Live Attendance Stats
Real-time progress bars with color-coded alerts to help you track your attendance health.

📜 Detailed History Logs
View complete logs for each subject to see exactly when you were present or absent.

🎉 Holiday Mode
Mark a day as a holiday so it doesn’t mess up your stats.

🌗 Dark & Light Themes
Choose your vibe. Your theme preference is saved for your next visit.

🔒 Private & Secure
No sign-up needed. Uses Firebase Anonymous Auth to generate a secure, private user ID.

📱 Responsive Design
Looks great and works seamlessly on mobile, tablet, and desktop.

🚀 Tech Stack
HTML – Structure of the app.

Tailwind CSS – For clean, responsive, and theme-aware styling.

Vanilla JavaScript – Handles all app logic and interactivity.

Google Firebase

Firestore for real-time database

Anonymous Authentication for secure, private access

Hosting and security rules to protect user data

🛠️ How to Set Up Your Own
1. Download the Code
Get the index.html file from this repository.

2. Create a Firebase Project
Go to Firebase Console

Create a new project

Add a Web App and copy the firebaseConfig object

3. Enable Firebase Services
Enable Anonymous Authentication under Authentication → Sign-in method

Set up Cloud Firestore in Production Mode

4. Set Firestore Security Rules

```bash
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
4. Insert Firebase Config
Paste your firebaseConfig into the placeholder inside the <script> tag of your index.html.

5. Deploy It
Use GitHub Pages:

Create a public repository

Upload index.html

Go to Settings → Pages → Choose main branch → / (root)

Boom! Your tracker is live 🚀

🔐 Privacy Matters
Uses anonymous authentication — no name, no email, just a random unique ID.

Data is only visible to you, protected via Firestore security rules.

No personal data is ever collected or shared.

🙌 Final Words
This tool was built to make student life a bit less stressful.
Track responsibly, and don’t forget to take real breaks! 💙
