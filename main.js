import { handleLogin, handleLogout } from './auth.js';
import { fetchData } from './api.js';
import { state } from './state.js';
import { setupUIForRole, showSection, getFirstVisibleSection, applyTheme, showNotification, showButtonLoader, hideButtonLoader, setupRekapFilters, setupAnalysisFilters, setupPayrollFilters, openMobileMenu, closeMobileMenu, setupMySalaryFilters } from './ui.js';
import { openSettingsModal, openRekapModal, openHostModal, openTiktokModal, openUserModal, openDetailRekapModal, handleEditHost, handleEditTiktok, handleEditRekap, handleEditUser, handleDeleteHost, handleDeleteTiktok, handleDeleteRekap, handleDeleteUser, openPayrollDetailModal, openCalendarDetailModal } from './components/Modals.js';
import { renderHostTable, renderTiktokTable, renderUserTable, renderRekapTable, renderPayrollTable } from './components/Table.js'; 
import { renderAnalysisView } from './components/Analysis.js';
import { updateKPIs, updatePerformanceChart, populateHostDropdowns, populateTiktokDropdowns, renderHostDocuments, renderMySalaryView } from './render.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// --- KONEKSI KE SUPABASE ---
const supabaseUrl = 'https://bvlzzhbvnhzvaojuqoqn.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bHp6aGJ2bmh6dmFvanVxb3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1Nzc4NjEsImV4cCI6MjA2OTE1Mzg2MX0.ngr8Zjd5lzsOWhycC_CDb3sOwVBFl21WTWSFt_cK2Hw'; 
export const supabaseClient = createClient(supabaseUrl, supabaseKey);

async function refreshDataAndRender() {
    await fetchData();
    // Re-render all components that might have changed
    renderHostTable();
    renderTiktokTable();
    renderUserTable();
    renderRekapTable();
    renderPayrollTable();
    renderAnalysisView();
    renderMySalaryView();
    updateKPIs();
    updatePerformanceChart();
    
    // Re-populate dropdowns in case data changed
    populateHostDropdowns(document.getElementById('rekap-host'));
    populateTiktokDropdowns(document.getElementById('rekap-tiktok-account'));
    populateHostDropdowns(document.getElementById('user-host-link'));

    // Re-populate profile form and documents if the user is a host
    if (state.currentUser.user_metadata?.role === 'host') {
        const hostId = state.currentUser.user_metadata.host_id;
        const hostData = state.hosts.find(h => h.id === hostId);
        if (hostData) {
            document.getElementById('profile-nama').value = hostData.nama_host || '';
            document.getElementById('profile-telepon').value = hostData.nomor_telepon || '';
            document.getElementById('profile-alamat').value = hostData.alamat || '';
            document.getElementById('profile-bank').value = hostData.nama_bank || '';
            document.getElementById('profile-rekening').value = hostData.nomor_rekening || '';
            renderHostDocuments(hostId);
        }
    }
}

