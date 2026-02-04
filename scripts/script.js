// Config for Element SDK
const defaultConfig = {
  app_title: 'نظام تحديد المستوى',
  current_theme: 'modern'
};

// Initialize Element SDK
if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange: async (config) => {
      const titleElement = document.getElementById('appTitle');
      if (titleElement) {
        titleElement.textContent = config.app_title || defaultConfig.app_title;
      }
    },
    mapToCapabilities: (config) => ({
      recolorables: [],
      borderables: [],
      fontEditable: undefined,
      fontSizeable: undefined
    }),
    mapToEditPanelValues: (config) => new Map([
      ['app_title', config.app_title || defaultConfig.app_title]
    ])
  });
}

// Audio Manager
class AudioManager {
  constructor() {
    this.sounds = {
      // Local sounds (Place your .mp3 or .wav files in assets/sounds/)
      correct: new Audio('assets/sounds/correct.mp3'),
      wrong: new Audio('assets/sounds/wrong.wav'), // Local Buzzer File
      skip: new Audio('assets/sounds/skip.ogg'),
      clap: new Audio('assets/sounds/clap.mp3'),
      celebration: new Audio('https://actions.google.com/sounds/v1/cartoon/clown_horn_squeeze.ogg'),
      hover: new Audio('assets/sounds/hover.ogg'),
      click: new Audio('assets/sounds/skip.ogg'),
      welcome: new Audio('https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg?v=new2'), // Cache bust
      finished: new Audio('assets/sounds/finished.mp3')
    };

    // Fallback URLs
    this.fallbacks = {
      correct: 'https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg',
      wrong: 'assets/sounds/wrong.wav',
      skip: 'https://actions.google.com/sounds/v1/cartoon/pop.ogg',
      clap: 'https://actions.google.com/sounds/v1/crowds/battle_crowd_celebrate_stutter.ogg',
      celebration: 'https://actions.google.com/sounds/v1/cartoon/clown_horn_squeeze.ogg',
      hover: 'https://actions.google.com/sounds/v1/cartoon/pop.ogg',
      click: 'https://actions.google.com/sounds/v1/cartoon/pop.ogg',
      welcome: 'https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg',
      finished: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3'
    };

    this.voices = [];
    this.initVoices();

    // Unlock Audio Context on first interaction
    document.addEventListener('click', () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    }, { once: true });
  }

  initVoices() {
    window.speechSynthesis.onvoiceschanged = () => {
      this.voices = window.speechSynthesis.getVoices();
    };
    this.voices = window.speechSynthesis.getVoices();
  }

  // Removed explicit addErrorHandling instantiation loop to prevent blocking

  play(soundName) {
    const sound = this.sounds[soundName];
    if (sound) {
      // Lazy error handling
      sound.onerror = () => {
        if (this.fallbacks[soundName] && sound.src !== this.fallbacks[soundName]) {
          sound.src = this.fallbacks[soundName];
          sound.play().catch(console.warn);
        }
      };

      sound.currentTime = 0;
      return sound.play().catch(e => console.log("Audio play prevented:", e));
    }
    return Promise.resolve();
  }


  // function removed



  speak(text) {
    if (!text || !('speechSynthesis' in window)) return;

    // 1. Clean text for file searching
    const cleanText = text.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    const localPath = `assets/sounds/questions/${cleanText}.mp3`;

    // 2. Try Local Human Record First
    const localAudio = new Audio(localPath);
    localAudio.play()
      .then(() => console.log('Playing local audio:', localPath))
      .catch(() => {
        // 3. Try predefined helper URLs as second option
        const humanVoiceUrls = {
          'apple': 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/apple--_gb_1.mp3',
          'red': 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/red--_gb_1.mp3',
          'book': 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/book--_gb_1.mp3',
          'elephant': 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/elephant--_gb_1.mp3',
          'monday': 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/monday--_gb_1.mp3',
          'teacher': 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/teacher--_gb_1.mp3',
          'jump': 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/jump--_gb_1.mp3',
          'happy': 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/happy--_gb_1.mp3',
          'lion': 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/lion--_gb_1.mp3',
          'one': 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/one--_gb_1.mp3',
          'ten': 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/ten--_gb_1.mp3'
        };

        const shortWord = text.toLowerCase().trim();
        if (humanVoiceUrls[shortWord]) {
          const helperAudio = new Audio(humanVoiceUrls[shortWord]);
          helperAudio.play().catch(() => this.useTTS(text));
        } else {
          // 4. Final Fallback: System TTS
          this.useTTS(text);
        }
      });
  }

  useTTS(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;

    if (this.voices.length === 0) {
      this.voices = window.speechSynthesis.getVoices();
    }

    const preferredVoice = this.voices.find(v =>
      v.name.includes('Google US English') ||
      v.name.includes('Microsoft Zira') ||
      v.name.includes('Samantha')
    );

    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  }
}

const audioManager = new AudioManager();

// Employee data
const defaultEmployees = {
  A: { name: 'فرع : ميامي', password: '1111', counter: 100 },
  B: { name: 'فرع : العجمى', password: '1111', counter: 200 },
  C: { name: 'فرع : السيوف', password: '1111', counter: 300 },
  D: { name: 'فرع : المندرة', password: '1111', counter: 400 },
  E: { name: 'فرع : سموحة', password: '1111', counter: 500 },
  F: { name: 'فرع : الازاريطة', password: '1111', counter: 600 },
  G: { name: 'فرع الاختبار الحر', password: '1111', counter: 700 }
};

// Load employees from LocalStorage or use default
var employees;
try {
  employees = JSON.parse(localStorage.getItem('englishTest_employees')) || defaultEmployees;

  // FORCE SYNC: Update names/passwords from code to override old LocalStorage
  // This ensures the source file is the truth for credentials
  Object.keys(defaultEmployees).forEach(key => {
    if (employees[key]) {
      employees[key].name = defaultEmployees[key].name;
      employees[key].password = defaultEmployees[key].password;
    } else {
      employees[key] = defaultEmployees[key];
    }
  });

  // Save back the updated version
  localStorage.setItem('englishTest_employees', JSON.stringify(employees));

} catch (e) {
  employees = defaultEmployees;
}

const ADMIN_PASSWORD = '3601834';
let SUPERVISOR_PASSWORD = localStorage.getItem('englishTest_supervisorPass') || '1357';

// Current session
let currentUser = null;
let isAdmin = false;
let isSupervisor = false;
// Load records from LocalStorage
var allRecords;
try {
  allRecords = JSON.parse(localStorage.getItem('englishTest_records')) || [];
} catch (e) {
  allRecords = [];
}
let currentTheme = 'modern';

// Test state
let testState = {
  studentName: '',
  age: 0,
  employeeId: '',
  questions: [],
  answers: [],
  currentIndex: 0,
  startTime: null,
  timerInterval: null,
  timeLimit: 0,
  showInstantFeedback: true,
  isExtraChance: false
};

// ==================== THEME FUNCTIONS ====================
function switchTheme(theme) {
  currentTheme = theme;
  const body = document.body;

  // Remove all theme classes
  body.classList.remove('theme-modern', 'theme-win7', 'theme-dark');

  // Add new theme class
  body.classList.add('theme-' + theme);

  // Update active button
  document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
  const btnId = 'theme' + theme.charAt(0).toUpperCase() + theme.slice(1);
  const btn = document.getElementById(btnId);
  if (btn) btn.classList.add('active');

  // Update config if SDK is available
  if (window.elementSdk) {
    window.elementSdk.setConfig({ current_theme: theme });
  }
}

// ==================== AUTHENTICATION ====================
function login() {
  const employeeId = document.getElementById('employeeSelect').value;
  const password = document.getElementById('passwordInput').value;

  if (!employeeId) {
    showToast('الرجاء اختيار الموظف');
    return;
  }

  if (employeeId === 'admin') {
    if (password === ADMIN_PASSWORD) {
      isAdmin = true;
      isSupervisor = false;
      currentUser = 'admin';
      showAdminDashboard();
    } else {
      showLoginError();
    }
  } else if (employeeId === 'supervisor') {
    if (password === SUPERVISOR_PASSWORD) {
      isAdmin = false;
      isSupervisor = true;
      currentUser = 'supervisor';
      showAdminDashboard();
    } else {
      showLoginError();
    }
  } else {
    if (employees[employeeId] && employees[employeeId].password === password) {
      isAdmin = false;
      isSupervisor = false;
      currentUser = employeeId;
      showEmployeeDashboard();
    } else {
      showLoginError();
    }
  }
}

function showLoginError() {
  document.getElementById('loginError').classList.remove('hidden');
  document.getElementById('passwordInput').classList.add('shake');
  setTimeout(() => document.getElementById('passwordInput').classList.remove('shake'), 300);
}

// Add Enter key support for login
document.addEventListener('DOMContentLoaded', function () {
  const passwordInput = document.getElementById('passwordInput');
  if (passwordInput) {
    passwordInput.addEventListener('keypress', function (event) {
      if (event.key === 'Enter') {
        login();
      }
    });
  }

  // Populate employee dropdown dynamically
  populateAllEmployeeDropdowns();

  showWelcomeScreen();
});

// Populate employee dropdown with current names from localStorage/Firebase
// Populate all employee dropdowns with current names
function populateMonthFilter() {
  const select = document.getElementById('filterMonth');
  if (!select) return;

  const currentMonthValue = select.value;
  select.innerHTML = '<option value="all">جميع الشهور</option>';

  // Get unique months from allRecords
  const months = new Set();
  allRecords.forEach(r => {
    if (r.month_year) {
      months.add(r.month_year);
    } else if (r.test_date) {
      // Fallback for old records: try to extract something
      // Extract month/year from Arabic or standard strings
      const dateParts = r.test_date.split('/');
      if (dateParts.length >= 2) {
        // Simple heuristic: year/month/day
        const y = dateParts[0].replace(/[^\d]/g, '');
        const m = dateParts[1].replace(/[^\d]/g, '');
        if (y && m) months.add(`${y}-${m.padStart(2, '0')}`);
      }
    }
  });

  // Sort months descending
  Array.from(months).sort().reverse().forEach(my => {
    const option = document.createElement('option');
    option.value = my;
    const [year, month] = my.split('-');
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    option.textContent = `${monthNames[parseInt(month) - 1]} ${year}`;
    select.appendChild(option);
  });

  if (currentMonthValue) select.value = currentMonthValue;
}

function populateAllEmployeeDropdowns() {
  const dropdowns = [
    { id: 'employeeSelect', defaultText: '-- اختر الموظف --', includeAdmin: true },
    { id: 'filterEmployee', defaultText: 'جميع الموظفين', defaultValue: 'all', includeAdmin: false },
    { id: 'adminEmployeeSelect', defaultText: '-- اختر الموظف --', includeAdmin: false },
    { id: 'forgotEmployeeSelect', defaultText: '-- اختر الموظف --', includeAdmin: true }
  ];

  dropdowns.forEach(conf => {
    const select = document.getElementById(conf.id);
    if (!select) return;

    // Save currently selected value to restore it if possible
    const currentValue = select.value;

    // Clear existing options
    select.innerHTML = '';

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = conf.defaultValue || '';
    defaultOption.textContent = conf.defaultText;
    select.appendChild(defaultOption);

    // Add employee options
    Object.entries(employees).forEach(([id, emp]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = emp.name;
      select.appendChild(option);
    });

    // Add admin option if requested
    if (conf.includeAdmin) {
      const adminOption = document.createElement('option');
      adminOption.value = 'admin';
      adminOption.textContent = 'المدير 👑';
      select.appendChild(adminOption);

      const supervisorOption = document.createElement('option');
      supervisorOption.value = 'supervisor';
      supervisorOption.textContent = 'المحاسب المالى 💰';
      select.appendChild(supervisorOption);
    }

    // Populate month filter if it's the admin filter
    if (conf.id === 'filterMonth') {
      populateMonthFilter();
    }

    // Restore selection if it still exists
    if (currentValue && (employees[currentValue] || currentValue === 'admin' || currentValue === 'all')) {
      select.value = currentValue;
    }
  });
}

