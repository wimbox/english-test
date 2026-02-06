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
      sound.currentTime = 0;
      return sound.play().catch(err => {
        console.warn(`Primary sound ${soundName} failed, trying fallback...`);
        if (this.fallbacks[soundName]) {
          const fallback = new Audio(this.fallbacks[soundName]);
          return fallback.play().catch(e => console.error("Fallback audio failed too:", e));
        }
      });
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
  isExtraChance: false,
  isAdminTest: false,
  skipSave: false,
  maxStageReached: 1,
  history: []
};

// ==================== THEME FUNCTIONS ====================
// Note: Authentication, Theme management, and dropdown population moved to core-navigation.js or script.js initialization

// Navigation and Dashboard functions moved to app-logic.js

// ==================== RECORDS RENDERING ====================
// Records and Statistics functions moved to app-logic.js
// ==================== TEST ENGINE START ====================

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
  const showFeedback = true;
  const skipSave = document.getElementById('adminSkipSave')?.checked || false;
  initializeTest(name, age, employeeId, stageMap[startLevel], showFeedback, true, skipSave);
}

function initializeTest(name, age, employeeId, startStage = 1, showFeedback = true, isAdminTest = false, skipSave = false) {
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
    lockedResult: null, // Achievement Lock: Best score reached so far
    startTime: Date.now(),
    timerInterval: null,
    timeLimit: getTimeLimit(age, generatedQuestions.length),
    showInstantFeedback: showFeedback,
    isExtraChance: false,
    isAdminTest: isAdminTest,
    skipSave: skipSave,
    isTransitioning: false,
    isFinished: false
  };

  testState.answers = new Array(testState.questions.length).fill(null);

  // Admin Magic: Show auto-solve button if admin is testing
  const magicZone = document.getElementById('adminMagicZone');
  if (magicZone) {
    if (isAdminTest) {
      magicZone.classList.remove('hidden');
      magicZone.classList.add('flex');
    } else {
      magicZone.classList.add('hidden');
      magicZone.classList.remove('flex');
    }
  }

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
      const currentStage = (testState && testState.currentStage) || 1;
      let levels;

      // Smart Level Labels based on Stage
      if (currentStage < 100) { // Phonics (1-5)
        levels = ['', 'Starter', 'Phonics (A)', 'Phonics (B)', 'Phonics (C)', 'Beginner', 'Elementary'];
      } else if (currentStage < 300) { // Let's Go 1-3
        levels = ['', 'Beginner', 'Elementary', 'Intermediate', 'Intermediate+', 'Advanced', 'Expert'];
      } else { // Let's Go 4-6 / Elite
        levels = ['', 'Intermediate', 'Advanced', 'Professional', 'Elite', 'Master', 'Legendary'];
      }

      badge.textContent = levels[this.currentDifficulty] || 'General';

      // Update color based on difficulty
      const colors = ['', '#38ef7d', '#667eea', '#ffd700', '#ff9f43', '#f5576c', '#764ba2'];
      badge.style.background = colors[this.currentDifficulty] || '#667eea';

      // Safety check: Avoid high-end terms for Phonics
      if (currentStage < 100 && this.currentDifficulty >= 5) {
        badge.textContent = 'Expert 🎓';
      }
    }
  };
}

