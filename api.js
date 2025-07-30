import { state } from './state.js';
import { supabaseClient } from './main.js';

export async function fetchData() {
    try {
        const { data: hosts, error: hostsError } = await supabaseClient.from('hosts').select('*');
        if (hostsError) throw hostsError;
        state.hosts = hosts;

        const { data: tiktokAccounts, error: tiktokError } = await supabaseClient.from('tiktok_accounts').select('*');
        if (tiktokError) throw tiktokError;
        state.tiktokAccounts = tiktokAccounts;

        const { data: rekapLive, error: rekapError } = await supabaseClient.from('rekap_live').select('*');
        if (rekapError) throw rekapError;
        state.rekapLive = rekapLive;

        // Hanya panggil fungsi untuk mengambil daftar pengguna jika yang login adalah superadmin
        if (state.currentUser && state.currentUser.user_metadata?.role === 'superadmin') {
            const { data: usersResponse, error: usersError } = await supabaseClient.functions.invoke('get-all-users');
            
            if (usersError) throw usersError;

            // Pastikan data yang diterima memiliki properti 'users'
            if (usersResponse && usersResponse.users) {
                state.users = usersResponse.users;
            } else {
                console.error("Respons dari Edge Function tidak valid:", usersResponse);
                state.users = []; // Atur ke array kosong jika respons tidak valid
            }
        }

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}
