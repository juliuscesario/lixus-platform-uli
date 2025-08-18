import React from 'react';
import { Link } from 'react-router-dom';

import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { formatCompactNumber } from '../services/apiService';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Keep this if used for navigation
import { apiService, formatCompactNumber } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage({ user }) {
    const { auth } = useAuth(); // Get auth from AuthContext
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [errorStats, setErrorStats] = useState(null);

    useEffect(() => {
        const fetchInfluencerStats = async () => {
            setLoadingStats(true);
            try {
                // Pass the auth object to apiService
                const response = await apiService(auth).getInfluencerDashboardStats(user.id);
                setStats(response);
            } catch (err) {
                setErrorStats("Failed to fetch influencer stats.");
                console.error("Error fetching influencer stats:", err);
            } finally {
                setLoadingStats(false);
            }
        };

        if (user && user.id) {
            fetchInfluencerStats();
        }
    }, [user]);

    // Handle case where user is not yet available
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
                <p className="mt-2 text-gray-600">Ini adalah halaman dashboard influencer Anda. Dari sini, Anda dapat mengelola profil, kampanye, dan akun sosial media Anda.</p>
                <p className="mt-1 text-gray-600">Email terdaftar: {user.email}</p>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-pink-100 p-6 rounded-lg">
                        <h3 className="font-bold text-pink-800">Profil Saya</h3>
                        <p className="text-pink-700 text-sm mt-1">Lengkapi dan perbarui profil influencer Anda.</p>
                        <Link to="/profile" className="mt-3 text-sm font-semibold text-pink-800 hover:underline">Kelola Profil &rarr;</Link>
                    </div>
                     <div className="bg-blue-100 p-6 rounded-lg">
                        <h3 className="font-bold text-blue-800">Kampanye Saya</h3>
                        <p className="text-blue-700 text-sm mt-1">Lihat kampanye yang sedang Anda ikuti.</p>
                        <Link to="/my-campaigns" className="mt-3 text-sm font-semibold text-blue-800 hover:underline">Lihat Kampanye &rarr;</Link>
                    </div>
                     <div className="bg-green-100 p-6 rounded-lg">
                        <h3 className="font-bold text-green-800">Akun Sosial Media</h3>
                        <p className="text-green-700 text-sm mt-1">Hubungkan dan kelola akun sosial media Anda.</p>
                        <Link to="/social-media" className="mt-3 text-sm font-semibold text-green-800 hover:underline">Hubungkan Akun &rarr;</Link>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-indigo-100 p-6 rounded-lg">
                        <h3 className="font-bold text-indigo-800">Total Posts</h3>
                        {loadingStats ? (
                            <p className="text-indigo-700 text-sm mt-1">Loading...</p>
                        ) : errorStats ? (
                            <p className="text-red-600 text-sm mt-1">{errorStats}</p>
                        ) : (
                            <p className="text-indigo-700 text-2xl font-bold mt-1">{formatCompactNumber(stats?.total_posts || 0)}</p>
                        )}
                    </div>
                    <div className="bg-purple-100 p-6 rounded-lg">
                        <h3 className="font-bold text-purple-800">Campaigns Joined</h3>
                        {loadingStats ? (
                            <p className="text-purple-700 text-sm mt-1">Loading...</p>
                        ) : errorStats ? (
                            <p className="text-red-600 text-sm mt-1">{errorStats}</p>
                        ) : (
                            <p className="text-purple-700 text-2xl font-bold mt-1">{formatCompactNumber(stats?.campaigns_joined || 0)}</p>
                        )}
                    </div>
                    <div className="bg-yellow-100 p-6 rounded-lg">
                        <h3 className="font-bold text-yellow-800">Total Points Earned</h3>
                        {loadingStats ? (
                            <p className="text-yellow-700 text-sm mt-1">Loading...</p>
                        ) : errorStats ? (
                            <p className="text-red-600 text-sm mt-1">{errorStats}</p>
                        ) : (
                            <p className="text-yellow-700 text-2xl font-bold mt-1">{formatCompactNumber(stats?.total_points || 0)}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}