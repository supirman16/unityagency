import { state } from './main.js';
import { updatePerformanceChart, populateHostDropdowns, populateTiktokDropdowns, renderAnalysisView, renderRekapTable, renderPayrollTable, calculatePayroll, calculateMonthlyPerformance, renderCalendar, renderHostDocuments } from './render.js';
import { formatDiamond, formatDate, formatDuration, formatRupiah } from './utils.js';

// --- STATE LOKAL UNTUK UI ---
export let calendarState = {
    currentDate: new Date()
};

// --- FUNGSI UTILITAS TAMPILAN ---

export function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    if (!notification) return;
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

// --- KONTROL TAMPILAN UTAMA & NAVIGASI ---

export async function setupUIForRole() {
    if (!state.currentUser) return;
    
    const userDisplayName = document.getElementById('user-display-name');
    if (userDisplayName) userDisplayName.textContent = state.currentUser.email;
    
    const isSuperAdmin = state.currentUser.user_metadata?.role === 'superadmin';

    const btnSettingsAccess = document.getElementById('btn-settings-access');
    if (btnSettingsAccess) btnSettingsAccess.style.display = isSuperAdmin ? 'block' : 'none';
    
    const kpiTitleHosts = document.getElementById('kpi-title-hosts');
    if (kpiTitleHosts) kpiTitleHosts.textContent = isSuperAdmin ? 'Total Host Aktif' : 'Status Anda';

    const dashboardSubtitle = document.getElementById('dashboard-subtitle');
    if (dashboardSubtitle) dashboardSubtitle.textContent = isSuperAdmin ? 'Metrik utama dari seluruh aktivitas host.' : 'Metrik utama dari aktivitas Anda.';
    
    const navItemHosts = document.getElementById('nav-item-hosts');
    if (navItemHosts) navItemHosts.style.display = isSuperAdmin ? 'flex' : 'none';
    
    const navItemTiktok = document.getElementById('nav-item-tiktok');
    if (navItemTiktok) navItemTiktok.style.display = isSuperAdmin ? 'flex' : 'none';
    
    const navItemUsers = document.getElementById('nav-item-users');
    if (navItemUsers) navItemUsers.style.display = isSuperAdmin ? 'flex' : 'none';
    
    const navItemPayroll = document.getElementById('nav-item-payroll');
    if (navItemPayroll) navItemPayroll.style.display = isSuperAdmin ? 'flex' : 'none';
    
    const btnImportCsv = document.getElementById('btn-import-csv');
    if (btnImportCsv) btnImportCsv.style.display = isSuperAdmin ? 'block' : 'none';
    
    const navItemDashboard = document.getElementById('nav-item-dashboard');
    if (navItemDashboard) navItemDashboard.style.display = (isSuperAdmin || state.hostMenuAccess.dashboard) ? 'flex' : 'none';
    
    const navItemAnalysis = document.getElementById('nav-item-analysis');
    if (navItemAnalysis) navItemAnalysis.style.display = (isSuperAdmin || state.hostMenuAccess.analysis) ? 'flex' : 'none';
    
    const navItemRekap = document.getElementById('nav-item-rekap');
    if (navItemRekap) navItemRekap.style.display = (isSuperAdmin || state.hostMenuAccess.rekap) ? 'flex' : 'none';
    
    const navItemProfile = document.getElementById('nav-item-profile');
    if (navItemProfile) navItemProfile.style.display = !isSuperAdmin ? 'flex' : 'none';

    const navItemSettings = document.getElementById('nav-item-settings');
    if(navItemSettings) navItemSettings.style.display = 'flex'; // Selalu tampilkan untuk semua user yang login

    populateMobileMenu();
}

export function showSection(sectionName) {
    Object.values(document.querySelectorAll('main > section')).forEach(section => section.classList.add('hidden'));
    Object.values(document.querySelectorAll('.nav-link')).forEach(link => {
        link.classList.remove('text-purple-600', 'border-purple-600', 'dark:text-purple-500', 'dark:border-purple-500');
    });
    
    const sectionToShow = document.getElementById(`section-${sectionName}`);
    if (sectionToShow) {
        sectionToShow.classList.remove('hidden');
    }

    const linkToActivate = document.getElementById(`nav-${sectionName}`);
    if (linkToActivate) {
        linkToActivate.classList.add('text-purple-600', 'border-purple-600', 'dark:text-purple-500', 'dark:border-purple-500');
    }
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
        if (iconMoon) iconMoon.classList.add('hidden');
        if (iconSun) iconSun.classList.remove('hidden');
    } else {
        root.classList.remove('dark');
        if (iconMoon) iconMoon.classList.remove('hidden');
        if (iconSun) iconSun.classList.add('hidden');
    }

    localStorage.setItem('theme', theme);

    if (state.performanceChart) {
        updatePerformanceChart(document.getElementById('chart-metric-selector').value);
    }
}

// --- FUNGSI MENU MOBILE ---

export function populateMobileMenu() {
    const desktopNav = document.getElementById('desktop-nav-list');
    const mobileNav = document.getElementById('mobile-nav-list');
    if (!desktopNav || !mobileNav) return;

    mobileNav.innerHTML = ''; // Kosongkan menu mobile sebelum diisi ulang
    
    const navItems = desktopNav.querySelectorAll('li');
    navItems.forEach(item => {
        // Hanya salin item menu yang terlihat
        if (item.style.display !== 'none') {
            const link = item.querySelector('a').cloneNode(true);
            const newLi = document.createElement('li');
            
            link.classList.remove('p-4', 'border-b-2', 'border-transparent', 'rounded-t-lg', 'group');
            link.classList.add('block', 'p-2', 'rounded-md', 'hover:bg-stone-100', 'dark:hover:bg-stone-700');

            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionName = link.id.replace('nav-', '');
                showSection(sectionName);
                closeMobileMenu();
            });

            newLi.appendChild(link);
            mobileNav.appendChild(newLi);
        }
    });
}

