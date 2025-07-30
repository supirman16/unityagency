// components/Modals.js
// Komponen ini bertanggung jawab untuk semua logika
// yang berhubungan dengan modal (pop-up).

import { state } from '../state.js';
import { showNotification } from '../ui.js';
import { populateHostDropdowns, populateTiktokDropdowns, renderHostDocuments } from '../render.js';
import { calculatePayroll } from './Analysis.js';
import { formatDiamond, formatDate, formatDuration, formatRupiah } from '../utils.js';

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
