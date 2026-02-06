// Firebase Database Manager
class FirebaseManager {
    constructor() {
        this.db = null;
        this.isOnline = false;
        this.syncQueue = []; // Queue for offline changes
        this.isSyncing = false;
        this.init();
    }

    init() {
        console.log('🔄 Initializing Firebase...');
        try {
            if (typeof firebase !== 'undefined' && typeof firebaseConfig !== 'undefined') {
                if (firebase.apps.length === 0) {
                    firebase.initializeApp(firebaseConfig);
                    console.log('📡 Firebase app initialized');
                }

                this.db = firebase.database();

                // Track connection state
                const connectedRef = this.db.ref('.info/connected');
                connectedRef.on('value', (snapshot) => {
                    const wasAlreadyOnline = this.isOnline;
                    this.isOnline = snapshot.val() === true;
                    this.updateStatusUI();

                    if (this.isOnline) {
                        console.log('🌐 Firebase Cloud: Online & Syncing');
                        // If we just reconnected, try to process any queued updates
                        if (!wasAlreadyOnline) {
                            this.processSyncQueue();
                            // Optional: Pull latest data effectively
                            // this.syncFromCloud(); 
                        }
                    } else {
                        console.warn('📴 Firebase Cloud: Disconnected/Offline');
                    }
                });
            } else {
                console.error('❌ Firebase SDK or Config missing in index.html');
                this.isOnline = false;
                this.updateStatusUI();
            }
        } catch (error) {
            console.error('⚠️ Firebase connection error:', error);
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

    addToQueue(operation, data) {
        this.syncQueue.push({ operation, data, timestamp: Date.now() });
        this.processSyncQueue();
    }

    async processSyncQueue() {
        if (!this.isOnline || this.isSyncing || this.syncQueue.length === 0) return;

        this.isSyncing = true;
        const task = this.syncQueue[0]; // Peek

        try {
            if (task.operation === 'saveRecords') await this.db.ref('records').set(task.data);
            if (task.operation === 'saveEmployees') await this.db.ref('employees').set(task.data);
            if (task.operation === 'saveCustomQuestions') await this.db.ref('custom_questions').set(task.data);
            if (task.operation === 'saveBackup') await this.db.ref('backups/' + task.data.id).set(task.data.payload);

            console.log(`✅ Queue task ${task.operation} completed`);
            this.syncQueue.shift(); // Remove on success
            this.processSyncQueue(); // Next
        } catch (error) {
            console.error(`❌ Queue task ${task.operation} failed`, error);
            // Keep in queue to retry later
        } finally {
            this.isSyncing = false;
        }
    }

    // Save records to cloud (with queue support)
    async saveRecords(records) {
        if (!this.db) return;
        if (!this.isOnline) {
            console.log('⚠️ Offline: Queuing records save');
            this.addToQueue('saveRecords', records);
            return;
        }

        try {
            await this.db.ref('records').set(records);
            console.log('✅ Records synced to cloud (Direct)');
        } catch (error) {
            console.error('❌ Failed to save to cloud, queuing...', error);
            this.addToQueue('saveRecords', records);
        }
    }

    // Save employees to cloud
    async saveEmployees(employees) {
        if (!this.db) return;
        if (!this.isOnline) {
            this.addToQueue('saveEmployees', employees);
            return;
        }

        try {
            await this.db.ref('employees').set(employees);
            console.log('✅ Employees synced to cloud (Direct)');
        } catch (error) {
            this.addToQueue('saveEmployees', employees);
        }
    }

    // Save custom questions
    async saveCustomQuestions(questions) {
        if (!this.db) return;
        if (!this.isOnline) {
            this.addToQueue('saveCustomQuestions', questions);
            return;
        }

        try {
            await this.db.ref('custom_questions').set(questions);
            console.log('✅ Custom questions synced to cloud (Direct)');
        } catch (error) {
            this.addToQueue('saveCustomQuestions', questions);
        }
    }

    // NEW: Full System Cloud Backup
    async pushFullBackup(fullBackupData) {
        if (!this.db) return;
        const backupId = new Date().toISOString().replace(/[:.]/g, '-');
        const payload = {
            id: backupId,
            timestamp: Date.now(),
            data: fullBackupData
        };

        if (this.isOnline) {
            try {
                // Keep only last 5 backups to save space? Or just push.
                // For now, simple push.
                await this.db.ref(`backups/${backupId}`).set(payload);
                console.log('☁️ Full Cloud Backup Success!');
                if (typeof showToast === 'function') showToast('✅ تم حفظ نسخة احتياطية على السحابة');
            } catch (e) {
                console.error('Cloud Backup Failed', e);
                this.addToQueue('saveBackup', { id: backupId, payload });
            }
        } else {
            this.addToQueue('saveBackup', { id: backupId, payload });
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
            return JSON.parse(localStorage.getItem('englishTest_employees')) || {};
        }

        try {
            const snapshot = await this.db.ref('employees').once('value');
            const cloudEmployees = snapshot.val();
            if (cloudEmployees) {
                console.log('✅ Loaded employees from cloud');
                return cloudEmployees;
            }
            return JSON.parse(localStorage.getItem('englishTest_employees')) || {};
        } catch (error) {
            console.error('❌ Failed to load employees from cloud:', error);
            return JSON.parse(localStorage.getItem('englishTest_employees')) || {};
        }
    }

    // Load custom questions from cloud
    async loadCustomQuestions() {
        if (!this.isOnline || !this.db) {
            return JSON.parse(localStorage.getItem('englishTest_customQuestions')) || [];
        }
        try {
            const snapshot = await this.db.ref('custom_questions').once('value');
            const data = snapshot.val() || [];
            console.log('✅ Loaded custom questions from cloud');
            return data;
        } catch (error) {
            console.error('❌ Failed to load custom questions:', error);
            return JSON.parse(localStorage.getItem('englishTest_customQuestions')) || [];
        }
    }

    // Sync from cloud to local
    async syncFromCloud() {
        if (!this.isOnline) return;

        try {
            const cloudRecords = await this.loadRecords();
            const cloudEmployees = await this.loadEmployees();
            const cloudCustomQuestions = await this.loadCustomQuestions();

            // Check if cloud has data before overwriting local completely
            // Simple strategy: If cloud has data, it wins.
            if (cloudRecords && cloudRecords.length > 0) {
                localStorage.setItem('englishTest_records', JSON.stringify(cloudRecords));
                if (typeof allRecords !== 'undefined') allRecords = cloudRecords;
            }

            if (cloudEmployees && Object.keys(cloudEmployees).length > 0) {
                localStorage.setItem('englishTest_employees', JSON.stringify(cloudEmployees));
                if (typeof employees !== 'undefined') employees = cloudEmployees;
            }

            if (cloudCustomQuestions && cloudCustomQuestions.length > 0) {
                localStorage.setItem('englishTest_customQuestions', JSON.stringify(cloudCustomQuestions));
                if (typeof adminQM !== 'undefined') {
                    adminQM.customQuestions = cloudCustomQuestions;
                    adminQM.loadAllQuestions();
                }
            }

            console.log('✅ Data synced from cloud to local');
            if (typeof showToast === 'function') showToast('تم تحديث البيانات من السحابة ☁️');

            // Refresh UI if function exists
            if (typeof refreshUI === 'function') refreshUI();

        } catch (error) {
            console.error('❌ Sync failed:', error);
        }
    }

    async manualSync() {
        if (!this.isOnline) {
            if (typeof showToast === 'function') showToast('لا يمكن المزامنة: أنت غير متصل بالسحابة ⚠️');
            return;
        }

        if (typeof showToast === 'function') showToast('جاري بدء المزامنة اليدوية... 🔄');
        await this.syncFromCloud();
    }
}

// Initialize Firebase Manager
const firebaseManager = new FirebaseManager();