function logout() {
  currentUser = null;
  isAdmin = false;
  isSupervisor = false;
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('employeeDashboard').classList.add('hidden');
  document.getElementById('adminDashboard').classList.add('hidden');
  document.getElementById('testScreen').classList.add('hidden');
  document.getElementById('resultsScreen').classList.add('hidden');
  document.getElementById('employeeSelect').value = '';
  document.getElementById('passwordInput').value = '';
  document.getElementById('loginError').classList.add('hidden');
}

// ==================== DASHBOARD FUNCTIONS ====================
function showEmployeeDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('employeeDashboard').classList.remove('hidden');
  document.getElementById('employeeName').textContent = employees[currentUser].name;
  hideAllEmployeeSections();
}

function showAdminDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('adminDashboard').classList.remove('hidden');

  const titleEl = document.querySelector('#adminDashboard h2');
  const subTitleEl = document.querySelector('#adminDashboard p');
  const empBtn = document.querySelector('button[onclick="showEmployeeSettings()"]');
  const delAllBtn = document.querySelector('button[onclick="deleteAllRecords()"]');

  if (isSupervisor) {
    if (titleEl) titleEl.innerHTML = 'لوحة المحاسب المالى 💰';
    if (subTitleEl) subTitleEl.textContent = 'إدارة السجلات والبيانات المباشرة';
    // Hide employee settings for supervisor (they have their own simplified edit button)
    if (empBtn) empBtn.style.display = 'none';
    // Hide 'Delete All' for supervisor for safety
    if (delAllBtn) delAllBtn.style.display = 'none';
  } else {
    if (titleEl) titleEl.innerHTML = 'لوحة المدير 👑';
    if (subTitleEl) subTitleEl.textContent = 'إدارة النظام والسجلات';
    if (empBtn) empBtn.style.display = 'block';
    if (delAllBtn) delAllBtn.style.display = 'flex';
  }

  hideAllAdminSections();
  showAdminRecords();
}

function hideAllEmployeeSections() {
  document.getElementById('newTestForm').classList.add('hidden');
  document.getElementById('myRecords').classList.add('hidden');
}

function hideAllAdminSections() {
  document.getElementById('adminRecords').classList.add('hidden');
  document.getElementById('employeeSettings').classList.add('hidden');
  document.getElementById('statistics').classList.add('hidden');
  document.getElementById('adminNewTest').classList.add('hidden');
}

function showNewTest() {
  hideAllEmployeeSections();
  document.getElementById('newTestForm').classList.remove('hidden');
}

function showMyRecords() {
  hideAllEmployeeSections();
  document.getElementById('myRecords').classList.remove('hidden');
  renderMyRecords();
}

function showAdminRecords() {
  hideAllAdminSections();
  document.getElementById('adminRecords').classList.remove('hidden');
  populateMonthFilter(); // Ensure months are updated
  renderAllRecords();
}

function showEmployeeSettings() {
  hideAllAdminSections();
  document.getElementById('employeeSettings').classList.remove('hidden');
  renderEmployeeSettings();
}

function showStatistics() {
  hideAllAdminSections();
  document.getElementById('statistics').classList.remove('hidden');
  renderStatistics();
}

function showAdminNewTest() {
  hideAllAdminSections();
  document.getElementById('adminNewTest').classList.remove('hidden');
}

// ==================== RECORDS RENDERING ====================
function renderMyRecords() {
  const container = document.getElementById('myRecordsTable');
  const myRecords = allRecords.filter(r => r.employee_id === currentUser);

  if (myRecords.length === 0) {
    container.innerHTML = '<p class="text-center py-8" style="color: var(--text-secondary);">لا توجد سجلات بعد 📭</p>';
    return;
  }

  container.innerHTML = `
    <table class="w-full text-sm">
      <thead>
        <tr>
          <th class="p-3 text-right">رقم الملف</th>
          <th class="p-3 text-right">الطالب</th>
          <th class="p-3 text-right">العمر</th>
          <th class="p-3 text-right">الدرجة</th>
          <th class="p-3 text-right">المستوى</th>
          <th class="p-3 text-right">التاريخ</th>
        </tr>
      </thead>
      <tbody>
        ${myRecords.map(r => `
          <tr>
            <td class="p-3 font-mono">${r.file_number}</td>
            <td class="p-3">${r.student_name}</td>
            <td class="p-3">${r.age}</td>
            <td class="p-3 font-bold ${getScoreColor(r.total_score)}">${r.total_score}/100</td>
            <td class="p-3">${r.level}</td>
            <td class="p-3">${r.test_date}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderAllRecords() {
  const container = document.getElementById('allRecordsTable');
  const filterValue = document.getElementById('filterEmployee') ? document.getElementById('filterEmployee').value : 'all';
  const monthFilter = document.getElementById('filterMonth') ? document.getElementById('filterMonth').value : 'all';

  // Map records to preserve their original index for accurate deletion/viewing
  let indexedRecords = allRecords.map((r, i) => ({ data: r, originalIndex: i }));

  if (filterValue !== 'all') {
    indexedRecords = indexedRecords.filter(item => item.data.employee_id === filterValue);
  }

  if (monthFilter !== 'all') {
    indexedRecords = indexedRecords.filter(item => item.data.month_year === monthFilter);
  }

  if (indexedRecords.length === 0) {
    container.innerHTML = '<p class="text-center py-8" style="color: var(--text-secondary);">لا توجد سجلات بعد 📭</p>';
    return;
  }

  container.innerHTML = `
    <table class="w-full text-sm">
      <thead>
        <tr>
          <th class="p-3 text-right">رقم الملف</th>
          <th class="p-3 text-right">الطالب</th>
          <th class="p-3 text-right">العمر</th>
          <th class="p-3 text-right">الموظف</th>
          <th class="p-3 text-right">الدرجة</th>
          <th class="p-3 text-right">المستوى</th>
          <th class="p-3 text-right">المنهج</th>
          <th class="p-3 text-right">التاريخ</th>
          <th class="p-3 text-right no-print">إجراء</th>
        </tr>
      </thead>
      <tbody>
        ${indexedRecords.map(({ data: r, originalIndex }) => `
          <tr>
            <td class="p-3 font-mono">${r.file_number}</td>
            <td class="p-3">${r.student_name}</td>
            <td class="p-3">${r.age}</td>
            <td class="p-3">${employees[r.employee_id] ? employees[r.employee_id].name : (r.employee_id === 'supervisor' ? 'المحاسب المالى 💰' : r.employee_id)}</td>
            <td class="p-3 font-bold ${getScoreColor(r.total_score)}">${r.total_score}/100</td>
            <td class="p-3">${r.level}</td>
            <td class="p-3 text-xs">${r.curriculum}</td>
            <td class="p-3">${r.test_date}</td>
            <td class="p-3 no-print flex gap-2">
              <button onclick="viewRecord(${originalIndex})" title="عرض الشهادة" class="hover:scale-110 transition text-lg">
                📄
              </button>
              <button onclick="deleteRecord(this, ${originalIndex})" title="حذف" style="color: #f45c43;" class="hover:scale-110 transition text-lg">
                🗑️
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function getScoreColor(score) {
  if (score >= 91) return 'text-green-600';
  if (score >= 71) return 'text-blue-600';
  if (score >= 46) return 'text-yellow-600';
  return 'text-red-600';
}

function viewRecord(index) {
  const record = allRecords[index];
  if (!record) return;

  // Reconstruct scores object from flat record
  const scores = {
    sectionA: record.section_a_score || 0,
    sectionB: record.section_b_score || 0,
    sectionC: record.section_c_score || 0,
    sectionD: record.section_d_score || 0,
    sectionE: record.section_e_score || 0,
    sectionF: record.section_f_score || 0,
    total: record.total_score || 0
  };

  // Switch to results screen
  document.getElementById('adminDashboard').classList.add('hidden');
  document.getElementById('employeeDashboard').classList.add('hidden');

  // Ensure we are in a clean state
  document.getElementById('resultsScreen').classList.remove('hidden');

  // Reuse existing showResults logic
  showResults(record, scores);
}

function deleteRecord(btn, index) {
  if (!isAdmin && !isSupervisor) {
    showToast('🚫 عفواً، لا تمتلك صلاحية الحذف.');
    playWrongSound();
    return;
  }

  const recordRow = btn.closest('tr');
  // Removed complex string capturing to prevent syntax errors

  recordRow.innerHTML = `
    <td colspan="9" class="p-4 text-center">
      <div class="flex items-center justify-center gap-4">
        <span class="font-bold" style="color: var(--text-primary);">هل أنت متأكد من حذف هذا السجل؟</span>
        <button onclick="confirmDelete(${index})" class="btn-danger px-4 py-2 rounded-lg font-semibold text-sm">
          نعم، احذف 🗑️
        </button>
        <button onclick="cancelDelete()" class="px-4 py-2 rounded-lg font-semibold text-sm" style="background: var(--bg-card); border: 2px solid var(--border-color);">
          إلغاء
        </button>
      </div>
    </td>
  `;
}

function confirmDelete(index) {
  // Verify index validity
  if (index >= 0 && index < allRecords.length) {
    const deletedRecord = allRecords.splice(index, 1);
    localStorage.setItem('englishTest_records', JSON.stringify(allRecords));

    // Sync to Firebase if available
    if (typeof firebaseManager !== 'undefined') {
      firebaseManager.saveRecords(allRecords);
    }

    renderAllRecords();
    renderStatistics();
    showToast('تم حذف السجل بنجاح ✅');
  } else {
    showToast('❌ حدث خطأ أثناء الحذف: السجل غير موجود');
    renderAllRecords(); // Refresh to show current state
  }
}

function cancelDelete() {
  // Simply re-render to restore state
  renderAllRecords();
}

// ==================== DELETE ALL RECORDS (ADMIN) ====================
function deleteAllRecords() {
  if (!isAdmin && !isSupervisor) {
    showToast('🚫 عفواً، لا تمتلك صلاحية الحذف.');
    return;
  }

  if (allRecords.length === 0) {
    showToast('لا توجد سجلات لحذفها 📥');
    return;
  }

  const confirmMsg = '⚠️ تنبيه هام: هل أنت متأكد من حذف "جميع السجلات" نهائياً؟\n\nهذا الإجراء سيقوم بمسح كل البيانات المسجلة ولا يمكن التراجع عنه أبدأ!';

  if (confirm(confirmMsg)) {
    allRecords = [];
    localStorage.setItem('englishTest_records', JSON.stringify(allRecords));

    // Sync to Firebase if available
    if (typeof firebaseManager !== 'undefined') {
      firebaseManager.saveRecords(allRecords);
    }

    renderAllRecords();
    renderStatistics();
    showToast('تم حذف جميع السجلات بنجاح ✅');
  }
}

// ==================== EMPLOYEE SETTINGS ====================
function renderEmployeeSettings() {
  const container = document.getElementById('employeeList');

  // Combine regular employees with the special Accountant account for the settings view
  const allAccounts = {
    ...employees,
    'supervisor': { name: 'المحاسب المالى 💰', password: SUPERVISOR_PASSWORD }
  };

  container.innerHTML = Object.entries(allAccounts).map(([id, emp]) => `
    <div class="rounded-xl p-4" style="background: var(--bg-card); border: 2px solid var(--border-color);">
      <div class="flex items-center gap-3 mb-3">
        <span class="text-2xl">${id === 'supervisor' ? '💰' : '👤'}</span>
        <span class="font-bold text-lg">${id === 'supervisor' ? 'حساب المحاسب المالي' : id}</span>
      </div>
      <div class="space-y-2">
        <div>
          <label class="text-sm" style="color: var(--text-secondary);" for="empName_${id}">الاسم</label>
          <input type="text" id="empName_${id}" value="${emp.name}" class="w-full p-2 rounded-lg outline-none" placeholder="مثال: عمر، أحمد، محمد" ${isSupervisor && id !== 'supervisor' ? 'disabled' : ''} />
        </div>
        <div>
          <label class="text-sm" style="color: var(--text-secondary);" for="empPass_${id}">كلمة المرور</label>
          <input type="text" id="empPass_${id}" value="${emp.password}" class="w-full p-2 rounded-lg outline-none" ${isSupervisor && id !== 'supervisor' ? 'disabled' : ''} />
        </div>
        ${(!isSupervisor || id === 'supervisor') ? `
        <button onclick="saveEmployee('${id}')" class="btn-primary w-full py-2 rounded-lg font-semibold text-sm hover:scale-105 transition">
          حفظ التغييرات ✅
        </button>
        ` : '<p class="text-xs text-center p-2 opacity-50">لا يمكن تعديل بيانات الموظفين بواسطة المحاسب</p>'}
      </div>
    </div>
  `).join('');
}

function saveEmployee(id) {
  const name = document.getElementById(`empName_${id}`).value.trim();
  const password = document.getElementById(`empPass_${id}`).value.trim();

  if (!name || !password) {
    showToast('الرجاء ملء جميع الحقول ⚠️');
    return;
  }

  if (id === 'supervisor') {
    SUPERVISOR_PASSWORD = password;
    localStorage.setItem('englishTest_supervisorPass', password);
  } else {
    employees[id].name = name;
    employees[id].password = password;
    localStorage.setItem('englishTest_employees', JSON.stringify(employees));
  }

  // Sync to Firebase if available
  if (typeof firebaseManager !== 'undefined') {
    if (id !== 'supervisor') {
      firebaseManager.saveEmployees(employees);
    }
    // Note: If you want to sync supervisor pass to cloud, you'd need another ref
  }

  showToast(`تم حفظ بيانات ${name} بنجاح ✅`);
  populateAllEmployeeDropdowns();
}

// ==================== BACKUP & RESTORE ====================
async function exportData() {
  const monthFilter = document.getElementById('filterMonth').value;
  const employeeFilter = document.getElementById('filterEmployee').value;

  let recordsToExport = allRecords;
  let filenameSuffix = "كل_السجلات";

  if (monthFilter !== 'all') {
    recordsToExport = recordsToExport.filter(r => r.month_year === monthFilter);
    const [year, month] = monthFilter.split('-');
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    filenameSuffix = `${monthNames[parseInt(month) - 1]}_${year}`;
  }

  if (employeeFilter !== 'all') {
    recordsToExport = recordsToExport.filter(r => r.employee_id === employeeFilter);
    filenameSuffix += `_${employeeFilter}`;
  }

  if (recordsToExport.length === 0) {
    showToast('لا توجد سجلات للتصدير في هذا الاختيار 📥');
    return;
  }

  const data = {
    records: recordsToExport,
    exportDate: new Date().toISOString(),
    filterMonth: monthFilter,
    filterEmployee: employeeFilter,
    version: '1.1'
  };

  const jsonString = JSON.stringify(data, null, 2);
  const fileName = `نسخة_احتياطية_${filenameSuffix}.json`;

  // Try "Save As" using File System Access API
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: 'JSON Backup File',
          accept: { 'application/json': ['.json'] },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(jsonString);
      await writable.close();
      showToast('تم حفظ الملف بنجاح 💾');
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('File picker failed, falling back to download:', err);
    }
  }

  // Fallback to traditional download (Save As behavior depends on browser settings)
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('تم تصدير النسخة الاحتياطية (تحميل) 💾');
}

