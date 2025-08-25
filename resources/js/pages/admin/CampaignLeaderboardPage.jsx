import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import { Link, useNavigate, useParams } from 'react-router-dom';

// Icons
const IconArrowLeft = () => ( 
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19-7-7 7-7"/>
        <path d="M19 12H5"/>
    </svg> 
);

const IconTrophy = () => ( 
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" x2="16" y1="6" y2="6"/>
        <line x1="6" x2="18" y1="10" y2="10"/>
        <line x1="4" x2="20" y1="14" y2="14"/>
        <line x1="2" x2="22" y1="18" y2="18"/>
        <line x1="12" x2="12" y1="2" y2="6"/>
    </svg> 
);

const IconMedal = () => ( 
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6"/>
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg> 
);

const IconEye = () => ( 
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg> 
);

export default function CampaignLeaderboardPage() {
    const { api, auth } = useApi();
    const { user } = auth;
    const navigate = useNavigate();
    const { id: campaignId } = useParams();
    
    const [campaign, setCampaign] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPosts, setModalPosts] = useState([]);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [selectedInfluencerName, setSelectedInfluencerName] = useState('');

    useEffect(() => {
        const fetchCampaignData = async () => {
            try {
                const response = await api('getAdminCampaignDetail', campaignId);
                setCampaign(response.data);
            } catch (err) {
                console.error('Failed to fetch campaign:', err);
            }
        };

        const fetchLeaderboard = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api('getCampaignLeaderboard', campaignId);
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
    }, [campaignId, api]);

    // Function to open posts modal
    const handleViewPosts = async (userId, influencerName) => {
        setIsModalOpen(true);
        setSelectedInfluencerName(influencerName);
        setIsModalLoading(true);
        
        try {
            const response = await api('getPostsForInfluencerInCampaign', campaignId, userId);
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
        setSelectedInfluencerName('');
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <IconTrophy className="w-6 h-6 text-yellow-500" />;
            case 2:
                return <IconMedal className="w-6 h-6 text-gray-400" />;
            case 3:
                return <IconMedal className="w-6 h-6 text-amber-600" />;
            default:
                return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
        }
    };

    const getRankStyle = (rank) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-200';
            case 2:
                return 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-200';
            case 3:
                return 'bg-gradient-to-r from-amber-100 to-amber-50 border-amber-200';
            default:
                return 'bg-white border-gray-200';
        }
    };

    if (loading) return <div>Memuat data leaderboard...</div>;
    if (error) return <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <Link 
                    to="/admin/campaigns" 
                    className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
                >
                    <IconArrowLeft /> Kembali ke Manajemen Kampanye
                </Link>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <IconTrophy className="w-8 h-8 text-yellow-500" />
                            Leaderboard Kampanye
                        </h1>
                        <p className="text-lg text-gray-600">{campaign?.name || 'Loading...'}</p>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-gray-900">{leaderboard.length}</div>
                    <div className="text-sm text-gray-500">Total Partisipan</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-yellow-600">
                        {leaderboard.length > 0 ? Math.max(...leaderboard.map(p => p.total_score || 0)) : 0}
                    </div>
                    <div className="text-sm text-gray-500">Skor Tertinggi</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-blue-600">
                        {leaderboard.length > 0 ? 
                            Math.round(leaderboard.reduce((sum, p) => sum + (p.total_score || 0), 0) / leaderboard.length) 
                            : 0}
                    </div>
                    <div className="text-sm text-gray-500">Rata-rata Skor</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-green-600">
                        {leaderboard.reduce((sum, p) => sum + (p.total_posts || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-500">Total Posts</div>
                </div>
            </div>

            {/* Leaderboard */}
            {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                    <IconTrophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <div className="text-gray-500 text-lg">
                        Belum ada data leaderboard untuk kampanye ini.
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Ranking Influencer</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {leaderboard.map((participant, index) => {
                            const rank = index + 1;
                            return (
                                <div 
                                    key={participant.user_id} 
                                    className={`p-6 flex items-center justify-between border-l-4 ${getRankStyle(rank)}`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            {getRankIcon(rank)}
                                        </div>
                                        
                                        <div className="flex-shrink-0">
                                            <img 
                                                className="h-12 w-12 rounded-full object-cover" 
                                                src={participant.user?.profile_photo_path || '/default-avatar.png'} 
                                                alt=""
                                            />
                                        </div>
                                        
                                        <div className="min-w-0 flex-1">
                                            <p className="text-lg font-semibold text-gray-900">
                                                {participant.user?.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {participant.user?.email}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-6">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-indigo-600">
                                                {participant.total_score || 0}
                                            </div>
                                            <div className="text-xs text-gray-500">Points</div>
                                        </div>
                                        
                                        <div className="text-center">
                                            <div className="text-lg font-semibold text-gray-700">
                                                {participant.total_posts || 0}
                                            </div>
                                            <div className="text-xs text-gray-500">Posts</div>
                                        </div>
                                        
                                        <div className="text-center">
                                            <div className="text-lg font-semibold text-gray-700">
                                                {participant.total_engagement || 0}
                                            </div>
                                            <div className="text-xs text-gray-500">Engagement</div>
                                        </div>
                                        
                                        <button
                                            onClick={() => handleViewPosts(participant.user_id, participant.user?.name)}
                                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <IconEye className="mr-1" />
                                            View Posts
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Posts Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Posts dari {selectedInfluencerName}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="max-h-96 overflow-y-auto">
                                {isModalLoading ? (
                                    <div className="text-center py-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                        <p className="mt-2 text-sm text-gray-500">Memuat posts...</p>
                                    </div>
                                ) : modalPosts.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Tidak ada posts ditemukan.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {modalPosts.map(post => (
                                            <div key={post.id} className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            {post.social_media_account?.platform}
                                                        </span>
                                                        <span className={`text-xs px-2 py-1 rounded ${
                                                            post.is_validated 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {post.is_validated ? 'Validated' : 'Pending'}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {post.calculated_score || 0} pts
                                                    </span>
                                                </div>
                                                
                                                {post.image_url && (
                                                    <img 
                                                        src={post.image_url} 
                                                        alt="Post" 
                                                        className="w-full h-32 object-cover rounded-md mb-3"
                                                    />
                                                )}
                                                
                                                <p className="text-sm text-gray-700 mb-2 line-clamp-3">
                                                    {post.caption || 'No caption'}
                                                </p>
                                                
                                                <div className="flex justify-between items-center text-xs text-gray-500">
                                                    <span>{new Date(post.posted_at).toLocaleDateString('id-ID')}</span>
                                                    {post.post_url && (
                                                        <a 
                                                            href={post.post_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            View Post
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}