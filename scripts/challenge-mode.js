// ========================================
// 🎯 CHALLENGE MODE FUNCTIONS
// وظائف نظام التحدي الإضافي
// ========================================

// Accept challenge - generate harder questions (Moved from script.js)
function acceptChallenge() {
    showToast('🎯 ممتاز! استعد للتحدي!');

    // Generate 10 hard questions (Prioritize difficulty 3 for true challenge)
    const hardQuestions = [];

    // Filter for Difficulty 3 (Very Hard) first, then fallback to 2 (Medium)
    let sectionD_Hard = [...questionBank.sectionD].filter(q => q.difficulty === 3);
    if (sectionD_Hard.length < 6) {
        // Fallback if not enough hard questions
        const sectionD_Medium = [...questionBank.sectionD].filter(q => q.difficulty === 2);
        sectionD_Hard = [...sectionD_Hard, ...sectionD_Medium];
    }

    let sectionF_Hard = [...questionBank.sectionF].filter(q => q.difficulty === 3);
    if (sectionF_Hard.length < 4) {
        const sectionF_Medium = [...questionBank.sectionF].filter(q => q.difficulty === 2);
        sectionF_Hard = [...sectionF_Hard, ...sectionF_Medium];
    }

    // Select 6 Reading (D) and 4 Grammar/Vocab (F)
    hardQuestions.push(...shuffleArray(sectionD_Hard).slice(0, 6).map(q => ({ ...q, section: 'D', sectionName: 'القراءة', points: 3 }))); // Higher points for challenge!
    hardQuestions.push(...shuffleArray(sectionF_Hard).slice(0, 4).map(q => ({ ...q, section: 'F', sectionName: 'المفردات والقواعد', points: 3 })));

    // Store challenge state
    testState.isChallenge = true;
    testState.challengeQuestions = shuffleArray(hardQuestions);
    testState.challengeAnswers = new Array(10).fill(null);
    testState.challengeIndex = 0;
    testState.challengeStartTime = Date.now();
    testState.challengeTimeLimit = 300; // 5 minutes

    // Show test screen first
    document.getElementById('testScreen').classList.remove('hidden');
    document.getElementById('resultsScreen').classList.add('hidden');

    // Now update UI elements (they exist now)
    const currentQ = document.getElementById('currentQuestion');
    const totalQ = document.getElementById('totalQuestions');
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

    // Start challenge timer
    startChallengeTimer();
    showChallengeQuestion(0);
}

// Decline challenge logic
function declineChallenge() {
    showToast('😊 قرار حكيم! النتائج قادمة...');
    saveAndShowResults(testState.initialResult);
}

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
    document.getElementById('currentQuestion').textContent = index + 1;
    const progress = ((index + 1) / 10) * 100;
    document.getElementById('progressBar').style.width = progress + '%';

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
      <button onclick="speakWord(this, '${question.word.replace(/'/g, "\\'")}')\" class="btn-audio px-6 py-3 rounded-2xl font-bold text-xl shadow-xl mb-6 pulse-animation">
        🔊 اضغط للاستماع
      </button>
    `;
    }

    html += `</div>`;

    if (question.type === 'choice') {
        const shuffledOptions = shuffleArray([...question.options]);
        html += `
      <div class="grid grid-cols-2 gap-4">
        ${shuffledOptions.map(opt => `
          <button onclick="selectChallengeOption(this, '${opt.replace(/'/g, "\\'")}')\" 
            class="option-btn p-4 rounded-xl text-xl font-semibold shadow-md">
            ${opt}
          </button>
        `).join('')}
      </div>
    `;
    } else if (question.type === 'typing') {
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
        if (testState.challengeIndex < 9) {
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
    saveAndShowResults(updatedResult);
}