function triggerImport() {
  document.getElementById('importFile').click();
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      let content = e.target.result;
      // Remove possible BOM or leading/trailing whitespace
      content = content.trim();
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }

      const data = JSON.parse(content);
      let recordsToImport = [];

      // Support various formats
      if (Array.isArray(data)) {
        recordsToImport = data;
      } else if (data.records && Array.isArray(data.records)) {
        recordsToImport = data.records;
      } else if (data.data && data.data.records && Array.isArray(data.data.records)) {
        recordsToImport = data.data.records;
      } else {
        // Search for any array property
        for (const key in data) {
          if (Array.isArray(data[key]) && data[key].length > 0) {
            recordsToImport = data[key];
            break;
          }
        }
      }

      if (recordsToImport.length === 0) {
        showToast('❌ لم يتم العثور على سجلات في هذا الملف');
        return;
      }

      if (confirm(`هل أنت متأكد من استيراد ${recordsToImport.length} سجل؟ سيتم إضافة السجلات الجديدة إلى السجلات الحالية.`)) {
        const existingNumbers = new Set(allRecords.map(r => r.file_number));
        const newRecords = recordsToImport.filter(r => !existingNumbers.has(r.file_number));

        allRecords = [...allRecords, ...newRecords];
        localStorage.setItem('englishTest_records', JSON.stringify(allRecords));

        if (typeof firebaseManager !== 'undefined') {
          firebaseManager.saveRecords(allRecords);
        }

        renderAllRecords();
        renderStatistics();
        showToast(`✅ تم استيراد ${newRecords.length} سجل جديد بنجاح`);
      }
    } catch (err) {
      console.error('Import error:', err);
      showToast('❌ فشل في قراءة الملف: تأكد من أنه ملف JSON صالح');
    }
  };
  reader.onerror = () => showToast('❌ خطأ في قراءة ملف الاستعادة');
  reader.readAsText(file);
  event.target.value = ''; // Reset for next time
}

// ==================== STATISTICS ====================
function renderStatistics() {
  const container = document.getElementById('statsContent');

  const totalTests = allRecords.length;
  const avgScore = totalTests > 0 ? Math.round(allRecords.reduce((sum, r) => sum + r.total_score, 0) / totalTests) : 0;

  const levelCounts = {};
  allRecords.forEach(r => {
    levelCounts[r.level] = (levelCounts[r.level] || 0) + 1;
  });

  const employeeCounts = {};
  allRecords.forEach(r => {
    employeeCounts[r.employee_id] = (employeeCounts[r.employee_id] || 0) + 1;
  });

  container.innerHTML = `
    <div class="rounded-xl p-4 text-center" style="background: var(--bg-card); border: 2px solid var(--border-color);">
      <p class="text-3xl font-bold" style="color: #667eea;">${totalTests}</p>
      <p class="text-sm" style="color: var(--text-secondary);">إجمالي الاختبارات</p>
    </div>
    <div class="rounded-xl p-4 text-center" style="background: var(--bg-card); border: 2px solid var(--border-color);">
      <p class="text-3xl font-bold" style="color: #38ef7d;">${avgScore}</p>
      <p class="text-sm" style="color: var(--text-secondary);">متوسط الدرجات</p>
    </div>
    <div class="rounded-xl p-4 text-center col-span-2" style="background: var(--bg-card); border: 2px solid var(--border-color);">
      <p class="text-lg font-bold mb-2" style="color: #764ba2;">توزيع المستويات</p>
      <div class="text-sm space-y-1">
        ${Object.entries(levelCounts).map(([level, count]) => `
          <div class="flex justify-between">
            <span>${level}</span>
            <span class="font-bold">${count}</span>
          </div>
        `).join('') || '<p style="color: var(--text-secondary);">لا توجد بيانات</p>'}
      </div>
    </div>
    <div class="rounded-xl p-4 text-center col-span-2 md:col-span-4" style="background: var(--bg-card); border: 2px solid var(--border-color);">
      <p class="text-lg font-bold mb-2" style="color: #f5576c;">اختبارات كل موظف</p>
      <div class="flex flex-wrap justify-center gap-4">
        ${Object.entries(employeeCounts).map(([emp, count]) => `
          <div class="rounded-lg px-4 py-2" style="background: var(--bg-card); border: 2px solid var(--border-color);">
            <span class="font-bold">${emp}:</span> ${count}
          </div>
        `).join('') || '<p style="color: var(--text-secondary);">لا توجد بيانات</p>'}
      </div>
    </div>
  `;
}

// ==================== FORGOT PASSWORD FUNCTIONS ====================
function showForgotPassword() {
  document.getElementById('forgotPasswordModal').classList.remove('hidden');
  document.getElementById('forgotEmployeeSelect').value = '';
  document.getElementById('masterKeyInput').value = '';
  document.getElementById('recoveredPassword').classList.add('hidden');
  document.getElementById('recoveryError').classList.add('hidden');
}

function hideForgotPassword() {
  document.getElementById('forgotPasswordModal').classList.add('hidden');
}

function recoverPassword() {
  const employeeId = document.getElementById('forgotEmployeeSelect').value;
  const adminPassword = document.getElementById('masterKeyInput').value;

  if (!employeeId) {
    showToast('الرجاء اختيار الموظف');
    return;
  }

  if (adminPassword !== ADMIN_PASSWORD) {
    document.getElementById('recoveryError').classList.remove('hidden');
    document.getElementById('masterKeyInput').classList.add('shake');
    setTimeout(() => document.getElementById('masterKeyInput').classList.remove('shake'), 300);
    return;
  }

  document.getElementById('recoveryError').classList.add('hidden');

  let password = '';
  if (employeeId === 'admin') {
    password = ADMIN_PASSWORD;
  } else if (employeeId === 'supervisor') {
    password = SUPERVISOR_PASSWORD;
  } else {
    password = employees[employeeId] ? employees[employeeId].password : 'ط؛ظٹط± ظ…ظˆط¬ظˆط¯';
  }

  document.getElementById('recoveredPasswordText').textContent = password;
  document.getElementById('recoveredPassword').classList.remove('hidden');
  document.getElementById('recoveredPassword').classList.add('celebrate');
  setTimeout(() => document.getElementById('recoveredPassword').classList.remove('celebrate'), 500);
}

// ==================== TEST FUNCTIONS ====================
function startTest() {
  const name = document.getElementById('studentName').value.trim();
  const age = parseInt(document.getElementById('studentAge').value);
  const startLevel = parseInt(document.getElementById('startLevel').value) || 1;
  const showFeedback = document.getElementById('showFeedbackToggle') ? document.getElementById('showFeedbackToggle').checked : true;

  if (!name) {
    showToast('الرجاء إدخال اسم الطالب');
    return;
  }

  if (!age || age < 5 || age > 15) {
    showToast('الرجاء اختيار عمر الطالب (5-15 سنة)');
    return;
  }

  // Map Level Names to Stages 
  const stageMap = { 1: 1, 2: 201, 3: 301 };
  initializeTest(name, age, currentUser, stageMap[startLevel], showFeedback);
}

