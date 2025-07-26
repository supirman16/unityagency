import { state } from './main.js';
import { formatDiamond, formatDate, formatDuration, formatRupiah } from './utils.js';

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
    
    const sortedData = [...filteredRekap].sort((a,b) => universalSorter(a, b, key, direction, type, lookupInfo));

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

export function populateHostDropdowns(selectElement) {
    if (!selectElement) return;
    const currentVal = selectElement.value;
    selectElement.innerHTML = '<option value="" disabled>Pilih seorang host</option>';
    state.hosts.filter(h => h.status === 'Aktif').forEach(host => {
        const option = document.createElement('option');
        option.value = host.id;
        option.textContent = host.nama_host;
        selectElement.appendChild(option);
    });
    selectElement.value = currentVal;
}

export function populateTiktokDropdowns(selectElement) {
    if (!selectElement) return;
    const currentVal = selectElement.value;
    selectElement.innerHTML = '<option value="" disabled>Pilih Akun TikTok</option>';
    state.tiktokAccounts.filter(t => t.status === 'Aktif').forEach(acc => {
        const option = document.createElement('option');
        option.value = acc.id;
        option.textContent = acc.username;
        selectElement.appendChild(option);
    });
    selectElement.value = currentVal;
}

export function updateKPIs() {
    if (!state.currentUser) return;
    const isSuperAdmin = state.currentUser.user_metadata?.role === 'superadmin';
    if (isSuperAdmin) {
        document.getElementById('kpi-total-hosts').textContent = state.hosts.filter(h => h.status === 'Aktif').length;
        const totalMinutes = state.rekapLive.reduce((sum, r) => sum + r.durasi_menit, 0);
        document.getElementById('kpi-total-hours').textContent = formatDuration(totalMinutes);
        const totalRevenue = state.rekapLive.reduce((sum, r) => sum + r.pendapatan, 0);
        document.getElementById('kpi-total-revenue').textContent = formatDiamond(totalRevenue);
    } else {
        const hostData = state.hosts.find(h => h.id === state.currentUser.user_metadata.host_id);
        if (hostData) {
            document.getElementById('kpi-total-hosts').innerHTML = `<span class="px-3 py-1 text-base leading-5 font-semibold rounded-full ${hostData.status === 'Aktif' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}">${hostData.status}</span>`;
            const hostRekap = state.rekapLive.filter(r => r.host_id === state.currentUser.user_metadata.host_id);
            const totalMinutes = hostRekap.reduce((sum, r) => sum + r.durasi_menit, 0);
            document.getElementById('kpi-total-hours').textContent = formatDuration(totalMinutes);
            const totalRevenue = hostRekap.reduce((sum, r) => sum + r.pendapatan, 0);
            document.getElementById('kpi-total-revenue').textContent = formatDiamond(totalRevenue);
        }
    }
}

