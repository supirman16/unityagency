// components/Table.js
// Komponen ini bertanggung jawab untuk merender semua tabel di aplikasi.

import { state } from '../state.js';
import { formatDiamond, formatDate, formatDuration, formatRupiah } from '../utils.js';
import { calculatePayroll } from './Analysis.js';

// --- FUNGSI SORTING ---
function universalSorter(a, b, key, direction, type, lookupInfo) {
    let valA, valB;

    function getValue(item) {
        if (lookupInfo) {
            const lookupArray = lookupInfo.array;
            const lookupId = key.includes('.') ? item[key.split('.')[0]][key.split('.')[1]] : item[key];
            const found = lookupArray.find(l => l.id === lookupId);
            return found ? found[lookupInfo.field] : null;
        }
        if (key.includes('.')) {
            const keys = key.split('.');
            return item[keys[0]] ? item[keys[0]][keys[1]] : null;
        }
        return item[key];
    }

    valA = getValue(a);
    valB = getValue(b);

    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    if (type === 'date') {
        valA = new Date(valA);
        valB = new Date(valB);
    } else if (type === 'number') {
        valA = Number(valA);
        valB = Number(valB);
    } else if (typeof valA === 'string' && typeof valB === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
    }
    
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
}

function updateSortIndicators(tableId, currentSortState) {
     const table = document.getElementById(tableId);
     if (!table) return;
     table.querySelectorAll('.sortable-header').forEach(header => {
        const indicator = header.querySelector('.sort-indicator');
        if (header.dataset.sortKey === currentSortState.key) {
            indicator.classList.add('active', currentSortState.direction);
            indicator.classList.remove(currentSortState.direction === 'asc' ? 'desc' : 'asc');
        } else {
            indicator.className = 'sort-indicator';
        }
    });
}

// --- FUNGSI RENDER TABEL ---
export function renderHostTable() {
    const hostTableBody = document.getElementById('host-table-body');
    if (!hostTableBody) return;
    const { key, direction } = state.sortState.hosts;
    const type = document.querySelector(`#host-table th[data-sort-key="${key}"]`).dataset.sortType || 'string';
    const sortedData = [...state.hosts].sort((a,b) => universalSorter(a, b, key, direction, type));

    hostTableBody.innerHTML = '';
    sortedData.forEach(host => {
        const row = document.createElement('tr');
        row.className = 'block md:table-row bg-white dark:bg-stone-800 border-b dark:border-stone-700 mb-4 md:mb-0 rounded-lg md:rounded-none shadow-md md:shadow-none';
        row.innerHTML = `
            <td data-label="Nama Host:" class="mobile-label px-6 py-4 block md:table-cell font-medium text-stone-900 dark:text-white whitespace-nowrap">${host.nama_host}</td>
            <td data-label="Platform:" class="mobile-label px-6 py-4 block md:table-cell">${host.platform}</td>
            <td data-label="Tgl Bergabung:" class="mobile-label px-6 py-4 block md:table-cell">${formatDate(host.tanggal_bergabung)}</td>
            <td data-label="Status:" class="mobile-label px-6 py-4 block md:table-cell">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${host.status === 'Aktif' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}">
                    ${host.status}
                </span>
            </td>
            <td data-label="Aksi:" class="mobile-label px-6 py-4 block md:table-cell text-right md:text-center">
                <button class="font-medium text-purple-600 hover:underline dark:text-purple-500 mr-3 btn-edit-host" data-id="${host.id}">Ubah</button>
                <button class="font-medium text-red-600 hover:underline dark:text-red-500 btn-delete-host" data-id="${host.id}">Hapus</button>
            </td>
        `;
        hostTableBody.appendChild(row);
    });
    updateSortIndicators('host-table', state.sortState.hosts);
}