function startAdminTest() {
  const name = document.getElementById('adminStudentName').value.trim();
  const age = parseInt(document.getElementById('adminStudentAge').value);
  const employeeId = document.getElementById('adminEmployeeSelect').value;
  const startLevel = parseInt(document.getElementById('adminStartLevel').value) || 1;

  if (!name) {
    showToast('الرجاء إدخال اسم الطالب');
    return;
  }

  if (!age || age < 5 || age > 15) {
    showToast('الرجاء اختيار عمر الطالب (5-15 سنة)');
    return;
  }

  // Map Level Names to Stages
  const stageMap = { 1: 1, 2: 201, 3: 301 };
  const showFeedback = true; // Admin test defaults to feedback on, or we could add a toggle there too. Assuming true for now.
  initializeTest(name, age, employeeId, stageMap[startLevel], showFeedback);
}

function initializeTest(name, age, employeeId, startStage = 1, showFeedback = true) {
  const generatedQuestions = generateRandomQuestions(age, startStage);

  testState = {
    studentName: name,
    age: age,
    employeeId: employeeId,
    questions: generatedQuestions,
    answers: [],
    currentIndex: 0,
    currentStage: startStage,
    startStage: startStage, // Remember where we started
    history: [], // Store results of previous stages
    startTime: Date.now(),
    timerInterval: null,
    timerInterval: null,
    timeLimit: getTimeLimit(age, generatedQuestions.length),
    showInstantFeedback: showFeedback,
    isExtraChance: false
  };

  testState.answers = new Array(testState.questions.length).fill(null);

  document.getElementById('employeeDashboard').classList.add('hidden');
  document.getElementById('adminDashboard').classList.add('hidden');
  document.getElementById('testScreen').classList.remove('hidden');

  document.getElementById('testStudentName').textContent = name;

  // Reset adaptive testing system
  if (typeof adaptiveTesting !== 'undefined') {
    adaptiveTesting.reset();
    // Set starting difficulty based on stage
    const stageDifficultyMap = { 1: 2, 201: 3, 301: 5 };
    adaptiveTesting.currentDifficulty = stageDifficultyMap[startStage] || 2;
    adaptiveTesting.updateDifficultyIndicator();
  }

  startTimer();
  showQuestion(0);
}

// Update existing adaptiveTesting object from adaptive-engine.js
if (typeof adaptiveTesting !== 'undefined') {
  adaptiveTesting.currentDifficulty = 2;
  adaptiveTesting.consecutiveCorrect = 0;
  adaptiveTesting.consecutiveWrong = 0;

  adaptiveTesting.reset = function () {
    this.currentDifficulty = 2;
    this.consecutiveCorrect = 0;
    this.consecutiveWrong = 0;
  };

  adaptiveTesting.trackAnswer = function (isCorrect) {
    if (isCorrect) {
      this.consecutiveCorrect++;
      this.consecutiveWrong = 0;
      if (this.consecutiveCorrect >= 3 && this.currentDifficulty < 6) {
        this.currentDifficulty++;
        this.consecutiveCorrect = 0;
        this.updateDifficultyIndicator();
      }
    } else {
      this.consecutiveWrong++;
      this.consecutiveCorrect = 0;
      if (this.consecutiveWrong >= 2 && this.currentDifficulty > 1) {
        this.currentDifficulty--;
        this.consecutiveWrong = 0;
        this.updateDifficultyIndicator();
      }
    }
  };

  adaptiveTesting.updateDifficultyIndicator = function () {
    const badge = document.getElementById('difficultyBadge');
    if (badge) {
      const levels = ['', 'Phonics', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Professional'];
      badge.textContent = levels[this.currentDifficulty] || 'General';

      // Update color based on difficulty
      const colors = ['', '#38ef7d', '#667eea', '#ffd700', '#ff9f43', '#f5576c', '#764ba2'];
      badge.style.background = colors[this.currentDifficulty] || '#667eea';
    }
  };
}

function tagQuestionsByLevel() {
  if (typeof questionBank === 'undefined') return;

  // Section A - All Basic Phonics (D1-2)
  questionBank.sectionA.forEach(q => q.difficulty = (q.type === 'typing' ? 2 : 1));

  // Section B - Pronunciation (D2-3)
  questionBank.sectionB.forEach(q => q.difficulty = 2);

  // Section C - Listening (D2-3)
  questionBank.sectionC.forEach(q => q.difficulty = 2);

  // Section D (Reading)
  questionBank.sectionD.forEach((q, i) => {
    if (i < 20) q.difficulty = 2;
    else if (i < 40) q.difficulty = 3;
    else if (i < 50) q.difficulty = 4; // LG 4
    else q.difficulty = 6; // LG 6 Reading (Indices 50+)
  });

  // Section E (Writing)
  questionBank.sectionE.forEach((q, i) => {
    // Only scrambled sentences are truly advanced in writing section
    if (q.isScrambled || q.q.includes('رتب')) {
      q.difficulty = 5;
    } else if (q.isOpposite) {
      q.difficulty = 3;
    } else {
      q.difficulty = 1 + (i % 2); // 1 or 2
    }
  });

  // Section F (Grammar/Vocab - THE BIG POOL)
  questionBank.sectionF.forEach((q, i) => {
    // Precise Identification:
    // Index 191 to 290 are the LG 6 questions (Advanced)
    if (i >= 191 && i <= 290) {
      q.difficulty = 6;
    }
    // Index 140 to 190 are LG 5
    else if (i >= 140 && i <= 190) {
      q.difficulty = 5;
    }
    // LG 4 questions (appended at the end, index 291+)
    else if (i > 290) {
      q.difficulty = 4;
    }
    // Everything else (0-139) is basic LG 1-3
    else {
      q.difficulty = (i < 50 ? 2 : 3);
    }
  });

  console.log('Professional Level Tagging Refined.');
}

// ADAPTIVE QUESTION GENERATION
// Generates questions that match current difficulty level
function generateRandomQuestions(age, stage = 1) {
  if (typeof questionBank === 'undefined') return [];
  tagQuestionsByLevel();

  const stageConfigs = {
    // Stage 1 (Phonics) - Adjusted base count to 15
    1: { count: 15, diffs: [1, 2], sections: ['sectionA', 'sectionB', 'sectionC', 'sectionE'] },
    // Standard Ladder Stages (Now strictly following age-based count)
    2: { count: 15, diffs: [3], sections: ['sectionB', 'sectionC', 'sectionD', 'sectionF'] },
    3: { count: 15, diffs: [4], sections: ['sectionD', 'sectionE', 'sectionF'] },
    4: { count: 15, diffs: [5], sections: ['sectionD', 'sectionF'] },
    5: { count: 15, diffs: [6], sections: ['sectionF'] },
    // Level 2 & 3 now follow the same compact rule for starting
    201: { count: 15, diffs: [3, 4], sections: ['sectionB', 'sectionC', 'sectionD', 'sectionF'] },
    301: { count: 15, diffs: [5, 6], sections: ['sectionD', 'sectionF'] }
  };

  const config = { ...stageConfigs[stage] }; // Copy to avoid mutating original
  if (!config) return [];

  // Different ranges for Initial vs Supplementary
  const isInitial = [1, 201, 301].includes(stage);

  if (isInitial) {
    // Initial Test: 15 to 20
    if (age <= 7) config.count = 15;
    else if (age <= 11) config.count = 18;
    else config.count = 20;
  } else {
    // Supplementary Test (Next Stages): 10 to 15
    if (age <= 7) config.count = 10;
    else if (age <= 11) config.count = 12;
    else config.count = 15;
  }

  const questions = [];
  let combinedPool = [];

  config.sections.forEach(secKey => {
    const sectionPool = (questionBank[secKey] || []).filter(q =>
      q.difficulty && config.diffs.includes(q.difficulty) &&
      (!testState.questions || !testState.questions.some(prev => prev.q === q.q))
    ).map(q => ({
      ...q,
      section: secKey.replace('section', ''),
      sectionName: `المرحلة ${stage}`,
      points: (stage === 1 ? 5 : 1)
    }));
    combinedPool = combinedPool.concat(sectionPool);
  });

  if (combinedPool.length < config.count) {
    console.warn(`Not enough questions for stage ${stage}. Wanted ${config.count}, found ${combinedPool.length}`);
  }

  return shuffleArray(combinedPool).slice(0, config.count);
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getTimeLimit(age, questionCount) {
  // Increased seconds per question for a more relaxed and professional experience
  let secondsPerQuestion = 30;
  if (age >= 5 && age <= 8) secondsPerQuestion = 50;  // 50s for younger kids
  if (age >= 9 && age <= 11) secondsPerQuestion = 40; // 40s for intermediate
  if (age >= 12 && age <= 15) secondsPerQuestion = 35; // 35s for advanced

  return questionCount * secondsPerQuestion;
}

function startTimer() {
  updateTimerDisplay();
  testState.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - testState.startTime) / 1000);
    const remaining = testState.timeLimit - elapsed;

    if (remaining <= 0) {
      clearInterval(testState.timerInterval);
      finishTest();
      return;
    }

    updateTimerDisplay(remaining);

    // Update circular progress ring
    const ring = document.getElementById('timerRing');
    if (ring) {
      const circumference = 264;
      const offset = circumference - (remaining / testState.timeLimit) * circumference;
      ring.style.strokeDashoffset = offset;
    }

    if (remaining < 60) {
      document.getElementById('timer').classList.add('timer-warning');
    }
  }, 1000);
}

