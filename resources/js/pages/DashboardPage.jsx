// ========================================
// STEP 2: Migrate DashboardPage.jsx
// ========================================

// FILE: resources/js/pages/DashboardPage.jsx (MIGRATED)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { formatCompactNumber } from '../services/apiService';
import SocialConnect from '../components/SocialConnect';

export default function DashboardPage() {
    const { user } = useAuth();
    const { api } = useApi();
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [errorStats, setErrorStats] = useState(null);

    useEffect(() => {
        const fetchInfluencerStats = async () => {
            setLoadingStats(true);
            try {
                const response = await api('getInfluencerDashboardStats', user.id);
                setStats(response);
            } catch (err) {
                if (err.message.includes('401') || err.message.includes('Session expired')) {
                    // Session expired - handled by AuthContext automatically
                } else {
                    setErrorStats("Failed to fetch influencer stats.");
                    console.error("Error fetching influencer stats:", err);
                }
            } finally {
                setLoadingStats(false);
            }
        };

        if (user && user.id) {
            fetchInfluencerStats();
        }
    }, [user, api]);

    // Handle case where user is not yet available
    if (!user) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <div className="mt-8 bg-white p-8 rounded-lg shadow-lg">
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Influencer Dashboard</h1>
            <div className="mt-8 bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-800">Selamat Datang, {user.name}!</h2>
                <p className="mt-2 text-gray-600">Ini adalah halaman dashboard influencer Anda.</p>
                
                {/* Stats Section */}
                {loadingStats ? (
                    <div className="flex justify-center items-center h-32 mt-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                        <p className="ml-3 text-gray-600">Loading stats...</p>
                    </div>
                ) : errorStats ? (
                    <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {errorStats}
                    </div>
                ) : stats && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-800">Total Campaigns</h3>
                            <p className="text-2xl font-bold text-blue-900">{stats.total_campaigns || 0}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-green-800">Active Campaigns</h3>
                            <p className="text-2xl font-bold text-green-900">{stats.active_campaigns || 0}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-purple-800">Total Posts</h3>
                            <p className="text-2xl font-bold text-purple-900">{stats.total_posts || 0}</p>
                        </div>
                    </div>
                )}

                {/* Social Connect Section */}
                <div className="mt-8">
                    <SocialConnect />
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link 
                        to="/influencer/my-campaigns" 
                        className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition duration-300 text-center"
                    >
                        View My Campaigns
                    </Link>
                    <Link 
                        to="/campaigns" 
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 text-center"
                    >
                        Browse All Campaigns
                    </Link>
                </div>
            </div>
        </div>
    );
}