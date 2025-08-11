import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

const IconArrowLeft = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> );

const SocialIcon = ({ platform }) => {
    if (platform === 'instagram') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
            </svg>
        );
    }
    if (platform === 'tiktok') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-tiktok" viewBox="0 0 16 16">
            <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
            </svg>
        );
    }
    return null;
};

export default function InfluencerDetailPage({ pageProps }) {
    const { user, auth } = useAuth();
    const [influencer, setInfluencer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInfluencerDetail = async () => {
            if (!pageProps.id) {
                setError("ID Influencer tidak ditemukan.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            const response = await apiService(auth).getInfluencerDetail(pageProps.id);
            if (response && response.data) {
                setInfluencer(response.data);
            } else {
                setError("Tidak dapat memuat detail influencer.");
            }
            setLoading(false);
        };
        fetchInfluencerDetail();
    }, [pageProps.id]);

    if (loading) { return <div className="max-w-4xl mx-auto py-12 px-4 text-center">Memuat profil influencer...</div>; }
    if (error) { return <div className="max-w-4xl mx-auto py-12 px-4 text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</div>; }
    if (!influencer) { return <div className="max-w-4xl mx-auto py-12 px-4 text-center">Influencer tidak ditemukan.</div>; }

    const profile = influencer.influencer_profile || {};
    const imageUrl = profile.profile_picture || `https://placehold.co/400x400/eab308/ffffff?text=${encodeURIComponent(influencer.name.charAt(0))}`;

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Link to="/influencers" className="mb-8 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <IconArrowLeft />
                Kembali ke Daftar Influencer
            </Link>
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="p-8 text-center">
                    <img className="w-40 h-40 mx-auto rounded-full mb-4 border-4 border-white shadow-lg" src={imageUrl} alt={influencer.name} />
                    <h1 className="text-4xl font-bold text-gray-900">{influencer.name}</h1>
                    <p className="text-lg text-gray-500 capitalize">{profile.city || 'Lokasi tidak diketahui'}</p>
                </div>
                <div className="border-t border-gray-200 px-8 py-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Tentang Saya</h2>
                    <p className="text-gray-600 mb-6">{profile.bio || "Bio belum diatur."}</p>
                    
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Akun Media Sosial</h3>
                    {influencer.social_media_accounts && influencer.social_media_accounts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {influencer.social_media_accounts.map(acc => (
                                <div key={acc.id} className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
                                    <div className="flex-shrink-0">
                                        <SocialIcon platform={acc.platform} />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-bold capitalize text-gray-700">{acc.platform}</p>
                                        <a href={`https://www.${acc.platform}.com/${acc.username}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">@{acc.username}</a>
                                        <div className="flex gap-4 text-sm mt-1 text-gray-500">
                                            <span><span className="font-bold">1.2M</span> Followers</span>
                                            <span><span className="font-bold">150</span> Following</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">Belum ada akun media sosial yang terhubung.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
