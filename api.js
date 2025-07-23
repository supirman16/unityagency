import { supabaseClient, state } from './main.js';

export async function fetchData() {
    const { data: hostsData, error: hostsError } = await supabaseClient.from('hosts').select('*');
    if (hostsError) console.error('Error fetching hosts:', hostsError);
    else state.hosts = hostsData;

    const { data: tiktokData, error: tiktokError } = await supabaseClient.from('tiktok_accounts').select('*');
    if (tiktokError) console.error('Error fetching tiktok accounts:', tiktokError);
    else state.tiktokAccounts = tiktokData;
    
    const { data: rekapData, error: rekapError } = await supabaseClient.from('rekap_live').select('*');
    if (rekapError) console.error('Error fetching rekap live:', rekapError);
    else state.rekapLive = rekapData;

    if (state.currentUser?.user_metadata?.role === 'superadmin') {
        const { data: usersData, error: usersError } = await supabaseClient.functions.invoke('list-all-users');
        if (usersError) console.error('Error fetching users:', usersError.message);
        else state.users = usersData;
    }
}
