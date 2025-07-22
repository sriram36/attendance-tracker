// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, query, onSnapshot, serverTimestamp, setDoc, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- PASTE YOUR FIREBASE CONFIG OBJECT HERE ---
// This is a placeholder. Replace it with the config from your Firebase project.
const firebaseConfig = {
  apiKey: "AIzaSyBn7aLWWtpSPRqvYhSmBIyixBTdNHEd0JQ",
  authDomain: "my-class-attendance-tracker.firebaseapp.com",
  projectId: "my-class-attendance-tracker",
  storageBucket: "my-class-attendance-tracker.firebasestorage.app",
  messagingSenderId: "598768607049",
  appId: "1:598768607049:web:e177677b8b6afbce108498"
};
// ---------------------------------------------

const appId = 'attendance-tracker-app'; // You can keep this as is

// --- TIMETABLE DATA (FIX IS HERE) ---
const timetable = {
    1: [ { period: 1, subject: 'DWDM Lab', code: 'DWDM LAB', lab: true },{ period: 2, subject: 'DWDM Lab', code: 'DWDM LAB', lab: true },{ period: 3, subject: 'DWDM Lab', code: 'DWDM LAB', lab: true },{ period: 4, subject: 'DWDM Lab', code: 'DWDM LAB', lab: true },{ period: 5, subject: 'Placement Training', code: 'PT', room: 'U-411' },{ period: 6, subject: 'Placement Training', code: 'PT', room: 'U-411' },{ period: 7, subject: 'Placement Training', code: 'PT', room: 'U-411' },{ period: 8, subject: 'Placement Training', code: 'PT', room: 'U-411' },],
    2: [ { period: 1, subject: 'DWDM', code: 'DWDM', room: 'U-411' },{ period: 2, subject: 'DWDM', code: 'DWDM', room: 'U-411' },{ period: 3, subject: 'IoT', code: 'IOT', room: 'U-411' },{ period: 4, subject: 'IoT', code: 'IOT', room: 'U-411' },{ period: 5, subject: 'Tinkering Lab', code: 'TINKERING', lab: true },{ period: 6, subject: 'Tinkering Lab', code: 'TINKERING', lab: true },{ period: 7, subject: 'Tinkering Lab', code: 'TINKERING', lab: true },{ period: 8, subject: 'Tinkering Lab', code: 'TINKERING', lab: true },],
    3: [ { period: 1, subject: 'OE-I', code: 'OE-1' },{ period: 2, subject: 'OE-I', code: 'OE-1' },{ period: 3, subject: 'Soft Skills', code: 'SOFTSKILLS', room: 'U-411' },{ period: 4, subject: 'Soft Skills', code: 'SOFTSKILLS', room: 'U-411' },{ period: 5, subject: 'MOOCS', code: 'MOOCS', room: 'TC' },{ period: 6, subject: 'MOOCS', code: 'MOOCS', room: 'TC' },],
    4: [ { period: 1, subject: 'FSD Lab', code: 'FSD LAB', lab: true },{ period: 2, subject: 'FSD Lab', code: 'FSD LAB', lab: true },{ period: 3, subject: 'FSD Lab', code: 'FSD LAB', lab: true },{ period: 4, subject: 'FSD Lab', code: 'FSD LAB', lab: true },{ period: 5, subject: 'CN', code: 'CN', room: 'TC' },{ period: 6, subject: 'CN', code: 'CN', room: 'TC' },],
    5: [ { period: 1, subject: 'QA', code: 'QA', room: 'U-411' },{ period: 2, subject: 'QA', code: 'QA', room: 'U-411' },{ period: 3, subject: 'CN', code: 'CN', room: 'U-411' },{ period: 4, subject: 'CN', code: 'CN', room: 'U-411' },{ period: 5, subject: 'OE-I', code: 'OE-1' },{ period: 6, subject: 'OE-I', code: 'OE-1' },{ period: 7, subject: 'MOOCS', code: 'MOOCS', room: 'U-411' },{ period: 8, subject: 'MOOCS', code: 'MOOCS', room: 'U-411' },],
    6: [ { period: 1, subject: 'IoT', code: 'IOT', room: 'U-411' },{ period: 2, subject: 'IoT', code: 'IOT', room: 'U-411' },{ period: 3, subject: 'DWDM', code: 'DWDM', room: 'U-411' },{ period: 4, subject: 'DWDM', code: 'DWDM', room: 'U-411' },],
    0: []
};
const allSubjects = [...new Set(Object.values(timetable).flat().map(p => ({ code: p.code, name: p.subject })))];

