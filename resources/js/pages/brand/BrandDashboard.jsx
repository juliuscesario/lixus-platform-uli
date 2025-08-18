import React from 'react';
import { Link } from 'react-router-dom';

import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateTime, formatCompactNumber } from '../../services/apiService'; // Assuming these are useful for campaign display

export default function BrandDashboard() {
    const { auth } = useAuth(); // Destructure auth from useAuth
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const data = await apiService(auth).getAdminCampaigns(); // Use apiService with auth
                setCampaigns(data.data); // Assuming data is wrapped in a 'data' key
            } catch (err) {
                setError("Failed to fetch campaigns. Please try again later.");
                console.error("Error fetching campaigns:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, [auth]); // Depend on auth to re-fetch if auth state changes

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    const latestCampaign = campaigns.length > 0 ? campaigns[0] : null; // Assuming latest is first, or sort if needed
    const otherCampaigns = campaigns.slice(1);
    return (
        <div className="mt-8 bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800">Brand Dashboard Overview</h2>
            <p className="mt-2 text-gray-600">Welcome to your Brand Dashboard. Here you can manage your campaigns, view reports, and connect with influencers.
            <Link to="/admin/campaigns/create" className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
                Create New Campaign
            </Link>
            </p>

            {latestCampaign && (
                <div className="mt-6 p-6 bg-blue-50 rounded-lg shadow-md border border-blue-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-2">Latest Campaign: {latestCampaign.name}</h3>
                    <p className="text-gray-700 text-sm mb-4">Launched on: {formatDateTime(latestCampaign.start_date)}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-blue-100 p-4 rounded-lg">
                            <p className="text-blue-900 text-xl font-bold">{formatCompactNumber(latestCampaign.total_participants || 0)}</p>
                            <p className="text-blue-700 text-sm">Influencers Joined</p>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-lg">
                            <p className="text-blue-900 text-xl font-bold">{formatCompactNumber(latestCampaign.total_posts || 0)}</p>
                            <p className="text-blue-700 text-sm">Posts</p>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-lg">
                            <p className="text-blue-900 text-xl font-bold">{formatCompactNumber(latestCampaign.total_likes || 0)}</p>
                            <p className="text-blue-700 text-sm">Likes</p>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-lg">
                            <p className="text-blue-900 text-xl font-bold">{formatCompactNumber(latestCampaign.total_comments || 0)}</p>
                            <p className="text-blue-700 text-sm">Comments</p>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-blue-900 text-xl font-bold">Total Points: {formatCompactNumber(latestCampaign.total_points || 0)}</p>
                    </div>
                    <div className="mt-4 text-right">
                        <Link to={`/admin/campaigns/${latestCampaign.id}`} className="text-sm font-semibold text-blue-800 hover:underline">View Details &rarr;</Link>
                    </div>
                </div>
            )}

            {otherCampaigns.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Other Campaigns</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {otherCampaigns.map(campaign => (
                            <div key={campaign.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="font-bold text-gray-800 text-base">{campaign.name}</h4>
                                <p className="text-gray-600 text-xs mt-1">Launched: {formatDateTime(campaign.start_date)}</p>
                                <p className="text-gray-600 text-xs mt-1">Influencers: {formatCompactNumber(campaign.total_participants || 0)}</p>
                                <Link to={`/admin/campaigns/${campaign.id}`} className="mt-2 text-xs font-semibold text-blue-700 hover:underline">View &rarr;</Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="bg-blue-100 p-6 rounded-lg">
                    <h3 className="font-bold text-blue-800">My Campaigns</h3>
                    <p className="text-blue-700 text-sm mt-1">View and manage all your active and past campaigns.</p>
                    <Link to="/admin/campaigns" className="mt-3 text-sm font-semibold text-blue-800 hover:underline">View Campaigns &rarr;</Link>
                </div>
                <div className="bg-green-100 p-6 rounded-lg">
                    <h3 className="font-bold text-green-800">Explore Influencers</h3>
                    <p className="text-green-700 text-sm mt-1">Discover and connect with influencers for your next campaign.</p>
                    <Link to="/influencers" className="mt-3 text-sm font-semibold text-green-800 hover:underline">Browse Influencers &rarr;</Link>
                </div>
                <div className="bg-red-100 p-6 rounded-lg">
                    <h3 className="font-bold text-red-800">Reporting & Analytics</h3>
                    <p className="text-red-700 text-sm mt-1">Access detailed reports on campaign performance and influencer engagement.</p>
                    <Link to="/admin/reporting" className="mt-3 text-sm font-semibold text-red-800 hover:underline">View Reports &rarr;</Link>
                </div>
            </div>
        </div>
    );
}