export function openMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    if (mobileMenu && backdrop) {
        backdrop.classList.remove('hidden');
        mobileMenu.classList.remove('-translate-x-full');
    }
}

export function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    if (mobileMenu && backdrop) {
        backdrop.classList.add('hidden');
        mobileMenu.classList.add('-translate-x-full');
    }
}

// --- FUNGSI SETUP FILTER ---
export function setupAnalysisFilters() {
    if (!state.currentUser) return;
    const hostSelect = document.getElementById('analysis-host-filter');
    const prevMonthBtn = document.getElementById('btn-prev-month');
    const nextMonthBtn = document.getElementById('btn-next-month');
    
    if (!hostSelect || !prevMonthBtn || !nextMonthBtn) return;

    const isSuperAdmin = state.currentUser.user_metadata?.role === 'superadmin';
    if (isSuperAdmin) {
        hostSelect.style.display = 'block';
        populateHostDropdowns(hostSelect);
    } else {
        hostSelect.style.display = 'none';
    }

    hostSelect.addEventListener('change', renderAnalysisView);
    prevMonthBtn.addEventListener('click', () => {
        calendarState.currentDate.setMonth(calendarState.currentDate.getMonth() - 1);
        renderAnalysisView();
    });
    nextMonthBtn.addEventListener('click', () => {
        calendarState.currentDate.setMonth(calendarState.currentDate.getMonth() + 1);
        renderAnalysisView();
    });
}

export function setupRekapFilters() {
    const monthSelect = document.getElementById('rekap-month-filter');
    const yearSelect = document.getElementById('rekap-year-filter');
    
    if (!monthSelect) return;

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
    
    if (!monthSelect || !yearSelect) return;

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
    const documentsSection = document.getElementById('host-documents-section');

    if (hostId) {
        modalTitle.textContent = 'Ubah Data Host';
        const host = state.hosts.find(h => h.id === hostId);
        if (!host) return showNotification('Host tidak ditemukan.', true);
        hostIdInput.value = host.id;
        document.getElementById('host-nama').value = host.nama_host;
        document.getElementById('host-platform').value = host.platform;
        document.getElementById('host-gabung').value = host.tanggal_bergabung;
        document.getElementById('host-status').value = host.status;

        if (documentsSection) {
            documentsSection.classList.remove('hidden');
            renderHostDocuments(hostId);
        }
    } else {
        modalTitle.textContent = 'Tambah Host Baru';
        hostIdInput.value = '';
        document.getElementById('host-gabung').valueAsDate = new Date();
        if (documentsSection) {
            documentsSection.classList.add('hidden');
        }
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

export function openCalendarDetailModal(day, year, month) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const isSuperAdmin = state.currentUser.user_metadata?.role === 'superadmin';
    let selectedHostId = isSuperAdmin 
        ? parseInt(document.getElementById('analysis-host-filter').value)
        : state.currentUser.user_metadata.host_id;

    const dailyRekaps = state.rekapLive.filter(r => 
        r.host_id === selectedHostId && r.tanggal_live === dateString && r.status === 'approved'
    );

    const modal = document.getElementById('modal-calendar-detail');
    const dateDisplay = document.getElementById('calendar-detail-date');
    const contentDiv = document.getElementById('calendar-detail-content');

    if (!modal || !dateDisplay || !contentDiv) return;

    dateDisplay.textContent = formatDate(dateString);
    contentDiv.innerHTML = '';

    if (dailyRekaps.length === 0) {
        contentDiv.innerHTML = '<p class="text-stone-500 dark:text-stone-400 text-center">Tidak ada sesi live yang tercatat pada tanggal ini.</p>';
    } else {
        let totalMinutes = 0;
        let totalDiamonds = 0;

        dailyRekaps.forEach(rekap => {
            const tiktokAccount = state.tiktokAccounts.find(t => t.id === rekap.tiktok_account_id);
            totalMinutes += rekap.durasi_menit;
            totalDiamonds += rekap.pendapatan;

            contentDiv.innerHTML += `
                <div class="bg-stone-100 dark:bg-stone-700 p-3 rounded-lg">
                    <p class="font-semibold text-stone-800 dark:text-stone-200">Sesi Pukul ${rekap.waktu_mulai}</p>
                    <div class="mt-1 border-t border-stone-200 dark:border-stone-600 pt-1 text-stone-600 dark:text-stone-300">
                        <p class="flex justify-between"><span>Akun:</span> <span>${tiktokAccount ? tiktokAccount.username : 'N/A'}</span></p>
                        <p class="flex justify-between"><span>Durasi:</span> <span>${formatDuration(rekap.durasi_menit)}</span></p>
                        <p class="flex justify-between"><span>Diamond:</span> <span>${formatDiamond(rekap.pendapatan)}</span></p>
                    </div>
                </div>
            `;
        });

        contentDiv.innerHTML += `
            <div class="bg-purple-50 dark:bg-purple-900/50 p-3 rounded-lg mt-4 text-center">
                <p class="font-bold text-purple-800 dark:text-purple-300">Total Hari Ini: ${formatDuration(totalMinutes)} / ${formatDiamond(totalDiamonds)}</p>
            </div>
        `;
    }

    modal.classList.remove('hidden');
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
