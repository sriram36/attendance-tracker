Attendance Tracker 📊✏️
Tired of last-minute math trying to figure out if you can skip that 8 AM class? Say goodbye to messy spreadsheets! This simple, sleek attendance tracker is your new semester sidekick.

It's built to be fast, private, and super easy to use, so you can focus on your studies, not on complicated spreadsheets.

<!-- You can take a screenshot of your working app and upload it to a site like Imgur to get a link! -->

✨ Features
✅ Automatic Daily Schedule
Displays only today's classes based on your weekly routine—no more confusion.

👆 One-Tap Tracking
Mark yourself "Present" or "Absent" with a single click. Saved instantly!

📈 Live Attendance Stats
Real-time progress bars with color-coded alerts for each subject, plus an Overall Attendance card to see the big picture.

📜 Detailed History Logs
View complete, dated logs for each subject to see exactly when you were present or absent.

🎉 Holiday Mode
Mark a day as a holiday so it doesn’t mess up your stats.

🌗 Dark & Light Themes
Choose your vibe. Your theme preference is saved for your next visit.

🔒 Private & Secure
No sign-up needed. Uses Firebase Anonymous Auth to generate a secure, private user ID. Your data is yours alone.

📱 Responsive Design
Looks great and works seamlessly on mobile, tablet, and desktop.

🚀 Tech Stack
HTML – The structure of the app.

Tailwind CSS – For clean, responsive, and theme-aware styling.

Vanilla JavaScript – Handles all app logic and interactivity.

Google Firebase

Firestore for the real-time database.

Anonymous Authentication for secure, private access.

🛠️ How to Set Up Your Own
Download the Code
Get the index.html file from this repository.

Create a Firebase Project (It's Free!)

Go to the Firebase Console.

Create a new project.

Add a Web App and copy the firebaseConfig object.

Enable Firebase Services

Enable Anonymous Authentication under Authentication → Sign-in method.

Set up Cloud Firestore in Production Mode.

Set Firestore Security Rules
Go to the Rules tab in Firestore and paste the following:
```bash
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // This rule is more secure and specific to the app's structure
    match /artifacts/attendance-tracker-app/users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Insert Firebase Config
Paste your firebaseConfig object into the placeholder inside the <script> tag of your index.html.

Deploy It!
The easiest way is to use GitHub Pages:

Create a new public repository.

Upload your index.html file.

Go to Settings → Pages → Choose main branch and / (root).

Boom! Your tracker is live 🚀

🔐 Privacy Matters
This app uses anonymous authentication — no name, no email, just a random unique ID.

Your data is only visible to you, protected via Firestore security rules.

No personal data is ever collected or shared.

🙌 Final Words
This tool was built to make student life a bit less stressful. Track responsibly, and don’t forget to take real breaks! 💙
