/**
 * App Logic & Navigation Manager
 * Handles authentication, dashboard navigation, and administrative tasks.
 */

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
  const errorEl = document.getElementById('loginError');
  const inputEl = document.getElementById('passwordInput');
  if (errorEl) errorEl.classList.remove('hidden');
  if (inputEl) {
    inputEl.classList.add('shake');
    setTimeout(() => inputEl.classList.remove('shake'), 300);
  }
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

// ==================== NAVIGATION ====================
function showEmployeeDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('employeeDashboard').classList.remove('hidden');
  const nameEl = document.getElementById('employeeName');
  if (nameEl && employees[currentUser]) nameEl.textContent = employees[currentUser].name;
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
    if (empBtn) empBtn.style.display = 'none';
    if (delAllBtn) delAllBtn.style.display = 'none';
  } else {
    if (titleEl) titleEl.innerHTML = 'لوحة المدير 👑';
    if (subTitleEl) subTitleEl.textContent = 'إدارة النظام والسجلات';
    if (empBtn) empBtn.style.display = 'block';
    if (delAllBtn) delAllBtn.style.display = 'flex';
  }

  hideAllAdminSections();
  showStatistics();

  if (typeof adminQM !== 'undefined') {
    adminQM.loadAllQuestions();
  }
}

function hideAllEmployeeSections() {
  document.getElementById('newTestForm').classList.add('hidden');
  document.getElementById('myRecords').classList.add('hidden');
}

