import { handleLogin, handleLogout } from './auth.js';
import { fetchData } from './api.js';
import { setupEventListeners, setupUIForRole, showSection, getFirstVisibleSection, applyTheme, setupRekapFilters, setupAnalysisFilters } from './ui.js';
import { renderHostTable, renderTiktokTable, renderUserTable, renderRekapTable, updateKPIs, updatePerformanceChart, populateHostDropdowns, populateTiktokDropdowns, renderAnalysisView } from './render.js';

// --- KONEKSI KE SUPABASE ---
const supabaseUrl = 'https://zorudwncbfietuzxrerd.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvcnVkd25jYmZpZXR1enhyZXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NzMzNTUsImV4cCI6MjA2ODI0OTM1NX0.d6YJ8qj3Uegmei6ip52fQ0gnjJltqVDlrlbu6VXk7Ks'; 
export const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- GLOBAL STATE ---
export let state = {
    currentUser: null,
    hosts: [],
    tiktokAccounts: [],
    rekapLive: [],
    users: [],
    itemToDelete: { id: null, type: '' },
    parsedCsvData: [],
    sortState: {
        hosts: { key: 'nama_host', direction: 'asc' },
        tiktok: { key: 'username', direction: 'asc' },
        rekap: { key: 'tanggal_live', direction: 'desc' },
        users: { key: 'email', direction: 'asc' }
    },
    performanceChart: null,
    hostMenuAccess: {
        dashboard: true,
        analysis: true,
        rekap: true,
    }
};

async function refreshDataAndRender() {
    await fetchData();
    // Re-render all components that might have changed
    renderHostTable();
    renderTiktokTable();
    renderUserTable();
    renderRekapTable();
    updateKPIs();
    updatePerformanceChart();
    
    // Re-populate dropdowns in case data changed (e.g., new host added)
    populateHostDropdowns(document.getElementById('rekap-host'));
    populateTiktokDropdowns(document.getElementById('rekap-tiktok-account'));
    populateHostDropdowns(document.getElementById('user-host-link'));

    // Re-populate profile form if the user is a host
    if (state.currentUser.user_metadata?.role === 'host') {
        const hostData = state.hosts.find(h => h.id === state.currentUser.user_metadata.host_id);
        if (hostData) {
            document.getElementById('profile-nama').value = hostData.nama_host || '';
            document.getElementById('profile-telepon').value = hostData.nomor_telepon || '';
            document.getElementById('profile-alamat').value = hostData.alamat || '';
            document.getElementById('profile-bank').value = hostData.nama_bank || '';
            document.getElementById('profile-rekening').value = hostData.nomor_rekening || '';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Apply initial theme
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);
    
    setupEventListeners();

    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        const wasLoggedIn = !!state.currentUser;
        const isLoggedIn = !!session?.user;

        if (isLoggedIn && !wasLoggedIn) { // User just logged in
            state.currentUser = session.user;
            document.getElementById('login-page').classList.add('hidden');
            document.getElementById('app').classList.remove('hidden');
            await updateAllDataAndUI();
        } else if (!isLoggedIn && wasLoggedIn) { // User just logged out
            state.currentUser = null;
            document.getElementById('app').classList.add('hidden');
            document.getElementById('login-page').classList.remove('hidden');
            document.getElementById('login-form').reset();
            document.getElementById('login-error').classList.add('hidden');
        }
    });
});

export async function updateAllDataAndUI() {
    await fetchData();
    await setupUIForRole();
    // Setup filters and render tables
    setupRekapFilters();
    setupAnalysisFilters(); 
    renderHostTable();
    renderTiktokTable();
    renderUserTable();
    renderRekapTable();
    updateKPIs();
    updatePerformanceChart();
    
    // Populate dropdowns in modals
    populateHostDropdowns(document.getElementById('rekap-host'));
    populateTiktokDropdowns(document.getElementById('rekap-tiktok-account'));
    populateHostDropdowns(document.getElementById('user-host-link'));
    
    if (state.currentUser.user_metadata?.role === 'host') {
        const hostData = state.hosts.find(h => h.id === state.currentUser.user_metadata.host_id);
        if (hostData) {
            document.getElementById('profile-nama').value = hostData.nama_host || '';
            document.getElementById('profile-telepon').value = hostData.nomor_telepon || '';
            document.getElementById('profile-alamat').value = hostData.alamat || '';
            document.getElementById('profile-bank').value = hostData.nama_bank || '';
            document.getElementById('profile-rekening').value = hostData.nomor_rekening || '';
        }
    }
    
    showSection(getFirstVisibleSection());
}
