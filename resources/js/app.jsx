import './bootstrap';
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

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

// Layout wrapper component for authenticated routes
const AuthenticatedLayout = ({ children }) => {
    const { isAuthenticated } = useAuth();
    
    // Only show DashboardLayout for authenticated users
    if (isAuthenticated) {
        return <DashboardLayout>{children}</DashboardLayout>;
    }
    
    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Suspense fallback={<div className="flex justify-center items-center h-screen"><div>Loading...</div></div>}>
                    <Routes>
                        {/* Public routes without DashboardLayout */}
                        <Route path="/" element={
                            <>
                                <Navbar />
                                <main className="flex-grow">
                                    <HomePageWrapper />
                                </main>
                                <Footer />
                            </>
                        } />
                        <Route path="/login" element={
                            <>
                                <Navbar />
                                <main className="flex-grow">
                                    <LoginPage />
                                </main>
                                <Footer />
                            </>
                        } />
                        <Route path="/register" element={
                            <>
                                <Navbar />
                                <main className="flex-grow">
                                    <RegisterPage />
                                </main>
                                <Footer />
                            </>
                        } />
                        <Route path="/influencers" element={
                            <>
                                <Navbar />
                                <main className="flex-grow">
                                    <InfluencersPage />
                                </main>
                                <Footer />
                            </>
                        } />
                        <Route path="/influencers/:id" element={
                            <>
                                <Navbar />
                                <main className="flex-grow">
                                    <InfluencerDetailPage />
                                </main>
                                <Footer />
                            </>
                        } />
                        <Route path="/posts" element={
                            <>
                                <Navbar />
                                <main className="flex-grow">
                                    <PostsPage />
                                </main>
                                <Footer />
                            </>
                        } />
                        <Route path="/posts/:id" element={
                            <>
                                <Navbar />
                                <main className="flex-grow">
                                    <PostDetailPage />
                                </main>
                                <Footer />
                            </>
                        } />
                        <Route path="/campaigns/:id" element={
                            <>
                                <Navbar />
                                <main className="flex-grow">
                                    <CampaignDetailWrapper />
                                </main>
                                <Footer />
                            </>
                        } />
                        <Route path="/apply-influencer" element={
                            <>
                                <Navbar />
                                <main className="flex-grow">
                                    <InfluencerApplicationPage />
                                </main>
                                <Footer />
                            </>
                        } />
                        
                        {/* Protected routes with DashboardLayout */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <DashboardWrapper />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        
                        {/* Influencer Routes */}
                        <Route path="/my-campaigns" element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <MyCampaignsWrapper />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/influencer/my-campaigns" element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <MyCampaignsWrapper />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        
                        {/* Admin/Brand Routes */}
                        <Route path="/admin/campaigns" element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <AdminCampaignsPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/campaigns/create" element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <CreateCampaignPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/campaigns/edit/:id" element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <EditCampaignPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/campaigns/:id/participants" element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <CampaignParticipantsPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/campaigns/:id/posts" element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <CampaignPostsPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/campaigns/:id/leaderboard" element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <CampaignLeaderboardPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/reporting" element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <ReportingPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/applications" element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <ManageApplicationsPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                    </Routes>
                </Suspense>
            </AuthProvider>
        </Router>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
