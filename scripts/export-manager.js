class ExportManager {

    // 1. Full Master Backup (JSON) - Everything included
    exportFullSystem() {
        const fullBackup = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            data: {
                records: JSON.parse(localStorage.getItem('englishTest_records')) || [],
                employees: JSON.parse(localStorage.getItem('englishTest_employees')) || {},
                customQuestions: JSON.parse(localStorage.getItem('englishTest_customQuestions')) || [],
                supervisorPass: localStorage.getItem('englishTest_supervisorPass') || '1357'
            }
        };

        const jsonContent = JSON.stringify(fullBackup, null, 2);
        const date = new Date().toLocaleDateString('ar-EG').replace(/\//g, '-');

        // 1. Local Download
        this.downloadFile(jsonContent, `نسخة_احتياطية_شاملة_${date}.json`, 'application/json');

        // 2. Cloud Backup (Auto-Push)
        if (typeof firebaseManager !== 'undefined') {
            firebaseManager.pushFullBackup(fullBackup);
        }

        if (typeof showToast === 'function') showToast('✅ تم إنشاء النسخة الاحتياطية (محلي + سحابي)');
    }

    // 2. Export Records to Excel (CSV)
    exportToExcel() {
        const records = JSON.parse(localStorage.getItem('englishTest_records')) || [];
        if (records.length === 0) {
            if (typeof showToast === 'function') showToast('⚠️ لا توجد سجلات للتصدير');
            return;
        }

        const headers = ['رقم الملف', 'اسم الطالب', 'العمر', 'الموظف', 'الدرجة', 'المستوى', 'المنهج', 'التاريخ'];
        const rows = records.map(r => [
            r.file_number, r.student_name, r.age, r.employee_id,
            r.total_score, r.level, r.curriculum, r.test_date
        ]);

        const BOM = '\uFEFF';
        let csvContent = BOM + headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        this.downloadFile(csvContent, 'سجلات_الطلاب.csv', 'text/csv;charset=utf-8');
        if (typeof showToast === 'function') showToast('📊 تم تصدير السجلات إلى Excel');
    }

    // 3. Restore Everything from Backup
    restoreFullSystem(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);
                let restoredCount = 0;

                // Priority 1: Format v2.0 (Full System)
                if (backup.version === '2.0' && backup.data) {
                    const d = backup.data;
                    if (d.records) localStorage.setItem('englishTest_records', JSON.stringify(d.records));
                    if (d.employees) localStorage.setItem('englishTest_employees', JSON.stringify(d.employees));
                    if (d.customQuestions) localStorage.setItem('englishTest_customQuestions', JSON.stringify(d.customQuestions));
                    if (d.supervisorPass) localStorage.setItem('englishTest_supervisorPass', d.supervisorPass);
                    restoredCount = d.records ? d.records.length : 0;
                }
                // Priority 2: Legacy Formats (Records Only)
                else {
                    const records = backup.records || (backup.data && backup.data.records) || (Array.isArray(backup) ? backup : null);
                    if (records) {
                        localStorage.setItem('englishTest_records', JSON.stringify(records));
                        restoredCount = records.length;
                    } else {
                        throw new Error('Unsupported format');
                    }
                }

                if (typeof showToast === 'function') {
                    showToast(`✅ تم استعادة ${restoredCount} سجل والبيانات بنجاح! جاري التحديث...`);
                }

                setTimeout(() => window.location.reload(), 1500);

            } catch (error) {
                console.error('Restore error:', error);
                if (typeof showToast === 'function') showToast('❌ فشل الاستعادة: الملف غير صالح أو تالف');
            }
        };

        reader.readAsText(file);
    }

    // Helper: Download File
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Trigger Import Dialog
    triggerImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file && confirm('⚠️ تنبيه: سيتم استبدال جميع البيانات الحالية ببيانات النسخة الاحتياطية. هل أنت متأكد؟')) {
                this.restoreFullSystem(file);
            }
        };
        input.click();
    }
}

// Global instance
const exportManager = new ExportManager();

// Bridge functions for UI
function exportFullBackup() { exportManager.exportFullSystem(); }
function importFullBackup() { exportManager.triggerImport(); }
function exportToExcel() { exportManager.exportToExcel(); }

// Legacy aliases for compatibility
function exportData() { exportFullBackup(); }
function triggerImport() { importFullBackup(); }
function createBackup() { exportFullBackup(); }
function restoreBackup() { importFullBackup(); }
