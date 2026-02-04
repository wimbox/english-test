// ====================================================
// 🎯 ADAPTIVE TESTING ENGINE
// نظام الاختبار التكيفي الذكي
// ====================================================

const adaptiveTesting = {
    // Current difficulty level (1=easy, 2=medium, 3=hard)
    currentDifficulty: 2,

    // Performance tracking
    recentCorrect: 0,
    recentTotal: 0,
    checkInterval: 5, // Check every 5 questions

    // Difficulty thresholds
    thresholds: {
        upgradeThreshold: 0.75,  // 75% correct → harder
        downgradeThreshold: 0.40 // 40% correct → easier
    },

    // Track performance
    trackAnswer(isCorrect) {
        this.recentTotal++;
        if (isCorrect) this.recentCorrect++;

        // Check if it's time to adjust difficulty
        if (this.recentTotal >= this.checkInterval) {
            this.adjustDifficulty();
        }
    },

    // Adjust difficulty based on performance
    adjustDifficulty() {
        const performance = this.recentCorrect / this.recentTotal;
        const oldDifficulty = this.currentDifficulty;

        if (performance >= this.thresholds.upgradeThreshold && this.currentDifficulty < 3) {
            this.currentDifficulty++;
            showToast(`🎯 ممتاز! الأسئلة ستصبح أصعب قليلاً`);
        } else if (performance <= this.thresholds.downgradeThreshold && this.currentDifficulty > 1) {
            this.currentDifficulty--;
            showToast(`💪 لا بأس! سنسهل الأسئلة قليلاً`);
        }

        // Reset counters
        this.recentCorrect = 0;
        this.recentTotal = 0;

        // Update UI indicator
        this.updateDifficultyIndicator();

        return oldDifficulty !== this.currentDifficulty;
    },

    // Update visual difficulty indicator
    updateDifficultyIndicator() {
        const badge = document.getElementById('difficultyBadge');
        if (!badge) return;

        const levels = {
            1: { text: '😊 سهل', color: '#38ef7d', emoji: '🟢' },
            2: { text: '😎 متوسط', color: '#667eea', emoji: '🟡' },
            3: { text: '🔥 صعب', color: '#f5576c', emoji: '🔴' }
        };

        const level = levels[this.currentDifficulty];
        badge.innerHTML = `${level.emoji} ${level.text}`;
        badge.style.background = level.color;
        badge.style.animation = 'pulse 0.5s ease';
    },

    // Reset for new test
    reset() {
        this.currentDifficulty = 2;
        this.recentCorrect = 0;
        this.recentTotal = 0;
    }
};

// Assign difficulty levels to questions in questionBank
function assignQuestionDifficulty() {
    // Section A - Letters (easy to hard based on complexity)
    const difficultyMap = {
        sectionA: [
            1, 1, 1, 1, 1, 2, 2, 1, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 1, 1,
            2, 2, 2, 1, 2, 1, 2, 2, 2, 1, 2, 3, 2, 2, 1, 3, 2, 1, 2, 3, 3, 1
        ],
        sectionB: [
            1, 1, 2, 2, 1, 2, 2, 2, 2, 3,
            2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 3, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3
        ],
        sectionC: [
            1, 1, 1, 1, 1, 1, 2, 2, 2, 2,
            1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 2, 2, 1, 1, 2, 2, 1, 2, 1, 2, 2
        ],
        sectionD: [
            1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
            // New Advanced Reading (Difficulty 3)
            3, 3, 3, 3, 3, 3, 3, 3, 3, 3
        ],
        sectionE: [
            1, 1, 2, 1, 1, 2, 2, 2, 2, 2, 2, 3,
            1, 1, 2, 2, 1, 2, 2, 3, 2, 2, 3, 2, 2, 2, 3, 2, 2, 3, 3, 3, 3, 2
        ],
        sectionF: [
            1, 1, 1, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
            // New 40 Questions (Hard Vocabulary & Comprehension)
            3, 3, 3, 3, 3, 3, 3, 3, 3, 3, // School
            3, 3, 3, 3, 3, 3, 3, 3, 3, 3, // People
            3, 3, 3, 3, 3, 3, 3, 3, 3, 3, // Clothes
            3, 3, 3, 3, 3, 3, 3, 3, 3, 3  // Subjects
        ]
    };

    // Apply difficulty to each question
    Object.keys(questionBank).forEach(section => {
        const difficulties = difficultyMap[section] || [];
        questionBank[section].forEach((q, index) => {
            q.difficulty = difficulties[index] || 2; // Default to medium
        });
    });
}

// Call this when the script loads
assignQuestionDifficulty();
