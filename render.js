import { state, supabaseClient } from './main.js';
import { calendarState } from './ui.js';
import { formatDiamond, formatDate, formatDuration, formatRupiah } from './utils.js';
import { renderCalendar } from './components/Calendar.js';

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

export async function renderHostDocuments(hostId) {
    const documentsListDiv = document.getElementById('host-documents-list');
    if (!documentsListDiv) return;

    documentsListDiv.innerHTML = '<p class="text-stone-500 dark:text-stone-400">Memuat dokumen...</p>';

    try {
        const { data: files, error } = await supabaseClient
            .storage
            .from('host-document')
            .list(hostId.toString(), {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            });

        if (error) throw error;

        if (files.length === 0) {
            documentsListDiv.innerHTML = '<p class="text-stone-500 dark:text-stone-400">Belum ada dokumen yang diunggah.</p>';
            return;
        }

        documentsListDiv.innerHTML = files.map(file => `
            <div class="flex justify-between items-center bg-stone-100 dark:bg-stone-700 p-2 rounded-md">
                <span class="text-sm text-stone-700 dark:text-stone-200">${file.name}</span>
                <div>
                    <button class="text-sm font-medium text-purple-600 hover:underline dark:text-purple-500 mr-3 btn-download-document" data-path="${hostId}/${file.name}">Unduh</button>
                    <button class="text-sm font-medium text-red-600 hover:underline dark:text-red-500 btn-delete-document" data-path="${hostId}/${file.name}">Hapus</button>
                </div>
            </div>
        `).join('');

    } catch (err) {
        documentsListDiv.innerHTML = '<p class="text-red-500">Gagal memuat dokumen.</p>';
        console.error('Error fetching documents:', err);
    }
}

export function renderMySalaryView() {
    if (!state.currentUser || state.currentUser.user_metadata?.role !== 'host') return;

    const hostId = state.currentUser.user_metadata.host_id;
    const month = parseInt(document.getElementById('my-salary-month-filter').value);
    const year = parseInt(document.getElementById('my-salary-year-filter').value);

    if (!hostId || isNaN(month) || isNaN(year)) return;

    const payrollData = calculatePayroll(hostId, year, month);
    if (!payrollData) {
        // Handle case where payroll data might not be available
        document.getElementById('my-salary-detail-base').textContent = 'N/A';
        document.getElementById('my-salary-detail-hours').textContent = 'N/A';
        document.getElementById('my-salary-detail-days').textContent = 'N/A';
        document.getElementById('my-salary-detail-deduction').textContent = 'N/A';
        document.getElementById('my-salary-detail-adjusted-base').textContent = 'N/A';
        document.getElementById('my-salary-detail-diamonds').textContent = 'N/A';
        document.getElementById('my-salary-detail-bonus').textContent = 'N/A';
        document.getElementById('my-salary-detail-final').textContent = 'N/A';
        return;
    };

    document.getElementById('my-salary-detail-base').textContent = formatRupiah(payrollData.baseSalary);
    document.getElementById('my-salary-detail-hours').textContent = `${payrollData.totalHours.toFixed(2)} jam / ${payrollData.targetHours} jam`;
    document.getElementById('my-salary-detail-days').textContent = `${payrollData.workDays} hari / ${payrollData.targetDays} hari`;
    document.getElementById('my-salary-detail-deduction').textContent = formatRupiah(payrollData.deduction);
    document.getElementById('my-salary-detail-adjusted-base').textContent = formatRupiah(payrollData.adjustedBaseSalary);
    document.getElementById('my-salary-detail-diamonds').textContent = formatDiamond(payrollData.totalDiamonds);
    document.getElementById('my-salary-detail-bonus').textContent = formatRupiah(payrollData.bonus);
    document.getElementById('my-salary-detail-final').textContent = formatRupiah(payrollData.finalSalary);
}
