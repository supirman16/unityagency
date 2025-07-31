import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';
import LoginPage from './components/LoginPage.js';
import DashboardLayout from './components/DashboardLayout.js';

// -- 1. KONFIGURASI & KLIEN SUPABASE --
const supabaseUrl = 'https://bvlzzhbvnhzvaojuqoqn.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bHp6aGJ2bmh6dmFvanVxb3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1Nzc4NjEsImV4cCI6MjA2OTE1Mzg2MX0.ngr8Zjd5lzsOWhycC_CDb3sOwVBFl21WTWSFt_cK2Hw'; 
export const supabase = createClient(supabaseUrl, supabaseKey);

// -- 2. KONTEKS UNTUK STATE MANAGEMENT --
export const AppContext = createContext();

// -- 3. KOMPONEN UTAMA: App --
export default function App() {
    const [session, setSession] = useState(null);
    const [page, setPage] = useState('dashboard');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [data, setData] = useState({
        hosts: [],
        tiktokAccounts: [],
        rekapLive: [],
        users: [],
        loading: true,
    });

    const fetchData = useCallback(async () => {
        if (!session) return;
        setData(prev => ({ ...prev, loading: true }));
        try {
            const { data: hosts, error: hostsError } = await supabase.from('hosts').select('*');
            if (hostsError) throw hostsError;

            const { data: tiktokAccounts, error: tiktokError } = await supabase.from('tiktok_accounts').select('*');
            if (tiktokError) throw tiktokError;

            const { data: rekapLive, error: rekapError } = await supabase.from('rekap_live').select('*');
            if (rekapError) throw rekapError;

            let users = [];
            if (session.user.user_metadata?.role === 'superadmin') {
                const { data: usersResponse, error: usersError } = await supabase.functions.invoke('list-all-users');
                if (usersError) throw usersError;
                if (Array.isArray(usersResponse)) {
                    users = usersResponse;
                }
            }

            setData({ hosts, tiktokAccounts, rekapLive, users, loading: false });
        } catch (error) {
            console.error("Error fetching data:", error);
            setData(prev => ({ ...prev, loading: false }));
        }
    }, [session]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        fetchData();
    }, [session, fetchData]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        session,
        data,
        fetchData,
        page,
        setPage,
        theme,
        setTheme,
        isMenuOpen,
        setIsMenuOpen,
        handleLogout,
        supabase
    };

    return (
        <AppContext.Provider value={value}>
            <div className="bg-stone-50 text-stone-800 dark:bg-stone-900 dark:text-stone-200 min-h-screen">
                {session ? <DashboardLayout /> : <LoginPage />}
            </div>
        </AppContext.Provider>
    );
}
