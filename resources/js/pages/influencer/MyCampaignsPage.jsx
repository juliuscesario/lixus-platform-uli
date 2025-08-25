// ========================================
// STEP 3: Migrate MyCampaignsPage.jsx
// ========================================

// FILE: resources/js/pages/influencer/MyCampaignsPage.jsx (MIGRATED)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { formatDate } from '../../services/apiService';
import PostsModal from '../../components/PostsModal';

const StatusBadge = ({ status }) => {
    const statusStyles = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        completed: 'bg-blue-100 text-blue-800',
        withdrawn: 'bg-gray-100 text-gray-800',
    };
    return (
        <span className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

export default function MyCampaignsPage() {
    const { api } = useApi();
    const [participations, setParticipations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State untuk modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPosts, setModalPosts] = useState([]);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [selectedCampaignName, setSelectedCampaignName] = useState('');

    const fetchMyCampaigns = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api('getMyCampaigns');
            setParticipations(response.data || []);
        } catch (err) {
            if (err.message.includes('401') || err.message.includes('Session expired')) {
                // Session expired - handled by AuthContext automatically
            } else if (err.message.includes('403')) {
                setError("You don't have permission to view campaigns.");
            } else {
                setError("Gagal memuat data kampanye Anda.");
            }
            console.error('Error fetching campaigns:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyCampaigns();
    }, [api]);

    const handleWithdraw = async (campaignId) => {
        if (window.confirm("Apakah Anda yakin ingin mengundurkan diri dari kampanye ini?")) {
            try {
                await api('withdrawFromCampaign', campaignId);
                alert('Anda berhasil mengundurkan diri.');
                fetchMyCampaigns(); // Muat ulang data
            } catch (err) {
                if (err.message.includes('401') || err.message.includes('Session expired')) {
                    // Session expired - handled by AuthContext automatically
                } else if (err.message.includes('403')) {
                    alert("You don't have permission to perform this action");
                } else if (err.message.includes('419')) {
                    alert("Security token expired. Please refresh the page.");
                } else {
                    alert(err.message || 'Gagal mengundurkan diri.');
                }
            }
        }
    };

    // Rest of the component remains the same...
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                    <p className="ml-4 text-gray-700">Loading campaigns...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Campaigns</h1>
            
            {participations.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">You haven't joined any campaigns yet.</p>
                    <Link 
                        to="/campaigns" 
                        className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition duration-300"
                    >
                        Browse Available Campaigns
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {participations.map((participation) => (
                        <div key={participation.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {participation.campaign?.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    {participation.campaign?.description}
                                </p>
                                
                                <div className="flex justify-between items-center mb-4">
                                    <StatusBadge status={participation.status} />
                                    <span className="text-sm text-gray-500">
                                        Joined: {formatDate(participation.created_at)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <Link 
                                        to={`/campaigns/${participation.campaign?.id}`}
                                        className="text-pink-500 hover:text-pink-600 font-medium"
                                    >
                                        View Details
                                    </Link>
                                    
                                    {participation.status === 'approved' && (
                                        <button
                                            onClick={() => handleWithdraw(participation.campaign?.id)}
                                            className="text-red-500 hover:text-red-600 font-medium"
                                        >
                                            Withdraw
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Posts Modal */}
            <PostsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                posts={modalPosts}
                loading={isModalLoading}
                campaignName={selectedCampaignName}
            />
        </div>
    );
}