function updateTimerDisplay(remaining) {
  if (remaining === undefined) {
    remaining = testState.timeLimit;
  }
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  document.getElementById('timerDisplay').textContent =
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function showQuestion(index) {
  testState.currentIndex = index;
  const question = testState.questions[index];
  const container = document.getElementById('questionArea');

  // Update progress & Question Ring
  const indexDisp = index + 1;
  const total = testState.questions.length;

  // Update text counters (support all UI variations)
  if (document.getElementById('currentQuestion')) document.getElementById('currentQuestion').textContent = indexDisp;
  if (document.getElementById('currentQuestionDisplay')) document.getElementById('currentQuestionDisplay').textContent = indexDisp;
  if (document.getElementById('totalQuestions')) document.getElementById('totalQuestions').textContent = total;
  if (document.getElementById('totalQuestionsCount')) document.getElementById('totalQuestionsCount').textContent = total;
  if (document.getElementById('answeredQuestions')) document.getElementById('answeredQuestions').textContent = index;
  if (document.getElementById('remainingQuestions')) document.getElementById('remainingQuestions').textContent = total - indexDisp;

  // Update Progress Bar (Top)
  // Use index / total for bar (so it fills up as we go)
  const progressPercent = (indexDisp / total) * 100;
  document.getElementById('progressBar').style.width = progressPercent + '%';

  // Update Question Ring (New Circular Counter)
  const questionRing = document.getElementById('questionRing');
  if (questionRing) {
    const circum = 264; // r=42 -> 2*pi*42 ~= 264
    // Fill the ring based on progress
    const offset = circum - ((indexDisp / total) * circum);
    questionRing.style.strokeDashoffset = offset;
  }

  // Update UI
  const stageNames = { 1: "L1", 201: "L2", 301: "L3", 2: "S2", 3: "S3", 4: "S4", 5: "S5" };
  const badgeId = stageNames[testState.currentStage] || testState.currentStage;
  document.getElementById('sectionBadge').textContent = `المستوى: ${badgeId}`;

  // Update Question Statistics
  updateQuestionStats();

  // Render question with wrapper
  let displayQ = question.q.replace(/___/g, '....');

  // Logic to handle direction
  const isEnglishStart = /^[A-Za-z]/.test(displayQ);

  if (isEnglishStart) {
    // If starts with English, force LTR for the whole question
    displayQ = `<span dir="ltr" class="inline-block">${displayQ}</span>`;
  } else if (displayQ.includes(':')) {
    const parts = displayQ.split(':');
    const prompt = parts[0].trim();
    const content = parts.slice(1).join(':').trim();
    // Wrap English part in LTR span to fix punctuation position
    displayQ = `${prompt}: <span dir="ltr" class="inline-block px-1">${content}</span>`;
  }

  const displayVal = question.display ? question.display.replace(/___/g, '....') : '';

  // Dynamic Image Logic: Try to find a photo for the word in assets/imag/
  // Prioritize question.word for listening tasks, then display text
  const targetImage = (question.word || question.display || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  let possibleImagePath = targetImage ? `assets/imag/${targetImage}.png` : '';

  // Default Image for Listening Section if no specific word image is found
  if (question.section === 'C' && !targetImage) {
    possibleImagePath = `assets/imag/listening_icon.png`;
  }

  // BALANCED SIZE - COMPACT MODE
  let html = `<div class="w-full">`;

  // Question Text - Compact
  html += `
    <div class="text-center mb-1">
      <h3 class="text-xl md:text-2xl font-bold leading-tight text-gray-800">
        ${displayQ}
      </h3>
    </div>
  `;

  // Display Image - Compact Size
  if (possibleImagePath) {
    html += `
      <div class="flex justify-center my-1">
        <img src="${possibleImagePath}"
             onerror="this.style.display='none'"
             class="max-h-28 md:max-h-36 w-auto rounded-xl shadow-md border-2 border-white"
             style="background: white;">
      </div>
    `;
  }

  // Display opposite word question - Compact
  if (question.isOpposite && question.oppositeWord) {
    const targetPlaceholder = question.placeholder !== undefined ? question.placeholder : "....";
    html += `
      <div class="flex justify-center items-center gap-4 my-2" dir="ltr">
        <div class="text-4xl md:text-5xl font-black text-indigo-600">${question.oppositeWord}</div>
        <div class="text-3xl text-gray-400">→</div>
        <div class="text-4xl md:text-5xl font-black text-emerald-500">${targetPlaceholder}</div>
      </div>
    `;
  } else if (displayVal && question.section === 'C') {
    // For listening section - Compact
    html += `
      <div class="flex justify-center my-2">
        <div class="font-black text-indigo-600" style="line-height: 1; font-size: 5rem;">${displayVal}</div>
      </div>
    `;
  } else if (displayVal) {
    // Show text display for other sections
    html += `
      <div class="font-black text-indigo-600 text-center my-2" dir="ltr" style="line-height: 1; font-size: 5rem;">${displayVal}</div>
    `;
  }

  // Audio button - Compact
  if (question.word) {
    html += `
      <div class="flex justify-center my-2">
        <button onclick="speakWord(this, '${question.word.replace(/'/g, "\\'")}')" 
          class="btn-audio px-4 py-2 rounded-full font-bold text-base shadow-md hover:scale-105 transition bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center gap-2">
          🔊 استماع
        </button>
      </div>
    `;
  }

  // OPTIONS - Compact Buttons
  if (question.type === 'choice') {
    const shuffledOptions = shuffleArray([...question.options]);
    html += `
      <div class="grid grid-cols-2 gap-2 w-full mt-2">
        ${shuffledOptions.map(opt => `
          <button onclick="selectOption(this, '${opt.replace(/'/g, "\\'")}')" 
            class="option-btn p-3 rounded-xl text-lg font-bold shadow-sm hover:shadow-md transition-all min-h-[60px] flex items-center justify-center border-2 ${testState.answers[index] === opt ? 'selected border-indigo-600 bg-indigo-100' : 'border-gray-200 bg-white hover:border-indigo-400'}">
            ${opt}
          </button>
        `).join('')}
      </div>
    `;
  } else if (question.type === 'typing') {
    // Determine placeholder
    let placeholderText = "اكتب الإجابة...";
    if (question.placeholder !== undefined) {
      placeholderText = question.placeholder;
    } else if (question.answer) {
      placeholderText = ".".repeat(question.answer.length * 2);
    }

    html += `
      <div class="max-w-xl mx-auto w-full mt-2">
        <input type="text" id="typingAnswer" 
          class="w-full p-3 text-2xl text-center rounded-xl outline-none uppercase font-bold tracking-wide shadow-sm border-2 border-indigo-200 focus:border-indigo-600 transition bg-white"
          placeholder="${placeholderText}"
          value="${testState.answers[index] || ''}"
          onkeyup="saveTypingAnswer(this.value)"
          onkeypress="if(event.key === 'Enter') checkTypingAnswer()"
          autocomplete="off">
        <button onclick="checkTypingAnswer()" 
          class="btn-primary w-full mt-2 py-2 rounded-xl font-bold text-lg shadow-md hover:scale-105 transition bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          تأكيد ✓
        </button>
      </div>
    `;
  }

  html += `</div>`;

  container.innerHTML = html;

  if (question.type === 'typing') {
    setTimeout(() => document.getElementById('typingAnswer')?.focus(), 100);
  }

  // --- AUTO SPEAK LOGIC DISABLED AS PER USER REQUEST ---
  // If the user wants to listen, they can click the designated button.
}

function selectOption(button, option) {
  // Disable all buttons to prevent multiple clicks
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.style.pointerEvents = 'none';
  });

  // Remove selected from all
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.classList.remove('selected', 'correct', 'wrong');
  });
  button.classList.add('selected');
  testState.answers[testState.currentIndex] = option;

  // Check if correct and show feedback
  const question = testState.questions[testState.currentIndex];
  const isCorrect = (option === question.answer);

  // Track performance for adaptive system
  if (typeof adaptiveTesting !== 'undefined') {
    adaptiveTesting.trackAnswer(isCorrect);
  }

  if (isCorrect) {
    if (testState.showInstantFeedback) {
      button.classList.add('correct', 'celebrate');
      createConfetti();
      playCorrectSound();
    } else {
      // Simple visual indicator WITH sound but no confetti
      playCorrectSound(); // ✅ Keep sound
      button.style.borderColor = '#10b981';
      button.style.borderWidth = '4px';
      button.style.background = 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
      button.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
      button.style.transform = 'scale(1.02)';
      // Add checkmark icon
      const icon = document.createElement('span');
      icon.textContent = ' ✅';
      icon.style.fontSize = '1.8rem';
      icon.style.marginLeft = '8px';
      button.appendChild(icon);
    }
  } else {
    if (testState.showInstantFeedback) {
      button.classList.add('wrong', 'shake');
      playWrongSound();

      // Show correct answer visually but don't play the "correct" sound
      document.querySelectorAll('.option-btn').forEach(btn => {
        if (btn.textContent.trim() === question.answer.trim()) {
          setTimeout(() => {
            btn.classList.add('correct');
          }, 300);
        }
      });

      setTimeout(() => button.classList.remove('shake'), 300);
    } else {
      // Simple visual indicator for wrong answer WITH sound
      playWrongSound(); // ✅ Keep sound
      button.style.borderColor = '#ef4444';
      button.style.borderWidth = '4px';
      button.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
      button.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
      button.style.transform = 'scale(1.02)';
      // Add X icon
      const icon = document.createElement('span');
      icon.textContent = ' ❌';
      icon.style.fontSize = '1.8rem';
      icon.style.marginLeft = '8px';
      button.appendChild(icon);

      // DON'T show correct answer immediately - only in final table
    }
  }

  // Auto advance
  setTimeout(() => {
    if (testState.currentIndex < testState.questions.length - 1) {
      showQuestion(testState.currentIndex + 1);
    } else {
      finishTest();
    }
  }, 1500);
}

function saveTypingAnswer(value) {
  testState.answers[testState.currentIndex] = value.toUpperCase().trim();
}

function checkTypingAnswer() {
  const question = testState.questions[testState.currentIndex];
  const userAnswer = testState.answers[testState.currentIndex];

  const input = document.getElementById('typingAnswer');
  if (!input) return;

  // Disable input and button
  input.disabled = true;
  const checkButton = input.nextElementSibling;
  if (checkButton) checkButton.disabled = true;

  const isCorrect = userAnswer && userAnswer.toUpperCase().trim() === question.answer.toUpperCase().trim();

  // Track performance for adaptive system
  if (typeof adaptiveTesting !== 'undefined') {
    adaptiveTesting.trackAnswer(isCorrect);
  }

  if (isCorrect) {
    if (testState.showInstantFeedback) {
      input.style.borderColor = '#38ef7d';
      input.style.borderWidth = '3px';
      createConfetti();
      playCorrectSound();
    } else {
      // Simple green styling WITH sound but no confetti
      playCorrectSound(); // ✅ Keep sound
      input.style.borderColor = '#10b981';
      input.style.borderWidth = '4px';
      input.style.background = 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
      input.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
      // Add checkmark after input
      const icon = document.createElement('span');
      icon.textContent = ' ✅';
      icon.style.fontSize = '2.5rem';
      icon.style.marginLeft = '10px';
      icon.style.color = '#10b981';
      input.parentElement.insertBefore(icon, input.nextSibling);
    }
  } else {
    if (testState.showInstantFeedback) {
      input.classList.add('shake');
      input.style.borderColor = '#f45c43';
      input.style.borderWidth = '3px';
      playWrongSound();

      // Show correct answer below input
      const correctAnswerDiv = document.createElement('div');
      correctAnswerDiv.className = 'mt-4 p-4 rounded-xl text-center animate-fade-in';
      correctAnswerDiv.style.background = 'var(--bg-success)';
      correctAnswerDiv.style.color = 'white';
      correctAnswerDiv.innerHTML = `
        <p class="font-semibold mb-2">الإجابة الصحيحة:</p>
        <p class="text-2xl font-bold">${question.answer}</p>
        `;
      input.parentElement.appendChild(correctAnswerDiv);

      setTimeout(() => input.classList.remove('shake'), 300);
    } else {
      // Simple red styling WITH sound
      playWrongSound(); // ✅ Keep sound
      input.style.borderColor = '#ef4444';
      input.style.borderWidth = '4px';
      input.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
      input.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
      // Add X icon
      const icon = document.createElement('span');
      icon.textContent = ' ❌';
      icon.style.fontSize = '2.5rem';
      icon.style.marginLeft = '10px';
      icon.style.color = '#ef4444';
      input.parentElement.insertBefore(icon, input.nextSibling);

      // DON'T show correct answer immediately - only in final table
    }
  }

  // Auto advance after 2.5 seconds
  setTimeout(() => {
    if (testState.currentIndex < testState.questions.length - 1) {
      showQuestion(testState.currentIndex + 1);
    } else {
      setTimeout(() => {
        finishTest();
      }, 2000);
    }
  }, 2500);
}

function skipQuestion() {
  playSkipSound();

  // If we are on a success screen, skip acts as "Finish"
  if (testState.isSuccessScreen) {
    finishTest(true);
    return;
  }

  testState.answers[testState.currentIndex] = null; // Mark as skipped

  // If it's the last question of the current stage, finish the test
  if (testState.currentIndex >= testState.questions.length - 1) {
    finishTest();
  } else {
    showQuestion(testState.currentIndex + 1);
  }
}

function playSkipSound() {
  audioManager.play('skip');
}

// Replaced speakWord with audioManager usage to prevent duplication
function speakWord(btn, word) {
  audioManager.speak(word);

  // Visual feedback
  const button = btn;
  if (button) {
    button.classList.add('celebrate');
    setTimeout(() => button.classList.remove('celebrate'), 500);
  }
}

