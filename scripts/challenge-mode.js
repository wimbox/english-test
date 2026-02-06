// ========================================
// 🎯 CHALLENGE MODE FUNCTIONS
// وظائف نظام التحدي الإضافي
// ========================================

// Essential utility: Local shuffle array to ensure independence
function localShuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Accept challenge - generate harder questions (Moved from script.js)
function acceptChallenge() {
    showToast('🎯 ممتاز! استعد للتحدي!');

    // Generate questions based on age for balanced challenge
    const age = testState.age || 10;
    const currentMaxStage = testState.currentStage || 1;
    let totalChallengeQ = 10;
    if (age >= 8 && age <= 11) totalChallengeQ = 12;
    if (age >= 12) totalChallengeQ = 15;

    const countD = Math.ceil(totalChallengeQ * 0.6); // 60% Reading
    const countF = totalChallengeQ - countD;         // 40% Grammar/Vocab

    const hardQuestions = [];

    // SMART FILTERING: High Level = Elite Questions Only
    let targetDiffs = [3]; // Default for low levels
    if (currentMaxStage >= 301 || currentMaxStage >= 5) {
        targetDiffs = [6, 5]; // Elite & Advanced ONLY
    } else if (currentMaxStage >= 201 || currentMaxStage >= 3) {
        targetDiffs = [5, 4, 3];
    }

    // Filter for Section D (Reading)
    let sectionD_Pool = [...questionBank.sectionD].filter(q => targetDiffs.includes(q.difficulty));
    if (sectionD_Pool.length < countD) {
        // Fallback to broader difficulty if pool is too small
        sectionD_Pool = [...questionBank.sectionD].filter(q => q.difficulty >= 2);
    }

    // Filter for Section F (Grammar)
    let sectionF_Pool = [...questionBank.sectionF].filter(q => targetDiffs.includes(q.difficulty));
    if (sectionF_Pool.length < countF) {
        sectionF_Pool = [...questionBank.sectionF].filter(q => q.difficulty >= 2);
    }

    // Select based on calculated counts
    hardQuestions.push(...localShuffle(sectionD_Pool).slice(0, countD).map(q => ({ ...q, section: 'D', sectionName: 'القراءة (Elite)', points: 3 })));
    hardQuestions.push(...localShuffle(sectionF_Pool).slice(0, countF).map(q => ({ ...q, section: 'F', sectionName: 'المفردات والقواعد (Elite)', points: 3 })));

    // Store challenge state
    testState.isChallenge = true;
    testState.challengeQuestions = localShuffle(hardQuestions);
    testState.challengeAnswers = new Array(hardQuestions.length).fill(null);
    testState.challengeIndex = 0;
    testState.challengeStartTime = Date.now();
    testState.challengeTimeLimit = totalChallengeQ * 45; // 45 seconds per question
    testState.challengeAttempted = true; // Mark as attempted

    // Clear any existing test timer
    if (testState.timerInterval) clearInterval(testState.timerInterval);

    // Hide test controls during challenge
    document.getElementById('testControls')?.classList.add('hidden');

    // Show test screen first
    document.getElementById('testScreen').classList.remove('hidden');
    document.getElementById('resultsScreen').classList.add('hidden');

    // Now update UI elements (they exist now)
    const currentQ = document.getElementById('currentQuestionDisplay');
    const totalQ = document.getElementById('totalQuestionsCount');
    const progressBar = document.getElementById('progressBar');
    const sectionBadge = document.getElementById('sectionBadge');
    const difficultyBadge = document.getElementById('difficultyBadge');

    if (currentQ) currentQ.textContent = '1';
    if (totalQ) totalQ.textContent = '10';
    if (progressBar) progressBar.style.width = '0%';
    if (sectionBadge) sectionBadge.textContent = '🎯 تحدي خاص - Advanced';
    if (difficultyBadge) {
        difficultyBadge.innerHTML = '🔥 صعب جداً';
        difficultyBadge.style.background = '#eb3349'; // Dark Red
    }

    // Support Admin Magic during challenge
    const magicZone = document.getElementById('adminMagicZone');
    if (magicZone) {
        if (testState.isAdminTest) {
            magicZone.classList.remove('hidden');
            magicZone.classList.add('flex');
        }
    }

    // Start challenge timer
    startChallengeTimer();
    showChallengeQuestion(0);
}

// Decline challenge logic - let script.js handle this to ensure consistency
// function declineChallenge() removed here as it is defined in script.js


