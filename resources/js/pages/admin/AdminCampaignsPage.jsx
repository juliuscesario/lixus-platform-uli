import React, { useState, useEffect } from 'react';
import { apiService, formatDate, formatCurrency } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminCampaignsPage() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to handle unauthorized access
    const handleUnauthorized = () => {
        setError("Unauthorized access. You do not have permission to view this page.");
        // Redirect to a 404 page or login page after a delay
        setTimeout(() => {
            navigate('/not-found'); // Asumsikan Anda punya rute not-found
        }, 3000);
    };

    useEffect(() => {
        const fetchCampaigns = async () => {
            if (authLoading) return; // Wait for authentication check to complete

            // Determine which API call to make based on user role
            setLoading(true);
            setError(null);

            try {
                let response;
                if (user?.role?.name === 'admin') {
                    response = await apiService.getAdminCampaigns();
                } else if (user?.role?.name === 'brand') {
                    // Assuming you have or will create a getBrandCampaigns in apiService
                    // For now, let's use a placeholder or decide how to handle it.
                    // This could also be the same `getAdminCampaigns` if the backend differentiates by user.
                    // Let's assume the backend handles it and we call a generic endpoint.
                    // The route `api/brand/campaigns` exists, let's create a service for it.
                    response = await apiService.getBrandCampaigns();
                } else {
                    handleUnauthorized();
                    return; // Stop execution if no valid role
                }

                if (response && response.data) {
                    setCampaigns(response.data);
                } else {
                    setError("Failed to load campaign data.");
                }
            } catch (err) {
                if (err.message.includes('403')) {
                    handleUnauthorized();
                } else {
                    setError("An unexpected error occurred.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, [user, authLoading, navigate]);

    if (loading) return <div>Memuat data kampanye...</div>;
    if (error) return <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Kampanye</h1>
                <Link 
                    to="/admin/campaigns/create"
                    className="bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors"
                >
                    + Buat Kampanye Baru
                </Link>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Kampanye</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mulai</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selesai</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {campaigns.map(campaign => (
                            <tr key={campaign.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{campaign.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(campaign.budget)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(campaign.start_date)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(campaign.end_date)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {/* PERBAIKAN: Mengubah link menjadi tombol yang rapi dan berwarna */}
                                    <div className="flex justify-end items-center gap-2">
                                        <Link 
                                            to={`/admin/campaigns/edit/${campaign.id}`}
                                            className="py-1 px-3 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-200 transition-colors text-xs font-semibold"
                                        >
                                            Edit
                                        </Link>
                                        <Link 
                                            to={`/admin/campaigns/${campaign.id}/participants`}
                                            className="py-1 px-3 bg-green-100 text-green-700 border border-green-200 rounded-md hover:bg-green-200 transition-colors text-xs font-semibold"
                                        >
                                            Partisipan
                                        </Link>
                                        <Link 
                                            to={`/admin/campaigns/${campaign.id}/posts`}
                                            className="py-1 px-3 bg-purple-100 text-purple-700 border border-purple-200 rounded-md hover:bg-purple-200 transition-colors text-xs font-semibold"
                                        >
                                            Posts
                                        </Link>
                                        <Link to={`/admin/campaigns/${campaign.id}/leaderboard`} 
                                        className="py-1 px-3 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-md hover:bg-yellow-200 transition-colors text-xs font-semibold"
                                            >
                                                Leaderboard
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