// Hover and Click sounds removed as per user request to play sounds only "on demand"
// Specific interaction sounds are handled by their respective functions

function playCorrectSound() {
  audioManager.play('correct');
}

function playWrongSound() {
  console.log('Playing wrong sound...');
  const sound = audioManager.sounds.wrong;
  if (sound) {
    sound.currentTime = 0;
    sound.play().then(() => {
      console.log('Wrong sound played successfully');
    }).catch(err => {
      console.error('Failed to play wrong sound:', err);
      // Try with a simple beep as ultimate fallback
      audioManager.play('skip'); // Use skip sound as fallback
    });
  }
}

function playClapSound() {
  audioManager.play('clap');
}

function createConfetti() {
  const container = document.getElementById('questionArea');
  const colors = ['#667eea', '#764ba2', '#38ef7d', '#f5576c', '#ffd700'];

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'confetti-particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = '50%';
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.width = '10px';
    particle.style.height = '10px';
    particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    particle.innerHTML = ['⭐', '🌟', '✨', '💫'][Math.floor(Math.random() * 4)];
    particle.style.fontSize = '20px';
    container.appendChild(particle);

    setTimeout(() => particle.remove(), 1000);
  }
}

function finishTest(force = false) {
  // Ladder Strategy Logic: Check if we should advance to next stage
  const currentStageCount = testState.questions.length;
  const currentStageQuestions = testState.questions;
  const currentStageAnswers = testState.answers;

  let correctInStage = 0;
  currentStageQuestions.forEach((q, i) => {
    if (currentStageAnswers[i] && currentStageAnswers[i].toUpperCase().trim() === q.answer.toUpperCase().trim()) {
      correctInStage++;
    }
  });

  const stageAccuracy = (correctInStage / (currentStageQuestions.length || 1)) * 100;

  // LADDER STRATEGY & IMPROVEMENT LOGIC
  if (!force && !testState.isExtraChance) {
    // 1. Mastery Condition (> 88%): Finish or Move Next immediately
    if (stageAccuracy >= 88) {
      // Proceed to normal success/handling logic
    }
    // 2. Improvement Chance Condition (70% - 87%): Trigger Ladder
    else if (stageAccuracy >= 70 && stageAccuracy < 88) {
      triggerImprovementChance();
      return;
    }
    // 3. Fail Condition (< 70%): Normal finish (will likely end test)
  }

  // Final End Decision Logic
  let hasNextStage = false;
  // If we are master of this stage, check if there is a next one
  // Note: We use 75 as standard pass, but 88 was mastery. Both pass.
  if (stageAccuracy >= 75) {
    // Level 1 Path
    if (testState.startStage === 1 && testState.currentStage < 5) hasNextStage = true;
    // Level 2 Path
    if (testState.startStage === 201 && testState.currentStage === 201) hasNextStage = true;
    // Level 3 Path
    if (testState.startStage === 301 && testState.currentStage === 301) hasNextStage = true;
  }

  // If force is true, we ignore hasNextStage and finish for real
  if (!force && hasNextStage) {
    handleStageSuccess(stageAccuracy);
    return;
  }

  testState.isSuccessScreen = false; // Reset screen state

  // Final End of Test - Update Header Stats for finality
  updateQuestionStats(true);
  clearInterval(testState.timerInterval);
  audioManager.play('finished');

  // Celebration for finishing LG 6 stage or high overall score
  if (testState.currentStage === 5 || stageAccuracy >= 90) {
    setTimeout(() => {
      playClapSound();
      createConfetti();
      audioManager.play('celebration');
    }, 1000);
  }

  const scores = calculateScores();

  // Highest stage reached in this test session
  let maxStage = testState.currentStage;
  testState.history.forEach(h => {
    if (h.stage > maxStage && h.stage < 100) maxStage = h.stage;
    if (h.stage === 201) maxStage = 2; // Map internal IDs to logical stages for capping
    if (h.stage === 301) maxStage = 5;
  });
  if (testState.currentStage === 201) maxStage = Math.max(maxStage, 2);
  if (testState.currentStage === 301) maxStage = Math.max(maxStage, 5);

  const levelData = getLevelAndCurriculum(scores.total, maxStage);
  const fileNumber = generateFileNumber();

  const resultData = {
    file_number: fileNumber,
    student_name: testState.studentName,
    age: testState.age,
    employee_id: testState.employeeId,
    total_score: scores.total,
    level: levelData.level,
    curriculum: levelData.curriculum,
    test_date: new Date().toLocaleDateString('ar-EG'),
    month_year: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    time_taken: Math.floor((Date.now() - testState.startTime) / 1000)
  };

  saveAndShowResults(resultData, scores);
}

function getStageCount(stage) {
  // This function is no longer strictly needed as questions.length is used directly
  // but keeping it for potential future use or if other parts rely on it.
  // For now, it will return 0 as the new logic uses testState.questions.length
  return 0;
}

function handleStageSuccess(accuracy) {
  testState.isSuccessScreen = true; // Mark that we are on the success screen
  let nextStage = 0;
  let nextStageName = "";

  // Logic to determine what's next based on current start/stage
  if (testState.startStage === 1) {
    nextStage = testState.currentStage + 1;
    const stageNames = ["", "Oxford Phonics", "Let's Go (Beginner)", "Let's Go (Intermediate)", "Let's Go (Advanced)", "Let's Go (Professional)"];
    nextStageName = stageNames[nextStage];
  } else if (testState.startStage === 201) {
    nextStage = 5; // Move to LG 6 (Stage 5) after first bulk
    nextStageName = "Let's Go (Professional)";
  } else if (testState.startStage === 301) {
    nextStage = 5; // Allow Level 3 to proceed to Professional (Stage 5) to confirm skills
    nextStageName = "Let's Go (Professional)";
  }

  if (!nextStage) { finishTest(true); return; }

  const isPerfect = accuracy === 100;
  updateQuestionStats(true); // Show 100% progress on header
  createConfetti();
  playClapSound();
  clearInterval(testState.timerInterval);

  const container = document.getElementById('questionArea');
  container.innerHTML = `
        <div class="text-center p-4 md:p-10 animate-fade-in flex flex-col items-center justify-center min-h-[400px]">
            <!-- Trophy Icon Container -->
            <div class="relative mb-6">
               <div class="text-8xl md:text-9xl transform animate-bounce">
                  ${isPerfect ? '' : '🎉'}
               </div>
               ${isPerfect ? '<div class="absolute -top-4 -right-4 text-4xl">🌟</div><div class="absolute -bottom-4 -left-4 text-4xl">🌟</div>' : ''}
            </div>

            <h2 class="text-4xl md:text-5xl font-black text-indigo-600 mb-2">أحسنت!</h2>
            <p class="text-2xl text-gray-600">لقد اجتزت هذه المرحلة بنجاح!</p>

            <div class="text-3xl mt-4 mb-4">الدقة: <span class="font-bold text-emerald-500">${Math.round(accuracy)}%</span></div>
            
            <!-- Success Info Card - Balanced Dimensions -->
            <div class="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 md:p-12 rounded-[40px] border-4 border-white shadow-xl max-w-2xl w-full my-6">
                <p class="text-xl text-indigo-800 mb-3 opacity-80">أنت مؤهل لمرحلة إضافية:</p>
                <p class="text-4xl md:text-5xl font-black text-indigo-600 mb-6 drop-shadow-sm">${nextStageName}</p>
                <div class="h-1 w-20 bg-indigo-200 mx-auto mb-6 rounded-full"></div>
                <p class="text-lg text-indigo-500/80">سيتم إضافة جولة جديدة من <b>${testState.age <= 7 ? 10 : (testState.age <= 11 ? 12 : 15)} سؤالاً</b> و <b>6 دقائق</b> جديدة</p>
            </div>
            
            <!-- Primary Action Button with spacing -->
            <div class="mt-8 mb-4 w-full max-w-md">
                <button onclick="startNextStage(${nextStage})" class="w-full btn-success px-12 py-6 rounded-3xl font-bold text-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-b-8 border-emerald-700 active:border-b-0 active:translate-y-2">
                    🚀 ابدأ المستوى التالي
                </button>
            </div>

            <!-- Secondary Actions - Proper spacing to avoid crowded look -->
            <div class="flex gap-4 mt-4 opacity-70 hover:opacity-100 transition-opacity">
               <button onclick="finishTest(true)" class="px-6 py-3 rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition-all" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);">
                  🛑 إيقاف وإنهاء
               </button>
               <button onclick="finishTest(true)" class="px-6 py-3 rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition-all" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">
                  ⏭️ تخطي وإنهاء
               </button>
            </div>
        </div>
    `;
}

function triggerImprovementChance() {
  // Show confirmation screen instead of adding questions directly
  showImprovementOfferScreen();
}

function showImprovementOfferScreen() {
  clearInterval(testState.timerInterval);
  updateQuestionStats(true);

  const extraCount = testState.age >= 10 ? 10 : 5;
  const extraTime = Math.ceil((extraCount * 45) / 60); // Convert to minutes

  const container = document.getElementById('questionArea');
  container.innerHTML = `
    <div class="text-center p-6 md:p-10 animate-fade-in flex flex-col items-center justify-center min-h-[400px]">
        <!-- Icon -->
        <div class="text-8xl mb-6 animate-bounce">🎯</div>

        <h2 class="text-4xl md:text-5xl font-black text-amber-600 mb-3">فرصة تحسين!</h2>
        <p class="text-xl text-gray-600 mb-6">أنت قريب من مستوى أعلى</p>

        <!-- Info Card -->
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-3xl border-3 border-amber-200 shadow-xl max-w-2xl w-full mb-6">
            <p class="text-lg text-gray-700 mb-4">💪 نعطيك فرصة إضافية:</p>
            <div class="text-2xl font-bold text-amber-700 mb-4">
                ✨ ${extraCount} أسئلة إضافية<br>
                ⏰ ${extraTime} دقائق إضافية
            </div>
            <div class="text-sm text-gray-600 bg-white/60 p-4 rounded-xl">
                <p class="mb-2">✅ إذا أجبت بشكل جيد → ترتفع درجتك وتصل لمستوى أعلى</p>
                <p>😊 إذا لم تنجح → تبقى في نتيجتك الحالية (لا تخسر شيئاً!)</p>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col md:flex-row gap-4 w-full max-w-xl">
            <button onclick="acceptImprovementChance()" 
                class="flex-1 px-8 py-5 rounded-2xl font-bold text-2xl shadow-xl hover:scale-105 transition-all text-white"
                style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.5);">
                🚀 قبول التحسين
            </button>
            <button onclick="declineImprovementChance()" 
                class="flex-1 px-8 py-5 rounded-2xl font-bold text-xl shadow-xl hover:scale-105 transition-all text-white"
                style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); box-shadow: 0 4px 15px rgba(239, 68, 68, 0.5);">
                😊 أنا راضٍ - إنهاء
            </button>
        </div>
    </div>
  `;
}