// --- DOM ELEMENTS ---
const appContainer = document.getElementById('app-container');
const htmlEl = document.documentElement;
const currentDateEl = document.getElementById('current-date');
const scheduleCardsEl = document.getElementById('schedule-cards');
const statsContainerEl = document.getElementById('stats-container');
const userIdDisplayEl = document.getElementById('user-id-display');
const viewTimetableBtn = document.getElementById('view-timetable-btn');
const timetableModal = document.getElementById('timetable-modal');
const closeTimetableModalBtn = document.getElementById('close-timetable-modal-btn');
const fullTimetableContentEl = document.getElementById('full-timetable-content');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const markHolidayBtn = document.getElementById('mark-holiday-btn');
const holidayViewEl = document.getElementById('holiday-view');
const historyModal = document.getElementById('history-modal');
const historyModalTitle = document.getElementById('history-modal-title');
const historyModalContent = document.getElementById('history-modal-content');
const closeHistoryModalBtn = document.getElementById('close-history-modal-btn');

// --- FIREBASE & APP STATE ---
let db, auth, userId;
let allAttendanceData = [];
let attendanceUnsubscribe = null;
let holidayUnsubscribe = null;
let isTodayHoliday = false;

// --- APP INITIALIZATION ---
async function main() {
    if (firebaseConfig.apiKey === "YOUR_API_KEY" || firebaseConfig.projectId === "YOUR_PROJECT_ID") {
        appContainer.innerHTML = `<div class="p-8 max-w-2xl mx-auto bg-red-100 border-l-4 border-red-500 text-red-700">
            <h2 class="font-bold text-xl mb-2">Action Required: Configuration Error</h2>
            <p>You must paste your project's keys into the <strong>firebaseConfig</strong> object in the code for the app to work.</p>
            <ol class="list-decimal list-inside mt-4 space-y-2">
                <li>Go to your <a href="https://console.firebase.google.com/" class="underline" target="_blank">Firebase project</a>.</li>
                <li>Go to <strong>Project settings</strong> (click the ⚙️ icon).</li>
                <li>Under the "General" tab, find the "Your apps" section.</li>
                <li>Click the "Config" radio button to see your keys.</li>
                <li>Copy the entire <strong>firebaseConfig</strong> object.</li>
                <li>Paste it into the code, replacing the placeholder object.</li>
            </ol>
         </div>`;
        console.error("Firebase initialization failed: Placeholder values are still present in firebaseConfig.");
        return;
    }

    try {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        onAuthStateChanged(auth, user => {
            if (user) {
                userId = user.uid;
                userIdDisplayEl.textContent = userId;
                loadTheme();
                renderApp();
                listenForAttendanceChanges();
                listenForHolidayChanges();
            } else {
                authenticateAnonymously();
            }
        });
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        document.body.innerHTML = `<div class="p-4 text-red-600 bg-red-100 border border-red-400 rounded-md">Error: Firebase configuration is invalid. Please check the 'firebaseConfig' object.</div>`;
    }
}

async function authenticateAnonymously() {
    try {
        await signInAnonymously(auth);
    } catch (error) {
        console.error("Authentication failed:", error);
    }
}

// --- UI RENDERING ---
function renderApp() {
    const today = new Date();
    currentDateEl.textContent = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    if (isTodayHoliday) {
        holidayViewEl.classList.remove('hidden');
        scheduleCardsEl.classList.add('hidden');
        markHolidayBtn.innerHTML = `<span class="hidden sm:inline">Undo Holiday</span> <span class="sm:hidden">✅</span>`;
    } else {
        holidayViewEl.classList.add('hidden');
        scheduleCardsEl.classList.remove('hidden');
        markHolidayBtn.innerHTML = `<span class="hidden sm:inline">Holiday</span> <span class="sm:hidden">🎉</span>`;
        renderTodaysSchedule(today);
    }
    renderFullTimetable();
}

