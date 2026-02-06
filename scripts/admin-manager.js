/**
 * Admin Question Manager
 * Handles browsing, searching, and editing questions.
 */

class AdminQuestionManager {
    constructor() {
        this.currentSection = 'all';
        this.searchQuery = '';
        this.customQuestions = [];
        this.allQuestions = [];
        this.init();
    }

    init() {
        // Load custom questions from localStorage as backup
        this.customQuestions = JSON.parse(localStorage.getItem('englishTest_customQuestions')) || [];
        this.loadAllQuestions();
    }

    loadAllQuestions() {
        this.allQuestions = [];
        // Combine static questionBank with custom questions
        if (typeof questionBank !== 'undefined') {
            Object.entries(questionBank).forEach(([section, questions]) => {
                questions.forEach(q => {
                    this.allQuestions.push({ ...q, section, isCustom: false });
                });
            });
        }

        // Add custom ones
        this.customQuestions.forEach(q => {
            this.allQuestions.push({ ...q, isCustom: true });
        });

        this.updateTotalCount();
    }

    updateTotalCount() {
        const count = this.allQuestions.length;
        const el = document.getElementById('totalQCount');
        if (el) el.textContent = count;

        const dashEl = document.getElementById('qBankDashboardCount');
        if (dashEl) dashEl.textContent = count;

        // Sectional counts for dashboard mini-badges
        ['sectionA', 'sectionB', 'sectionC', 'sectionD', 'sectionE', 'sectionF'].forEach((sec, idx) => {
            const secCount = this.allQuestions.filter(q => q.section === sec).length;
            const badgeId = `mini${String.fromCharCode(65 + idx)}`; // miniA, miniB, etc.
            const badgeEl = document.getElementById(badgeId);
            if (badgeEl) badgeEl.textContent = secCount;
        });
    }

