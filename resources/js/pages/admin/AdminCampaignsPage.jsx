import React, { useState, useEffect } from 'react';
import { apiService, formatDate, formatCurrency } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

import { Link, useNavigate } from 'react-router-dom';

export default function AdminCampaignsPage() {
    const { user, auth } = useAuth();
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCampaigns = async () => {
            setLoading(true);
            setError(null);
            const response = await apiService(auth).getAdminCampaigns();
            if (response && response.data) {
                setCampaigns(response.data);
            } else {
                setError("Gagal memuat data kampanye.");
            }
            setLoading(false);
        };
        fetchCampaigns();
    }, []);

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
