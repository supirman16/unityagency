import { state } from './main.js';
import { updatePerformanceChart, populateHostDropdowns, populateTiktokDropdowns, renderAnalysisView, renderRekapTable, renderPayrollTable, calculatePayroll } from './render.js';
import { formatDiamond, formatDate, formatDuration, formatRupiah } from './utils.js';

// --- FUNGSI UTILITAS TAMPILAN ---

export function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.remove('bg-green-500', 'bg-red-500');
    notification.classList.add(isError ? 'bg-red-500' : 'bg-green-500');
    notification.classList.remove('translate-x-[120%]');
    notification.classList.add('translate-x-0');
    setTimeout(() => {
        notification.classList.remove('translate-x-0');
        notification.classList.add('translate-x-[120%]');
    }, 3000);
}

export function showButtonLoader(button) {
    if (!button) return;
    button.disabled = true;
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner');
    if (btnText) btnText.classList.add('hidden');
    if (spinner) spinner.classList.remove('hidden');
}

export function hideButtonLoader(button) {
    if (!button) return;
    button.disabled = false;
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner');
    if (btnText) btnText.classList.remove('hidden');
    if (spinner) spinner.classList.add('hidden');
}

// --- KONTROL TAMPILAN UTAMA ---

export async function setupUIForRole() {
    if (!state.currentUser) return;
    document.getElementById('user-display-name').textContent = state.currentUser.email;
    const isSuperAdmin = state.currentUser.user_metadata?.role === 'superadmin';

    document.getElementById('btn-settings').style.display = isSuperAdmin ? 'block' : 'none';
    document.getElementById('kpi-title-hosts').textContent = isSuperAdmin ? 'Total Host Aktif' : 'Status Anda';
    document.getElementById('dashboard-subtitle').textContent = isSuperAdmin ? 'Metrik utama dari seluruh aktivitas host.' : 'Metrik utama dari aktivitas Anda.';
    
    document.getElementById('nav-item-hosts').style.display = isSuperAdmin ? 'flex' : 'none';
    document.getElementById('nav-item-tiktok').style.display = isSuperAdmin ? 'flex' : 'none';
    document.getElementById('nav-item-users').style.display = isSuperAdmin ? 'flex' : 'none';
    document.getElementById('nav-item-payroll').style.display = isSuperAdmin ? 'flex' : 'none';
    document.getElementById('btn-import-csv').style.display = isSuperAdmin ? 'block' : 'none';
    document.getElementById('nav-item-dashboard').style.display = (isSuperAdmin || state.hostMenuAccess.dashboard) ? 'flex' : 'none';
    document.getElementById('nav-item-analysis').style.display = (isSuperAdmin || state.hostMenuAccess.analysis) ? 'flex' : 'none';
    document.getElementById('nav-item-rekap').style.display = (isSuperAdmin || state.hostMenuAccess.rekap) ? 'flex' : 'none';
    document.getElementById('nav-item-profile').style.display = !isSuperAdmin ? 'flex' : 'none';
}

export function showSection(sectionName) {
    Object.values(document.querySelectorAll('main > section')).forEach(section => section.classList.add('hidden'));
    Object.values(document.querySelectorAll('.nav-link')).forEach(link => {
        link.classList.remove('text-teal-600', 'border-teal-600', 'dark:text-teal-500', 'dark:border-teal-500');
    });
    document.getElementById(`section-${sectionName}`).classList.remove('hidden');
    document.getElementById(`nav-${sectionName}`).classList.add('text-teal-600', 'border-teal-600', 'dark:text-teal-500', 'dark:border-teal-500');
}

export function getFirstVisibleSection() {
    if (!state.currentUser) return 'dashboard';
    const isSuperAdmin = state.currentUser.user_metadata?.role === 'superadmin';
    if (isSuperAdmin || state.hostMenuAccess.dashboard) return 'dashboard';
    if (isSuperAdmin || state.hostMenuAccess.analysis) return 'analysis';
    if (state.hostMenuAccess.rekap) return 'rekap';
    if (isSuperAdmin) return 'payroll';
    return 'dashboard'; // Fallback
}

