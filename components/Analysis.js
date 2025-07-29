// components/Analysis.js
// Komponen ini bertanggung jawab untuk semua logika dan rendering
// di halaman Analisis Kinerja.

import { state } from '../state.js';
import { calendarState } from '../ui.js';
import { formatDiamond, formatDuration } from '../utils.js';
import { renderCalendar } from './Calendar.js'; // <-- Diperbarui untuk mengimpor dari komponen Kalender

function calculateMonthlyPerformance(hostId, year, month) {
    const targetWorkDays = 26;
    const dailyTargetHours = 6;
    const minWorkMinutes = 120; // 2 jam dalam menit

    const hostRekaps = state.rekapLive.filter(r => {
        const [recYear, recMonth] = r.tanggal_live.split('-').map(Number);
        return r.host_id === hostId && recYear === year && (recMonth - 1) === month && r.status === 'approved';
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
    Object.values(dailyData).forEach(daySummary => {
        if (daySummary.minutes >= minWorkMinutes) {
            achievedWorkDays++;
        }
    });
    
    let totalLiveMinutes = hostRekaps.reduce((sum, r) => sum + r.durasi_menit, 0);
    let absentDays = 0;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offDayEntitlement = daysInMonth - targetWorkDays;
    
    const today = new Date();
    const lastDayToCheck = (year === today.getFullYear() && month === today.getMonth()) ? today.getDate() : daysInMonth;
    
    const presentDays = new Set(Object.keys(dailyData));
    for (let day = 1; day <= lastDayToCheck; day++) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (!presentDays.has(dateString)) {
            absentDays++;
        }
    }

    const remainingOffDays = offDayEntitlement - absentDays;
    const totalLiveHours = totalLiveMinutes / 60;
    const targetLiveHours = achievedWorkDays * dailyTargetHours;
    const hourBalance = totalLiveHours - targetLiveHours;
    const totalDiamonds = hostRekaps.reduce((sum, r) => sum + r.pendapatan, 0);
    const revenuePerDay = achievedWorkDays > 0 ? Math.round(totalDiamonds / achievedWorkDays) : 0;

    return {
        workDays: achievedWorkDays,
        totalHours: totalLiveHours,
        hourBalance: hourBalance,
        offDayEntitlement: offDayEntitlement,
        remainingOffDays: remainingOffDays,
        totalDiamonds: totalDiamonds,
        revenuePerDay: revenuePerDay
    };
}

export function renderAnalysisView() {
    if (!state.currentUser) return;
    const hostSelect = document.getElementById('analysis-host-filter');
    let hostId;
    const month = calendarState.currentDate.getMonth();
    const year = calendarState.currentDate.getFullYear();

    const isSuperAdmin = state.currentUser.user_metadata?.role === 'superadmin';
    if (isSuperAdmin) {
        if (!hostSelect.value) {
            const firstActiveHost = state.hosts.find(h => h.status === 'Aktif');
            if (firstActiveHost) {
                hostSelect.value = firstActiveHost.id;
            }
        }
        hostId = parseInt(hostSelect.value);
    } else {
        hostId = state.currentUser.user_metadata.host_id;
    }

    if (!hostId || isNaN(month) || isNaN(year)) {
        document.getElementById('analysis-work-days').textContent = '-';
        document.getElementById('analysis-total-hours').textContent = '-';
        document.getElementById('analysis-hour-balance').textContent = '-';
        document.getElementById('analysis-off-allowance').textContent = '-';
        document.getElementById('analysis-off-remaining').textContent = '-';
        document.getElementById('analysis-total-diamonds').textContent = '-';
        document.getElementById('analysis-revenue-per-day').textContent = '-';
        renderCalendar();
        return;
    }

    const performance = calculateMonthlyPerformance(hostId, year, month);
    
    document.getElementById('analysis-work-days').textContent = performance.workDays;
    document.getElementById('analysis-off-allowance').textContent = performance.offDayEntitlement;
    document.getElementById('analysis-off-remaining').textContent = performance.remainingOffDays;
    document.getElementById('analysis-total-hours').textContent = formatDuration(Math.round(performance.totalHours * 60));
    document.getElementById('analysis-total-diamonds').textContent = formatDiamond(performance.totalDiamonds);
    document.getElementById('analysis-revenue-per-day').textContent = `${formatDiamond(performance.revenuePerDay)}/hari`;
    
    const balanceEl = document.getElementById('analysis-hour-balance');
    balanceEl.textContent = formatDuration(Math.round(performance.hourBalance * 60));
    if (performance.hourBalance < 0) {
        balanceEl.classList.remove('text-green-600', 'dark:text-green-400');
        balanceEl.classList.add('text-red-600', 'dark:text-red-400');
    } else {
        balanceEl.classList.remove('text-red-600', 'dark:text-red-400');
        balanceEl.classList.add('text-green-600', 'dark:text-green-400');
    }

    renderCalendar();
}