export function renderTiktokTable() {
    const tiktokTableBody = document.getElementById('tiktok-table-body');
    if (!tiktokTableBody) return;
    const { key, direction } = state.sortState.tiktok;
    const type = document.querySelector(`#tiktok-table th[data-sort-key="${key}"]`).dataset.sortType || 'string';
    const sortedData = [...state.tiktokAccounts].sort((a,b) => universalSorter(a, b, key, direction, type));

    tiktokTableBody.innerHTML = '';
    sortedData.forEach(account => {
        const row = document.createElement('tr');
        row.className = 'block md:table-row bg-white dark:bg-stone-800 border-b dark:border-stone-700 mb-4 md:mb-0 rounded-lg md:rounded-none shadow-md md:shadow-none';
        row.innerHTML = `
            <td data-label="Username:" class="mobile-label px-6 py-4 block md:table-cell font-medium text-stone-900 dark:text-white whitespace-nowrap">${account.username}</td>
            <td data-label="Status:" class="mobile-label px-6 py-4 block md:table-cell">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${account.status === 'Aktif' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}">
                    ${account.status}
                </span>
            </td>
            <td data-label="Aksi:" class="mobile-label px-6 py-4 block md:table-cell text-right md:text-center">
                <button class="font-medium text-purple-600 hover:underline dark:text-purple-500 mr-3 btn-edit-tiktok" data-id="${account.id}">Ubah</button>
                <button class="font-medium text-red-600 hover:underline dark:text-red-500 btn-delete-tiktok" data-id="${account.id}">Hapus</button>
            </td>
        `;
        tiktokTableBody.appendChild(row);
    });
    updateSortIndicators('tiktok-table', state.sortState.tiktok);
}

export function renderUserTable() {
    const userTableBody = document.getElementById('user-table-body');
    if (!userTableBody) return;
    const { key, direction } = state.sortState.users;
    const header = document.querySelector(`#user-table th[data-sort-key="${key}"]`);
    const type = header.dataset.sortType || 'string';
    const lookupType = header.dataset.sortLookup;
    let lookupInfo = null;
    if (lookupType === 'hosts') {
        lookupInfo = { array: state.hosts, field: 'nama_host' };
    }
    
    const sortedData = [...state.users].sort((a, b) => universalSorter(a, b, key, direction, type, lookupInfo));

    userTableBody.innerHTML = '';
    sortedData.forEach(user => {
        const host = user.user_metadata.host_id ? state.hosts.find(h => h.id === user.user_metadata.host_id) : null;
        const row = document.createElement('tr');
        row.className = 'block md:table-row bg-white dark:bg-stone-800 border-b dark:border-stone-700 mb-4 md:mb-0 rounded-lg md:rounded-none shadow-md md:shadow-none';
        row.innerHTML = `
            <td data-label="Email:" class="mobile-label px-6 py-4 block md:table-cell font-medium text-stone-900 dark:text-white whitespace-nowrap">${user.email}</td>
            <td data-label="Peran:" class="mobile-label px-6 py-4 block md:table-cell">${user.user_metadata.role}</td>
            <td data-label="Host:" class="mobile-label px-6 py-4 block md:table-cell">${host ? host.nama_host : '-'}</td>
            <td data-label="Aksi:" class="mobile-label px-6 py-4 block md:table-cell text-right md:text-center">
                <button class="font-medium text-purple-600 hover:underline dark:text-purple-500 mr-3 btn-edit-user" data-id="${user.id}">Ubah</button>
                ${state.currentUser.id !== user.id ? `<button class="font-medium text-red-600 hover:underline dark:text-red-500 btn-delete-user" data-id="${user.id}">Hapus</button>` : ''}
            </td>
        `;
        userTableBody.appendChild(row);
    });
    updateSortIndicators('user-table', state.sortState.users);
}