function acceptImprovementChance() {
  testState.isExtraChance = true;

  // Calculate specific questions to add based on age
  const extraCount = testState.age >= 10 ? 10 : 5;

  // Generate additional questions from the same stage/difficulty pool
  const extraQuestions = generateRandomQuestions(testState.age, testState.currentStage).slice(0, extraCount);

  // Tag them to identify they are improvement questions
  extraQuestions.forEach(q => q.isImprovement = true);

  // Append to current test state
  testState.questions = [...testState.questions, ...extraQuestions];
  testState.answers = [...testState.answers, ...new Array(extraCount).fill(null)];

  // Add extra time (approx 45s per question)
  const extraTime = extraCount * 45;
  testState.timeLimit += extraTime;

  // Reset timer
  testState.startTime = Date.now();
  startTimer();

  // Show toast notification
  showToast(`🎯 تم إضافة ${extraCount} أسئلة! حظاً موفقاً 🍀`);

  // Update UI stats
  updateQuestionStats();

  // Continue to next question
  showQuestion(testState.currentIndex + 1);
}

function declineImprovementChance() {
  // User is satisfied with current score - finish immediately
  showToast('✅ تم إنهاء الاختبار');
  finishTest(true);
}

function startNextStage(specificStage) {
  // ARCHIVE CURRENT RESULTS
  testState.history.push({
    stage: testState.currentStage,
    questions: [...testState.questions],
    answers: [...testState.answers]
  });

  const nextStage = specificStage;
  const nextQuestions = generateRandomQuestions(testState.age, nextStage);

  // RESET STATE FOR NEW STAGE (Fresh Start)
  testState.isSuccessScreen = false;
  testState.questions = nextQuestions;
  testState.answers = new Array(nextQuestions.length).fill(null);
  testState.currentIndex = 0;
  testState.currentStage = nextStage;

  // RESET TIMER: 6 Minutes for the new stage
  testState.startTime = Date.now();
  testState.timeLimit = 360;

  startTimer();
  showQuestion(0);
}

// Get the threshold for the next level
function getNextLevelThreshold(currentScore) {
  // Balanced thresholds following the document
  const thresholds = [26, 41, 51, 61, 69, 77, 84, 90, 95];
  for (let threshold of thresholds) {
    if (currentScore < threshold) {
      return threshold;
    }
  }
  return null; // Already at peak level (Let's Go 6)
}

// Offer challenge questions
function offerChallenge(resultData, scores, nextThreshold) {
  const pointsNeeded = nextThreshold - scores.total;
  const nextLevel = getLevelAndCurriculum(nextThreshold);

  document.getElementById('testScreen').classList.remove('hidden');
  document.getElementById('questionArea').innerHTML = `
    <div class="text-center space-y-6 p-8">
      <div class="text-6xl mb-4">🎯</div>
      <h2 class="text-3xl font-bold" style="color: #667eea;">أنت قريب جداً!</h2>
      <p class="text-xl" style="color: var(--text-primary);">
        درجتك الحالية: <span class="font-bold text-2xl">${scores.total}/100</span>
      </p>
      <p class="text-lg" style="color: var(--text-secondary);">
        تحتاج فقط <span class="font-bold text-xl" style="color: #f5576c;">${pointsNeeded} نقطة</span> 
        للوصول إلى:<br>
        <span class="font-bold text-2xl" style="color: #38ef7d;">${nextLevel.level} - ${nextLevel.curriculum}</span>
      </p>
      
      <div class="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200" style="background: rgba(102, 126, 234, 0.1);">
        <p class="text-lg font-semibold mb-2">💪 تحدي إضافي</p>
        <p>نعطيك <b>10 أسئلة</b> أصعب قليلاً + <b>5 دقائق</b> إضافية</p>
        <p class="text-sm mt-2" style="color: var(--text-secondary);">
          إذا أجبت بشكل جيد → ترتفع لمستوى أعلى ✅<br>
          إذا لم تنجح → تبقى في مستواك الحالي (لا تخسر شيء!)
        </p>
      </div>

      <div class="flex gap-4 justify-center mt-8">
        <button onclick="acceptChallenge()" class="btn-success px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition">
          🚀 قبول التحدي!
        </button>
        <button onclick="declineChallenge()" class="btn-skip px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition">
          😊 أنا راضٍ - إنهاء
        </button>
      </div>
    </div>
  `;
}

// Challenge functions removed from script.js to avoid duplication with challenge-mode.js
// Logic is handled in scripts/challenge-mode.js


// Button to finish test early
function manualFinishTest() {
  if (confirm('هل أنت متأكد من إنهاء الاختبار الآن؟ سيتم احتساب النتيجة بناءً على ما أجبت عليه.')) {
    finishTest(true);
  }
}

// Save results and show
function saveAndShowResults(resultData, scores) {
  // Use passed scores or calculate now
  const finalScores = scores || calculateScores();

  // If this is a final results call (not offering challenge), save it.
  // Otherwise, store for later.
  const nextThreshold = getNextLevelThreshold(finalScores.total);
  const shouldOfferChallenge = nextThreshold &&
    finalScores.total >= (nextThreshold - 5) &&
    !testState.isChallenge &&
    !testState.challengeAttempted;

  if (shouldOfferChallenge) {
    testState.initialResult = resultData;
    testState.initialScores = finalScores;
    offerChallenge(resultData, finalScores, nextThreshold);
    return;
  }

  allRecords.push(resultData);
  localStorage.setItem('englishTest_records', JSON.stringify(allRecords));

  if (typeof firebaseManager !== 'undefined') {
    firebaseManager.saveRecords(allRecords);
  }

  showResults(resultData, finalScores);
}

function calculateScores() {
  let sectionScores = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  let correctCount = 0;
  let totalCount = 0;

  // 1. Process Finished Stages from History
  testState.history.forEach(session => {
    session.questions.forEach((q, i) => {
      totalCount++;
      const ans = session.answers[i];
      if (ans && ans.toUpperCase().trim() === q.answer.toUpperCase().trim()) {
        correctCount++;
        if (sectionScores[q.section] !== undefined) sectionScores[q.section]++;
      }
    });
  });

  // 2. Process Current Running Stage
  testState.questions.forEach((q, i) => {
    totalCount++;
    const answer = testState.answers[i];
    if (!answer) return;
    const isCorrect = answer.toUpperCase().trim() === q.answer.toUpperCase().trim();
    if (isCorrect) {
      correctCount++;
      if (sectionScores[q.section] !== undefined) sectionScores[q.section]++;
    }
  });

  // Normalize to 100 points
  const totalScore = totalCount > 0 ? Math.min(100, Math.round((correctCount / totalCount) * 100)) : 0;

  return {
    sectionA: sectionScores.A,
    sectionB: sectionScores.B,
    sectionC: sectionScores.C,
    sectionD: sectionScores.D,
    sectionE: sectionScores.E,
    sectionF: sectionScores.F,
    total: totalScore
  };
}

// IMPROVED LEVEL DETERMINATION SYSTEM
// More balanced thresholds based on weighted scoring
function getLevelAndCurriculum(score, maxStageReached = 1) {
  // 1. Level 1 Range: Phonics (Stages 1-1.x)
  if (maxStageReached === 1) {
    if (score <= 20) return { level: 'Prep Level', curriculum: 'Phonics Foundation' };
    if (score <= 40) return { level: 'Phonics 1', curriculum: 'Oxford Phonics 1' };
    if (score <= 60) return { level: 'Phonics 2', curriculum: 'Oxford Phonics 2' };
    if (score <= 80) return { level: 'Phonics 3', curriculum: 'Oxford Phonics 3' };
    if (score <= 90) return { level: 'Phonics 4', curriculum: 'Oxford Phonics 4' };
    return { level: 'Phonics 5', curriculum: 'Oxford Phonics 5' };
  }

  // 2. Level 2 Range: Let's Go 1-3 (Stages 2-3)
  if (maxStageReached >= 2 && maxStageReached <= 4) {
    if (score <= 30) return { level: 'Phonics 5', curriculum: 'Oxford Phonics 5' }; // Drop down if very low
    if (score <= 60) return { level: "Let's Go 1", curriculum: "Let's Go 1" };
    if (score <= 85) return { level: "Let's Go 2", curriculum: "Let's Go 2" };
    return { level: "Let's Go 3", curriculum: "Let's Go 3" };
  }

  // 3. Level 3 Range: Let's Go 4-6 (Stage 5)
  if (maxStageReached >= 5) {
    if (score <= 40) return { level: "Let's Go 3", curriculum: "Let's Go 3" }; // Drop down
    if (score <= 75) return { level: "Let's Go 4", curriculum: "Let's Go 4" };
    if (score <= 90) return { level: "Let's Go 5", curriculum: "Let's Go 5" };
    return { level: "Let's Go 6", curriculum: "Let's Go 6" };
  }

  return { level: 'Phonics 1', curriculum: 'Oxford Phonics 1' }; // Fallback
}

function generateFileNumber() {
  const emp = employees[testState.employeeId];
  emp.counter++;
  return `${testState.employeeId}-${emp.counter}`;
}

function showResults(data, scores) {
  document.getElementById('testScreen').classList.add('hidden');
  document.getElementById('resultsScreen').classList.remove('hidden');

  document.getElementById('resultStudentName').textContent = data.student_name;
  document.getElementById('levelResult').textContent = data.level;
  document.getElementById('curriculumResult').textContent = data.curriculum;
  document.getElementById('fileNumber').textContent = data.file_number;

  // Calculate denominators dynamically (History + Current)
  const denominators = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };

  // 1. From History
  testState.history.forEach(session => {
    session.questions.forEach(q => {
      if (denominators[q.section] !== undefined) denominators[q.section]++;
    });
  });

  // 2. From Current Batch
  testState.questions.forEach(q => {
    if (denominators[q.section] !== undefined) denominators[q.section]++;
  });

  const updateStat = (id, score, den) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = den > 0 ? `<span class="text-indigo-600">${score}</span><small class="text-gray-400">/${den}</small>` : `<span class="text-gray-300">0</span><small class="text-gray-300">/0</small>`;
  };

  updateStat('sectionAScore', scores.sectionA, denominators.A);
  updateStat('sectionBScore', scores.sectionB, denominators.B);
  updateStat('sectionCScore', scores.sectionC, denominators.C);
  updateStat('sectionDScore', scores.sectionD, denominators.D);
  updateStat('sectionEScore', scores.sectionE, denominators.E);
  updateStat('sectionFScore', scores.sectionF, denominators.F);

  const scoreCircle = document.getElementById('scoreCircle');
  const scoreValue = document.getElementById('scoreValue');
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (data.total_score / 100) * circumference;

  setTimeout(() => {
    scoreCircle.style.strokeDashoffset = offset;

    let current = 0;
    const increment = data.total_score / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= data.total_score) {
        current = data.total_score;
        clearInterval(timer);
      }
      scoreValue.textContent = Math.round(current);
    }, 20);
  }, 100);

  if (data.total_score >= 70) {
    createResultsFireworks();
  }

  // If Instant Feedback was OFF, show the detailed Answer Table
  if (!testState.showInstantFeedback) {
    renderAnswersTable();
  }
}

