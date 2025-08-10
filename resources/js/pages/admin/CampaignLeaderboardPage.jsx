import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import PostsModal from '../../components/PostsModal'; // Import modal baru

const IconArrowLeft = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> );
const IconTrophy = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-yellow-500"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M8 21h8"/><path d="M12 17.5c-1.74 0-3.41-.5-4.62-1.33a5 5 0 0 1-1.26-6.51C6.78 8.79 8 7.5 8 6c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2c0 1.5 1.22 2.79 1.88 3.66a5 5 0 0 1-1.26 6.51C15.41 17 13.74 17.5 12 17.5Z"/></svg> );
const SocialIcon = ({ platform, className }) => {
    if (platform === 'instagram') {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={className}
            >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
            </svg>
        );
    }
    if (platform === 'tiktok') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-tiktok" viewBox="0 0 16 16">
            <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
            </svg>
        );
    }
    return null;
};

import { Link, useNavigate, useParams } from 'react-router-dom';

export default function CampaignLeaderboardPage() {
    const navigate = useNavigate();
    const { id: campaignId } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State baru untuk modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPosts, setModalPosts] = useState([]);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [selectedInfluencerName, setSelectedInfluencerName] = useState('');

    useEffect(() => {
        const fetchCampaignData = async () => {
            try {
                const response = await apiService.getAdminCampaignDetail(campaignId);
                setCampaign(response.data);
            } catch (err) {
                console.error('Failed to fetch campaign:', err);
            }
        };

        const fetchLeaderboard = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiService.getCampaignLeaderboard(campaignId);
                setLeaderboard(response.data || []);
            } catch (err) {
                setError('Gagal memuat data leaderboard.');
            } finally {
                setLoading(false);
            }
        };
        
        if (campaignId) {
            fetchCampaignData();
            fetchLeaderboard();
        }
    }, [campaignId]);

    const handleViewPosts = async (userId, userName) => {
        setIsModalOpen(true);
        setIsModalLoading(true);
        setSelectedInfluencerName(userName);
        try {
            const response = await apiService.getPostsForInfluencerInCampaign(campaignId, userId);
            setModalPosts(response.data || []);
        } catch (err) {
            console.error("Gagal memuat postingan untuk modal:", err);
            setModalPosts([]);
        } finally {
            setIsModalLoading(false);
        }
    };


    const getRankColor = (rank) => {
        if (rank === 1) return 'bg-yellow-400 text-white';
        if (rank === 2) return 'bg-gray-300 text-gray-800';
        if (rank === 3) return 'bg-yellow-600 text-white';
        return 'bg-gray-100 text-gray-700';
    };

    if (loading) return <div>Memuat leaderboard...</div>;
    if (error) return <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;

   return (
        <div>
            <Link to="/admin/campaigns" className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <IconArrowLeft />
                Kembali ke Manajemen Kampanye
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Leaderboard</h1>
            <p className="text-lg text-gray-600 mb-6">{campaign?.name || 'Loading...'}</p>
            
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Peringkat</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Influencer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Skor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform Terdaftar</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Postingan</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {leaderboard.length > 0 ? leaderboard.map((entry, index) => (
                            <tr key={entry.user_id}>
                                <td className="px-6 py-4 text-center">
                                    <span className={`w-8 h-8 rounded-full inline-flex items-center justify-center font-bold text-sm ${getRankColor(index + 1)}`}>
                                        {index < 3 ? <IconTrophy /> : index + 1}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{entry.influencer_name}</div>
                                    <div className="text-sm text-gray-500">{entry.influencer_email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{parseFloat(entry.total_score).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center space-x-2">
                                        {(entry.social_media_platforms || []).map(platform => (
                                            <SocialIcon key={platform} platform={platform} className="h-6 w-6 text-gray-600" />
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button onClick={() => handleViewPosts(entry.user_id, entry.influencer_name)} className="text-blue-600 hover:underline">
                                        Lihat postingan terkait
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Data leaderboard belum tersedia.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <PostsModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                posts={modalPosts}
                loading={isModalLoading}
                influencerName={selectedInfluencerName}
                campaignName={campaign?.name || ''} // Kirim nama kampanye ke modal
            />
        </div>
    );
}