export function applyTheme(theme) {
    const root = document.documentElement;
    const iconMoon = document.getElementById('icon-moon');
    const iconSun = document.getElementById('icon-sun');

    if (theme === 'dark') {
        root.classList.add('dark');
        iconMoon.classList.add('hidden');
        iconSun.classList.remove('hidden');
    } else {
        root.classList.remove('dark');
        iconMoon.classList.remove('hidden');
        iconSun.classList.add('hidden');
    }

    localStorage.setItem('theme', theme);

    if (state.performanceChart) {
        updatePerformanceChart(document.getElementById('chart-metric-selector').value);
    }
}

// --- FUNGSI SETUP FILTER ---
export function setupAnalysisFilters() {
    if (!state.currentUser) return;
    const hostSelect = document.getElementById('analysis-host');
    const monthSelect = document.getElementById('analysis-month');
    const yearSelect = document.getElementById('analysis-year');
    
    populateHostDropdowns(hostSelect);
    if(state.currentUser.user_metadata?.role === 'host') {
        hostSelect.value = state.currentUser.user_metadata.host_id;
        hostSelect.disabled = true;
    } else {
        hostSelect.disabled = false;
    }

    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    monthSelect.innerHTML = '';
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
    monthSelect.value = new Date().getMonth();

    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '';
    for (let i = currentYear; i >= currentYear - 5; i--) {
         const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
    
    [hostSelect, monthSelect, yearSelect].forEach(el => el.addEventListener('change', renderAnalysisView));
}

export function setupRekapFilters() {
    const monthSelect = document.getElementById('rekap-month-filter');
    const yearSelect = document.getElementById('rekap-year-filter');
    
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    monthSelect.innerHTML = '';
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
    monthSelect.value = new Date().getMonth();

    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '';
    for (let i = currentYear; i >= currentYear - 5; i--) {
         const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
    [monthSelect, yearSelect].forEach(el => el.addEventListener('change', renderRekapTable));
}

export function setupPayrollFilters() {
    const monthSelect = document.getElementById('payroll-month-filter');
    const yearSelect = document.getElementById('payroll-year-filter');
    
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    monthSelect.innerHTML = '';
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
    monthSelect.value = new Date().getMonth();

    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '';
    for (let i = currentYear; i >= currentYear - 5; i--) {
         const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
    [monthSelect, yearSelect].forEach(el => el.addEventListener('change', renderPayrollTable));
}

// --- FUNGSI UNTUK MODAL & AKSI ---

export function openSettingsModal() {
    document.getElementById('setting-dashboard').checked = state.hostMenuAccess.dashboard;
    document.getElementById('setting-analysis').checked = state.hostMenuAccess.analysis;
    document.getElementById('setting-rekap').checked = state.hostMenuAccess.rekap;
    document.getElementById('modal-settings').classList.remove('hidden');
}

export async function openHostModal(hostId = null) {
    const formHost = document.getElementById('form-host');
    formHost.reset();
    const modalTitle = document.getElementById('modal-host-title');
    const hostIdInput = document.getElementById('host-id');
    if (hostId) {
        modalTitle.textContent = 'Ubah Data Host';
        const host = state.hosts.find(h => h.id === hostId);
        if (!host) return showNotification('Host tidak ditemukan.', true);
        hostIdInput.value = host.id;
        document.getElementById('host-nama').value = host.nama_host;
        document.getElementById('host-platform').value = host.platform;
        document.getElementById('host-gabung').value = host.tanggal_bergabung;
        document.getElementById('host-status').value = host.status;
    } else {
        modalTitle.textContent = 'Tambah Host Baru';
        hostIdInput.value = '';
        document.getElementById('host-gabung').valueAsDate = new Date();
    }
    document.getElementById('modal-host').classList.remove('hidden');
}

export async function openTiktokModal(accountId = null) {
    const formTiktok = document.getElementById('form-tiktok');
    formTiktok.reset();
    const modalTitle = document.getElementById('modal-tiktok-title');
    const tiktokIdInput = document.getElementById('tiktok-id');
    if (accountId) {
        modalTitle.textContent = 'Ubah Akun TikTok';
        const account = state.tiktokAccounts.find(t => t.id === accountId);
        if (!account) return showNotification('Akun TikTok tidak ditemukan.', true);
        tiktokIdInput.value = account.id;
        document.getElementById('tiktok-username').value = account.username;
        document.getElementById('tiktok-status').value = account.status;
    } else {
        modalTitle.textContent = 'Tambah Akun TikTok';
        tiktokIdInput.value = '';
    }
    document.getElementById('modal-tiktok').classList.remove('hidden');
}

export async function openUserModal(userId = null) {
    const formUser = document.getElementById('form-user');
    formUser.reset();
    const modalTitle = document.getElementById('modal-user-title');
    const userIdInput = document.getElementById('user-id');
    const userHostLinkContainer = document.getElementById('user-host-link-container');
    const userHostLinkSelect = document.getElementById('user-host-link');
    const userEmailInput = document.getElementById('user-email');
    
    await populateHostDropdowns(userHostLinkSelect);

    if (userId) {
        modalTitle.textContent = 'Ubah Pengguna';
        const user = state.users.find(u => u.id === userId);
        userIdInput.value = user.id;
        userEmailInput.value = user.email;
        userEmailInput.disabled = true;
        document.getElementById('user-role').value = user.user_metadata.role;
        if (user.user_metadata.role === 'host') {
            userHostLinkContainer.classList.remove('hidden');
            userHostLinkSelect.value = user.user_metadata.host_id;
        } else {
            userHostLinkContainer.classList.add('hidden');
        }
    } else {
        modalTitle.textContent = 'Tambah Pengguna Baru';
        userIdInput.value = '';
        userEmailInput.disabled = false;
        userHostLinkContainer.classList.add('hidden');
    }
    document.getElementById('modal-user').classList.remove('hidden');
}

export async function openRekapModal(rekapId = null) {
    const formRekap = document.getElementById('form-rekap');
    formRekap.reset();
    const modalTitle = document.getElementById('modal-rekap-title');
    const rekapIdInput = document.getElementById('rekap-id');
    const hostSelect = document.getElementById('rekap-host');
    const tiktokSelect = document.getElementById('rekap-tiktok-account');
    
    populateHostDropdowns(hostSelect);
    populateTiktokDropdowns(tiktokSelect);
    hostSelect.disabled = state.currentUser.user_metadata?.role === 'host';
    
    if (rekapId) {
        modalTitle.textContent = 'Ubah Rekap Live';
        const rekap = state.rekapLive.find(r => r.id === rekapId);
        rekapIdInput.value = rekap.id;
        hostSelect.value = rekap.host_id;
        tiktokSelect.value = rekap.tiktok_account_id;
        document.getElementById('rekap-tanggal').value = rekap.tanggal_live;
        document.getElementById('rekap-mulai').value = rekap.waktu_mulai;
        document.getElementById('rekap-selesai').value = rekap.waktu_selesai;
        document.getElementById('rekap-pendapatan').value = rekap.pendapatan;
        document.getElementById('rekap-catatan').value = rekap.catatan;
    } else {
        modalTitle.textContent = 'Tambah Rekap Baru';
        rekapIdInput.value = '';
        hostSelect.value = state.currentUser.user_metadata?.role === 'host' ? state.currentUser.user_metadata.host_id : '';
        document.getElementById('rekap-tanggal').valueAsDate = new Date();
    }
    document.getElementById('modal-rekap').classList.remove('hidden');
}

export async function openDetailRekapModal(rekapId) {
    const rekap = state.rekapLive.find(r => r.id === rekapId);
    if (!rekap) return;

    const host = state.hosts.find(h => h.id === rekap.host_id);
    const tiktokAccount = state.tiktokAccounts.find(t => t.id === rekap.tiktok_account_id);
    const detailContent = document.getElementById('rekap-detail-content');

    detailContent.innerHTML = `
        <div class="flex justify-between border-b pb-2 dark:border-stone-600"><span class="font-medium text-stone-500 dark:text-stone-400">Tanggal Live:</span> <span class="text-stone-900 dark:text-white font-semibold">${formatDate(rekap.tanggal_live)}</span></div>
        <div class="flex justify-between border-b pb-2 dark:border-stone-600"><span class="font-medium text-stone-500 dark:text-stone-400">Host:</span> <span class="text-stone-900 dark:text-white font-semibold">${host ? host.nama_host : 'N/A'}</span></div>
        <div class="flex justify-between border-b pb-2 dark:border-stone-600"><span class="font-medium text-stone-500 dark:text-stone-400">Akun TikTok:</span> <span class="text-stone-900 dark:text-white font-semibold">${tiktokAccount ? tiktokAccount.username : 'N/A'}</span></div>
        <div class="flex justify-between border-b pb-2 dark:border-stone-600"><span class="font-medium text-stone-500 dark:text-stone-400">Waktu:</span> <span class="text-stone-900 dark:text-white font-semibold">${rekap.waktu_mulai} - ${rekap.waktu_selesai}</span></div>
        <div class="flex justify-between border-b pb-2 dark:border-stone-600"><span class="font-medium text-stone-500 dark:text-stone-400">Durasi:</span> <span class="text-stone-900 dark:text-white font-semibold">${formatDuration(rekap.durasi_menit)}</span></div>
        <div class="flex justify-between border-b pb-2 dark:border-stone-600"><span class="font-medium text-stone-500 dark:text-stone-400">Pendapatan:</span> <span class="text-stone-900 dark:text-white font-semibold">${formatDiamond(rekap.pendapatan)}</span></div>
        <div class="mt-4">
            <p class="font-medium text-stone-500 dark:text-stone-400 mb-1">Catatan:</p>
            <p class="text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-700 p-3 rounded-md min-h-[50px]">${rekap.catatan || 'Tidak ada catatan.'}</p>
        </div>
    `;

    document.getElementById('modal-rekap-detail').classList.remove('hidden');
}

export function openPayrollDetailModal(hostId, year, month) {
    const payrollData = calculatePayroll(hostId, year, month);
    if (!payrollData) return;

    document.getElementById('payroll-detail-host').textContent = payrollData.hostName;
    document.getElementById('payroll-detail-periode').textContent = new Date(year, month).toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    
    document.getElementById('payroll-detail-base').textContent = formatRupiah(payrollData.baseSalary);
    document.getElementById('payroll-detail-hours').textContent = `${payrollData.totalHours.toFixed(2)} jam / ${payrollData.targetHours} jam`;
    document.getElementById('payroll-detail-days').textContent = `${payrollData.workDays} hari / ${payrollData.targetDays} hari`;
    document.getElementById('payroll-detail-deduction').textContent = formatRupiah(payrollData.deduction);
    document.getElementById('payroll-detail-adjusted-base').textContent = formatRupiah(payrollData.adjustedBaseSalary);
    
    document.getElementById('payroll-detail-diamonds').textContent = formatDiamond(payrollData.totalDiamonds);
    document.getElementById('payroll-detail-bonus').textContent = formatRupiah(payrollData.bonus);
    
    document.getElementById('payroll-detail-final').textContent = formatRupiah(payrollData.finalSalary);

    document.getElementById('modal-payroll-detail').classList.remove('hidden');
}

export function handleEditHost(hostId) { openHostModal(hostId); }
export function handleEditTiktok(accountId) { openTiktokModal(accountId); }
export function handleEditRekap(rekapId) { openRekapModal(rekapId); }
export function handleEditUser(userId) { openUserModal(userId); }

export function handleDeleteHost(hostId) {
    state.itemToDelete = { id: hostId, type: 'host' };
    document.getElementById('confirm-message').textContent = 'Menghapus host juga akan menghapus semua rekap terkait. Apakah Anda yakin?';
    document.getElementById('modal-confirm').classList.remove('hidden');
}

export function handleDeleteTiktok(accountId) {
    state.itemToDelete = { id: accountId, type: 'tiktok' };
    document.getElementById('confirm-message').textContent = 'Menghapus akun TikTok tidak akan menghapus rekap live yang sudah ada. Apakah Anda yakin?';
    document.getElementById('modal-confirm').classList.remove('hidden');
}

export function handleDeleteRekap(rekapId) {
    state.itemToDelete = { id: rekapId, type: 'rekap' };
    document.getElementById('confirm-message').textContent = 'Apakah Anda yakin ingin menghapus data rekap ini?';
    document.getElementById('modal-confirm').classList.remove('hidden');
}

export function handleDeleteUser(userId) {
    state.itemToDelete = { id: userId, type: 'user' };
    const user = state.users.find(u => u.id === userId);
    document.getElementById('confirm-message').textContent = `Apakah Anda yakin ingin menghapus pengguna "${user.email}"?`;
    document.getElementById('modal-confirm').classList.remove('hidden');
}