function hideAllAdminSections() {
  ['adminRecords', 'employeeSettings', 'statistics', 'adminNewTest', 'questionManager'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
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
  if (typeof populateMonthFilter === 'function') populateMonthFilter();
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
              <button onclick="viewRecord(${originalIndex})" title="عرض الشهادة" class="hover:scale-110 transition text-lg">📄</button>
              <button onclick="deleteRecord(this, ${originalIndex})" title="حذف" style="color: #f45c43;" class="hover:scale-110 transition text-lg">🗑️</button>
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
  const scores = {
    sectionA: record.section_a_score || 0,
    sectionB: record.section_b_score || 0,
    sectionC: record.section_c_score || 0,
    sectionD: record.section_d_score || 0,
    sectionE: record.section_e_score || 0,
    sectionF: record.section_f_score || 0,
    total: record.total_score || 0
  };
  document.getElementById('adminDashboard').classList.add('hidden');
  document.getElementById('employeeDashboard').classList.add('hidden');
  document.getElementById('resultsScreen').classList.remove('hidden');
  showResults(record, scores);
}

function deleteRecord(btn, index) {
  if (!isAdmin && !isSupervisor) {
    showToast('🚫 عفواً، لا تمتلك صلاحية الحذف.');
    playWrongSound();
    return;
  }
  const recordRow = btn.closest('tr');
  recordRow.innerHTML = `
    <td colspan="9" class="p-4 text-center">
      <div class="flex items-center justify-center gap-4">
        <span class="font-bold" style="color: var(--text-primary);">هل أنت متأكد من حذف هذا السجل؟</span>
        <button onclick="confirmDelete(${index})" class="btn-danger px-4 py-2 rounded-lg font-semibold text-sm">نعم، احذف 🗑️</button>
        <button onclick="cancelDelete()" class="px-4 py-2 rounded-lg font-semibold text-sm" style="background: var(--bg-card); border: 2px solid var(--border-color);">إلغاء</button>
      </div>
    </td>
  `;
}

function confirmDelete(index) {
  if (index >= 0 && index < allRecords.length) {
    allRecords.splice(index, 1);
    localStorage.setItem('englishTest_records', JSON.stringify(allRecords));
    if (typeof firebaseManager !== 'undefined') firebaseManager.saveRecords(allRecords);
    renderAllRecords();
    renderStatistics();
    showToast('تم حذف السجل بنجاح ✅');
  } else {
    showToast('❌ حدث خطأ أثناء الحذف: السجل غير موجود');
    renderAllRecords();
  }
}

function cancelDelete() {
  renderAllRecords();
}

function deleteAllRecords() {
  if (!isAdmin && !isSupervisor) {
    showToast('🚫 عفواً، لا تمتلك صلاحية الحذف.');
    return;
  }
  if (allRecords.length === 0) {
    showToast('لا توجد سجلات لحذفها 📥');
    return;
  }
  if (confirm('⚠️ تنبيه هام: هل أنت متأكد من حذف "جميع السجلات" نهائياً؟')) {
    allRecords = [];
    localStorage.setItem('englishTest_records', JSON.stringify(allRecords));
    if (typeof firebaseManager !== 'undefined') firebaseManager.saveRecords(allRecords);
    renderAllRecords();
    renderStatistics();
    showToast('تم حذف جميع السجلات بنجاح ✅');
  }
}

// ==================== EMPLOYEE SETTINGS ====================
function renderEmployeeSettings() {
  const container = document.getElementById('employeeList');
  const allAccounts = { ...employees, 'supervisor': { name: 'المحاسب المالى 💰', password: SUPERVISOR_PASSWORD } };
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
        <button onclick="saveEmployee('${id}')" class="btn-primary w-full py-2 rounded-lg font-semibold text-sm hover:scale-105 transition">حفظ التغييرات ✅</button>
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
  if (typeof firebaseManager !== 'undefined') {
    if (id !== 'supervisor') firebaseManager.saveEmployees(employees);
  }
  showToast(`تم حفظ بيانات ${name} بنجاح ✅`);
  if (typeof populateAllEmployeeDropdowns === 'function') populateAllEmployeeDropdowns();
}

// ==================== STATISTICS ====================
function renderStatistics() {
  const container = document.getElementById('statsContent');
  const totalTests = allRecords.length;
  if (totalTests === 0) {
    container.innerHTML = `<div class="col-span-full text-center py-8 text-gray-500">لا توجد بيانات كافية للتحليل 📊</div>`;
    return;
  }
  const avgScore = Math.round(allRecords.reduce((sum, r) => sum + r.total_score, 0) / totalTests);
  const passCount = allRecords.filter(r => r.total_score >= 50).length;
  const passRate = Math.round((passCount / totalTests) * 100);
  const employeeCounts = {};
  allRecords.forEach(r => {
    const name = employees[r.employee_id]?.name || r.employee_id;
    employeeCounts[name] = (employeeCounts[name] || 0) + 1;
  });
  let topEmpName = '-';
  let topEmpCount = 0;
  Object.entries(employeeCounts).forEach(([name, count]) => { if (count > topEmpCount) { topEmpCount = count; topEmpName = name; } });
  const levelCounts = {};
  allRecords.forEach(r => { levelCounts[r.level] = (levelCounts[r.level] || 0) + 1; });

  container.innerHTML = `
    <div class="rounded-xl p-4 text-center bg-white shadow-sm border border-indigo-100 relative overflow-hidden group">
      <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
      <p class="text-3xl font-bold text-indigo-600 mb-1">${totalTests}</p>
      <p class="text-xs text-gray-500 font-semibold">إجمالي الاختبارات</p>
    </div>
    <div class="rounded-xl p-4 text-center bg-white shadow-sm border border-emerald-100 relative overflow-hidden group">
      <div class="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
      <p class="text-3xl font-bold text-emerald-600 mb-1">${passRate}%</p>
      <p class="text-xs text-gray-500 font-semibold">نسبة النجاح</p>
    </div>
    <div class="rounded-xl p-4 text-center bg-white shadow-sm border border-amber-100 relative overflow-hidden group">
      <div class="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
      <p class="text-3xl font-bold text-amber-600 mb-1">${avgScore}</p>
      <p class="text-xs text-gray-500 font-semibold">متوسط الدرجات</p>
    </div>
    <div class="rounded-xl p-4 text-center bg-white shadow-sm border border-purple-100 relative overflow-hidden group">
      <div class="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
      <p class="text-sm font-bold text-purple-600 mb-1 truncate px-2">${topEmpName}</p>
      <p class="text-xs text-gray-500 font-semibold">الموظف الأنشط (${topEmpCount})</p>
    </div>
  `;
}

// ==================== FORGOT PASSWORD ====================
function showForgotPassword() { document.getElementById('forgotPasswordModal').classList.remove('hidden'); }
function hideForgotPassword() {
  document.getElementById('forgotPasswordModal').classList.add('hidden');
  document.getElementById('masterKeyInput').value = '';
}
function recoverPassword() {
  const empId = document.getElementById('forgotEmployeeSelect').value;
  const masterKey = document.getElementById('masterKeyInput').value;
  if (!empId) { showToast('الرجاء اختيار الموظف 👤'); return; }
  if (masterKey === ADMIN_PASSWORD) {
    let pass = '';
    if (empId === 'admin') pass = ADMIN_PASSWORD;
    else if (empId === 'supervisor') pass = SUPERVISOR_PASSWORD;
    else if (employees[empId]) pass = employees[empId].password;
    document.getElementById('recoveredPasswordText').textContent = pass;
    document.getElementById('recoveredPassword').classList.remove('hidden');
    document.getElementById('recoveryError').classList.add('hidden');
  } else {
    document.getElementById('recoveredPassword').classList.add('hidden');
  }
}

// ==================== SESSION NAVIGATION ====================
function backToDashboard() {
  document.getElementById('resultsScreen').classList.add('hidden');
  document.getElementById('timer')?.classList.remove('timer-warning');

  // Clear inputs
  ['studentName', 'studentAge', 'adminStudentName', 'adminStudentAge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  if (isAdmin || isSupervisor) {
    showAdminDashboard();
  } else {
    showEmployeeDashboard();
  }
}