export function renderRekapTable() {
    if (!state.currentUser) return;
    const rekapTableBody = document.getElementById('rekap-table-body');
    if (!rekapTableBody) return;
    const isSuperAdmin = state.currentUser.user_metadata?.role === 'superadmin';
    const month = parseInt(document.getElementById('rekap-month-filter').value);
    const year = parseInt(document.getElementById('rekap-year-filter').value);
    
    let filteredRekap = state.rekapLive.filter(r => {
        const recDate = new Date(r.tanggal_live);
        return recDate.getFullYear() === year && recDate.getMonth() === month;
    });

    if (!isSuperAdmin) {
        filteredRekap = filteredRekap.filter(r => r.host_id === state.currentUser.user_metadata.host_id);
    }
    
    const { key, direction } = state.sortState.rekap;
    const header = document.querySelector(`#rekap-table th[data-sort-key="${key}"]`);
    const type = header.dataset.sortType || 'string';
    const lookupType = header.dataset.sortLookup;
    let lookupInfo = null;
    if (lookupType === 'hosts') {
        lookupInfo = { array: state.hosts, field: 'nama_host' };
    } else if (lookupType === 'tiktok') {
        lookupInfo = { array: state.tiktokAccounts, field: 'username' };
    }
    
    const sortedData = [...filteredRekap].sort((a,b) => {
        const primarySort = universalSorter(a, b, key, direction, type, lookupInfo);
        if (primarySort !== 0) return primarySort;

        // Pengurutan sekunder berdasarkan tanggal dan jam mulai
        const dateA = new Date(`${a.tanggal_live}T${a.waktu_mulai}`);
        const dateB = new Date(`${b.tanggal_live}T${b.waktu_mulai}`);
        if (dateA < dateB) return direction === 'asc' ? -1 : 1;
        if (dateA > dateB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    rekapTableBody.innerHTML = '';
     if (sortedData.length === 0) {
        rekapTableBody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-stone-500 dark:text-stone-400">Tidak ada data rekap untuk ditampilkan pada periode ini.</td></tr>`;
        return;
    }
    sortedData.forEach(rekap => {
        const host = state.hosts.find(h => h.id === rekap.host_id);
        const tiktokAccount = state.tiktokAccounts.find(t => t.id === rekap.tiktok_account_id);
        const row = document.createElement('tr');
        row.className = 'block md:table-row bg-white dark:bg-stone-800 border-b dark:border-stone-700 mb-4 md:mb-0 rounded-lg md:rounded-none shadow-md md:shadow-none cursor-pointer';
        row.dataset.rekapId = rekap.id;

        let statusBadge = '';
        if (rekap.status === 'pending') {
            statusBadge = '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Pending</span>';
        } else if (rekap.status === 'approved') {
            statusBadge = '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Approved</span>';
        }

        let actionButtons = '';
        if (isSuperAdmin) {
            if (rekap.status === 'pending') {
                actionButtons = `
                    <button class="font-medium text-green-600 hover:underline dark:text-green-500 mr-3 btn-approve-rekap" data-id="${rekap.id}">Approve</button>
                    <button class="font-medium text-red-600 hover:underline dark:text-red-500 mr-3 btn-reject-rekap" data-id="${rekap.id}">Reject</button>
                    <button class="font-medium text-purple-600 hover:underline dark:text-purple-500 mr-3 btn-edit-rekap" data-id="${rekap.id}">Ubah</button>
                    <button class="font-medium text-red-600 hover:underline dark:text-red-500 btn-delete-rekap" data-id="${rekap.id}">Hapus</button>
                `;
            } else if (rekap.status === 'approved') {
                actionButtons = `<button class="font-medium text-yellow-600 hover:underline dark:text-yellow-500 btn-rollback-rekap" data-id="${rekap.id}">Rollback</button>`;
            }
        } else {
            if (rekap.status === 'pending') {
                actionButtons = `
                    <button class="font-medium text-purple-600 hover:underline dark:text-purple-500 mr-3 btn-edit-rekap" data-id="${rekap.id}">Ubah</button>
                    <button class="font-medium text-red-600 hover:underline dark:text-red-500 btn-delete-rekap" data-id="${rekap.id}">Hapus</button>
                `;
            }
        }

        row.innerHTML = `
            <td data-label="Tanggal:" class="mobile-label px-6 py-4 block md:table-cell">${formatDate(rekap.tanggal_live)}</td>
            <td data-label="Host:" class="mobile-label px-6 py-4 block md:table-cell font-medium text-stone-900 dark:text-white whitespace-nowrap">${host ? host.nama_host : 'Host Dihapus'}</td>
            <td data-label="Akun:" class="mobile-label px-6 py-4 block md:table-cell">${tiktokAccount ? tiktokAccount.username : 'Akun Dihapus'}</td>
            <td data-label="Durasi:" class="mobile-label px-6 py-4 block md:table-cell">${formatDuration(rekap.durasi_menit)}</td>
            <td data-label="Diamond:" class="mobile-label px-6 py-4 block md:table-cell">${formatDiamond(rekap.pendapatan)}</td>
            <td data-label="Status:" class="mobile-label px-6 py-4 block md:table-cell">${statusBadge}</td>
            <td data-label="Aksi:" class="mobile-label px-6 py-4 block md:table-cell text-right md:text-center">${actionButtons}</td>
        `;
        rekapTableBody.appendChild(row);
    });
    updateSortIndicators('rekap-table', state.sortState.rekap);
}

export function renderPayrollTable() {
    const payrollTableBody = document.getElementById('payroll-table-body');
    if (!payrollTableBody) return;

    const month = parseInt(document.getElementById('payroll-month-filter').value);
    const year = parseInt(document.getElementById('payroll-year-filter').value);

    const activeHosts = state.hosts.filter(h => h.status === 'Aktif');

    payrollTableBody.innerHTML = '';
    if (activeHosts.length === 0) {
        payrollTableBody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-stone-500 dark:text-stone-400">Tidak ada host aktif untuk ditampilkan.</td></tr>`;
        return;
    }

    activeHosts.forEach(host => {
        const payrollData = calculatePayroll(host.id, year, month);
        if (!payrollData) return;

        const row = document.createElement('tr');
        row.className = 'block md:table-row bg-white dark:bg-stone-800 border-b dark:border-stone-700 mb-4 md:mb-0 rounded-lg md:rounded-none shadow-md md:shadow-none';
        row.innerHTML = `
            <td data-label="Nama Host:" class="mobile-label px-6 py-4 block md:table-cell font-medium text-stone-900 dark:text-white whitespace-nowrap">${payrollData.hostName}</td>
            <td data-label="Total Jam:" class="mobile-label px-6 py-4 block md:table-cell">${formatDuration(payrollData.totalHours * 60)}</td>
            <td data-label="Total Diamond:" class="mobile-label px-6 py-4 block md:table-cell">${formatDiamond(payrollData.totalDiamonds)}</td>
            <td data-label="Gaji Pokok:" class="mobile-label px-6 py-4 block md:table-cell">${formatRupiah(payrollData.baseSalary)}</td>
            <td data-label="Bonus:" class="mobile-label px-6 py-4 block md:table-cell text-green-600 dark:text-green-400">${formatRupiah(payrollData.bonus)}</td>
            <td data-label="Potongan:" class="mobile-label px-6 py-4 block md:table-cell text-red-600 dark:text-red-400">${formatRupiah(payrollData.deduction)}</td>
            <td data-label="Gaji Akhir:" class="mobile-label px-6 py-4 block md:table-cell font-bold text-purple-700 dark:text-purple-500">${formatRupiah(payrollData.finalSalary)}</td>
            <td data-label="Aksi:" class="mobile-label px-6 py-4 block md:table-cell text-right md:text-center">
                <button class="font-medium text-purple-600 hover:underline dark:text-purple-500 btn-payroll-detail" data-id="${host.id}">Detail</button>
            </td>
        `;
        payrollTableBody.appendChild(row);
    });
}
