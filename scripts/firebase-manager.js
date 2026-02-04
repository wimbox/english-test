// Firebase Database Manager
class FirebaseManager {
    constructor() {
        this.db = null;
        this.isOnline = false;
        this.init();
    }

    init() {
        try {
            if (typeof firebase !== 'undefined' && firebaseConfig) {
                firebase.initializeApp(firebaseConfig);
                this.db = firebase.database();
                this.isOnline = true;
                console.log('✅ Firebase connected successfully');

                // Listen for connection changes
                firebase.database().ref('.info/connected').on('value', (snapshot) => {
                    this.isOnline = snapshot.val() === true;
                    this.updateStatusUI();
                    if (this.isOnline) {
                        console.log('🌐 Firebase online');
                        this.syncFromCloud();
                    } else {
                        console.log('📴 Firebase offline - using localStorage');
                    }
                });
            }
        } catch (error) {
            console.warn('⚠️ Firebase initialization failed, using localStorage only:', error);
            this.isOnline = false;
            this.updateStatusUI();
        }
    }

    updateStatusUI() {
        const statuses = ['syncStatus', 'adminSyncStatus'];
        statuses.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (this.isOnline) {
                    el.style.background = 'rgba(56, 239, 125, 0.1)';
                    el.style.color = '#38ef7d';
                    el.innerHTML = '<span class="w-2 h-2 rounded-full bg-green-500"></span> متصل بالسحابة ☁️';
                } else {
                    el.style.background = 'rgba(244, 92, 67, 0.1)';
                    el.style.color = '#f45c43';
                    el.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> غير متصل';
                }
            }
        });
    }

    // Save records to cloud
    async saveRecords(records) {
        if (!this.isOnline || !this.db) {
            console.log('Using localStorage only');
            return;
        }

        try {
            await this.db.ref('records').set(records);
            console.log('✅ Records synced to cloud');
        } catch (error) {
            console.error('❌ Failed to save to cloud:', error);
        }
    }

    // Save employees to cloud
    async saveEmployees(employees) {
        if (!this.isOnline || !this.db) return;

        try {
            await this.db.ref('employees').set(employees);
            console.log('✅ Employees synced to cloud');
        } catch (error) {
            console.error('❌ Failed to save employees to cloud:', error);
        }
    }

    // Load records from cloud
    async loadRecords() {
        if (!this.isOnline || !this.db) {
            return JSON.parse(localStorage.getItem('englishTest_records')) || [];
        }

        try {
            const snapshot = await this.db.ref('records').once('value');
            const cloudRecords = snapshot.val() || [];
            console.log('✅ Loaded records from cloud');
            return cloudRecords;
        } catch (error) {
            console.error('❌ Failed to load from cloud:', error);
            return JSON.parse(localStorage.getItem('englishTest_records')) || [];
        }
    }

    // Load employees from cloud
    async loadEmployees() {
        if (!this.isOnline || !this.db) {
            return JSON.parse(localStorage.getItem('englishTest_employees')) || defaultEmployees;
        }

        try {
            const snapshot = await this.db.ref('employees').once('value');
            const cloudEmployees = snapshot.val();
            if (cloudEmployees) {
                console.log('✅ Loaded employees from cloud');
                return cloudEmployees;
            }
            return JSON.parse(localStorage.getItem('englishTest_employees')) || defaultEmployees;
        } catch (error) {
            console.error('❌ Failed to load employees from cloud:', error);
            return JSON.parse(localStorage.getItem('englishTest_employees')) || defaultEmployees;
        }
    }

    // Sync from cloud to local
    async syncFromCloud() {
        if (!this.isOnline) return;

        try {
            const cloudRecords = await this.loadRecords();
            const cloudEmployees = await this.loadEmployees();

            // Update local storage
            localStorage.setItem('englishTest_records', JSON.stringify(cloudRecords));
            localStorage.setItem('englishTest_employees', JSON.stringify(cloudEmployees));

            // Update global variables
            allRecords = cloudRecords;
            employees = cloudEmployees;

            console.log('✅ Data synced from cloud to local');
            showToast('تم تحديث البيانات من السحابة ☁️');

            // Refresh UI if function exists
            if (typeof refreshUI === 'function') {
                refreshUI();
            }
        } catch (error) {
            console.error('❌ Sync failed:', error);
        }
    }
}

// Initialize Firebase Manager
const firebaseManager = new FirebaseManager();
