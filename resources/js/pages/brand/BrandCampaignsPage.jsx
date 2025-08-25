import React, { useState, useEffect } from 'react';
import { formatDate, formatCurrency } from '../../services/apiService';
import useApi from '../../hooks/useApi';
import { Link } from 'react-router-dom';

export default function BrandCampaignsPage() {
    const { api, auth } = useApi();
    const { user } = auth;
    
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCampaigns = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await api('getBrandCampaigns');
                setCampaigns(response.data || []);
            } catch (err) {
                setError("Failed to load campaign data.");
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, [api]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
                Memuat data kampanye...
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Campaigns</h1>
                <Link 
                    to="/admin/campaigns/create"
                    className="bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors"
                >
                    + Create New Campaign
                </Link>
            </div>

            {campaigns.length === 0 ? (
                <div className="mt-8 bg-white p-8 rounded-lg shadow-lg text-center">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome, Brand Manager!</h2>
                    <p className="text-gray-600 mb-6">
                        You haven't created any campaigns yet. Start by creating your first campaign to connect with influencers.
                    </p>
                    <Link 
                        to="/admin/campaigns/create"
                        className="inline-block bg-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-600 transition-colors"
                    >
                        Create Your First Campaign
                    </Link>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Campaign
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Budget
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Period
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {campaigns.map((campaign) => (
                                <tr key={campaign.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img 
                                                    className="h-10 w-10 rounded-lg object-cover" 
                                                    src={campaign.image || `https://placehold.co/40x40/f472b6/ffffff?text=${campaign.name?.[0] || 'C'}`}
                                                    alt=""
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {campaign.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {campaign.description?.substring(0, 50)}...
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            campaign.status === 'active' 
                                                ? 'bg-green-100 text-green-800'
                                                : campaign.status === 'completed'
                                                ? 'bg-blue-100 text-blue-800'
                                                : campaign.status === 'paused'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {campaign.status?.charAt(0).toUpperCase() + campaign.status?.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatCurrency(campaign.budget)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>{formatDate(campaign.start_date)}</div>
                                        <div className="text-xs text-gray-400">to {formatDate(campaign.end_date)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <Link
                                                to={`/admin/campaigns/edit/${campaign.id}`}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Edit
                                            </Link>
                                            <Link
                                                to={`/admin/campaigns/${campaign.id}/participants`}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Participants
                                            </Link>
                                            <Link
                                                to={`/admin/campaigns/${campaign.id}/posts`}
                                                className="text-purple-600 hover:text-purple-900"
                                            >
                                                Posts
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="font-bold text-gray-800 mb-2">Explore Influencers</h3>
                    <p className="text-gray-700 text-sm mb-4">
                        Discover talent for your next campaign.
                    </p>
                    <Link 
                        to="/influencers" 
                        className="text-sm font-semibold text-pink-700 hover:underline"
                    >
                        Browse Influencers →
                    </Link>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="font-bold text-gray-800 mb-2">Campaign Performance</h3>
                    <p className="text-gray-700 text-sm mb-4">
                        View detailed analytics and reports.
                    </p>
                    <Link 
                        to="/admin/reporting" 
                        className="text-sm font-semibold text-pink-700 hover:underline"
                    >
                        View Reports →
                    </Link>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="font-bold text-gray-800 mb-2">Manage Applications</h3>
                    <p className="text-gray-700 text-sm mb-4">
                        Review influencer applications.
                    </p>
                    <Link 
                        to="/admin/applications" 
                        className="text-sm font-semibold text-pink-700 hover:underline"
                    >
                        Manage Applications →
                    </Link>
                </div>
            </div>
        </div>
    );
}