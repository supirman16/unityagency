// state.js
// File ini berfungsi sebagai satu-satunya sumber kebenaran (single source of truth)
// untuk semua data dinamis di dalam aplikasi.

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