// Show challenge question
function showChallengeQuestion(index) {
    if (!testState.isChallenge) return;

    const question = testState.challengeQuestions[index];
    if (!question) {
        finishChallenge();
        return;
    }

    testState.challengeIndex = index;

    // Update progress
    const currentQ = document.getElementById('currentQuestionDisplay');
    if (currentQ) currentQ.textContent = index + 1;

    const total = testState.challengeQuestions.length;

    document.getElementById('totalQuestionsCount').textContent = total;

    // Update Answered and Remaining counters for Challenge Mode
    const answeredEl = document.getElementById('answeredQuestions');
    const remainingEl = document.getElementById('remainingQuestions');
    if (answeredEl) answeredEl.textContent = index;
    if (remainingEl) remainingEl.textContent = total - index;

    const progress = ((index + 1) / total) * 100;
    const progressBar = document.getElementById('progressBar');
    if (progressBar) progressBar.style.width = progress + '%';

    // Update Question Ring (Visual feedback)
    const ring = document.getElementById('questionRing');
    if (ring) {
        const offset = 264 - (264 * (index + 1) / total);
        ring.style.strokeDashoffset = offset;
    }

    // Update Wrong count in challenge mode
    updateWrongCountInChallenge();

    // Show question using existing function (reuse code)
    const container = document.getElementById('questionArea');
    let html = renderQuestion(question);
    container.innerHTML = html;

    if (question.type === 'typing') {
        setTimeout(() => document.getElementById('typingAnswer')?.focus(), 100);
    }
}

// Render question HTML (helper)
function renderQuestion(question) {
    let displayQ = question.q.replace(/___/g, '....');

    // Logic to handle direction - force LTR for English start
    const isEnglishStart = /^[A-Za-z]/.test(displayQ);

    if (isEnglishStart) {
        displayQ = `<span dir="ltr" class="inline-block w-full">${displayQ}</span>`;
    } else if (displayQ.includes(':')) {
        const parts = displayQ.split(':');
        const prompt = parts[0].trim();
        const content = parts.slice(1).join(':').trim();
        displayQ = `${prompt}: <span dir="ltr" class="inline-block px-1">${content}</span>`;
    }

    const displayVal = question.display ? question.display.replace(/___/g, '....') : '';

    let html = `<div class="question-wrapper">
    <div class="text-center mb-6">
      <h3 class="text-2xl font-bold mb-6 flex flex-wrap justify-center items-center gap-1">${displayQ}</h3>
  `;

    if (question.section === 'C' && displayVal) {
        html += `<div class="mb-6 flex justify-center">
      <div class="text-9xl float-animation" style="font-size: 8rem; line-height: 1.2;">${displayVal}</div>
    </div>`;
    } else if (displayVal) {
        html += `<div class="text-9xl mb-6 float-animation" dir="ltr" style="font-size: 6rem; line-height: 1.2;">${displayVal}</div>`;
    }

    if (question.word) {
        html += `
      <button onclick="speakWord(this, '${question.word.replace(/'/g, "\\'")}')" class="btn-audio px-6 py-3 rounded-2xl font-bold text-xl shadow-xl mb-6 pulse-animation">
        🔊 اضغط للاستماع
      </button>
    `;
    }

    html += `</div>`;

    if (question.type === 'choice') {
        const shuffledOptions = localShuffle([...question.options]);
        html += `
      <div class="grid grid-cols-2 gap-4">
        ${shuffledOptions.map(opt => `
          <button onclick="selectChallengeOption(this, '${opt.replace(/'/g, "\\'")}')" 
            class="option-btn p-4 rounded-xl text-xl font-semibold shadow-md">
            ${opt}
          </button>
        `).join('')}
      </div>
    `;
    }
    else if (question.type === 'typing') {
        html += `
      <div class="max-w-md mx-auto">
        <input type="text" id="typingAnswer" 
          class="w-full p-4 text-2xl text-center rounded-xl outline-none uppercase"
          placeholder="اكتب الإجابة هنا..."
          onkeyup="saveChallengeTypingAnswer(this.value)"
          onkeypress="if(event.key === 'Enter') checkChallengeTypingAnswer()"
          autocomplete="off"
          style="border: 3px solid var(--border-color);">
        <button onclick="checkChallengeTypingAnswer()" class="btn-primary w-full mt-4 py-3 rounded-xl font-bold text-lg">
          تحقق ✓
        </button>
      </div>
    `;
    }

    html += `</div>`;
    return html;
}

// Select option in challenge
function selectChallengeOption(button, option) {
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.style.pointerEvents = 'none';
    });

    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected', 'correct', 'wrong');
    });
    button.classList.add('selected');
    testState.challengeAnswers[testState.challengeIndex] = option;

    const question = testState.challengeQuestions[testState.challengeIndex];
    const isCorrect = (option === question.answer);

    if (isCorrect) {
        button.classList.add('correct', 'celebrate');
        createConfetti();
        playCorrectSound();
    } else {
        button.classList.add('wrong', 'shake');
        playWrongSound();

        document.querySelectorAll('.option-btn').forEach(btn => {
            if (btn.textContent.trim() === question.answer.trim()) {
                setTimeout(() => btn.classList.add('correct'), 300);
            }
        });
        setTimeout(() => button.classList.remove('shake'), 300);
    }

    setTimeout(() => {
        if (testState.challengeIndex < testState.challengeQuestions.length - 1) {
            showChallengeQuestion(testState.challengeIndex + 1);
        } else {
            finishChallenge();
        }
    }, 1500);
}

// Save typing answer in challenge
function saveChallengeTypingAnswer(value) {
    testState.challengeAnswers[testState.challengeIndex] = value.toUpperCase().trim();
}