export function updatePerformanceChart(metric = 'duration') {
    if (!state.currentUser) return;
    const performanceChartCanvas = document.getElementById('performanceChart').getContext('2d');
    const isSuperAdmin = state.currentUser.user_metadata?.role === 'superadmin';
    let hostData;

    if (isSuperAdmin) {
        hostData = state.hosts.filter(h => h.status === 'Aktif').map(host => {
            const hostRekap = state.rekapLive.filter(r => r.host_id === host.id);
            return { name: host.nama_host, duration: hostRekap.reduce((s, r) => s + r.durasi_menit, 0) / 60, revenue: hostRekap.reduce((s, r) => s + r.pendapatan, 0) };
        });
    } else {
        const hostRekap = state.rekapLive.filter(r => r.host_id === state.currentUser.user_metadata.host_id);
        const dataByDate = hostRekap.reduce((acc, r) => {
            if (!acc[r.tanggal_live]) {
                acc[r.tanggal_live] = { duration: 0, revenue: 0 };
            }
            acc[r.tanggal_live].duration += r.durasi_menit / 60;
            acc[r.tanggal_live].revenue += r.pendapatan;
            return acc;
        }, {});
        hostData = Object.keys(dataByDate).map(date => ({
            name: formatDate(date),
            duration: dataByDate[date].duration,
            revenue: dataByDate[date].revenue
        })).sort((a,b) => new Date(a.name) - new Date(b.name));
    }

    const labels = hostData.map(h => h.name);
    const dataPoints = hostData.map(h => h[metric]);
    const chartLabel = metric === 'duration' ? 'Total Durasi (Jam)' : 'Total Diamond';
    
    const isDarkMode = document.documentElement.classList.contains('dark');
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb';
    const tickColor = isDarkMode ? '#9ca3af' : '#374151';
    const backgroundColor = 'rgba(168, 85, 247, 0.6)';
    const borderColor = 'rgba(147, 51, 234, 1)';
    
    if (state.performanceChart && typeof state.performanceChart.destroy === 'function') { 
        state.performanceChart.destroy(); 
    }

    state.performanceChart = new Chart(performanceChartCanvas, {
        type: 'bar',
        data: { labels: labels, datasets: [{ label: chartLabel, data: dataPoints, backgroundColor: backgroundColor, borderColor: borderColor, borderWidth: 1, borderRadius: 6 }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { 
                y: { 
                    beginAtZero: true, 
                    grid: { color: gridColor },
                    ticks: { color: tickColor }
                }, 
                x: { 
                    grid: { display: false },
                    ticks: { color: tickColor }
                } 
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) { label += ': '; }
                            if (context.parsed.y !== null) {
                                if (metric === 'revenue') { label += new Intl.NumberFormat('id-ID').format(context.parsed.y) + ' 💎'; } 
                                else { label += formatDuration(Math.round(context.parsed.y * 60)); }
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// --- ANALYSIS LOGIC & RENDER ---

export function calculateMonthlyPerformance(hostId, year, month) {
    const targetWorkDays = 26;
    const dailyTargetHours = 6;
    const minWorkHours = 2;

    const hostRekaps = state.rekapLive.filter(r => {
        const recDate = new Date(r.tanggal_live);
        return r.host_id === hostId && recDate.getFullYear() === year && recDate.getMonth() === month && r.status === 'approved';
    });

    const dailyData = hostRekaps.reduce((acc, r) => {
        const dateKey = r.tanggal_live;
        if (!acc[dateKey]) {
            acc[dateKey] = { minutes: 0, revenue: 0 };
        }
        acc[dateKey].minutes += r.durasi_menit;
        acc[dateKey].revenue += r.pendapatan;
        return acc;
    }, {});

    let achievedWorkDays = 0;
    let totalLiveMinutes = 0;
    let totalRevenue = 0;
    let absentDays = 0;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offDayEntitlement = daysInMonth - targetWorkDays;
    
    const today = new Date();
    const lastDayToCheck = (year === today.getFullYear() && month === today.getMonth()) ? today.getDate() : daysInMonth;

    for (let day = 1; day <= lastDayToCheck; day++) {
        const currentDate = new Date(year, month, day);
        const dateString = currentDate.toISOString().split('T')[0];

        if (dailyData[dateString]) {
            const dailyMinutes = dailyData[dateString].minutes;
            totalLiveMinutes += dailyMinutes;
            totalRevenue += dailyData[dateString].revenue;
            if (dailyMinutes >= minWorkHours * 60) {
                achievedWorkDays++;
            }
        } else {
            absentDays++;
        }
    }

    const remainingOffDays = offDayEntitlement - absentDays;
    const totalLiveHours = totalLiveMinutes / 60;
    const targetLiveHours = achievedWorkDays * dailyTargetHours;
    const hourBalance = totalLiveHours - targetLiveHours;
    const revenuePerHour = totalLiveHours > 0 ? Math.round(totalRevenue / totalLiveHours) : 0;

    return {
        workDays: achievedWorkDays,
        totalHours: totalLiveHours,
        hourBalance: hourBalance,
        offDayEntitlement: offDayEntitlement,
        remainingOffDays: remainingOffDays,
        revenuePerHour: revenuePerHour
    };
}

export function renderAnalysisView() {
    if (!state.currentUser) return;
    const hostSelect = document.getElementById('analysis-host');
    let hostId = parseInt(hostSelect.value);
    const month = parseInt(document.getElementById('analysis-month').value);
    const year = parseInt(document.getElementById('analysis-year').value);

    // If superadmin and no host is selected, select the first one.
    const isSuperAdmin = state.currentUser.user_metadata?.role === 'superadmin';
    if (isSuperAdmin && !hostId && hostSelect.options.length > 1) {
        hostSelect.value = hostSelect.options[1].value;
        hostId = parseInt(hostSelect.value);
    }

    if (!hostId || isNaN(month) || isNaN(year)) {
        document.getElementById('analysis-work-days').textContent = '-';
        document.getElementById('analysis-total-hours').textContent = '-';
        document.getElementById('analysis-hour-balance').textContent = '-';
        document.getElementById('analysis-off-allowance').textContent = '-';
        document.getElementById('analysis-off-remaining').textContent = '-';
        document.getElementById('analysis-revenue-per-hour').textContent = '-';
        return;
    }

    const performance = calculateMonthlyPerformance(hostId, year, month);
    
    document.getElementById('analysis-work-days').textContent = performance.workDays;
    document.getElementById('analysis-off-allowance').textContent = performance.offDayEntitlement;
    document.getElementById('analysis-off-remaining').textContent = performance.remainingOffDays;
    document.getElementById('analysis-total-hours').textContent = formatDuration(Math.round(performance.totalHours * 60));
    document.getElementById('analysis-revenue-per-hour').textContent = `${new Intl.NumberFormat('id-ID').format(performance.revenuePerHour)} 💎/jam`;
    
    const balanceEl = document.getElementById('analysis-hour-balance');
    balanceEl.textContent = formatDuration(Math.round(performance.hourBalance * 60));
    if (performance.hourBalance < 0) {
        balanceEl.classList.remove('text-green-600', 'dark:text-green-400');
        balanceEl.classList.add('text-red-600', 'dark:text-red-400');
    } else {
        balanceEl.classList.remove('text-red-600', 'dark:text-red-400');
        balanceEl.classList.add('text-green-600', 'dark:text-green-400');
    }
}

// --- PAYROLL LOGIC & RENDER ---

export function calculatePayroll(hostId, year, month) {
    const host = state.hosts.find(h => h.id === hostId);
    if (!host) {
        return null;
    }

    const hostRekaps = state.rekapLive.filter(r => {
        const recDate = new Date(r.tanggal_live);
        return r.host_id === hostId && recDate.getFullYear() === year && recDate.getMonth() === month && r.status === 'approved';
    });

    const totalDiamonds = hostRekaps.reduce((sum, r) => sum + r.pendapatan, 0);
    const totalMinutes = hostRekaps.reduce((sum, r) => sum + r.durasi_menit, 0);
    const totalHours = totalMinutes / 60;
    
    const workDays = new Set(hostRekaps.map(r => r.tanggal_live)).size;

    // Hitung Bonus berdasarkan target diamond
    let bonus = 0;
    if (totalDiamonds >= 300000) bonus = 5000000;
    else if (totalDiamonds >= 250000) bonus = 4000000;
    else if (totalDiamonds >= 200000) bonus = 3000000;
    else if (totalDiamonds >= 150000) bonus = 2000000;
    else if (totalDiamonds >= 100000) bonus = 1000000;
    else if (totalDiamonds >= 90000) bonus = 900000;
    else if (totalDiamonds >= 80000) bonus = 800000;
    else if (totalDiamonds >= 70000) bonus = 700000;
    else if (totalDiamonds >= 60000) bonus = 600000;
    else if (totalDiamonds >= 50000) bonus = 500000;

    // Hitung Potongan Gaji Pokok
    const targetDays = 26;
    const targetHours = 156;
    const baseSalary = host.gaji_pokok || 0;
    
    const daysPercentage = Math.min(1, workDays / targetDays);
    const hoursPercentage = totalHours > 0 ? Math.min(1, totalHours / targetHours) : 0;
    
    // Gunakan persentase pencapaian yang lebih rendah untuk menghitung gaji yang disesuaikan
    const achievementPercentage = Math.min(daysPercentage, hoursPercentage);
    const adjustedBaseSalary = baseSalary * achievementPercentage;
    const deduction = baseSalary - adjustedBaseSalary;

    // Hitung Gaji Akhir
    const finalSalary = adjustedBaseSalary + bonus;

    return {
        hostName: host.nama_host,
        totalHours,
        totalDiamonds,
        baseSalary,
        bonus,
        deduction,
        adjustedBaseSalary,
        finalSalary,
        workDays,
        targetDays,
        targetHours,
    };
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