function tagQuestionsByLevel() {
  if (typeof questionBank === 'undefined') return;

  // Section A - All Basic Phonics (D1)
  questionBank.sectionA.forEach(q => q.difficulty = 1);

  // Section B - Pronunciation (D1-2)
  questionBank.sectionB.forEach(q => q.difficulty = 2);

  // Section C - Listening (D2)
  questionBank.sectionC.forEach(q => q.difficulty = 2);

  // Section D (Reading) - SMART TAGGING
  questionBank.sectionD.forEach((q, i) => {
    // 117-151 are basic descriptive questions (Easy)
    if (i <= 35) q.difficulty = 2;
    // 153-162 are Inferencing/Comprehension (Elite)
    else q.difficulty = 6;
  });

  // Section E (Writing)
  questionBank.sectionE.forEach((q, i) => {
    if (q.isScrambled || q.q.includes('رتب')) {
      q.difficulty = 5;
    } else if (q.isOpposite) {
      q.difficulty = 3;
    } else {
      q.difficulty = 1;
    }
  });

  // Section F (Grammar/Vocab) - THE BIG POOL
  questionBank.sectionF.forEach((q, i) => {
    if (i >= 191 && i <= 290) {      // LG 6 (Elite)
      q.difficulty = 6;
    } else if (i >= 140 && i <= 190) { // LG 5 (Advanced)
      q.difficulty = 5;
    } else if (i > 290) {              // LG 4 (Intermediate)
      q.difficulty = 4;
    } else {                           // LG 1-3 (Elementary)
      q.difficulty = (i < 50 ? 2 : 3);
    }
  });

  console.log('✅ Question Purge Complete: High-level filters applied.');
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
    // Initial Test: Balanced by age for fairness (increased count)
    if (age <= 7) config.count = 25;      // 5-7 years
    else if (age <= 11) config.count = 30; // 8-11 years
    else config.count = 33;                // 12-15 years
  } else {
    // Supplementary Test (Next Stages): Balanced by age
    if (age <= 7) config.count = 15;
    else if (age <= 11) config.count = 18;
    else config.count = 20;
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
      sectionName: `المرحلة ${stage} `,
      points: (stage === 1 ? 5 : 1)
    }));
    combinedPool = combinedPool.concat(sectionPool);
  });

  // INTEGRATE CUSTOM QUESTIONS
  if (typeof adminQM !== 'undefined' && adminQM.customQuestions && adminQM.customQuestions.length > 0) {
    adminQM.customQuestions.forEach(q => {
      if (config.sections.includes(q.section)) {
        // Only add if not already in test
        if (!testState.questions || !testState.questions.some(prev => prev.q === q.q)) {
          // Rule: Custom questions are treated as Difficulty 6 (Advanced)
          // or they can match the pool's difficulty if it's the target
          if (config.diffs.includes(6) || config.diffs.includes(5)) {
            combinedPool.push({
              ...q,
              section: q.section.replace('section', ''),
              sectionName: `إضافي`,
              points: 2,
              difficulty: 6 // Force advanced
            });
          }
        }
      }
    });
  }

  if (combinedPool.length < config.count) {
    console.warn(`Not enough questions for stage ${stage}.Wanted ${config.count}, found ${combinedPool.length} `);
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
  let secondsPerQuestion = 40;
  if (age >= 5 && age <= 8) secondsPerQuestion = 60;  // 60s for younger kids
  if (age >= 9 && age <= 11) secondsPerQuestion = 55; // 55s for intermediate
  if (age >= 12 && age <= 15) secondsPerQuestion = 45; // 45s for advanced

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
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} `;
}

function showQuestion(index) {
  testState.isTransitioning = false;
  testState.currentIndex = index;
  const question = testState.questions[index];

  if (!question) {
    console.error("Critical: Question at index " + index + " is undefined. Finishing test to prevent freeze.");
    finishTest(true);
    return;
  }

  const container = document.getElementById('questionArea');

  // Update progress & Question Ring
  const indexDisp = index + 1;
  const total = testState.questions.length;

  // Update text counters
  if (document.getElementById('currentQuestion')) document.getElementById('currentQuestion').textContent = indexDisp;
  if (document.getElementById('currentQuestionDisplay')) document.getElementById('currentQuestionDisplay').textContent = indexDisp;
  if (document.getElementById('totalQuestions')) document.getElementById('totalQuestions').textContent = total;
  if (document.getElementById('totalQuestionsCount')) document.getElementById('totalQuestionsCount').textContent = total;
  if (document.getElementById('answeredQuestions')) document.getElementById('answeredQuestions').textContent = index;
  // Remaining questions is handled by updateQuestionStats to ensure consistency


  // Update Progress Bar
  const progressPercent = (indexDisp / total) * 100;
  document.getElementById('progressBar').style.width = progressPercent + '%';

  // Update Question Ring
  const questionRing = document.getElementById('questionRing');
  if (questionRing) {
    const circum = 264;
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
    displayQ = `<span dir="ltr" class="inline-block">${displayQ}</span>`;
  } else if (displayQ.includes(':')) {
    const parts = displayQ.split(':');
    const prompt = parts[0].trim();
    const content = parts.slice(1).join(':').trim();
    displayQ = `${prompt}: <span dir="ltr" class="inline-block px-1">${content}</span>`;
  }

  const displayVal = question.display ? question.display.replace(/___/g, '....') : '';

  // Dynamic Image Logic
  const targetImage = (question.word || question.display || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  let possibleImagePath = targetImage ? `assets/imag/${targetImage}.png` : '';

  if (question.section === 'C' && !targetImage) {
    possibleImagePath = `assets/imag/listening_icon.png`;
  }

  // BALANCED SIZE - COMPACT MODE
  let html = `<div class="w-full">`;

  // Question Text
  html += `
    <div class="text-center mb-1">
      <h3 class="text-xl md:text-2xl font-bold leading-tight text-gray-800">
        ${displayQ}
      </h3>
    </div>
  `;

  // Display Image
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

  // Display opposite word question
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
    // For listening section
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

  // Audio button
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

  // OPTIONS
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
}

function selectOption(button, option) {
  if (testState.isTransitioning) return;
  testState.isTransitioning = true;
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
  if (testState.isTransitioning) return;
  testState.isTransitioning = true;
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
    < p class="font-semibold mb-2" > الإجابة الصحيحة:</p >
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
  audioManager.play('wrong');
}

function playClapSound() {
  audioManager.play('clap');
}

// ADMIN DEBUG TOOL: Auto-Correct Current Question
// ADMIN DEBUG TOOL: Auto-Correct Current Question
function autoSolveQuestion() {
  if (!testState.isAdminTest) return;
  if (testState.isTransitioning || testState.isFinished) return;

  const isChallenge = (typeof testState !== 'undefined' && testState.isChallenge);
  const q = isChallenge ? testState.challengeQuestions[testState.challengeIndex] : testState.questions[testState.currentIndex];
  if (!q) return;

  showToast('🪄 Admin Magic: Solving correctly...');

  // FORCE CORRECT ANSWER IN STATE (Data Integrity First)
  const answerToSet = q.answer; // Ensure we use the exact expected answer string
  if (isChallenge) {
    if (testState.challengeAnswers) testState.challengeAnswers[testState.challengeIndex] = answerToSet;
  } else {
    if (testState.answers) testState.answers[testState.currentIndex] = answerToSet;
  }

  // Now handle UI Visuals
  if (q.type === 'choice') {
    const btns = document.querySelectorAll('.option-btn');
    let found = false;

    // 1. Try exact text match
    btns.forEach(btn => {
      if (btn.textContent.trim().toUpperCase() === q.answer.trim().toUpperCase()) {
        found = true;
        if (isChallenge && typeof selectChallengeOption === 'function') selectChallengeOption(btn, q.answer);
        else selectOption(btn, q.answer);
      }
    });

    // 2. Fallback: If visual mismatch, click the first one but we ALREADY forced the correct answer in state
    if (!found && btns.length > 0) {
      // We pass q.answer again just to be safe, though state is already set
      if (isChallenge && typeof selectChallengeOption === 'function') selectChallengeOption(btns[0], q.answer);
      else selectOption(btns[0], q.answer);
    }

  } else if (q.type === 'typing') {
    const input = document.getElementById('typingAnswer');
    if (input) {
      input.value = q.answer;
      // Trigger logical checks to update UI (colors, confetti)
      if (isChallenge) {
        if (typeof saveChallengeTypingAnswer === 'function') saveChallengeTypingAnswer(q.answer);
        if (typeof checkChallengeTypingAnswer === 'function') checkChallengeTypingAnswer();
      } else {
        saveTypingAnswer(q.answer);
        checkTypingAnswer();
      }
    }
  }
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
  if (testState.isFinished && !force) return;
  testState.isFinished = true;
  testState.isTransitioning = true;

  if (testState.timerInterval) clearInterval(testState.timerInterval);

  // 1. Calculate stats for the GLOBAL result
  const scores = calculateScores();

  // 2. Map stages for internal logic (Moved below)
  const mapStageToLogical = (s) => (s === 201 ? 2 : (s === 301 ? 5 : s));



  // 3. Handle Challenge Result (Success or Failure)
  if (testState.isExtraChance) {
    // Determine accuracy of THE CHALLENGE ONLY
    const challengeQs = testState.questions.filter(q => q.isImprovement);

    if (challengeQs.length > 0) {
      const challengeStartIndex = testState.questions.indexOf(challengeQs[0]);

      let challengeCorrect = 0;
      challengeQs.forEach((q, i) => {
        const ans = testState.answers[challengeStartIndex + i];
        if (ans && ans.toUpperCase().trim() === q.answer.toUpperCase().trim()) {
          challengeCorrect++;
        }
      });
      const challengeAccuracy = (challengeCorrect / (challengeQs.length || 1)) * 100;

      if (challengeAccuracy >= 75) {
        console.log('🎉 Challenge Success!');
        // Update logic state based on jump type
        if (testState.improvementType === 'jump_to_lg13') {
          testState.currentStage = 201;
        } else if (testState.improvementType === 'jump_to_lg46') {
          testState.currentStage = 301;
        }

        // Save this success in history
        testState.history.push({
          stage: testState.currentStage,
          type: testState.improvementType,
          scores: { ...scores }
        });

        testState.isExtraChance = false;
        // Don't finish yet, let the rules decide if another challenge should be offered
      } else {
        console.log('🔒 Challenge Failed: Reverting to locked best result');
        testState.isTransitioning = false;
        if (testState.lockedResult) {
          saveAndShowResults(undefined, testState.lockedResult.scores);
          return;
        }
        testState.isExtraChance = false;
      }
    }
  }

  // 4. SMART IMPROVEMENT CHANCE SYSTEM (Trigger Rules)
  // RECALCULATE max stage and level after challenge result
  const historyStages = (testState.history || [])
    .filter(h => h.stage !== undefined)
    .map(h => mapStageToLogical(h.stage));

  const maxLogicalStage = Math.max(mapStageToLogical(testState.currentStage || 1), ...historyStages);
  testState.maxLogicalStage = maxLogicalStage;
  const levelData = getLevelAndCurriculum(scores, maxLogicalStage);

  if (!force) {
    // 🛡️ ELITE TERMINATION RULE (The fix you requested)
    // If student reached the final level (Stage 5 / Let's Go 6 range) 
    // and has 90% or more, FINISH IMMEDIATELY.
    if (maxLogicalStage >= 5 && scores.total >= 90) {
      console.log('🏆 Elite Performance: Ending test at maximum level.');
      // Proceed to results
    } else {
      const isPhonics = testState.startStage === 1;

      // Rule A: High Phonics → Offer LG 1-3 Jump
      if (isPhonics && scores.total >= 75 && maxLogicalStage < 2 && !testState.isExtraChance) {
        testState.isTransitioning = false; // RESET BEFORE REDIRECT
        triggerImprovementChance('jump_to_lg13');
        return;
      }

      // Rule B: Reached LG 1-3 Level → Offer LG 4-6 Jump
      if ((levelData.level.includes("Let's Go 1") || levelData.level.includes("Let's Go 3") || testState.currentStage === 201)
        && scores.total >= 75 && maxLogicalStage < 5) {
        testState.isTransitioning = false; // RESET BEFORE REDIRECT
        triggerImprovementChance('jump_to_lg46');
        return;
      }
    }
  }



  // 5. FINAL PROCEDE TO RESULTS
  try {
    testState.isTransitioning = false;
    testState.isSuccessScreen = false;
    updateQuestionStats(true);
    if (typeof audioManager !== 'undefined') {
      audioManager.play('finished');
    }

    // Celebrations
    if (maxLogicalStage >= 5 || scores.total >= 95) {
      setTimeout(() => {
        if (typeof playClapSound === 'function') playClapSound();
        if (typeof createConfetti === 'function') createConfetti();
        if (typeof audioManager !== 'undefined') audioManager.play('celebration');
      }, 500);
    }

    // Finalize data
    const resultData = {
      file_number: generateFileNumber(),
      student_name: testState.studentName,
      age: testState.age,
      employee_id: testState.employeeId,
      total_score: scores.total,
      level: levelData.level,
      curriculum: levelData.curriculum,
      test_date: new Date().toLocaleDateString('ar-EG'),
      month_year: `${new Date().getFullYear()} -${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      time_taken: Math.floor((Date.now() - testState.startTime) / 1000)
    };

    saveAndShowResults(resultData, scores);
  } catch (err) {
    console.error("Critical error in finishTest:", err);
    // Emergency fallback: just show results if possible
    saveAndShowResults(undefined, scores);
  }
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
  let stageNames = [];
  if (testState.startStage === 1) {
    if (testState.currentStage < 5 && accuracy >= 95) {
      // High performance in Phonics -> Offer Leap to Let's Go 1
      nextStage = 201;
      nextStageName = "Let's Go (Beginner) 1-3 [تحدي القفز!]";
    } else {
      nextStage = testState.currentStage + 1;
      stageNames = ["", "Oxford Phonics 1", "Oxford Phonics 2", "Oxford Phonics 3", "Oxford Phonics 4", "Oxford Phonics 5", "Let's Go Beginner"];
      nextStageName = stageNames[nextStage] || "Next Phonics Level";
    }
  } else if (testState.startStage === 201) {
    if (accuracy >= 90) {
      nextStage = 301; // Leap to Advanced
      nextStageName = "Let's Go (Advanced) 4-6 [تحدي القفز!]";
    } else {
      nextStage = 301; // Normal progression to Intermediate (or repeat/detailed)
      nextStageName = "Let's Go (Intermediate)";
    }
  } else if (testState.startStage === 301) {
    nextStage = 5; // Elite
    nextStageName = "Let's Go (Elite)";
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
            <!--Trophy Icon Container-->
            <div class="relative mb-6">
               <div class="text-8xl md:text-9xl transform animate-bounce">
                  ${isPerfect ? '' : '🎉'}
               </div>
               ${isPerfect ? '<div class="absolute -top-4 -right-4 text-4xl">🌟</div><div class="absolute -bottom-4 -left-4 text-4xl">🌟</div>' : ''}
            </div>

            <h2 class="text-4xl md:text-5xl font-black text-indigo-600 mb-2">أحسنت!</h2>
            <p class="text-2xl text-gray-600">لقد اجتزت هذه المرحلة بنجاح!</p>

            <div class="text-3xl mt-4 mb-4">الدقة: <span class="font-bold text-emerald-500">${Math.round(accuracy)}%</span></div>
            
            <!--Success Info Card - Balanced Dimensions-->
            <div class="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 md:p-12 rounded-[40px] border-4 border-white shadow-xl max-w-2xl w-full my-6">
                <p class="text-xl text-indigo-800 mb-3 opacity-80">أنت مؤهل لمرحلة إضافية:</p>
                <p class="text-4xl md:text-5xl font-black text-indigo-600 mb-6 drop-shadow-sm">${nextStageName}</p>
                <div class="h-1 w-20 bg-indigo-200 mx-auto mb-6 rounded-full"></div>
                <p class="text-lg text-indigo-500/80">سيتم إضافة جولة جديدة من <b>${testState.age <= 7 ? 10 : (testState.age <= 11 ? 12 : 15)} سؤالاً</b> و <b>6 دقائق</b> جديدة</p>
            </div>
            
            <!--Primary Action Button with spacing-->
            <div class="mt-8 mb-4 w-full max-w-md">
                <button onclick="startNextStage(${nextStage})" class="w-full btn-success px-12 py-6 rounded-3xl font-bold text-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-b-8 border-emerald-700 active:border-b-0 active:translate-y-2">
                    🚀 ابدأ المستوى التالي
                </button>
            </div>

            <!--Secondary Actions - Proper spacing to avoid crowded look-->
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

function triggerImprovementChance(improvementType) {
  testState.improvementType = improvementType;
  testState.isFinished = false; // Reset to allow end logic to work later

  // 🎉 ADD CELEBRATION (Clapping & Confetti) when qualifying for a challenge
  setTimeout(() => {
    playClapSound();
    createConfetti();
    if (typeof audioManager !== 'undefined') {
      audioManager.play('celebration');
    }
  }, 100);

  showImprovementOfferScreen();
}

function showImprovementOfferScreen() {
  clearInterval(testState.timerInterval);
  updateQuestionStats(true);

  // Hide test controls during offer
  document.getElementById('testControls')?.classList.add('hidden');

  // Lock the current result (Achievement Lock)
  const currentScores = calculateScores();
  testState.lockedResult = {
    scores: currentScores,
    stage: testState.currentStage,
    accuracy: (testState.questions.filter((q, i) =>
      testState.answers[i] && testState.answers[i].toUpperCase().trim() === q.answer.toUpperCase().trim()
    ).length / testState.questions.length) * 100
  };

  offerImprovementChance();
}

function calculateExtraStats() {
  const age = testState.age || 7;
  let count = 8;
  let secPerQ = 60;

  if (age >= 8 && age <= 10) {
    count = 12;
    secPerQ = 45;
  } else if (age >= 11) {
    count = 15;
    secPerQ = 35;
  }

  return {
    count: count,
    time: count * secPerQ,
    displayTime: Math.ceil((count * secPerQ) / 60)
  };
}

function offerImprovementChance() {
  try {
    const stats = calculateExtraStats();
    const extraCount = stats.count;
    const extraTime = stats.displayTime;

    // Determine the message based on improvement type
    const improvementType = testState.improvementType || 'improve_lg6';
    let title = '';
    let subtitle = '';
    let targetLevel = '';
    let icon = '🎯';
    let currentAchievementMsg = "";

    // 1. Calculate accuracy and level safely
    let correctTotal = 0;
    let questionsTotal = 0;

    if (testState.history) {
      testState.history.forEach(session => {
        if (session.questions && Array.isArray(session.questions)) {
          session.questions.forEach((q, i) => {
            questionsTotal++;
            if (session.answers && session.answers[i] && q.answer && session.answers[i].toUpperCase().trim() === q.answer.toUpperCase().trim()) {
              correctTotal++;
            }
          });
        }
      });
    }

    // Also count current session (which just finished but isn't in history yet)
    if (testState.questions && Array.isArray(testState.questions)) {
      testState.questions.forEach((q, i) => {
        questionsTotal++;
        if (testState.answers && testState.answers[i] && q.answer && testState.answers[i].toUpperCase().trim() === q.answer.toUpperCase().trim()) {
          correctTotal++;
        }
      });
    }

    const scores = calculateScores();
    const mapStageToLogical = (s) => (s === 201 ? 2 : (s === 301 ? 5 : s));
    const historyStages = (testState.history || []).map(h => mapStageToLogical(h.stage));
    const maxStage = Math.max(mapStageToLogical(testState.currentStage), ...historyStages);
    const levelData = getLevelAndCurriculum(scores, maxStage);

    if (improvementType === 'jump_to_lg13') {
      title = 'تحدي القفز الذهبي 🌟';
      subtitle = 'مستوى الطالب متميز! هل تود تخطي المستويات الأولى؟';
      targetLevel = 'Let\'s Go 4';
      icon = '🚀';
      currentAchievementMsg = `انت بطل! أتقنت مستوى الفونكس بنجاح! 👑`;
    } else if (improvementType === 'jump_to_lg46') {
      title = 'تحدي العمالقة 🏆';
      subtitle = 'أداء مذهل! هل تستطيع الوصول لقمة المنهج؟';
      targetLevel = 'Let\'s Go 6 Elite';
      icon = '⭐';
      currentAchievementMsg = `رائع يا بطل! لقد وصلت للمستوى 3 بنجاح! 🏆`;
    } else if (improvementType === 'improve_lg6') {
      title = 'قريب جداً! 💪';
      subtitle = 'فرصة للوصول للتميز التام';
      targetLevel = 'Let\'s Go 6 Elite';
      icon = '🎯';
      currentAchievementMsg = `لقد حققت نتيجة مذهلة في Let's Go 6! 🔥`;
    }


    const container = document.getElementById('questionArea');
    if (!container) return;

    container.innerHTML = `
      <div class="text-center p-6 md:p-10 animate-fade-in flex flex-col items-center justify-center min-h-[400px]">
          <div class="text-8xl mb-6 animate-bounce">${icon}</div>
          <h2 class="text-4xl md:text-5xl font-black text-indigo-600 mb-3">${title}</h2>
          <p class="text-xl text-gray-600 mb-2">${subtitle}</p>
  
          ${currentAchievementMsg ? `<div class="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full font-bold text-lg mb-6 border-2 border-emerald-200">
            ${currentAchievementMsg}
          </div>` : ''}
  
          <div class="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-3xl border-3 border-indigo-200 shadow-xl max-w-2xl w-full mb-6">
              <p class="text-lg text-gray-700 mb-4">🎓 نعطيك فرصة اختبار مادة متقدمة؛ إذا نجحت فيها ستقفز فوراً إلى: <b class="text-indigo-600">${targetLevel}</b></p>
              <div class="text-2xl font-bold text-indigo-700 mb-4">
                  ✨ ${extraCount} أسئلة تحدي ذكية<br>
                  ⏰ ${extraTime} دقائق إضافية
              </div>
              <div class="text-sm text-gray-600 bg-white/60 p-4 rounded-xl">
                  <p class="mb-2">✅ إذا حصلت على 75%+ → مبروك! قفزت لـ <b>${targetLevel}</b></p>
                  <p>😊 إذا لم تنجح → تحتفظ بنتيجتك الحالية (لا تخسر شيئاً!)</p>
              </div>
          </div>
  
          <div class="flex flex-col md:flex-row gap-4 w-full max-w-xl">
            <button onclick="acceptImprovementChance()"
              class="flex-1 px-8 py-5 rounded-2xl font-bold text-2xl shadow-xl hover:scale-105 transition-all text-white"
              style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.5);">
              🚀 قبول التحدي
            </button>
            <button onclick="declineImprovementChance()"
              class="flex-1 px-8 py-5 rounded-2xl font-bold text-xl shadow-xl hover:scale-105 transition-all text-white"
              style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); box-shadow: 0 4px 15px rgba(239, 68, 68, 0.5);">
              😊 أنا راضٍ - إنهاء
            </button>
          </div>
      </div>
      `;
  } catch (err) {
    console.error("Critical error in offer screen render:", err);
    // Emergency fallback: just finish everything and show results
    finishTest(true);
  }
}


function acceptImprovementChance() {
  testState.isExtraChance = true;

  // Show controls again
  document.getElementById('testControls')?.classList.remove('hidden');

  // Calculate dynamic stats
  const stats = calculateExtraStats();
  const extraCount = stats.count;

  if (extraCount <= 0) {
    showToast('⚠️ لا يوجد أسئلة إضافية متاحة حالياً');
    finishTest(true);
    return;
  }

  // Determine target stage based on improvement type
  const improvementType = testState.improvementType || 'improve_lg6';
  let targetStage = testState.currentStage;

  if (improvementType === 'jump_to_lg13') {
    targetStage = 201; // Let's Go 1-3
  } else if (improvementType === 'jump_to_lg46') {
    targetStage = 301; // Let's Go 4-6
  } else if (improvementType === 'improve_lg6') {
    targetStage = 301; // Same level but harder questions
  }

  // Generate questions from target stage
  let extraQuestions = generateRandomQuestions(testState.age, targetStage);

  // CRITICAL: Remove any questions that were already asked
  const usedQuestions = testState.questions.map(q => q.q);
  extraQuestions = extraQuestions.filter(q => !usedQuestions.includes(q.q));

  // Take only the needed count
  extraQuestions = extraQuestions.slice(0, extraCount);

  // Tag them to identify they are improvement questions
  extraQuestions.forEach(q => {
    q.isImprovement = true;
    q.improvementType = improvementType;
  });

  // Append to current test state
  testState.questions = [...testState.questions, ...extraQuestions];
  testState.answers = [...testState.answers, ...new Array(extraQuestions.length).fill(null)];

  // Update time limit based on calculation
  testState.timeLimit += stats.time;

  // Reset timer for the extra questions session
  testState.startTime = Date.now();
  testState.isFinished = false; // Allow test to continue
  testState.isTransitioning = false;
  startTimer();

  // Show toast notification
  const levelNames = {
    'jump_to_lg13': 'Let\'s Go 1-3',
    'jump_to_lg46': 'Let\'s Go 4-6',
    'improve_lg6': 'Let\'s Go 6'
  };
  showToast(`🎯 تم إضافة ${extraQuestions.length} سؤال من ${levelNames[improvementType]}! حظاً موفقاً 🍀`);

  // Update UI stats
  updateQuestionStats();

  // Continue to next question if we actually added something
  if (extraQuestions.length > 0) {
    showQuestion(testState.currentIndex + 1);
  } else {
    showToast('⚠️ تم استخدام جميع الأسئلة المتاحة لهذا المستوى');
    finishTest(true);
  }
}

function declineImprovementChance() {
  // Show controls again
  document.getElementById('testControls')?.classList.remove('hidden');
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

// Old challenge systems removed to prevent interference


// Challenge functions removed from script.js to avoid duplication with challenge-mode.js
// Challenge functions
// We expose this globally here to ensure the "I am satisfied" button works even if challenge-mode.js has scope issues
function declineChallenge() {
  testState.challengeDeclined = true;
  document.getElementById('testControls')?.classList.remove('hidden');
  showToast('✅ تم إنهاء الاختبار');

  // Force show results directly
  if (testState.initialResult) {
    saveAndShowResults(testState.initialResult, testState.initialScores);
  } else {
    // If for some reason initialResult is missing, recalculate everything
    const finalScores = calculateScores();
    const resultData = {
      student_name: testState.studentName,
      age: testState.age,
      employee_id: testState.employeeId,
      total_score: finalScores.total,
      level: getLevelAndCurriculum(finalScores.total, testState.maxStageReached).level,
      curriculum: getLevelAndCurriculum(finalScores.total, testState.maxStageReached).curriculum,
      test_date: new Date().toLocaleDateString('ar-EG'),
      file_number: generateFileNumber()
    };
    saveAndShowResults(resultData, finalScores);
  }
}

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
  const maxStage = testState.maxLogicalStage || 1;

  // Admin Skip Save Logic
  if (testState.skipSave) {
    showToast('🛡️ تم إنهاء وضع التجربة بنجاح (لم يتم حفظ السجل)');
    showResults(resultData, finalScores);
    return;
  }

  // Ensure resultData exists (if called from failure of challenge)
  const finalResult = resultData || {
    file_number: generateFileNumber(),
    student_name: testState.studentName,
    age: testState.age,
    employee_id: testState.employeeId,
    total_score: finalScores.total,
    level: getLevelAndCurriculum(finalScores, maxStage).level,
    curriculum: getLevelAndCurriculum(finalScores, maxStage).curriculum,
    test_date: new Date().toLocaleDateString('ar-EG'),
    month_year: `${new Date().getFullYear()} -${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    time_taken: Math.floor((Date.now() - testState.startTime) / 1000)
  };

  allRecords.push(finalResult);
  localStorage.setItem('englishTest_records', JSON.stringify(allRecords));

  if (typeof firebaseManager !== 'undefined') {
    firebaseManager.saveRecords(allRecords);
  }

  showResults(finalResult, finalScores);
}



function calculateScores() {
  let sectionScores = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  let correctCount = 0;
  let totalCount = 0;

  // 1. Process History (Archived Stages)
  if (testState.history && Array.isArray(testState.history)) {
    testState.history.forEach(session => {
      if (session.questions && Array.isArray(session.questions)) {
        session.questions.forEach((q, i) => {
          totalCount++;
          const ans = session.answers ? session.answers[i] : null;
          if (ans && q.answer && ans.toUpperCase().trim() === q.answer.toUpperCase().trim()) {
            correctCount++;
            if (sectionScores[q.section] !== undefined) sectionScores[q.section]++;
          }
        });
      }
    });
  }

  // 2. Process Current questions
  if (testState.questions && testState.questions.length > 0) {
    testState.questions.forEach((q, i) => {
      totalCount++;
      const ans = testState.answers[i];
      if (ans && q.answer && ans.toUpperCase().trim() === q.answer.toUpperCase().trim()) {
        correctCount++;
        if (sectionScores[q.section] !== undefined) sectionScores[q.section]++;
      }
    });
  }

  // Calculate global score
  let totalScore = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;


  // Debug logging
  console.log('📊 Score Calculation:', {
    totalQuestions: totalCount,
    correctAnswers: correctCount,
    totalScore: totalScore,
    sectionScores: sectionScores
  });

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
function getLevelAndCurriculum(scoresObj, maxStageReached = 1) {
  const score = scoresObj.total;
  let result = { level: 'Phonics 1', curriculum: 'Oxford Phonics 1' };

  // 1. Level 1 Range: Phonics (Stages 1-1.x)
  if (maxStageReached === 1) {
    if (score <= 20) result = { level: 'Prep Level', curriculum: 'Phonics Foundation' };
    else if (score <= 40) result = { level: 'Phonics 1', curriculum: 'Oxford Phonics 1' };
    else if (score <= 60) result = { level: 'Phonics 2', curriculum: 'Oxford Phonics 2' };
    else if (score <= 80) result = { level: 'Phonics 3', curriculum: 'Oxford Phonics 3' };
    else if (score <= 90) result = { level: 'Phonics 4', curriculum: 'Oxford Phonics 4' };
    else result = { level: 'Phonics 5', curriculum: 'Oxford Phonics 5' };
  }
  // 2. Level 2 Range: Let's Go 1-3 (Stages 2-3)
  else if (maxStageReached >= 2 && maxStageReached <= 4) {
    if (score <= 30) result = { level: 'Phonics 5', curriculum: 'Oxford Phonics 5' }; // Drop down if very low
    else if (score <= 60) result = { level: "Let's Go 1", curriculum: "Let's Go 1" };
    else if (score <= 85) result = { level: "Let's Go 2", curriculum: "Let's Go 2" };
    else result = { level: "Let's Go 3", curriculum: "Let's Go 3" };
  }
  // 3. Level 3 Range: Let's Go 4-6 (Stage 5)
  else if (maxStageReached >= 5) {
    // 🛡️ GOLDEN RULE: Never drop below Let's Go 4 if reached Stage 5
    if (score <= 75) result = { level: "Let's Go 4", curriculum: "Let's Go 4" };
    else if (score <= 90) result = { level: "Let's Go 5", curriculum: "Let's Go 5" };
    else result = { level: "Let's Go 6", curriculum: "Let's Go 6" };
  }
  return result;
}


function generateFileNumber() {
  const emp = employees[testState.employeeId];
  emp.counter++;
  return `${testState.employeeId} -${emp.counter} `;
}

function showResults(data, scores) {
  try {
    document.getElementById('testScreen').classList.add('hidden');
    document.getElementById('resultsScreen').classList.remove('hidden');

    document.getElementById('resultStudentName').textContent = data.student_name || 'طالب';
    document.getElementById('levelResult').textContent = data.level || '-';
    document.getElementById('curriculumResult').textContent = data.curriculum || '-';
    document.getElementById('fileNumber').textContent = data.file_number || '-';


    // Calculate denominators dynamically from HISTORY + CURRENT
    const denominators = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };

    // From History
    if (testState.history) {
      testState.history.forEach(session => {
        if (session.questions) {
          session.questions.forEach(q => {
            if (denominators[q.section] !== undefined) denominators[q.section]++;
          });
        }
      });
    }

    // From Current
    if (testState.questions) {
      testState.questions.forEach(q => {
        if (denominators[q.section] !== undefined) denominators[q.section]++;
      });
    }



    // Debug logging
    console.log('📈 Results Display:', {
      scores: scores,
      denominators: denominators
    });

    const updateStat = (id, score, den) => {
      const el = document.getElementById(id);
      if (!el) return;
      const pct = den > 0 ? Math.round((score / den) * 100) : 0;
      el.innerHTML = den > 0 ?
        `<span class="text-indigo-600">${score}</span> <small class="text-gray-400">/${den}</small> <div class="text-[10px] text-green-600 font-bold">${pct}%</div>` :
        `<span class="text-gray-300">0</span> <small class="text-gray-300">/0</small>`;
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
      if (typeof createResultsFireworks === 'function') {
        createResultsFireworks();
      } else if (typeof createConfetti === 'function') {
        createConfetti(); // Fallback
      }
    }

    // If Instant Feedback was OFF, show the detailed Answer Table
    if (!testState.showInstantFeedback) {
      renderAnswersTable();
    }
  } catch (err) {
    console.error("Error in showResults UI update:", err);
  }
}


// 📋 Answer Table implementation
function renderAnswersTable() {
  const container = document.getElementById('resultsScreen');
  if (!container) return;

  // Create table section
  let tableHtml = `
    <div class="mt-10 p-4 rounded-2xl bg-white shadow-xl overflow-hidden border-2 border-indigo-100">
      <h3 class="text-xl font-bold text-indigo-700 mb-4 text-center">📊 تحليل الإجابات (للمعلم)</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-right">
          <thead class="bg-indigo-50 text-indigo-700">
            <tr>
              <th class="p-3">السؤال</th>
              <th class="p-3">إجابة الطالب</th>
              <th class="p-3">الإجابة الصحيحة</th>
              <th class="p-3 text-center">الحالة</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
  `;

  testState.questions.forEach((q, i) => {
    const userAnswer = testState.answers[i] || 'لم يتم الحل';
    const isCorrect = userAnswer.toUpperCase().trim() === q.answer.toUpperCase().trim();

    tableHtml += `
      <tr class="${isCorrect ? 'bg-emerald-50/30' : 'bg-red-50/30'}">
        <td class="p-3 font-medium">${q.q}</td>
        <td class="p-3 ${isCorrect ? 'text-emerald-700' : 'text-red-600 font-bold'}">${userAnswer}</td>
        <td class="p-3 text-gray-600 font-bold">${q.answer}</td>
        <td class="p-3 text-center text-xl">${isCorrect ? '✅' : '❌'}</td>
      </tr>
    `;
  });

  tableHtml += `
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Append to results screen
  const wrapper = document.createElement('div');
  wrapper.className = 'max-w-4xl mx-auto w-full px-4 mb-20';
  wrapper.innerHTML = tableHtml;
  container.appendChild(wrapper);
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

// backToDashboard moved to app-logic.js

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
  // Start the premium welcome sequence
  if (typeof showWelcomeScreen === 'function') {
    showWelcomeScreen();
  }
});

// Hook into existing global functions if needed, or simply let the DOMContentLoaded handle initial load.

function updateQuestionStats(isFinal = false) {
  const qStats = document.getElementById('questionStats');
  if (!qStats || qStats.classList.contains('hidden')) return;

  const total = testState.questions.length;
  // If final, everything is answered and nothing is left
  const questionsAnswered = isFinal ? total : testState.answers.filter(a => a !== null).length;

  // Logic: Total - Index (Current Question counts as remaining to be done)
  // If isFinal is true, force 0.
  const questionsLeft = isFinal ? 0 : (total - testState.currentIndex);

  document.getElementById('totalQuestionsCount').textContent = total;

  const remnantEl = document.getElementById('remainingQuestions');
  if (remnantEl) remnantEl.textContent = questionsLeft;

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

  // Calculate Mistakes (Only count questions that were ATTEMPTED/ANSWERED)
  let mistakes = 0;
  let actuallyAnswered = 0;

  testState.questions.forEach((q, i) => {
    const answer = testState.answers[i];
    if (answer !== null && answer !== undefined) {
      actuallyAnswered++;
      const isCorrect = answer.toUpperCase().trim() === q.answer.toUpperCase().trim();
      if (!isCorrect) mistakes++;
    }
  });

  // Include history mistakes (Safely)
  if (testState.history) {
    testState.history.forEach(session => {
      if (session.questions && Array.isArray(session.questions)) {
        session.questions.forEach((q, i) => {
          const ans = session.answers ? session.answers[i] : null;
          if (ans !== null && ans !== undefined) {
            actuallyAnswered++;
            if (q.answer) {
              const isCorrect = ans.toUpperCase().trim() === q.answer.toUpperCase().trim();
              if (!isCorrect) mistakes++;
            }
          }
        });
      }
    });
  }


  // Calculate and Update Live Accuracy Badge
  let liveAccuracy = 100;
  if (actuallyAnswered > 0) {
    liveAccuracy = Math.round(((actuallyAnswered - mistakes) / actuallyAnswered) * 100);
  }

  const accuracyValueEl = document.getElementById('liveAccuracyValue');
  const accuracyBadgeEl = document.getElementById('liveAccuracyBadge');
  if (accuracyValueEl) accuracyValueEl.textContent = `${liveAccuracy}%`;

  if (accuracyBadgeEl) {
    if (liveAccuracy < 70) {
      accuracyBadgeEl.classList.replace('text-green-500', 'text-amber-500');
      accuracyBadgeEl.classList.replace('bg-green-500/10', 'bg-amber-500/10');
      accuracyBadgeEl.classList.replace('border-green-500/20', 'border-amber-500/20');
      accuracyBadgeEl.querySelector('.w-1.5').classList.replace('bg-green-500', 'bg-amber-500');
    } else {
      accuracyBadgeEl.classList.add('text-green-500'); // Ensure green by default
      accuracyBadgeEl.classList.add('bg-green-500/10');
    }
  }

  const wrongEl = document.getElementById('wrongQuestions');
  if (wrongEl) wrongEl.textContent = mistakes;

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