function renderTodaysSchedule(date) {
    const dayOfWeek = date.getDay();
    const todaysClasses = timetable[dayOfWeek] || [];
    scheduleCardsEl.innerHTML = ''; 

    if (todaysClasses.length === 0) {
        scheduleCardsEl.innerHTML = `<div class="card p-4 rounded-lg shadow-sm text-center text-sub">No classes scheduled for today.</div>`;
        return;
    }

    todaysClasses.forEach(cls => {
        const card = document.createElement('div');
        card.className = 'card p-4 rounded-lg shadow-sm';
        card.id = `class-${cls.code}-${cls.period}`;
        
        card.innerHTML = `
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div class="mb-3 sm:mb-0">
                    <p class="font-bold text-lg text-main">${cls.subject}</p>
                    <p class="text-sm text-sub">Period ${cls.period}${cls.room ? ` • Room: ${cls.room}` : ''}${cls.lab ? ' • Lab' : ''}</p>
                </div>
                <div class="flex space-x-2" data-code="${cls.code}" data-period="${cls.period}">
                    <button class="btn-present flex-1 sm:flex-none py-2 px-4 text-sm font-semibold rounded-md border border-gray-300 hover:bg-gray-100 transition" data-status="present">Present</button>
                    <button class="btn-absent flex-1 sm:flex-none py-2 px-4 text-sm font-semibold rounded-md border border-gray-300 hover:bg-gray-100 transition" data-status="absent">Absent</button>
                </div>
            </div>
        `;
        scheduleCardsEl.appendChild(card);
    });
}
        
function renderFullTimetable() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let html = '<div class="space-y-6">';
    days.forEach((day, index) => {
        const classes = timetable[index] || [];
        if (index > 0 && classes.length > 0) {
            html += `<div><h4 class="font-bold text-lg mb-2 border-b pb-1 border-main text-main">${day}</h4>`;
            html += '<ul class="space-y-1 list-disc list-inside text-sub">';
            classes.forEach(cls => { html += `<li><strong>Period ${cls.period}:</strong> ${cls.subject} (${cls.code})</li>`; });
            html += '</ul></div>';
        }
    });
    html += '</div>';
    fullTimetableContentEl.innerHTML = html;
}

function updateStatsUI() {
    statsContainerEl.innerHTML = '';
    const stats = {};
    const uniqueSubjects = allSubjects.filter((v,i,a)=>a.findIndex(t=>(t && t.code === v.code))===i);

    uniqueSubjects.forEach(subj => {
        if(subj && subj.code) stats[subj.code] = { name: subj.name, total: 0, present: 0 };
    });

    allAttendanceData.forEach(record => {
        if (stats[record.code]) {
            stats[record.code].total++;
            if (record.status === 'present') stats[record.code].present++;
        }
    });

    Object.keys(stats).forEach(code => {
        const s = stats[code];
        const percentage = s.total > 0 ? (s.present / s.total) * 100 : 0;
        let bgColor = percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';

        const card = document.createElement('div');
        card.className = 'card p-4 rounded-lg shadow-sm flex flex-col';
        card.innerHTML = `
            <div class="flex-grow">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-main">${s.name}</p>
                        <p class="text-sm text-sub">${s.present} / ${s.total} classes attended</p>
                    </div>
                    <p class="font-bold text-lg text-main">${percentage.toFixed(1)}%</p>
                </div>
                <div class="mt-3">
                    <div class="progress-bar-bg w-full rounded-full h-2.5"><div class="${bgColor} h-2.5 rounded-full" style="width: ${percentage}%"></div></div>
                </div>
            </div>
            <button class="view-history-btn mt-4 w-full text-sm text-indigo-600 dark:text-indigo-400 hover:underline text-left" data-subject-code="${code}" data-subject-name="${s.name}">
                View History
            </button>
        `;
        statsContainerEl.appendChild(card);
    });
}
        
function updateTodaysScheduleUI() {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysAttendance = allAttendanceData.filter(rec => rec.date === todayStr);

    document.querySelectorAll('#schedule-cards .flex[data-code]').forEach(buttonGroup => {
        const code = buttonGroup.dataset.code;
        const period = parseInt(buttonGroup.dataset.period);
        const record = todaysAttendance.find(rec => rec.code === code && rec.period === period);
        
        buttonGroup.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        
        if (record) {
            const activeButton = buttonGroup.querySelector(`button[data-status="${record.status}"]`);
            if (activeButton) activeButton.classList.add('active');
        }
    });
}

// --- DATA HANDLING ---
function listenForAttendanceChanges() {
    if (attendanceUnsubscribe) attendanceUnsubscribe();
    const q = query(collection(db, `artifacts/${appId}/users/${userId}/attendance`));
    
    attendanceUnsubscribe = onSnapshot(q, (snapshot) => {
        allAttendanceData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateStatsUI();
        updateTodaysScheduleUI();
    }, console.error);
}