// Check typing answer in challenge
function checkChallengeTypingAnswer() {
    const question = testState.challengeQuestions[testState.challengeIndex];
    const userAnswer = testState.challengeAnswers[testState.challengeIndex];
    const input = document.getElementById('typingAnswer');
    if (!input) return;

    input.disabled = true;
    const checkButton = input.nextElementSibling;
    if (checkButton) checkButton.disabled = true;

    const isCorrect = userAnswer && userAnswer.toUpperCase().trim() === question.answer.toUpperCase().trim();

    if (isCorrect) {
        input.style.borderColor = '#38ef7d';
        input.style.borderWidth = '3px';
        createConfetti();
        playCorrectSound();
    } else {
        input.classList.add('shake');
        input.style.borderColor = '#f45c43';
        input.style.borderWidth = '3px';
        playWrongSound();

        const correctAnswerDiv = document.createElement('div');
        correctAnswerDiv.className = 'mt-4 p-4 rounded-xl text-center';
        correctAnswerDiv.style.background = 'var(--bg-success)';
        correctAnswerDiv.style.color = 'white';
        correctAnswerDiv.innerHTML = `
      <p class="font-semibold mb-2">الإجابة الصحيحة:</p>
      <p class="text-2xl font-bold">${question.answer}</p>
    `;
        input.parentElement.appendChild(correctAnswerDiv);
        setTimeout(() => input.classList.remove('shake'), 300);
    }

    setTimeout(() => {
        if (testState.challengeIndex < 9) {
            showChallengeQuestion(testState.challengeIndex + 1);
        } else {
            finishChallenge();
        }
    }, 2500);
}

// Challenge timer
function startChallengeTimer() {
    updateTimerDisplay(testState.challengeTimeLimit);

    testState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - testState.challengeStartTime) / 1000);
        const remaining = testState.challengeTimeLimit - elapsed;

        if (remaining <= 0) {
            clearInterval(testState.timerInterval);
            finishChallenge();
            return;
        }

        updateTimerDisplay(remaining);

        const ring = document.getElementById('timerRing');
        if (ring) {
            const circumference = 264;
            const offset = circumference - (remaining / testState.challengeTimeLimit) * circumference;
            ring.style.strokeDashoffset = offset;
        }

        if (remaining < 60) {
            document.getElementById('timer').classList.add('timer-warning');
        }
    }, 1000);
}

// Finish challenge and recalculate
function finishChallenge() {
    clearInterval(testState.timerInterval);

    // Calculate challenge score
    let challengeScore = 0;
    testState.challengeQuestions.forEach((q, i) => {
        const answer = testState.challengeAnswers[i];
        if (!answer) return;
        const isCorrect = answer.toUpperCase().trim() === q.answer.toUpperCase().trim();
        if (isCorrect) {
            challengeScore += q.points;
        }
    });

    // Add to original score
    const newTotal = Math.min(100, testState.initialScores.total + challengeScore);
    const newLevelData = getLevelAndCurriculum(newTotal);

    // Update result
    const updatedResult = {
        ...testState.initialResult,
        total_score: newTotal,
        level: newLevelData.level,
        curriculum: newLevelData.curriculum,
        challenge_score: challengeScore,
        challenge_attempted: true
    };

    // Show message based on performance
    if (challengeScore >= 20) { // High score on hard questions
        showToast(`🎉 مبروك! أداء استثنائي! مستوى ${newLevelData.level}!`);
        audioManager.play('celebration');
    } else if (challengeScore >= 10) {
        showToast(`👍 جيد جداً! ارتفعت درجتك.`);
    } else {
        showToast(`💪 محاولة جيدة!`);
    }

    testState.isChallenge = false;
    document.getElementById('testControls')?.classList.remove('hidden');
    saveAndShowResults(updatedResult, { ...testState.initialScores, total: newTotal });
}

function updateWrongCountInChallenge() {
    let wrongCount = 0;

    // 1. Errors from history
    if (testState.history) {
        testState.history.forEach(session => {
            session.questions.forEach((q, i) => {
                const ans = session.answers[i];
                if (ans) {
                    if (ans.toUpperCase().trim() !== q.answer.toUpperCase().trim()) wrongCount++;
                }
            });
        });
    }

    // 2. Errors from main test session
    if (testState.questions) {
        testState.questions.forEach((q, i) => {
            const ans = testState.answers[i];
            if (ans) {
                if (ans.toUpperCase().trim() !== q.answer.toUpperCase().trim()) wrongCount++;
            }
        });
    }

    // 3. Errors from current challenge
    if (testState.challengeQuestions) {
        testState.challengeQuestions.forEach((q, i) => {
            const ans = testState.challengeAnswers[i];
            if (ans) {
                if (ans.toUpperCase().trim() !== q.answer.toUpperCase().trim()) wrongCount++;
            }
        });
    }

    const wrongEl = document.getElementById('wrongQuestions');
    if (wrongEl) wrongEl.textContent = wrongCount;
}
