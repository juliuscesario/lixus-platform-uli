import './bootstrap';
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
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

function App() {
    return (
        <Router>
            <AuthProvider>
                <Navbar />
                <Suspense fallback={<div className="flex justify-center items-center h-screen"><div>Loading...</div></div>}>
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<HomePageWrapper />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/dashboard" element={
                                <ProtectedRoute>
                                    <DashboardWrapper />
                                </ProtectedRoute>
                            } />
                            <Route path="/influencers" element={<InfluencersPage />} />
                            <Route path="/influencers/:id" element={<InfluencerDetailPage />} />
                            <Route path="/posts" element={<PostsPage />} />
                            <Route path="/posts/:id" element={<PostDetailPage />} />
                            
                            {/* Influencer Routes */}
                            <Route path="/my-campaigns" element={
                                <ProtectedRoute>
                                    <MyCampaignsWrapper />
                                </ProtectedRoute>
                            } />
                            <Route path="/campaigns/:id" element={<CampaignDetailWrapper />} />
                            <Route path="/apply-influencer" element={<InfluencerApplicationPage />} />
                            
                            {/* Admin Routes */}
                            <Route path="/admin/campaigns" element={
                                <ProtectedRoute>
                                    <AdminCampaignsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/campaigns/create" element={
                                <ProtectedRoute>
                                    <CreateCampaignPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/campaigns/edit/:id" element={
                                <ProtectedRoute>
                                    <EditCampaignPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/campaigns/:id/participants" element={
                                <ProtectedRoute>
                                    <CampaignParticipantsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/campaigns/:id/posts" element={
                                <ProtectedRoute>
                                    <CampaignPostsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/campaigns/:id/leaderboard" element={
                                <ProtectedRoute>
                                    <CampaignLeaderboardPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/reports" element={
                                <ProtectedRoute>
                                    <ReportingPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/applications" element={
                                <ProtectedRoute>
                                    <ManageApplicationsPage />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </main>
                </Suspense>
                <Footer />
            </AuthProvider>
        </Router>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
