// Export and Backup Manager
// ميزات التصدير والنسخ الاحتياطي

class ExportManager {

    // تصدير السجلات إلى ملف Excel (CSV)
    exportToExcel() {
        const records = JSON.parse(localStorage.getItem('englishTest_records')) || [];

        if (records.length === 0) {
            showToast('لا توجد سجلات للتصدير 📭');
            return;
        }

        // إنشاء رأس الجدول
        const headers = [
            'رقم الملف',
            'اسم الطالب',
            'العمر',
            'الموظف',
            'الدرجة الكلية',
            'الحروف والصوتيات',
            'النطق',
            'الاستماع',
            'القراءة',
            'الكتابة',
            'المفردات والقواعد',
            'المستوى',
            'المنهج',
            'التاريخ'
        ];

        // تحويل السجلات إلى صفوف
        const rows = records.map(r => [
            r.file_number,
            r.student_name,
            r.age,
            r.employee_id,
            r.total_score,
            r.section_a_score || 0,
            r.section_b_score || 0,
            r.section_c_score || 0,
            r.section_d_score || 0,
            r.section_e_score || 0,
            r.section_f_score || 0,
            r.level,
            r.curriculum,
            r.test_date
        ]);

        // إنشاء محتوى CSV مع دعم UTF-8 للعربية
        const BOM = '\uFEFF'; // للتعامل مع الحروف العربية في Excel
        let csvContent = BOM + headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        // تحميل الملف
        this.downloadFile(csvContent, 'سجلات_الاختبارات.csv', 'text/csv;charset=utf-8');
        showToast('تم تصدير السجلات بنجاح 📊');
    }

    // تصدير السجلات إلى JSON
    exportToJSON() {
        const data = {
            exportDate: new Date().toISOString(),
            records: JSON.parse(localStorage.getItem('englishTest_records')) || [],
            employees: JSON.parse(localStorage.getItem('englishTest_employees')) || {}
        };

        if (data.records.length === 0) {
            showToast('لا توجد بيانات للتصدير 📭');
            return;
        }

        const jsonContent = JSON.stringify(data, null, 2);
        this.downloadFile(jsonContent, 'نسخة_احتياطية.json', 'application/json');
        showToast('تم إنشاء النسخة الاحتياطية بنجاح 💾');
    }

    // إنشاء نسخة احتياطية كاملة
    createBackup() {
        const backup = {
            version: '1.0',
            createdAt: new Date().toISOString(),
            data: {
                records: JSON.parse(localStorage.getItem('englishTest_records')) || [],
                employees: JSON.parse(localStorage.getItem('englishTest_employees')) || {}
            }
        };

        const jsonContent = JSON.stringify(backup, null, 2);
        const date = new Date().toLocaleDateString('ar-EG').replace(/\//g, '-');
        this.downloadFile(jsonContent, `نسخة_احتياطية_${date}.json`, 'application/json');
        showToast('تم إنشاء النسخة الاحتياطية بنجاح 💾');
    }

    // استعادة من نسخة احتياطية
    restoreFromBackup(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);

                // التحقق من صحة الملف
                if (!backup.data || (!backup.data.records && !backup.data.employees)) {
                    // محاولة قراءة التنسيق القديم
                    if (backup.records) {
                        localStorage.setItem('englishTest_records', JSON.stringify(backup.records));
                        if (backup.employees) {
                            localStorage.setItem('englishTest_employees', JSON.stringify(backup.employees));
                        }
                    } else {
                        throw new Error('ملف غير صالح');
                    }
                } else {
                    // التنسيق الجديد
                    if (backup.data.records) {
                        localStorage.setItem('englishTest_records', JSON.stringify(backup.data.records));
                    }
                    if (backup.data.employees) {
                        localStorage.setItem('englishTest_employees', JSON.stringify(backup.data.employees));
                    }
                }

                showToast('تم استعادة البيانات بنجاح! سيتم تحديث الصفحة... ✅');

                // تحديث الصفحة بعد ثانيتين
                setTimeout(() => {
                    window.location.reload();
                }, 2000);

            } catch (error) {
                console.error('Restore error:', error);
                showToast('فشل في قراءة ملف النسخة الاحتياطية ❌');
            }
        };

        reader.onerror = () => {
            showToast('فشل في قراءة الملف ❌');
        };

        reader.readAsText(file);
    }

    // دالة مساعدة لتحميل الملفات
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

    // فتح نافذة اختيار ملف للاستعادة
    openRestoreDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.restoreFromBackup(file);
            }
        };
        input.click();
    }
}

// إنشاء مدير التصدير
const exportManager = new ExportManager();

// دوال مختصرة للاستخدام السريع
function exportToExcel() {
    exportManager.exportToExcel();
}

function exportToJSON() {
    exportManager.exportToJSON();
}

function createBackup() {
    exportManager.createBackup();
}

function restoreBackup() {
    exportManager.openRestoreDialog();
}
