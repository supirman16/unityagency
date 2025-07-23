import { handleLogin, handleLogout } from './auth.js';
import { fetchData } from './api.js';
import { setupUIForRole, showSection, getFirstVisibleSection, applyTheme, showNotification, showButtonLoader, hideButtonLoader, openSettingsModal, openRekapModal, openHostModal, openTiktokModal, openUserModal, openDetailRekapModal, handleEditHost, handleEditTiktok, handleEditRekap, handleEditUser, handleDeleteHost, handleDeleteTiktok, handleDeleteRekap, handleDeleteUser, setupRekapFilters, setupAnalysisFilters } from './ui.js';
import { renderHostTable, renderTiktokTable, renderUserTable, renderRekapTable, updateKPIs, updatePerformanceChart, populateHostDropdowns, populateTiktokDropdowns, renderAnalysisView } from './render.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// --- KONEKSI KE SUPABASE ---
const supabaseUrl = 'https://zorudwncbfietuzxrerd.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvcnVkd25jYmZpZXR1enhyZXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NzMzNTUsImV4cCI6MjA2ODI0OTM1NX0.d6YJ8qj3Uegmei6ip52fQ0gnjJltqVDlrlbu6VXk7Ks'; 
export const supabaseClient = createClient(supabaseUrl, supabaseKey);

// --- GLOBAL STATE ---
export let state = {
    currentUser: null,
    hosts: [],
    tiktokAccounts: [],
    rekapLive: [],
    users: [],
    itemToDelete: { id: null, type: '' },
    parsedCsvData: [],
    sortState: {
        hosts: { key: 'nama_host', direction: 'asc' },
        tiktok: { key: 'username', direction: 'asc' },
        rekap: { key: 'tanggal_live', direction: 'desc' },
        users: { key: 'email', direction: 'asc' }
    },
    performanceChart: null,
    hostMenuAccess: {
        dashboard: true,
        analysis: true,
        rekap: true,
    }
};

async function refreshDataAndRender() {
    await fetchData();
    // Re-render all components that might have changed
    renderHostTable();
    renderTiktokTable();
    renderUserTable();
    renderRekapTable();
    updateKPIs();
    updatePerformanceChart();
    
    // Re-populate dropdowns in case data changed (e.g., new host added)
    populateHostDropdowns(document.getElementById('rekap-host'));
    populateTiktokDropdowns(document.getElementById('rekap-tiktok-account'));
    populateHostDropdowns(document.getElementById('user-host-link'));

    // Re-populate profile form if the user is a host
    if (state.currentUser.user_metadata?.role === 'host') {
        const hostData = state.hosts.find(h => h.id === state.currentUser.user_metadata.host_id);
        if (hostData) {
            document.getElementById('profile-nama').value = hostData.nama_host || '';
            document.getElementById('profile-telepon').value = hostData.nomor_telepon || '';
            document.getElementById('profile-alamat').value = hostData.alamat || '';
            document.getElementById('profile-bank').value = hostData.nama_bank || '';
            document.getElementById('profile-rekening').value = hostData.nomor_rekening || '';
        }
    }
}

