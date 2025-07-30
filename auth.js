import { state } from './state.js';
import { supabaseClient } from './main.js';
import { showNotification, showButtonLoader, hideButtonLoader } from './ui.js';

export async function handleLogin(event) {
    event.preventDefault();
    const button = event.submitter;
    showButtonLoader(button);
    const loginError = document.getElementById('login-error');
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // onAuthStateChange di main.js akan menangani sisanya
    } catch (error) {
        loginError.textContent = 'Email atau password salah.';
        loginError.classList.remove('hidden');
    } finally {
        hideButtonLoader(button);
    }
}

export async function handleLogout() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        // onAuthStateChange di main.js akan menangani sisanya
    } catch (error) {
        showNotification(`Error saat logout: ${error.message}`, true);
    }
}
