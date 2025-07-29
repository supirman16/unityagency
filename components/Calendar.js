// components/Calendar.js
// Komponen ini bertanggung jawab untuk merender kalender
// di halaman Analisis Kinerja.

import { state } from '../state.js';
import { calendarState } from '../ui.js';
import { formatDiamond, formatDuration } from '../utils.js';

export function renderCalendar() {
    if (!state.currentUser) return;

    const calendarGrid = document.getElementById('calendar-grid');
    const monthDisplay = document.getElementById('calendar-month-year');
    const hostSelect = document.getElementById('analysis-host-filter');
    if (!calendarGrid || !monthDisplay || !hostSelect) return;

    const isSuperAdmin = state.currentUser.user_metadata?.role === 'superadmin';
    let selectedHostId;

    if (isSuperAdmin) {
        if (!hostSelect.value) {
            const firstActiveHost = state.hosts.find(h => h.status === 'Aktif');
            if (firstActiveHost) {
                hostSelect.value = firstActiveHost.id;
            } else {
                calendarGrid.innerHTML = '<p class="text-center col-span-7 text-stone-500">Tidak ada host aktif yang bisa dipilih.</p>';
                return;
            }
        }
        selectedHostId = parseInt(hostSelect.value);
    } else {
        selectedHostId = state.currentUser.user_metadata.host_id;
    }

    const year = calendarState.currentDate.getFullYear();
    const month = calendarState.currentDate.getMonth();

    monthDisplay.textContent = new Date(year, month).toLocaleString('id-ID', {
        month: 'long',
        year: 'numeric'
    });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const startDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

    const hostRekaps = state.rekapLive.filter(r => 
        r.host_id === selectedHostId && r.status === 'approved'
    );

    const dailyData = hostRekaps.reduce((acc, r) => {
        const [recYear, recMonth, recDay] = r.tanggal_live.split('-').map(Number);
        if (recYear === year && (recMonth - 1) === month) {
            if (!acc[recDay]) {
                acc[recDay] = { totalMinutes: 0, totalDiamonds: 0 };
            }
            acc[recDay].totalMinutes += r.durasi_menit;
            acc[recDay].totalDiamonds += r.pendapatan;
        }
        return acc;
    }, {});

    calendarGrid.innerHTML = '';

    // Hanya tampilkan sel kosong di tampilan desktop
    for (let i = 0; i < startDay; i++) {
        calendarGrid.innerHTML += `<div class="hidden md:block border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 rounded-md"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayData = dailyData[day];
        let content = '';
        let statusClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        let statusText = 'Absent';
        let clickableClass = '';
        let mobileDetails = '<p class="text-sm text-stone-500 dark:text-stone-400">Absent</p>';

        if (dayData && dayData.totalMinutes >= 120) {
            statusClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            statusText = 'Live';
            clickableClass = 'cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700';
            content = `
                <div class="text-xs mt-2 space-y-1">
                    <p class="flex justify-between"><span>Jam:</span> <span>${formatDuration(dayData.totalMinutes)}</span></p>
                    <p class="flex justify-between"><span>Diamond:</span> <span>${formatDiamond(dayData.totalDiamonds)}</span></p>
                </div>
            `;
            mobileDetails = `
                <div class="text-sm">
                    <p class="font-semibold text-stone-800 dark:text-stone-200">${formatDuration(dayData.totalMinutes)}</p>
                    <p class="text-stone-600 dark:text-stone-300">${formatDiamond(dayData.totalDiamonds)}</p>
                </div>
            `;
        }

        calendarGrid.innerHTML += `
            <!-- Desktop View -->
            <div class="hidden md:flex border border-stone-200 dark:border-stone-700 p-2 rounded-md h-32 flex-col ${clickableClass}" data-day="${day}">
                <div class="font-bold text-stone-800 dark:text-stone-200">${day}</div>
                <div class="mt-1">
                    <span class="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${statusText}
                    </span>
                </div>
                ${content}
            </div>
            <!-- Mobile View -->
            <div class="flex md:hidden calendar-day-mobile border-stone-200 dark:border-stone-700 ${clickableClass}" data-day="${day}">
                <div class="date-circle ${dayData && dayData.totalMinutes >= 120 ? 'bg-green-200 dark:bg-green-800' : 'bg-stone-200 dark:bg-stone-700'}">
                    ${day}
                </div>
                <div class="details">
                    ${mobileDetails}
                </div>
            </div>
        `;
    }
}