function setupEventListeners() {
    const loginForm = document.getElementById('login-form');
    const btnLogout = document.getElementById('btn-logout');
    const btnSettings = document.getElementById('btn-settings');
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    const btnAddRekap = document.getElementById('btn-add-rekap');
    const btnAddHost = document.getElementById('btn-add-host');
    const btnAddTiktok = document.getElementById('btn-add-tiktok');
    const btnAddUser = document.getElementById('btn-add-user');
    const btnImportCsv = document.getElementById('btn-import-csv');
    const btnCancelHost = document.getElementById('btn-cancel-host');
    const btnCancelTiktok = document.getElementById('btn-cancel-tiktok');
    const btnCancelRekap = document.getElementById('btn-cancel-rekap');
    const btnCancelUser = document.getElementById('btn-cancel-user');
    const btnCancelImport = document.getElementById('btn-cancel-import');
    const btnCloseRekapDetail = document.getElementById('btn-close-rekap-detail');
    const btnCancelSettings = document.getElementById('btn-cancel-settings');
    const btnConfirmCancel = document.getElementById('btn-confirm-cancel');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    const formHost = document.getElementById('form-host');
    const formTiktok = document.getElementById('form-tiktok');
    const formRekap = document.getElementById('form-rekap');
    const formUser = document.getElementById('form-user');
    const formImportCsv = document.getElementById('form-import-csv');
    const formSettings = document.getElementById('form-settings');
    const btnGenerateAnalysis = document.getElementById('btn-generate-analysis');
    const formProfile = document.getElementById('form-profile');
    const navLinks = {
        dashboard: document.getElementById('nav-dashboard'),
        analysis: document.getElementById('nav-analysis'),
        hosts: document.getElementById('nav-hosts'),
        tiktok: document.getElementById('nav-tiktok'),
        rekap: document.getElementById('nav-rekap'),
        users: document.getElementById('nav-users'),
        profile: document.getElementById('nav-profile'),
    };

    loginForm.addEventListener('submit', handleLogin);
    btnLogout.addEventListener('click', handleLogout);
    btnSettings.addEventListener('click', openSettingsModal);
    btnThemeToggle.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
        applyTheme(currentTheme);
    });
    Object.keys(navLinks).forEach(key => navLinks[key].addEventListener('click', () => showSection(key)));
    document.getElementById('chart-metric-selector').addEventListener('change', (e) => updatePerformanceChart(e.target.value));
    
    btnAddRekap.addEventListener('click', () => openRekapModal());

    btnAddHost.addEventListener('click', () => openHostModal());
    btnAddTiktok.addEventListener('click', () => openTiktokModal());
    btnAddUser.addEventListener('click', () => openUserModal());
    btnImportCsv.addEventListener('click', () => document.getElementById('modal-import-csv').classList.remove('hidden'));
    btnCancelHost.addEventListener('click', () => document.getElementById('modal-host').classList.add('hidden'));
    btnCancelTiktok.addEventListener('click', () => document.getElementById('modal-tiktok').classList.add('hidden'));
    btnCancelRekap.addEventListener('click', () => document.getElementById('modal-rekap').classList.add('hidden'));
    btnCancelUser.addEventListener('click', () => document.getElementById('modal-user').classList.add('hidden'));
    btnCancelImport.addEventListener('click', () => document.getElementById('modal-import-csv').classList.add('hidden'));
    btnCloseRekapDetail.addEventListener('click', () => document.getElementById('modal-rekap-detail').classList.add('hidden'));
    btnCancelSettings.addEventListener('click', () => document.getElementById('modal-settings').classList.add('hidden'));
    btnConfirmCancel.addEventListener('click', () => {
        state.itemToDelete = { id: null, type: '' };
        document.getElementById('modal-confirm').classList.add('hidden');
    });
    btnConfirmDelete.addEventListener('click', async (e) => {
        const button = e.currentTarget;
        showButtonLoader(button);
        if (!state.itemToDelete.id) return;
        let error;
        try {
            if (state.itemToDelete.type === 'host') {
                ({ error } = await supabaseClient.from('hosts').delete().eq('id', state.itemToDelete.id));
            } else if (state.itemToDelete.type === 'rekap') {
                ({ error } = await supabaseClient.from('rekap_live').delete().eq('id', state.itemToDelete.id));
            } else if (state.itemToDelete.type === 'tiktok') {
                ({ error } = await supabaseClient.from('tiktok_accounts').delete().eq('id', state.itemToDelete.id));
            } else if (state.itemToDelete.type === 'user') {
                ({ data, error } = await supabaseClient.functions.invoke('delete-user', {
                    body: { userId: state.itemToDelete.id }
                }));
            }
            if (error) throw error;
            state.itemToDelete = { id: null, type: '' };
            document.getElementById('modal-confirm').classList.add('hidden');
            showNotification('Data berhasil dihapus.');
            await refreshDataAndRender();
        } catch (err) {
            showNotification(`Error: ${err.message}`, true);
        } finally {
            hideButtonLoader(button);
        }
    });
    
    document.getElementById('host-table-body').addEventListener('click', (event) => {
        const target = event.target;
        const row = target.closest('tr');
        if (!row) return;
        const hostId = parseInt(row.querySelector('.btn-edit-host')?.dataset.id);
        if (target.matches('.btn-edit-host')) {
            handleEditHost(hostId);
        } else if (target.matches('.btn-delete-host')) {
            handleDeleteHost(hostId);
        }
    });

    document.getElementById('tiktok-table-body').addEventListener('click', (event) => {
        const target = event.target;
        const row = target.closest('tr');
        if (!row) return;
        const tiktokId = parseInt(row.querySelector('.btn-edit-tiktok')?.dataset.id);
        if (target.matches('.btn-edit-tiktok')) {
            handleEditTiktok(tiktokId);
        } else if (target.matches('.btn-delete-tiktok')) {
            handleDeleteTiktok(tiktokId);
        }
    });
    
    document.getElementById('user-table-body').addEventListener('click', (event) => {
        const target = event.target;
        const row = target.closest('tr');
        if (!row) return;
        const userId = row.querySelector('.btn-edit-user')?.dataset.id;
        if (target.matches('.btn-edit-user')) {
            handleEditUser(userId);
        } else if (target.matches('.btn-delete-user')) {
            handleDeleteUser(userId);
        }
    });

    document.getElementById('rekap-table-body').addEventListener('click', (event) => {
        const target = event.target;
        const row = target.closest('tr[data-rekap-id]');
        if (!row) return;
        const rekapId = parseInt(row.dataset.rekapId);
        if (target.matches('.btn-edit-rekap')) {
            event.stopPropagation();
            handleEditRekap(rekapId);
        } else if (target.matches('.btn-delete-rekap')) {
            event.stopPropagation();
            handleDeleteRekap(rekapId);
        } else {
            openDetailRekapModal(rekapId);
        }
    });


    formHost.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = e.submitter;
        showButtonLoader(button);
        const hostId = parseInt(document.getElementById('host-id').value);
        const hostData = {
            nama_host: document.getElementById('host-nama').value,
            platform: document.getElementById('host-platform').value,
            tanggal_bergabung: document.getElementById('host-gabung').value,
            status: document.getElementById('host-status').value,
        };
        let error;
        try {
            if (hostId) {
                ({ error } = await supabaseClient.from('hosts').update(hostData).eq('id', hostId));
            } else {
                ({ error } = await supabaseClient.from('hosts').insert(hostData));
            }
            if (error) throw error;
            document.getElementById('modal-host').classList.add('hidden');
            showNotification('Data host berhasil disimpan.');
            await refreshDataAndRender();
        } catch(err) {
            showNotification(err.message, true);
        } finally {
            hideButtonLoader(button);
        }
    });
    
    formTiktok.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = e.submitter;
        showButtonLoader(button);
        const tiktokId = parseInt(document.getElementById('tiktok-id').value);
        const tiktokData = {
            username: document.getElementById('tiktok-username').value,
            status: document.getElementById('tiktok-status').value,
        };
        let error;
        try {
            if (tiktokId) {
                ({ error } = await supabaseClient.from('tiktok_accounts').update(tiktokData).eq('id', tiktokId));
            } else {
                ({ error } = await supabaseClient.from('tiktok_accounts').insert(tiktokData));
            }
            if (error) throw error;
            document.getElementById('modal-tiktok').classList.add('hidden');
            showNotification('Akun TikTok berhasil disimpan.');
            await refreshDataAndRender();
        } catch (err) {
            showNotification(err.message, true);
        } finally {
            hideButtonLoader(button);
        }
    });
    
    formUser.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = e.submitter;
        showButtonLoader(button);
        const originalUserId = document.getElementById('user-id').value;
        const email = document.getElementById('user-email').value;
        const password = document.getElementById('user-password').value;
        const role = document.getElementById('user-role').value;
        const hostId = role === 'host' ? parseInt(document.getElementById('user-host-link').value) : null;
        
        try {
            if (originalUserId) {
                const { data, error } = await supabaseClient.functions.invoke('update-user-role', {
                    body: { userId: originalUserId, role, host_id: hostId }
                });
                if (error) throw error;
                if (password) {
                    const { error: passwordError } = await supabaseClient.functions.invoke('update-user-password', {
                        body: { userId: originalUserId, password: password }
                    });
                    if (passwordError) throw passwordError;
                }
                showNotification(`Pengguna ${email} berhasil diperbarui.`);
            } else {
                if (!password) throw new Error('Password wajib diisi untuk pengguna baru.');
                const { data, error } = await supabaseClient.functions.invoke('create-user-with-role', {
                    body: { email, password, role, host_id: hostId }
                });
                if (error) throw error;
                showNotification(`Pengguna ${email} berhasil dibuat.`);
            }
            document.getElementById('modal-user').classList.add('hidden');
            await refreshDataAndRender();
        } catch (err) {
            showNotification(`Error: ${err.message}`, true);
        } finally {
            hideButtonLoader(button);
        }
    });

    document.getElementById('user-role').addEventListener('change', (e) => {
         const hostLinkContainer = document.getElementById('user-host-link-container');
         if (e.target.value === 'host') {
             hostLinkContainer.classList.remove('hidden');
         } else {
             hostLinkContainer.classList.add('hidden');
         }
    });
    
    formRekap.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = e.submitter;
        showButtonLoader(button);
        const rekapId = parseInt(document.getElementById('rekap-id').value);
        const dateString = document.getElementById('rekap-tanggal').value;
        const startTimeString = document.getElementById('rekap-mulai').value;
        const endTimeString = document.getElementById('rekap-selesai').value;

        const startDateTime = new Date(`${dateString}T${startTimeString}`);
        const endDateTime = new Date(`${dateString}T${endTimeString}`);

        if (endDateTime <= startDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 1);
        }

        const duration = Math.round((endDateTime - startDateTime) / (1000 * 60));

        const rekapData = {
            host_id: parseInt(document.getElementById('rekap-host').value),
            tiktok_account_id: parseInt(document.getElementById('rekap-tiktok-account').value),
            tanggal_live: dateString,
            waktu_mulai: startTimeString,
            waktu_selesai: endTimeString,
            durasi_menit: duration,
            pendapatan: parseInt(document.getElementById('rekap-pendapatan').value),
            catatan: document.getElementById('rekap-catatan').value,
        };
        
        let error;
        try {
            if (rekapId) {
                ({ error } = await supabaseClient.from('rekap_live').update(rekapData).eq('id', rekapId));
            } else {
                ({ error } = await supabaseClient.from('rekap_live').insert(rekapData));
            }
            if (error) throw error;
            document.getElementById('modal-rekap').classList.add('hidden');
            showNotification('Data rekap berhasil disimpan.');
            await refreshDataAndRender();
        } catch(err) {
            showNotification(err.message, true);
        } finally {
            hideButtonLoader(button);
        }
    });
    
    formSettings.addEventListener('submit', async (e) => {
        e.preventDefault();
        const settingsData = {
            dashboard: document.getElementById('setting-dashboard').checked,
            analysis: document.getElementById('setting-analysis').checked,
            rekap: document.getElementById('setting-rekap').checked,
        };
        // In a real app, you would save this to a settings table in Supabase.
        // For this simulation, we'll just update the local variable.
        state.hostMenuAccess = settingsData;
        document.getElementById('modal-settings').classList.add('hidden');
        showNotification('Pengaturan akses berhasil disimpan.');
    });
    
    function parseDateFromCSV(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return null;
        const trimmedDate = dateStr.trim();
        // Coba format DD/MM/YYYY
        const parts = trimmedDate.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                // Kembalikan format YYYY-MM-DD yang aman untuk new Date()
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
        }
        // Fallback untuk format lain yang mungkin bisa dipahami new Date()
        if (!isNaN(new Date(trimmedDate).getTime())) {
            return trimmedDate;
        }
        return null; // Kembalikan null jika format tidak dikenali
    }

    formImportCsv.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = e.submitter;
        showButtonLoader(button);
        const fileInput = document.getElementById('csv-file');
        const file = fileInput.files[0];
        if (!file) {
            showNotification('Silakan pilih file CSV terlebih dahulu.', true);
            hideButtonLoader(button);
            return;
        }

        const previewContainer = document.getElementById('import-preview-container');
        const previewBody = document.getElementById('import-preview-body');
        const confirmButton = document.getElementById('btn-confirm-import');
        previewBody.innerHTML = '';
        previewContainer.classList.remove('hidden');
        confirmButton.classList.add('hidden');
        state.parsedCsvData = [];

        const reader = new FileReader();
        reader.onload = async function(event) {
            const csvData = event.target.result;
            const rows = csvData.split('\n').slice(1);
            let hasValidData = false;

            for (const row of rows) {
                if (!row || row.split(',').length < 6) continue;
                const cols = row.split(',');
                const [date, hostName, tiktokUsername, startTime, endTime, revenue, ...noteParts] = cols;
                
                if (!date || !hostName || !tiktokUsername) {
                    console.warn('Melewatkan baris karena data penting kosong:', row);
                    continue;
                }

                const parsedDate = parseDateFromCSV(date);
                if (!parsedDate) {
                    console.warn(`Melewatkan baris karena format tanggal tidak valid: ${date}`);
                    continue;
                }
                const dateString = new Date(parsedDate).toISOString().split('T')[0];

                const note = noteParts.join(',').replace(/"/g, '');
                
                const host = state.hosts.find(h => h.nama_host.trim().toLowerCase() === hostName.trim().toLowerCase());
                const tiktokAccount = state.tiktokAccounts.find(t => t.username.trim().toLowerCase() === tiktokUsername.trim().toLowerCase());
                
                let status = '<span class="text-green-600 font-semibold">Valid</span>';
                let rowData = null;

                if (host && tiktokAccount) {
                    const startDateTime = new Date(`${dateString}T${startTime.trim()}`);
                    const endDateTime = new Date(`${dateString}T${endTime.trim()}`);
                    if (endDateTime <= startDateTime) {
                        endDateTime.setDate(endDateTime.getDate() + 1);
                    }
                    const duration = Math.round((endDateTime - startDateTime) / (1000 * 60));
                    
                    rowData = {
                        tanggal_live: dateString,
                        host_id: host.id,
                        tiktok_account_id: tiktokAccount.id,
                        waktu_mulai: startTime.trim(),
                        waktu_selesai: endTime.trim(),
                        durasi_menit: duration,
                        pendapatan: parseInt(revenue.trim()) || 0,
                        catatan: note.trim()
                    };
                    hasValidData = true;
                } else {
                    status = `<span class="text-red-600 font-semibold">${!host ? 'Host tidak ditemukan' : 'Akun tidak ditemukan'}</span>`;
                }
                
                state.parsedCsvData.push({ data: rowDa