import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { apiService } from './services/apiService';

// Import Layouts
import DashboardLayout from './layouts/DashboardLayout'; // <-- PERBAIKAN: Menambahkan import yang hilang

// Import Halaman Publik
import HomePage from './pages/HomePage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import LoginPage from './pages/LoginPage';
//import RegisterPage from './pages/RegisterPage';
import InfluencersPage from './pages/InfluencersPage';
import InfluencerDetailPage from './pages/InfluencerDetailPage';
import PostsPage from './pages/PostsPage';
import PostDetailPage from './pages/PostDetailPage';
import PlaceholderPage from './pages/PlaceholderPage';
import InfluencerApplicationPage from './pages/InfluencerApplicationPage'; // NEW

// Import Halaman Admin/Brand
import DashboardPage from './pages/DashboardPage'; // Ini akan jadi halaman overview dashboard
import CreateCampaignPage from './pages/admin/CreateCampaignPage';
import EditCampaignPage from './pages/admin/EditCampaignPage';
import AdminCampaignsPage from './pages/admin/AdminCampaignsPage';
import CampaignParticipantsPage from './pages/admin/CampaignParticipantsPage';
import CampaignPostsPage from './pages/admin/CampaignPostsPage';
import CampaignLeaderboardPage from './pages/admin/CampaignLeaderboardPage'; // <-- BARU
import MyCampaignsPage from './pages/influencer/MyCampaignsPage';
// --- 1. IMPORT THE NEW REPORTING PAGE ---
import ReportingPage from './pages/admin/ReportingPage';

// Import Komponen Global
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
    const [page, setPage] = useState('home');
    const [pageProps, setPageProps] = useState({});
    
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [justLoggedIn, setJustLoggedIn] = useState(false); 

    // useCallback memastikan fungsi navigate tidak dibuat ulang di setiap render
    const navigate = useCallback((pageName, props = {}) => {
        setPage(pageName);
        setPageProps(props);
        window.scrollTo(0, 0);
    }, []);
    
    
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

// Efek ini HANYA untuk memeriksa sesi saat aplikasi pertama kali dimuat
    useEffect(() => {
        const verifyUserSession = async () => {
            const storedUser = localStorage.getItem('authUser');
            if (storedUser) {
                try {
                    const freshUserData = await apiService.checkAuthStatus();
                    if (freshUserData) {
                        const enhancedUser = enrichUserWithRole(freshUserData);
                        setUser(enhancedUser);
                        localStorage.setItem('authUser', JSON.stringify(enhancedUser));
                    } else {
                        localStorage.removeItem('authUser');
                        setUser(null);
                    }
                } catch (error) {
                    setUser(null);
                }
            }
            setAuthLoading(false);
        };

        verifyUserSession();
    }, []);

    // Efek ini HANYA untuk navigasi SETELAH login berhasil
    useEffect(() => {
        if (justLoggedIn && user) {
            navigate('dashboard-overview');
            setJustLoggedIn(false); // Reset flag setelah navigasi
        }
    }, [justLoggedIn, user, navigate]);

   const handleLogin = (userData) => {
        const enhancedUser = enrichUserWithRole(userData);
        setUser(enhancedUser);
        localStorage.setItem('authUser', JSON.stringify(enhancedUser));
        setJustLoggedIn(true); // <-- Set flag, ini akan memicu useEffect di atas
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
    };
    

    const renderPage = () => {
        if (authLoading) {
            return <div className="flex justify-center items-center h-screen">Memuat...</div>;
        }

        // --- CORRECTED LOGIC ---
        // The influencer application page is public, so it must be excluded from the dashboard check.
        const isDashboardPage = (page.startsWith('dashboard-') || page.startsWith('admin-') || page.startsWith('influencer-')) && page !== 'influencer-application';

        if (isDashboardPage && !user) {
            // If trying to access a protected page without being logged in, show the login page.
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
                // --- 2. ADD THE CASE FOR THE ANALYTICS PAGE ---
                case 'admin-analytics':
                    dashboardContent = <ReportingPage setPage={navigate} />;
                    break;
                case 'admin-users':
                    dashboardContent = <PlaceholderPage title="Manajemen User" />;
                    break;
                case 'influencer-my-campaigns':
                     dashboardContent = <MyCampaignsPage pageProps={pageProps} setPage={navigate} user={user} />;
                     break;
                case 'dashboard-overview':
                default:
                    if (user.role === 'influencer') {
                        dashboardContent = <MyCampaignsPage setPage={navigate} user={user} />;
                    } else {
                        dashboardContent = <DashboardPage user={user} />;
                    }
                    break;
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
            case 'influencer-application': // NEW
                publicContent = <InfluencerApplicationPage setPage={navigate} />;
                break;
            //case 'register':
            //   publicContent = <RegisterPage onRegisterSuccess={handleLogin} setPage={navigate} />;
            //   break;
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