function setupEventListeners() {
    const loginForm = document.getElementById('login-form');
    const btnLogout = document.getElementById('btn-logout');
    const btnSettingsAccess = document.getElementById('btn-settings-access');
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
    const formChangePassword = document.getElementById('form-change-password');
    const formUploadDocument = document.getElementById('form-upload-document');
    const hostDocumentsList = document.getElementById('host-documents-list');
    const importCsvModal = document.getElementById('modal-import-csv');
    const apiKeyModal = document.getElementById('modal-api-key');
    const formApiKey = document.getElementById('form-api-key');
    const btnCancelApiKey = document.getElementById('btn-cancel-api-key');
    const btnClosePayrollDetail = document.getElementById('btn-close-payroll-detail');
    const btnHamburger = document.getElementById('btn-hamburger');
    const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
    const calendarGrid = document.getElementById('calendar-grid');
    const btnCloseCalendarDetail = document.getElementById('btn-close-calendar-detail');
    const navLinks = {
        dashboard: document.getElementById('nav-dashboard'),
        analysis: document.getElementById('nav-analysis'),
        rekap: document.getElementById('nav-rekap'),
        profile: document.getElementById('nav-profile'),
        'my-salary': document.getElementById('nav-my-salary'),
        payroll: document.getElementById('nav-payroll'),
        settings: document.getElementById('nav-settings'),
        hosts: document.getElementById('nav-hosts'),
        tiktok: document.getElementById('nav-tiktok'),
        users: document.getElementById('nav-users'),
    };

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (btnLogout) btnLogout.addEventListener('click', handleLogout);
    if (btnSettingsAccess) btnSettingsAccess.addEventListener('click', openSettingsModal);
    if (btnThemeToggle) btnThemeToggle.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
        applyTheme(currentTheme);
    });
    Object.keys(navLinks).forEach(key => {
        if (navLinks[key]) {
            navLinks[key].addEventListener('click', () => showSection(key));
        }
    });
    const chartMetricSelector = document.getElementById('chart-metric-selector');
    if (chartMetricSelector) chartMetricSelector.addEventListener('change', (e) => updatePerformanceChart(e.target.value));
    
    if (btnAddRekap) btnAddRekap.addEventListener('click', () => openRekapModal());
    if (btnAddHost) btnAddHost.addEventListener('click', () => openHostModal());
    if (btnAddTiktok) btnAddTiktok.addEventListener('click', () => openTiktokModal());
    if (btnAddUser) btnAddUser.addEventListener('click', () => openUserModal());
    if (btnImportCsv) btnImportCsv.addEventListener('click', () => document.getElementById('modal-import-csv').classList.remove('hidden'));
    if (btnCancelHost) btnCancelHost.addEventListener('click', () => document.getElementById('modal-host').classList.add('hidden'));
    if (btnCancelTiktok) btnCancelTiktok.addEventListener('click', () => document.getElementById('modal-tiktok').classList.add('hidden'));
    if (btnCancelRekap) btnCancelRekap.addEventListener('click', () => document.getElementById('modal-rekap').classList.add('hidden'));
    if (btnCancelUser) btnCancelUser.addEventListener('click', () => document.getElementById('modal-user').classList.add('hidden'));
    if (btnCancelImport) btnCancelImport.addEventListener('click', () => document.getElementById('modal-import-csv').classList.add('hidden'));
    if (btnCloseRekapDetail) btnCloseRekapDetail.addEventListener('click', () => document.getElementById('modal-rekap-detail').classList.add('hidden'));
    if (btnClosePayrollDetail) btnClosePayrollDetail.addEventListener('click', () => document.getElementById('modal-payroll-detail').classList.add('hidden'));
    if (btnCloseCalendarDetail) btnCloseCalendarDetail.addEventListener('click', () => document.getElementById('modal-calendar-detail').classList.add('hidden'));
    if (btnCancelSettings) btnCancelSettings.addEventListener('click', () => document.getElementById('modal-settings').classList.add('hidden'));
    if (btnConfirmCancel) btnConfirmCancel.addEventListener('click', () => {
        state.itemToDelete = { id: null, type: '' };
        document.getElementById('modal-confirm').classList.add('hidden');
    });
    if (btnConfirmDelete) btnConfirmDelete.addEventListener('click', async (e) => {
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
    
    const hostTableBody = document.getElementById('host-table-body');
    if (hostTableBody) hostTableBody.addEventListener('click', (event) => {
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

    const tiktokTableBody = document.getElementById('tiktok-table-body');
    if (tiktokTableBody) tiktokTableBody.addEventListener('click', (event) => {
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
    
    const userTableBody = document.getElementById('user-table-body');
    if (userTableBody) userTableBody.addEventListener('click', (event) => {
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

    const rekapTableBody = document.getElementById('rekap-table-body');
    if (rekapTableBody) rekapTableBody.addEventListener('click', async (event) => {
        const target = event.target;
        const row = target.closest('tr[data-rekap-id]');
        if (!row) return;
        const rekapId = parseInt(row.dataset.rekapId || target.dataset.id);
        
        let newStatus = '';
        if (target.matches('.btn-approve-rekap')) newStatus = 'approved';
        else if (target.matches('.btn-reject-rekap')) newStatus = 'rejected';
        else if (target.matches('.btn-rollback-rekap')) newStatus = 'pending';

        if (newStatus) {
            event.stopPropagation();
            try {
                const { error } = await supabaseClient.from('rekap_live').update({ status: newStatus }).eq('id', rekapId);
                if (error) throw error;
                showNotification(`Status rekap berhasil diubah ke ${newStatus}.`);
                await refreshDataAndRender();
            } catch (err) {
                showNotification(`Gagal mengubah status: ${err.message}`, true);
            }
            return;
        }
        
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

    const payrollTableBody = document.getElementById('payroll-table-body');
    if (payrollTableBody) payrollTableBody.addEventListener('click', (event) => {
        const target = event.target;
        if (target.matches('.btn-payroll-detail')) {
            const hostId = parseInt(target.dataset.id);
            const month = parseInt(document.getElementById('payroll-month-filter').value);
            const year = parseInt(document.getElementById('payroll-year-filter').value);
            openPayrollDetailModal(hostId, year, month);
        }
    });

    if (calendarGrid) calendarGrid.addEventListener('click', (event) => {
        const target = event.target.closest('[data-day]');
        if (target) {
            const day = parseInt(target.dataset.day);
            const month = calendarState.currentDate.getMonth();
            const year = calendarState.currentDate.getFullYear();
            openCalendarDetailModal(day, year, month);
        }
    });

    if (btnHamburger) btnHamburger.addEventListener('click', openMobileMenu);
    if (mobileMenuBackdrop) mobileMenuBackdrop.addEventListener('click', closeMobileMenu);


    if (formHost) formHost.addEventListener('submit', async (e) => {
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
    
    if (formTiktok) formTiktok.addEventListener('submit', async (e) => {
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
    
    if (formUser) formUser.addEventListener('submit', async (e) => {
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

    const userRoleSelect = document.getElementById('user-role');
    if (userRoleSelect) userRoleSelect.addEventListener('change', (e) => {
         const hostLinkContainer = document.getElementById('user-host-link-container');
         if (e.target.value === 'host') {
             hostLinkContainer.classList.remove('hidden');
         } else {
             hostLinkContainer.classList.add('hidden');
         }
    });
    
    if (formRekap) formRekap.addEventListener('submit', async (e) => {
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
    
    if (formSettings) formSettings.addEventListener('submit', async (e) => {
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

    if (formImportCsv) formImportCsv.addEventListener('submit', async (e) => {
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
                
                state.parsedCsvData.push({ data: rowData, valid: !!rowData });

                const previewRow = document.createElement('tr');
                previewRow.className = !rowData ? 'bg-red-50' : 'bg-white';
                previewRow.innerHTML = `
                    <td class="px-4 py-2 border-b">${status}</td>
                    <td class="px-4 py-2 border-b">${date}</td>
                    <td class="px-4 py-2 border-b">${hostName}</td>
                    <td class="px-4 py-2 border-b">${tiktokUsername}</td>
                    <td class="px-4 py-2 border-b">${rowData ? formatDuration(rowData.durasi_menit) : '-'}</td>
                    <td class="px-4 py-2 border-b">${revenue}</td>
                `;
                previewBody.appendChild(previewRow);
            }
            if (hasValidData) {
                confirmButton.classList.remove('hidden');
            }
            hideButtonLoader(button);
        };
        reader.readAsText(file);
    });

    const btnConfirmImport = document.getElementById('btn-confirm-import');
    if (btnConfirmImport) btnConfirmImport.addEventListener('click', async (e) => {
        const button = e.currentTarget;
        showButtonLoader(button);
        const validData = state.parsedCsvData.filter(row => row.valid).map(row => row.data);
        try {
            if (validData.length > 0) {
                const { error } = await supabaseClient.from('rekap_live').insert(validData);
                if (error) throw error;
                showNotification(`${validData.length} data berhasil diimport.`);
                importCsvModal.classList.add('hidden');
                await refreshDataAndRender();
            } else {
                showNotification('Tidak ada data valid untuk diimport.', true);
            }
        } catch (err) {
            showNotification(`Error saat import: ${err.message}`, true);
        } finally {
            hideButtonLoader(button);
        }
    });
    
    if (btnGenerateAnalysis) btnGenerateAnalysis.addEventListener('click', async (e) => {
        const button = e.currentTarget;
        const apiKey = localStorage.getItem('geminiApiKey');

        if (!apiKey) {
            document.getElementById('modal-api-key').classList.remove('hidden');
            return;
        }
        
        showButtonLoader(button);

        const hostId = parseInt(document.getElementById('analysis-host-filter').value);
        const month = calendarState.currentDate.getMonth();
        const year = calendarState.currentDate.getFullYear();
        if (!hostId) {
            showNotification('Silakan pilih host terlebih dahulu.', true);
            hideButtonLoader(button);
            return;
        }

        const geminiContainer = document.getElementById('gemini-analysis-container');
        const loader = document.getElementById('gemini-loader');
        const resultDiv = document.getElementById('gemini-analysis-result');
        
        geminiContainer.classList.remove('hidden');
        loader.classList.remove('hidden');
        resultDiv.innerHTML = '';

        const performance = calculateMonthlyPerformance(hostId, year, month);
        const host = state.hosts.find(h => h.id === hostId);
        
        const prompt = `
            Anda adalah seorang analis kinerja untuk manajer agensi host live streaming.
            Berdasarkan data kinerja berikut untuk host bernama ${host.nama_host} pada bulan ${new Date(year, month).toLocaleString('id-ID', { month: 'long', year: 'numeric' })}, buatlah sebuah ringkasan analisis yang singkat dan jelas.

            Data Kinerja:
            - Hari Kerja Tercapai: ${performance.workDays} hari
            - Target Hari Kerja: 26 hari
            - Total Jam Live: ${performance.totalHours.toFixed(1)} jam
            - Keseimbangan Jam (dibandingkan target 6 jam/hari kerja): ${performance.hourBalance.toFixed(1)} jam
            - Sisa Jatah Libur: ${performance.remainingOffDays} hari
            - Efisiensi Pendapatan: ${performance.revenuePerDay} diamond per hari

            Format laporan dalam poin-poin sebagai berikut:
            1.  **Ringkasan Umum:** Berikan kesimpulan singkat tentang kinerja host di bulan ini.
            2.  **Kekuatan:** Sebutkan 1-2 hal positif utama dari data (misalnya, melebihi target jam, efisiensi pendapatan tinggi).
            3.  **Area Perbaikan:** Sebutkan 1-2 area yang perlu ditingkatkan (misalnya, kurang dari target hari kerja, efisiensi pendapatan rendah).
            4.  **Saran Tindak Lanjut:** Berikan satu saran konkret yang bisa dilakukan host untuk meningkatkan performa di bulan berikutnya.

            Gunakan bahasa yang profesional, suportif, dan mudah dimengerti.
        `;

        try {
            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.candidates && result.candidates[0].content.parts[0].text) {
                let html = result.candidates[0].content.parts[0].text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br>');
                resultDiv.innerHTML = html;
            } else {
                throw new Error("Respons dari API tidak valid.");
            }
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            resultDiv.innerHTML = `<p class="text-red-500">Gagal menghasilkan analisis. Error: ${error.message}. Pastikan kunci API Anda benar.</p>`;
        } finally {
            loader.classList.add('hidden');
            hideButtonLoader(button);
        }
    });
    
    if (formApiKey) formApiKey.addEventListener('submit', (e) => {
        e.preventDefault();
        const apiKeyInput = document.getElementById('gemini-api-key');
        const key = apiKeyInput.value.trim();
        
        if (key) {
            localStorage.setItem('geminiApiKey', key);
            document.getElementById('modal-api-key').classList.add('hidden');
            apiKeyInput.value = '';
            // Setelah kunci disimpan, langsung coba lagi panggilan API
            btnGenerateAnalysis.click();
        }
    });

    if (btnCancelApiKey) btnCancelApiKey.addEventListener('click', () => {
        document.getElementById('modal-api-key').classList.add('hidden');
    });
    
    if (formProfile) formProfile.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = e.submitter;
        showButtonLoader(button);

        if (!state.currentUser || state.currentUser.user_metadata?.role !== 'host') {
            showNotification('Aksi tidak diizinkan.', true);
            hideButtonLoader(button);
            return;
        }
        
        const hostId = state.currentUser.user_metadata.host_id;
        if (!hostId) {
             showNotification('ID Host tidak ditemukan.', true);
             hideButtonLoader(button);
             return;
        }

        // Ambil data dari form, ubah string kosong menjadi null
        const updatedData = {
            nama_host: document.getElementById('profile-nama').value,
            nomor_telepon: document.getElementById('profile-telepon').value || null,
            alamat: document.getElementById('profile-alamat').value || null,
            nama_bank: document.getElementById('profile-bank').value || null,
            nomor_rekening: document.getElementById('profile-rekening').value || null,
        };

        try {
            const { error } = await supabaseClient
                .from('hosts')
                .update(updatedData)
                .eq('id', hostId);

            if (error) throw error;
            
            showNotification('Profil berhasil diperbarui.');
            await fetchData(); // Ambil data terbaru setelah update
            
        } catch (err) {
            showNotification(`Gagal memperbarui profil: ${err.message}`, true);
        } finally {
            hideButtonLoader(button);
        }
    });

    if (formChangePassword) formChangePassword.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = e.submitter;
        showButtonLoader(button);

        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            showNotification('Konfirmasi password tidak cocok.', true);
            hideButtonLoader(button);
            return;
        }

        try {
            const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
            if (error) throw error;
            showNotification('Password berhasil diperbarui.');
            formChangePassword.reset();
        } catch (err) {
            showNotification(`Gagal memperbarui password: ${err.message}`, true);
        } finally {
            hideButtonLoader(button);
        }
    });

    if (formUploadDocument) formUploadDocument.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = e.submitter;
        showButtonLoader(button);

        const hostId = state.currentUser.user_metadata.host_id;
        const fileInput = document.getElementById('host-document-file');
        const file = fileInput.files[0];

        if (!file || !hostId) {
            showNotification('File atau ID host tidak ditemukan.', true);
            hideButtonLoader(button);
            return;
        }

        try {
            const filePath = `${hostId}/${file.name}`;
            const { error } = await supabaseClient.storage
                .from('host-document')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true,
                });
            
            if (error) throw error;
            showNotification('Dokumen berhasil diunggah.');
            formUploadDocument.reset();
            renderHostDocuments(hostId);
        } catch (err) {
            showNotification(`Gagal mengunggah dokumen: ${err.message}`, true);
        } finally {
            hideButtonLoader(button);
        }
    });

    if (hostDocumentsList) hostDocumentsList.addEventListener('click', async (e) => {
        const target = e.target;
        const path = target.dataset.path;
        if (!path) return;

        if (target.matches('.btn-download-document')) {
            try {
                const { data, error } = await supabaseClient.storage
                    .from('host-document')
                    .download(path);
                if (error) throw error;
                const blob = new Blob([data], { type: data.type });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = path.split('/').pop();
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            } catch (err) {
                showNotification(`Gagal mengunduh file: ${err.message}`, true);
            }
        } else if (target.matches('.btn-delete-document')) {
            if (confirm(`Apakah Anda yakin ingin menghapus file "${path.split('/').pop()}"?`)) {
                try {
                    const { error } = await supabaseClient.storage
                        .from('host-document')
                        .remove([path]);
                    if (error) throw error;
                    showNotification('Dokumen berhasil dihapus.');
                    const hostId = state.currentUser.user_metadata.host_id;
                    renderHostDocuments(hostId);
                } catch (err) {
                    showNotification(`Gagal menghapus file: ${err.message}`, true);
                }
            }
        }
    });

    document.querySelectorAll('.sortable-header').forEach(header => {
        header.addEventListener('click', () => {
            const tableId = header.closest('table').id;
            const sortKey = header.dataset.sortKey;
            let tableType;

            if (tableId === 'host-table') tableType = 'hosts';
            else if (tableId === 'tiktok-table') tableType = 'tiktok';
            else if (tableId === 'rekap-table') tableType = 'rekap';
            else if (tableId === 'user-table') tableType = 'users';
            
            if (!tableType) return;

            if (state.sortState[tableType].key === sortKey) {
                state.sortState[tableType].direction = state.sortState[tableType].direction === 'asc' ? 'desc' : 'asc';
            } else {
                state.sortState[tableType].key = sortKey;
                state.sortState[tableType].direction = 'asc';
            }

            switch(tableType) {
                case 'hosts': renderHostTable(); break;
                case 'tiktok': renderTiktokTable(); break;
                case 'rekap': renderRekapTable(); break;
                case 'users': renderUserTable(); break;
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    // Apply initial theme
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);
    
    setupEventListeners();

    // --- INITIAL SESSION CHECK ---
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        state.currentUser = session.user;
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        await updateAllDataAndUI();
    } else {
        document.getElementById('login-page').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
    }

    // --- AUTH STATE CHANGE LISTENER ---
    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
        // This listener now primarily handles LOGIN and LOGOUT events,
        // as the initial session is already handled above.
        if (session && !state.currentUser) { // User just logged in
            state.currentUser = session.user;
            document.getElementById('login-page').classList.add('hidden');
            document.getElementById('app').classList.remove('hidden');
            await updateAllDataAndUI();
        } else if (!session && state.currentUser) { // User just logged out
            state.currentUser = null;
            document.getElementById('app').classList.add('hidden');
            document.getElementById('login-page').classList.remove('hidden');
            document.getElementById('login-form').reset();
            const loginError = document.getElementById('login-error');
            if(loginError) loginError.classList.add('hidden');
        }
    });
});

export async function updateAllDataAndUI() {
    await fetchData();
    await setupUIForRole();
    // Setup filters and render tables
    setupRekapFilters();
    setupAnalysisFilters(); 
    setupPayrollFilters();
    setupMySalaryFilters();
    renderHostTable();
    renderTiktokTable();
    renderUserTable();
    renderRekapTable();
    renderPayrollTable();
    renderAnalysisView();
    renderMySalaryView();
    updateKPIs();
    updatePerformanceChart();
    
    const geminiContainer = document.getElementById('gemini-analysis-container');
    if (geminiContainer) geminiContainer.classList.add('hidden');
    
    // Populate dropdowns in modals
    populateHostDropdowns(document.getElementById('rekap-host'));
    populateTiktokDropdowns(document.getElementById('rekap-tiktok-account'));
    populateHostDropdowns(document.getElementById('user-host-link'));
    
    if (state.currentUser.user_metadata?.role === 'host') {
        const hostId = state.currentUser.user_metadata.host_id;
        const hostData = state.hosts.find(h => h.id === hostId);
        if (hostData) {
            document.getElementById('profile-nama').value = hostData.nama_host || '';
            document.getElementById('profile-telepon').value = hostData.nomor_telepon || '';
            document.getElementById('profile-alamat').value = hostData.alamat || '';
            document.getElementById('profile-bank').value = hostData.nama_bank || '';
            document.getElementById('profile-rekening').value = hostData.nomor_rekening || '';
            renderHostDocuments(hostId);
        }
    }
    
    showSection(getFirstVisibleSection());
}
