import './bootstrap';
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import SessionExpiredModal from './components/SessionExpiredModal';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const InfluencersPage = lazy(() => import('./pages/InfluencersPage'));
const InfluencerDetailPage = lazy(() => import('./pages/InfluencerDetailPage'));
const MyCampaignsPage = lazy(() => import('./pages/influencer/MyCampaignsPage'));
const CampaignDetailPage = lazy(() => import('./pages/CampaignDetailPage'));
const AdminCampaignsPage = lazy(() => import('./pages/admin/AdminCampaignsPage'));
const CreateCampaignPage = lazy(() => import('./pages/admin/CreateCampaignPage'));
const EditCampaignPage = lazy(() => import('./pages/admin/EditCampaignPage'));
const CampaignParticipantsPage = lazy(() => import('./pages/admin/CampaignParticipantsPage'));
const CampaignPostsPage = lazy(() => import('./pages/admin/CampaignPostsPage'));
const CampaignLeaderboardPage = lazy(() => import('./pages/admin/CampaignLeaderboardPage'));
const ReportingPage = lazy(() => import('./pages/admin/ReportingPage'));
const InfluencerApplicationPage = lazy(() => import('./pages/InfluencerApplicationPage'));
const ManageApplicationsPage = lazy(() => import('./pages/admin/ManageApplicationsPage'));
const PostsPage = lazy(() => import('./pages/PostsPage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));

// Wrapper components to pass user data to pages that need it
const DashboardWrapper = () => {
    const { user } = useAuth();
    return <DashboardPage user={user} />;
};

const HomePageWrapper = () => {
    const { user } = useAuth();
    return <HomePage user={user} />;
};

const MyCampaignsWrapper = () => {
    const { user } = useAuth();
    return <MyCampaignsPage user={user} />;
};

const CampaignDetailWrapper = () => {
    const { user } = useAuth();
    return <CampaignDetailPage user={user} />;
};

const CampaignParticipantsWrapper = () => {
    const { user } = useAuth();
    return <CampaignParticipantsPage user={user} />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

function AppContent() {
    const { sessionExpired, setSessionExpired, logout } = useAuth();

    const handleCloseModal = () => {
        logout();
        setSessionExpired(false);
    };

    return (
        <>
            <Suspense fallback={<div className="flex justify-center items-center h-screen"><div>Loading...</div></div>}>
                <Routes>
                    <Route path="/" element={<PublicLayout><HomePageWrapper /></PublicLayout>} />
                    <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
                    <Route path="/register" element={<Navigate to="/apply-influencer" replace />} />
                    <Route path="/influencers" element={<PublicLayout><InfluencersPage /></PublicLayout>} />
                    <Route path="/influencers/:id" element={<PublicLayout><InfluencerDetailPage /></PublicLayout>} />
                    <Route path="/posts" element={<PublicLayout><PostsPage /></PublicLayout>} />
                    <Route path="/posts/:id" element={<PublicLayout><PostDetailPage /></PublicLayout>} />
                    <Route path="/campaigns/:id" element={<PublicLayout><CampaignDetailWrapper /></PublicLayout>} />
                    <Route path="/apply-influencer" element={<PublicLayout><InfluencerApplicationPage /></PublicLayout>} />
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardWrapper /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/my-campaigns" element={<ProtectedRoute><DashboardLayout><MyCampaignsWrapper /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/influencer/my-campaigns" element={<ProtectedRoute><DashboardLayout><MyCampaignsWrapper /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/admin/campaigns" element={<ProtectedRoute><DashboardLayout><AdminCampaignsPage /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/admin/campaigns/create" element={<ProtectedRoute><DashboardLayout><CreateCampaignPage /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/admin/campaigns/edit/:id" element={<ProtectedRoute><DashboardLayout><EditCampaignPage /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/admin/campaigns/:id/participants" element={<ProtectedRoute><DashboardLayout><CampaignParticipantsWrapper /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/admin/campaigns/:id/posts" element={<ProtectedRoute><DashboardLayout><CampaignPostsPage /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/admin/campaigns/:id/leaderboard" element={<ProtectedRoute><DashboardLayout><CampaignLeaderboardPage /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/admin/reporting" element={<ProtectedRoute><DashboardLayout><ReportingPage /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/admin/applications" element={<ProtectedRoute><DashboardLayout><ManageApplicationsPage /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
            <SessionExpiredModal isOpen={sessionExpired} onClose={handleCloseModal} />
        </>
    );
}

const PublicLayout = ({ children }) => (
    <>
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
    </>
);

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
