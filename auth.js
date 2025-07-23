import { supabaseClient, state } from './main.js';
import { showButtonLoader, hideButtonLoader } from './ui.js';

export async function handleLogin(e) {
    e.preventDefault();
    const button = e.submitter;
    showButtonLoader(button);
    const loginError = document.getElementById('login-error');
    loginError.classList.add('hidden');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // onAuthStateChange in main.js will handle the UI change
    } catch (error) {
        loginError.textContent = "Email atau password salah.";
        loginError.classList.remove('hidden');
    } finally {
        hideButtonLoader(button);
    }
}

export async function handleLogout() {
    await supabaseClient.auth.signOut();
    // onAuthStateChange in main.js will handle the UI change
}

export async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session;
}
