import { state, updateAllDataAndUI } from './main.js';
import { handleLogout } from './auth.js';
import { updatePerformanceChart } from './render.js';

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
    if (isSuperAdmin) return 'hosts';
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
