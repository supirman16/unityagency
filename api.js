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

        // Hanya ambil daftar pengguna jika yang login adalah superadmin
        if (state.currentUser && state.currentUser.user_metadata?.role === 'superadmin') {
            const { data: usersResponse, error: usersError } = await supabaseClient.auth.admin.listUsers();
            if (usersError) throw usersError;
            state.users = usersResponse.users;
        }

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}