function renderAnswersTable() {
  const container = document.getElementById('resultsScreen').querySelector('.card-gradient');
  const tableDiv = document.createElement('div');
  tableDiv.className = 'mt-8 w-full animate-fade-in no-print';

  let html = `
        <h3 class="text-xl font-bold mb-4 text-center">📝 مراجعة الإجابات</h3>
        <div class="overflow-x-auto rounded-xl border-2 border-gray-200">
            <table class="w-full text-sm text-center">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="p-3 border-b">السؤال</th>
                        <th class="p-3 border-b">إجابتك</th>
                        <th class="p-3 border-b">الإجابة الصحيحة</th>
                        <th class="p-3 border-b">النتيجة</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
    `;

  // Retrieve ALL questions (including history if multi-stage)
  // Flatten logic: If history exists, iterate it. Then current questions.
  let allQ = [];
  let allA = [];

  testState.history.forEach(h => {
    h.questions.forEach((q, i) => {
      allQ.push(q);
      allA.push(h.answers[i]);
    });
  });

  // Current session
  testState.questions.forEach((q, i) => {
    allQ.push(q);
    allA.push(testState.answers[i]);
  });

  allQ.forEach((q, i) => {
    const myAns = allA[i] ? allA[i] : (allA[i] === null ? '(متروك)' : '');
    const correctAns = q.answer;
    const isCorrect = myAns && myAns.toUpperCase().trim() === correctAns.toUpperCase().trim();

    html += `
            <tr class="${isCorrect ? 'bg-green-50' : 'bg-red-50'} hover:bg-gray-50 transition">
                <td class="p-3 font-semibold" dir="auto">${q.q.replace(/___/g, '...')}</td>
                <td class="p-3 ${isCorrect ? 'text-green-700 font-bold' : 'text-red-600 line-through'}">${myAns}</td>
                <td class="p-3 text-green-700 font-bold" dir="ltr">${correctAns}</td>
                <td class="p-3 text-xl">${isCorrect ? '✅' : '❌'}</td>
            </tr>
        `;
  });

  html += `
                </tbody>
            </table>
        </div>
    `;

  tableDiv.innerHTML = html;

  // Append before the buttons at the bottom
  const buttonsDiv = container.querySelector('.flex.flex-wrap.justify-center.gap-4');
  container.insertBefore(tableDiv, buttonsDiv);
}

function createResultsFireworks() {
  const container = document.getElementById('confettiContainer');
  const colors = ['#667eea', '#764ba2', '#38ef7d', '#f5576c', '#ffd700', '#f45c43'];

  for (let burst = 0; burst < 5; burst++) {
    setTimeout(() => {
      const centerX = Math.random() * 80 + 10;
      const centerY = Math.random() * 40 + 10;

      for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework-particle';
        particle.style.position = 'absolute';
        particle.style.left = centerX + '%';
        particle.style.top = centerY + '%';
        particle.style.color = colors[Math.floor(Math.random() * colors.length)];
        particle.innerHTML = ['⭐', '✨', '💫', '🌟'][Math.floor(Math.random() * 4)];
        particle.style.fontSize = '24px';

        const angle = (i / 12) * 2 * Math.PI;
        const distance = 100 + Math.random() * 50;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        particle.style.setProperty('--x', x + 'px');
        particle.style.setProperty('--y', y + 'px');

        container.appendChild(particle);

        setTimeout(() => particle.remove(), 1000);
      }
    }, burst * 300);
  }
}

function backToDashboard() {
  document.getElementById('resultsScreen').classList.add('hidden');
  document.getElementById('timer').classList.remove('timer-warning');

  document.getElementById('studentName').value = '';
  document.getElementById('studentAge').value = '';
  document.getElementById('adminStudentName').value = '';
  document.getElementById('adminStudentAge').value = '';

  if (isAdmin || isSupervisor) {
    showAdminDashboard();
  } else {
    showEmployeeDashboard();
  }
}

// ==================== UTILITY FUNCTIONS ====================
function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMessage').textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

function printResults() {
  console.log('Printing results...');
  // Add a small delay to ensure UI updates if any, then force print
  setTimeout(() => {
    window.print();
  }, 250);
}

// Global refresh function for external sync (Firebase)
function refreshUI() {
  if (currentUser) {
    if (isAdmin) {
      if (!document.getElementById('adminDashboard').classList.contains('hidden')) {
        if (!document.getElementById('adminRecords').classList.contains('hidden')) renderAllRecords();
        if (!document.getElementById('employeeSettings').classList.contains('hidden')) renderEmployeeSettings();
        if (!document.getElementById('statistics').classList.contains('hidden')) renderStatistics();
      }
    } else {
      if (!document.getElementById('employeeDashboard').classList.contains('hidden')) {
        if (!document.getElementById('myRecords').classList.contains('hidden')) renderMyRecords();
      }
    }
  }
}

// ==================== WELCOME SCREEN ====================
function showWelcomeScreen() {
  const welcomeScreen = document.getElementById('welcomeScreen');
  const fireworksContainer = document.getElementById('welcomeFireworks');

  // playCelebrationMusic(); // Removed auto-music
  // Attempt auto-play, fallback to click interaction if blocked
  audioManager.play('welcome').catch(() => {
    console.log('Autoplay blocked. Waiting for user interaction...');
    document.addEventListener('click', () => {
      audioManager.play('welcome');
    }, { once: true });
  });
  // Speak welcome message removed
  setTimeout(() => {
    // Check if voice is available, otherwise it might be silent
    audioManager.speak('Welcome to the English Placement Test, please select your name');
  }, 1500);

  const fireworkInterval = setInterval(() => {
    createWelcomeFireworks(fireworksContainer);
  }, 400);

  createConfettiRain();

  setTimeout(() => {
    clearInterval(fireworkInterval);
    welcomeScreen.style.transition = 'opacity 1s ease-out';
    welcomeScreen.style.opacity = '0';
    setTimeout(() => {
      welcomeScreen.style.display = 'none';
    }, 1000);
  }, 4000);
}

function createWelcomeFireworks(container) {
  const colors = ['#FFD700', '#FF69B4', '#00FF00', '#00BFFF', '#FF4500', '#FF1493', '#FFFF00'];

  const x = Math.random() * 100;
  const y = Math.random() * 100;

  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.left = x + '%';
    particle.style.top = y + '%';
    particle.style.fontSize = '24px';
    particle.innerHTML = ['⭐', '✨', '💫', '🌟', '🎆', '🎇'][Math.floor(Math.random() * 6)];

    const angle = (i / 15) * 2 * Math.PI;
    const distance = 80 + Math.random() * 40;
    const xMove = Math.cos(angle) * distance;
    const yMove = Math.sin(angle) * distance;

    particle.style.setProperty('--x', xMove + 'px');
    particle.style.setProperty('--y', yMove + 'px');
    particle.className = 'firework-particle';

    container.appendChild(particle);

    setTimeout(() => particle.remove(), 1000);
  }
}

function createConfettiRain() {
  const colors = ['#667eea', '#764ba2', '#38ef7d', '#f5576c', '#ffd700', '#ff69b4'];
  const body = document.body;

  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-20px';
      confetti.style.fontSize = '30px';
      confetti.style.zIndex = '9999';
      confetti.innerHTML = ['🎊', '🎉', '🎈', '🎁', '⭐', '✨'][Math.floor(Math.random() * 6)];
      confetti.style.animation = `confetti ${2 + Math.random() * 2}s linear forwards`;

      body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 4000);
    }, i * 80);
  }
}

function playCelebrationMusic() {
  audioManager.play('celebration');
}

// ==================== DYNAMIC DATA LOADER ====================
function populateEmployeeSelects() {
  const selectIds = ['employeeSelect', 'adminEmployeeSelect', 'forgotEmployeeSelect'];

  selectIds.forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;

    // Keep the first option (default/placeholder)
    const placeholderText = select.options[0] ? select.options[0].textContent : '-- اختر الموظف --';
    select.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = placeholderText;
    select.appendChild(defaultOption);

    // Populate from employees object
    if (typeof employees !== 'undefined') {
      Object.keys(employees).forEach(key => {
        const emp = employees[key];
        const option = document.createElement('option');
        option.value = key; // Internal ID (A, B, C...)
        option.textContent = emp.name; // Display name
        select.appendChild(option);
      });
    }

    // Add Special Roles Logic
    // 1. Separator
    if (id === 'employeeSelect' || id === 'forgotEmployeeSelect') {
      const separator = document.createElement('option');
      separator.disabled = true;
      separator.textContent = '──────────';
      select.appendChild(separator);
    }

    // 2. Admin (Only for Login)
    if (id === 'employeeSelect') {
      const adminOption = document.createElement('option');
      adminOption.value = 'admin';
      adminOption.textContent = '👑 المدير';
      select.appendChild(adminOption);
    }

    // 3. Supervisor/Accountant (For Login AND Forgot Password)
    if (id === 'employeeSelect' || id === 'forgotEmployeeSelect') {
      const superOption = document.createElement('option');
      superOption.value = 'supervisor';
      superOption.textContent = '💰 المحاسب المالي';
      select.appendChild(superOption);
    }
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  populateEmployeeSelects();
});

// Hook into existing global functions if needed, or simply let the DOMContentLoaded handle initial load.

function updateQuestionStats(isFinal = false) {
  const qStats = document.getElementById('questionStats');
  if (!qStats || qStats.classList.contains('hidden')) return;

  const total = testState.questions.length;
  // If final, everything is answered and nothing is left
  const questionsAnswered = isFinal ? total : testState.answers.filter(a => a !== null).length;
  const questionsLeft = isFinal ? 0 : (total - testState.currentIndex);

  document.getElementById('totalQuestionsCount').textContent = total;

  const remnantEl = document.getElementById('remainingQuestions');
  remnantEl.textContent = questionsLeft;

  // Update answered count
  document.getElementById('answeredQuestions').textContent = questionsAnswered;

  // Calculate Section Counts
  const sectionCounts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  const sectionTotals = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };

  testState.questions.forEach(q => {
    if (sectionTotals[q.section] !== undefined) {
      sectionTotals[q.section]++;
    }
  });

  // Count where we are currently
  // We can just highlight the sections based on current question
  // Or show how many "passed" per section. 
  // Let's show "Current/Total" per section

  // This requires iterating up to current index
  for (let i = 0; i <= testState.currentIndex; i++) {
    const q = testState.questions[i];
    if (sectionCounts[q.section] !== undefined) {
      sectionCounts[q.section]++;
    }
  }

  // Update Section Badges
  ['A', 'B', 'C', 'D', 'E', 'F'].forEach(sec => {
    const statEl = document.getElementById(`statSection${sec}`);
    if (statEl) {
      statEl.textContent = `${sectionCounts[sec]}/${sectionTotals[sec]}`;
      // Dim if 0/Total, Highlight if active
      if (sectionTotals[sec] === 0) {
        statEl.parentElement.style.opacity = '0.3';
      } else {
        statEl.parentElement.style.opacity = '1';
        if (sectionCounts[sec] > 0 && sectionCounts[sec] < sectionTotals[sec]) {
          statEl.parentElement.style.boxShadow = '0 0 0 2px #667eea';
        } else if (sectionCounts[sec] === sectionTotals[sec]) {
          statEl.parentElement.style.background = 'rgba(56, 239, 125, 0.2)'; // Green tint when done
          statEl.parentElement.style.boxShadow = 'none';
        } else {
          statEl.parentElement.style.boxShadow = 'none';
        }
      }
    }
  });

  // Update Progress Bars
  // ABC = Total questions in A+B+C
  const totalABC = sectionTotals.A + sectionTotals.B + sectionTotals.C;
  const currentABC = sectionCounts.A + sectionCounts.B + sectionCounts.C;
  const pctABC = totalABC > 0 ? (currentABC / totalABC) * 100 : 0;

  const totalDEF = sectionTotals.D + sectionTotals.E + sectionTotals.F;
  const currentDEF = sectionCounts.D + sectionCounts.E + sectionCounts.F;
  const pctDEF = totalDEF > 0 ? (currentDEF / totalDEF) * 100 : 0;

  document.getElementById('progressABC').style.width = `${pctABC}%`;
  document.getElementById('progressDEF').style.width = `${pctDEF}%`;
}

