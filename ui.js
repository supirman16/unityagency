import { state } from './state.js';
import { updatePerformanceChart, populateHostDropdowns } from './render.js';
import { renderAnalysisView } from './components/Analysis.js';
import { renderRekapTable, renderPayrollTable } from './components/Table.js';
import { renderMySalaryView } from './render.js';

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

    const navItemMySalary = document.getElementById('nav-item-my-salary');
    if (navItemMySalary) navItemMySalary.style.display = !isSuperAdmin ? 'flex' : 'none';

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

    if (isSuperAdmin) {
        return 'dashboard';
    } else {
        if (state.hostMenuAccess.dashboard) return 'dashboard';
        if (state.hostMenuAccess.analysis) return 'analysis';
        if (state.hostMenuAccess.rekap) return 'rekap';
        return 'profile'; // Fallback untuk host
    }
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

export function setupMySalaryFilters() {
    const monthSelect = document.getElementById('my-salary-month-filter');
    const yearSelect = document.getElementById('my-salary-year-filter');
    
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
    [monthSelect, yearSelect].forEach(el => el.addEventListener('change', renderMySalaryView));
}
