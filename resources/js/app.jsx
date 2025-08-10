import './bootstrap';
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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

function App() {
    return (
        <Router>
            <Suspense fallback={<div className="flex justify-center items-center h-screen"><div>Loading...</div></div>}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/influencers" element={<InfluencersPage />} />
                    <Route path="/influencers/:id" element={<InfluencerDetailPage />} />
                    <Route path="/posts" element={<PostsPage />} />
                    <Route path="/posts/:id" element={<PostDetailPage />} />
                    
                    {/* Influencer Routes */}
                    <Route path="/my-campaigns" element={<MyCampaignsPage />} />
                    <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
                    <Route path="/apply-influencer" element={<InfluencerApplicationPage />} />

                    {/* Admin Routes */}
                    <Route path="/admin/campaigns" element={<AdminCampaignsPage />} />
                    <Route path="/admin/campaigns/create" element={<CreateCampaignPage />} />
                    <Route path="/admin/campaigns/edit/:id" element={<EditCampaignPage />} />
                    <Route path="/admin/campaigns/:id/participants" element={<CampaignParticipantsPage />} />
                    <Route path="/admin/campaigns/:id/posts" element={<CampaignPostsPage />} />
                    <Route path="/admin/campaigns/:id/leaderboard" element={<CampaignLeaderboardPage />} />
                    <Route path="/admin/reports" element={<ReportingPage />} />
                    <Route path="/admin/applications" element={<ManageApplicationsPage />} />
                </Routes>
            </Suspense>
        </Router>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