function listenForHolidayChanges() {
    if (holidayUnsubscribe) holidayUnsubscribe();
    const todayStr = new Date().toISOString().split('T')[0];
    const holidayRef = doc(db, `artifacts/${appId}/users/${userId}/holidays`, todayStr);

    holidayUnsubscribe = onSnapshot(holidayRef, (docSnap) => {
        isTodayHoliday = docSnap.exists();
        renderApp();
    });
}

async function handleAttendanceAction(code, period, status) {
    if (!userId) { console.error("User not authenticated."); return; }
    const todayStr = new Date().toISOString().split('T')[0];
    const docId = `${todayStr}_${code}_${period}`;
    const attendanceRef = doc(db, `artifacts/${appId}/users/${userId}/attendance`, docId);
    try {
        await setDoc(attendanceRef, { code, period, status, date: todayStr, timestamp: serverTimestamp() });
    } catch (error) { console.error("Error writing attendance:", error); }
}

async function handleHolidayToggle() {
    if (!userId) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const holidayRef = doc(db, `artifacts/${appId}/users/${userId}/holidays`, todayStr);
    if (isTodayHoliday) {
        await deleteDoc(holidayRef);
    } else {
        await setDoc(holidayRef, { markedAt: serverTimestamp() });
    }
}

function showHistory(subjectCode, subjectName) {
    historyModalTitle.textContent = `History for ${subjectName}`;
    
    const records = allAttendanceData
        .filter(rec => rec.code === subjectCode)
        .sort((a, b) => b.date.localeCompare(a.date));

    if (records.length === 0) {
        historyModalContent.innerHTML = `<p class="text-sub text-center">No history found for this subject.</p>`;
    } else {
        let html = '<ul class="space-y-2">';
        records.forEach(rec => {
            const date = new Date(rec.date + 'T00:00:00');
            const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
            const statusClass = rec.status === 'present' ? 'text-green-500' : 'text-red-500';
            html += `
                <li class="flex justify-between items-center border-b border-main pb-2">
                    <span class="text-main">${formattedDate} (P${rec.period})</span>
                    <span class="font-bold ${statusClass}">${rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}</span>
                </li>
            `;
        });
        html += '</ul>';
        historyModalContent.innerHTML = html;
    }
    historyModal.classList.add('active');
}

// --- THEME HANDLING ---
async function loadTheme() {
    if (!userId) return;
    const settingsRef = doc(db, `artifacts/${appId}/users/${userId}/settings`, 'theme');
    try {
        const docSnap = await getDoc(settingsRef);
        if (docSnap.exists() && docSnap.data().mode) {
            setTheme(docSnap.data().mode);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
    } catch (error) {
        console.error("Error loading theme:", error);
        setTheme('light');
    }
}

function setTheme(theme) {
    htmlEl.className = theme;
    themeToggleBtn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

async function saveTheme(theme) {
    if (!userId) return;
    const settingsRef = doc(db, `artifacts/${appId}/users/${userId}/settings`, 'theme');
    try {
        await setDoc(settingsRef, { mode: theme });
    } catch (error) {
        console.error("Error saving theme:", error);
    }
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    scheduleCardsEl.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-status]');
        if (button) {
            const buttonGroup = button.closest('[data-code]');
            handleAttendanceAction(buttonGroup.dataset.code, parseInt(buttonGroup.dataset.period), button.dataset.status);
        }
    });

    statsContainerEl.addEventListener('click', (e) => {
        const button = e.target.closest('.view-history-btn');
        if (button) {
            showHistory(button.dataset.subjectCode, button.dataset.subjectName);
        }
    });

    markHolidayBtn.addEventListener('click', handleHolidayToggle);

    themeToggleBtn.addEventListener('click', () => {
        const newTheme = htmlEl.classList.contains('dark') ? 'light' : 'dark';
        setTheme(newTheme);
        saveTheme(newTheme);
    });

    // Modal close buttons
    closeTimetableModalBtn.addEventListener('click', () => timetableModal.classList.remove('active'));
    closeHistoryModalBtn.addEventListener('click', () => historyModal.classList.remove('active'));
    
    // Open modal buttons
    viewTimetableBtn.addEventListener('click', () => timetableModal.classList.add('active'));

    // Close modal on overlay click
    timetableModal.addEventListener('click', e => {
        if (e.target === timetableModal) timetableModal.classList.remove('active');
    });
    historyModal.addEventListener('click', e => {
        if (e.target === historyModal) historyModal.classList.remove('active');
    });
}


// --- START THE APP ---
main();
setupEventListeners();
