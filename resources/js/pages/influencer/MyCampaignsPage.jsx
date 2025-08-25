import React, { useState, useEffect } from 'react';
import { formatDate } from '../../services/apiService';
import useApi from '../../hooks/useApi';
import { Link } from 'react-router-dom';
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
        <span className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${
            statusStyles[status] || 'bg-gray-100 text-gray-800'
        }`}>
            {status}
        </span>
    );
};

export default function MyCampaignsPage({ user }) {
    const { api, auth } = useApi();
    const { user: authUser } = auth;
    
    // Use authenticated user or passed user prop
    const currentUser = authUser || user;
    
    const [participations, setParticipations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for modal
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
            console.error('Error fetching campaigns:', err);
            setError("Gagal memuat data kampanye Anda.");
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
                fetchMyCampaigns(); // Reload data
            } catch (err) {
                alert(err.message || 'Gagal mengundurkan diri.');
            }
        }
    };

    // Function to open posts modal
    const handleViewPosts = async (campaignId, campaignName) => {
        setIsModalOpen(true);
        setSelectedCampaignName(campaignName);
        setIsModalLoading(true);
        
        try {
            // Get posts for this campaign and current user
            const response = await api('getPostsForInfluencerInCampaign', campaignId, currentUser?.id);
            setModalPosts(response.data || []);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setModalPosts([]);
        } finally {
            setIsModalLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalPosts([]);
        setSelectedCampaignName('');
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto py-12 px-4 text-center">
                Memuat kampanye Anda...
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto py-12 px-4 text-center">
                <div className="text-red-500 bg-red-100 p-4 rounded-md">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Kampanye Saya</h1>
            
            {participations.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">
                        Anda belum mengikuti kampanye apapun.
                    </div>
                    <Link 
                        to="/" 
                        className="bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors"
                    >
                        Lihat Kampanye Tersedia
                    </Link>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kampanye
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal Bergabung
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal Berakhir
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {participations.map((participation) => (
                                    <tr key={participation.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img 
                                                        className="h-10 w-10 rounded-lg object-cover" 
                                                        src={participation.campaign?.image || `https://placehold.co/40x40/f472b6/ffffff?text=${participation.campaign?.name?.[0] || 'C'}`}
                                                        alt=""
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {participation.campaign?.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {participation.campaign?.description?.substring(0, 60)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={participation.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(participation.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(participation.campaign?.end_date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <Link
                                                    to={`/campaigns/${participation.campaign?.id}`}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Lihat Detail
                                                </Link>
                                                
                                                {participation.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleViewPosts(
                                                            participation.campaign?.id,
                                                            participation.campaign?.name
                                                        )}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Lihat Posts
                                                    </button>
                                                )}
                                                
                                                {participation.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleWithdraw(participation.campaign?.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Withdraw
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Posts Modal */}
            {isModalOpen && (
                <PostsModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    posts={modalPosts}
                    campaignName={selectedCampaignName}
                    loading={isModalLoading}
                />
            )}
        </div>
    );
}