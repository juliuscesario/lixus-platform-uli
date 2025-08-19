import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService, formatDateTime, formatCompactNumber } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

export default function BrandDashboard() {
    const { auth } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const data = await apiService(auth).getAdminCampaigns();
                setCampaigns(data.data);
            } catch (err) {
                setError("Failed to fetch campaigns. Please try again later.");
                console.error("Error fetching campaigns:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, [auth]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (error) {
        return <p className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</p>;
    }

    const latestCampaign = campaigns.length > 0 ? campaigns[0] : null;
    const otherCampaigns = campaigns.slice(1);

    return (
        <div className="space-y-8">
            {/* ✅ FIX: Replaced <p> tag with a responsive flex container for proper alignment */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Brand Dashboard Overview</h2>
                    <p className="mt-1 text-gray-600">Manage your campaigns, view reports, and connect with influencers.</p>
                </div>
                <Link to="/admin/campaigns/create" className="flex-shrink-0 px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg shadow-md hover:bg-pink-700 transition duration-300">
                    + Create New Campaign
                </Link>
            </div>

            {latestCampaign ? (
                <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">Latest Campaign: {latestCampaign.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">Launched on: {formatDateTime(latestCampaign.start_date)}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-blue-900 text-2xl font-bold">{formatCompactNumber(latestCampaign.total_participants)}</p>
                            <p className="text-blue-700 text-sm font-medium">Influencers Joined</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-green-900 text-2xl font-bold">{formatCompactNumber(latestCampaign.total_posts)}</p>
                            <p className="text-green-700 text-sm font-medium">Posts</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <p className="text-red-900 text-2xl font-bold">{formatCompactNumber(latestCampaign.total_likes)}</p>
                            <p className="text-red-700 text-sm font-medium">Likes</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <p className="text-yellow-900 text-2xl font-bold">{formatCompactNumber(latestCampaign.total_comments)}</p>
                            <p className="text-yellow-700 text-sm font-medium">Comments</p>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                         <p className="text-gray-500 text-sm font-medium">Total Points</p>
                        <p className="text-indigo-900 text-3xl font-bold">{formatCompactNumber(latestCampaign.total_points)}</p>
                    </div>
                    <div className="mt-4 text-right">
                        <Link to={`/admin/campaigns/edit/${latestCampaign.id}`} className="text-sm font-semibold text-pink-700 hover:underline">View Details &rarr;</Link>
                    </div>
                </div>
            ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed">
                    <p className="text-gray-600">You haven't created any campaigns yet. Let's get started!</p>
                </div>
            )}

            {otherCampaigns.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Other Campaigns</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {otherCampaigns.map(campaign => (
                            <div key={campaign.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-gray-800 text-base truncate">{campaign.name}</h4>
                                <p className="text-gray-600 text-xs mt-1">Launched: {formatDateTime(campaign.start_date)}</p>
                                <p className="text-gray-600 text-xs mt-1">Influencers: {formatCompactNumber(campaign.total_participants || 0)}</p>
                                <Link to={`/admin/campaigns/edit/${campaign.id}`} className="mt-2 inline-block text-xs font-semibold text-pink-700 hover:underline">View &rarr;</Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-gray-800">My Campaigns</h3>
                    <p className="text-gray-700 text-sm mt-1">View and manage all your active and past campaigns.</p>
                    <Link to="/admin/campaigns" className="mt-3 text-sm font-semibold text-pink-700 hover:underline">Manage Campaigns &rarr;</Link>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-gray-800">Explore Influencers</h3>
                    <p className="text-gray-700 text-sm mt-1">Discover talent for your next campaign.</p>
                    <Link to="/influencers" className="mt-3 text-sm font-semibold text-pink-700 hover:underline">Browse Influencers &rarr;</Link>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-gray-800">Reporting & Analytics</h3>
                    <p className="text-gray-700 text-sm mt-1">Access detailed performance reports.</p>
                    <Link to="/admin/reporting" className="mt-3 text-sm font-semibold text-pink-700 hover:underline">View Reports &rarr;</Link>
                </div>
            </div>
        </div>
    );
}