    render() {
        const container = document.getElementById('questionsList');
        if (!container) return;

        let filtered = this.allQuestions;

        // Apply Section Filter
        if (this.currentSection !== 'all') {
            filtered = filtered.filter(q => q.section === this.currentSection);
        }

        // Apply Search Filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(q =>
                (q.q && q.q.toLowerCase().includes(query)) ||
                (q.answer && q.answer.toLowerCase().includes(query)) ||
                (q.display && q.display.toLowerCase().includes(query))
            );
        }

        if (filtered.length === 0) {
            container.innerHTML = '<div class="p-8 text-center text-gray-500">🔍 لم يتم العثور على أسئلة تطابق البحث</div>';
            return;
        }

        container.innerHTML = filtered.reverse().map((q, index) => `
            <div class="question-row ${q.isCustom ? 'bg-indigo-500/5' : ''}">
                <div>
                    <span class="q-badge ${q.type === 'choice' ? 'q-type-choice' : 'q-type-typing'}">
                        ${q.type === 'choice' ? 'اختياري' : 'كتابة'}
                    </span>
                </div>
                <div class="truncate font-semibold" title="${q.q}">
                    ${q.isCustom ? '⭐ ' : ''}${q.q}
                </div>
                <div class="text-emerald-400 font-bold truncate">${q.answer}</div>
                <div class="text-xs opacity-60">${this.getSectionName(q.section)}</div>
                <div class="flex gap-2">
                    <button onclick="adminQM.editQuestion(${q.id})" class="btn-icon btn-edit" title="تعديل">✏️</button>
                    ${q.isCustom ? `<button onclick="adminQM.deleteQuestion(${q.id})" class="btn-icon btn-delete" title="حذف">🗑️</button>` : ''}
                </div>
            </div>
        `).join('');
    }

    async exportToWord() {
        let filtered = this.allQuestions;

        // Apply current filters to the export
        if (this.currentSection !== 'all') {
            filtered = filtered.filter(q => q.section === this.currentSection);
        }
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(q =>
                (q.q && q.q.toLowerCase().includes(query)) ||
                (q.answer && q.answer.toLowerCase().includes(query))
            );
        }

        if (filtered.length === 0) {
            if (typeof showToast === 'function') showToast('⚠️ لا توجد أسئلة معروضة لتصديرها');
            return;
        }

        let html = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Exported Questions</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; direction: rtl; }
                table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                th, td { border: 1px solid #ccc; padding: 10px; text-align: right; }
                th { background-color: #f4f4f4; }
                .ltr { direction: ltr; text-align: left; }
                .header { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #1e3a8a; }
            </style>
            </head>
            <body>
                <div class="header">بنك الأسئلة (${this.currentSection === 'all' ? 'جميع الأقسام' : this.getSectionName(this.currentSection)})</div>
                <table>
                    <thead>
                        <tr>
                            <th>القسم</th>
                            <th>السؤال</th>
                            <th>الخيارات</th>
                            <th>الإجابة</th>
                            <th>النوع</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Export questions in the same order as they appear (reversed to show newest first)
        filtered.slice().reverse().forEach(q => {
            const options = q.options ? q.options.join(', ') : '-';
            html += `
                <tr>
                    <td>${this.getSectionName(q.section)}</td>
                    <td class="ltr">${q.q}</td>
                    <td class="ltr">${options}</td>
                    <td class="ltr">${q.answer}</td>
                    <td>${q.type === 'choice' ? 'اختياري' : 'كتابة'}</td>
                </tr>
            `;
        });

        html += `</tbody></table></body></html>`;

        try {
            const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
            const fileName = `Save_English_Questions_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.doc`;

            if ('showSaveFilePicker' in window) {
                // Modern browsers: Force "Save As" dialog
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'Word Document',
                        accept: { 'application/msword': ['.doc'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                if (typeof showToast === 'function') showToast('تم حفظ الملف بنجاح ✅');
            } else {
                // Fallback for older browsers
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                if (typeof showToast === 'function') showToast('تم الحفظ في التنزيلات (المتصفح لا يدعم نافذة الحفظ) 📥');
            }
        } catch (err) {
            console.warn('Save As cancelled or failed:', err);
            // Don't show toast for cancellation
        }
    }

    getSectionName(id) {
        const names = {
            sectionA: 'الحروف',
            sectionB: 'النطق',
            sectionC: 'الاستماع',
            sectionD: 'القراءة',
            sectionE: 'الكتابة',
            sectionF: 'القواعد'
        };
        return names[id] || id;
    }

    setSection(section) {
        this.currentSection = section;
        this.render();
    }

    setSearch(query) {
        this.searchQuery = query;
        this.render();
    }

    editQuestion(id) {
        const q = this.allQuestions.find(i => i.id === id);
        if (!q) {
            // Fallback for original questions that might not have ID
            showToast('⚠️ الأسئلة الأصلية مخصصة للقراءة فقط.');
            return;
        }

        this.openAddModal();
        document.getElementById('qModalTitle').textContent = '✏️ تعديل السؤال';

        // Populate fields
        document.getElementById('field_q').value = q.q || '';
        document.getElementById('field_answer').value = q.answer || '';
        document.getElementById('field_section').value = q.section || 'sectionF';
        document.getElementById('field_type').value = q.type || 'choice';

        // Clear options first
        for (let i = 1; i <= 4; i++) document.getElementById(`field_opt${i}`).value = '';

        if (q.options && q.options.length > 0) {
            q.options.forEach((opt, idx) => {
                const el = document.getElementById(`field_opt${idx + 1}`);
                if (el) el.value = opt;
            });
        }

        this.editingId = q.id;
    }

    // Modal Handlers
    openAddModal() {
        document.getElementById('qModal').classList.add('active');
        document.getElementById('qModalTitle').textContent = '➕ إضافة سؤال جديد';
        // Clear fields
        ['field_q', 'field_answer', 'field_opt1', 'field_opt2', 'field_opt3', 'field_opt4'].forEach(id => {
            document.getElementById(id).value = '';
        });
    }

    openBulkModal() {
        document.getElementById('bulkModal').classList.add('active');
        document.getElementById('bulkData').value = '';
    }

    closeModals() {
        document.querySelectorAll('.admin-modal').forEach(m => m.classList.remove('active'));
    }

    async saveQuestion() {
        const q = document.getElementById('field_q').value.trim();
        const a = document.getElementById('field_answer').value.trim();
        const section = document.getElementById('field_section').value;
        const type = document.getElementById('field_type').value;

        if (!q || !a) {
            showToast('⚠️ الرجاء إدخال السؤال والإجابة');
            return;
        }

        const options = [];
        if (type === 'choice') {
            for (let i = 1; i <= 4; i++) {
                const opt = document.getElementById(`field_opt${i}`).value.trim();
                if (opt) options.push(opt);
            }
            if (options.length < 2) {
                showToast('⚠️ يجب إدخال خيارين على الأقل');
                return;
            }
        }

        const newQ = {
            q,
            answer: a,
            options: type === 'choice' ? options : [],
            type,
            section,
            display: '',
            isCustom: true,
            id: this.editingId || Date.now()
        };

        if (this.editingId) {
            const idx = this.customQuestions.findIndex(item => item.id === this.editingId);
            if (idx !== -1) {
                this.customQuestions[idx] = newQ;
            }
            this.editingId = null;
        } else {
            this.customQuestions.push(newQ);
        }

        await this.syncData();
        this.closeModals();
        showToast('✅ تم حفظ السؤال بنجاح');
    }

    async deleteQuestion(id) {
        if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;

        this.customQuestions = this.customQuestions.filter(q => q.id !== id);
        await this.syncData();
        showToast('🗑️ تم الحذف');
    }

    async processBulk() {
        const text = document.getElementById('bulkData').value.trim();
        if (!text) return;

        const lines = text.split('\n');
        let count = 0;

        lines.forEach(line => {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length >= 3) {
                const section = parts[0].includes('section') ? parts[0] : 'sectionF'; // Default to advanced
                const question = parts[1];
                const optPart = parts[2];
                const answer = parts[3] || parts[2]; // If no 4th part, answer is the 3rd

                const options = optPart.includes(',') ? optPart.split(',').map(o => o.trim()) : [];

                this.customQuestions.push({
                    q: question,
                    options: options,
                    answer: answer,
                    type: options.length > 0 ? 'choice' : 'typing',
                    section: section,
                    display: '',
                    isCustom: true,
                    id: Date.now() + Math.random()
                });
                count++;
            }
        });

        if (count > 0) {
            await this.syncData();
            this.closeModals();
            showToast(`✅ تم إضافة ${count} سؤال بنجاح`);
        } else {
            showToast('⚠️ لم يتم العثور على بيانات صالحة. تأكد من استخدام فاصل |');
        }
    }

    async syncData() {
        // Save to local
        localStorage.setItem('englishTest_customQuestions', JSON.stringify(this.customQuestions));

        // Save to Firebase
        if (typeof firebaseManager !== 'undefined') {
            await firebaseManager.saveCustomQuestions(this.customQuestions);
        }

        this.loadAllQuestions();
        this.render();
    }
}

// Global instance
const adminQM = new AdminQuestionManager();

// Bridge functions for HTML
function showQuestionManager() {
    if (typeof hideAllAdminSections === 'function') hideAllAdminSections();
    document.getElementById('questionManager').classList.remove('hidden');
    adminQM.loadAllQuestions();
    adminQM.render();
}

function filterQuestions() {
    const section = document.getElementById('qLevelFilter').value;
    const query = document.getElementById('qSearchInput').value;
    adminQM.setSection(section);
    adminQM.setSearch(query);
}

function openAddQuestionModal() { adminQM.openAddModal(); }
function openBulkAddModal() { adminQM.openBulkModal(); }
function closeAdminModals() { adminQM.closeModals(); }
function saveNewQuestion() { adminQM.saveQuestion(); }
function processBulkAdd() { adminQM.processBulk(); }
function quickFilterSection(sectionId) {
    showQuestionManager();
    const filterEl = document.getElementById('qLevelFilter');
    if (filterEl) {
        filterEl.value = sectionId;
        filterQuestions();
    }
}
