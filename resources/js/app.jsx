import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { apiService } from './services/apiService';

// Import Layouts
import DashboardLayout from './layouts/DashboardLayout'; // <-- PERBAIKAN: Menambahkan import yang hilang

// Import Halaman Publik
import HomePage from './pages/HomePage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InfluencersPage from './pages/InfluencersPage';
import InfluencerDetailPage from './pages/InfluencerDetailPage';
import PostsPage from './pages/PostsPage';
import PostDetailPage from './pages/PostDetailPage';
import PlaceholderPage from './pages/PlaceholderPage';

// Import Halaman Admin/Brand
import DashboardPage from './pages/DashboardPage'; // Ini akan jadi halaman overview dashboard
import CreateCampaignPage from './pages/admin/CreateCampaignPage';
import EditCampaignPage from './pages/admin/EditCampaignPage';
import AdminCampaignsPage from './pages/admin/AdminCampaignsPage';
import CampaignParticipantsPage from './pages/admin/CampaignParticipantsPage';
import CampaignPostsPage from './pages/admin/CampaignPostsPage';
import CampaignLeaderboardPage from './pages/admin/CampaignLeaderboardPage'; // <-- BARU
import MyCampaignsPage from './pages/influencer/MyCampaignsPage';

// Import Komponen Global
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
    const [page, setPage] = useState('home');
    const [pageProps, setPageProps] = useState({});
    
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const navigate = (pageName, props = {}) => {
        setPage(pageName);
        setPageProps(props);
        window.scrollTo(0, 0);
    };
    
    const enrichUserWithRole = (userData) => {
        if (!userData) return null;
        
        const enhancedUser = { ...userData };
        const roleMap = {
            1: 'admin',
            2: 'influencer',
            3: 'brand',
        };
        
        if (enhancedUser.role_id) {
            enhancedUser.role = roleMap[enhancedUser.role_id];
        }
        return enhancedUser;
    };

    useEffect(() => {
        const verifyUserSession = async () => {
            // Cek apakah ada data user di localStorage sebagai penanda awal
            const storedUser = localStorage.getItem('authUser');
            if (storedUser) {
                try {
                    // Verifikasi sesi ke backend
                    const freshUserData = await apiService.checkAuthStatus();
                    if (freshUserData) {
                        // Jika sesi valid, perbarui data pengguna
                        const enhancedUser = enrichUserWithRole(freshUserData);
                        setUser(enhancedUser);
                        localStorage.setItem('authUser', JSON.stringify(enhancedUser));
                    } else {
                        // Jika sesi tidak valid, bersihkan localStorage
                        localStorage.removeItem('authUser');
                        setUser(null);
                    }
                } catch (error) {
                    // Jika terjadi error (misal, 401), sesi sudah di-handle oleh authenticatedFetch
                    setUser(null);
                }
            }
            setAuthLoading(false);
        };

        verifyUserSession();
    }, []);

    const handleLogin = (userData) => {
        const enhancedUser = enrichUserWithRole(userData);
        setUser(enhancedUser);
        localStorage.setItem('authUser', JSON.stringify(enhancedUser));
        
        if (enhancedUser.role === 'influencer') {
            setPage('influencer-my-campaigns');
        } else {
            setPage('dashboard-overview');
        }
    };

    const handleLogout = async () => {
        try {
            await apiService.logout();
        } catch (error) {
            console.error("API logout gagal, tapi tetap melanjutkan:", error);
        } finally {
            setUser(null);
            localStorage.removeItem('authUser');
            navigate('home');
        }
    };;
    
    
    const renderPage = () => {
        if (authLoading) {
            return <div className="flex justify-center items-center h-screen">Memuat...</div>;
        }

        const isDashboardPage = page.startsWith('dashboard-') || page.startsWith('admin-');

        if (isDashboardPage && !user) {
            return <LoginPage onLoginSuccess={handleLogin} setPage={navigate} />;
        }

        if (isDashboardPage && user) {
            let dashboardContent;
            switch (page) {
                case 'admin-campaigns':
                    dashboardContent = <AdminCampaignsPage setPage={navigate} />;
                    break;
                case 'admin-create-campaign':
                    dashboardContent = <CreateCampaignPage setPage={navigate} />;
                    break;
                case 'admin-edit-campaign':
                    dashboardContent = <EditCampaignPage pageProps={pageProps} setPage={navigate} />;
                    break;
                case 'admin-campaign-participants':
                    dashboardContent = <CampaignParticipantsPage pageProps={pageProps} setPage={navigate} />;
                    break;
                case 'admin-campaign-posts':
                    dashboardContent = <CampaignPostsPage pageProps={pageProps} setPage={navigate} />;
                    break;
                case 'admin-campaign-leaderboard':
                    dashboardContent = <CampaignLeaderboardPage pageProps={pageProps} setPage={navigate} />;
                    break;
                case 'admin-users':
                    dashboardContent = <PlaceholderPage title="Manajemen User" />;
                    break;
                // CASE BARU UNTUK INFLUENCER
                case 'influencer-my-campaigns':
                    dashboardContent = <MyCampaignsPage pageProps={pageProps} setPage={navigate} user={user} />;
                    break;
                case 'dashboard-overview':
                    default:
                    // Jika influencer, arahkan ke halaman kampanye mereka sebagai default dashboard
                    if (user.role === 'influencer') {
                        dashboardContent = <MyCampaignsPage setPage={navigate} user={user} />;
                    } else {
                        dashboardContent = <DashboardPage user={user} />;
                    }
            }
            return (
                <DashboardLayout user={user} onLogout={handleLogout} setPage={navigate} activePage={page}>
                    {dashboardContent}
                </DashboardLayout>
            );
        }
        
        let publicContent;
        switch (page) {
            case 'login':
                publicContent = <LoginPage onLoginSuccess={handleLogin} setPage={navigate} />;
                break;
            case 'register':
                publicContent = <RegisterPage onRegisterSuccess={handleLogin} setPage={navigate} />;
                break;
            case 'influencers':
                publicContent = <InfluencersPage setPage={navigate} />;
                break;
            case 'influencer-detail':
                publicContent = <InfluencerDetailPage pageProps={pageProps} setPage={navigate} />;
                break;
            case 'posts':
                publicContent = <PostsPage setPage={navigate} />;
                break;
            case 'post-detail':
                publicContent = <PostDetailPage pageProps={pageProps} setPage={navigate} />;
                break;
            case 'campaign-detail':
                 publicContent = <CampaignDetailPage pageProps={pageProps} setPage={navigate} user={user} />;
                 break;
            case 'home':
            default:
                publicContent = <HomePage setPage={navigate} user={user} />;
        }

        return (
            <div className="bg-gray-50 min-h-screen font-sans">
                <Navbar user={user} onLogout={handleLogout} setPage={navigate} />
                <main>{publicContent}</main>
                <Footer />
            </div>
        );
    };

    return renderPage();
}

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
}
