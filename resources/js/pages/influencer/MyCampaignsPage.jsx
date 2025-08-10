import React, { useState, useEffect } from 'react';
import { apiService, formatDate } from '../../services/apiService';
import PostsModal from '../../components/PostsModal'; // Import modal

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

import { Link } from 'react-router-dom';

export default function MyCampaignsPage({ user }) {
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
            const response = await apiService.getMyCampaigns();
            // PERBAIKAN: Ambil data dari response.data, bukan response langsung
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
    }, []);

    const handleWithdraw = async (campaignId) => {
        // Menggunakan window.confirm untuk konfirmasi
        if (window.confirm("Apakah Anda yakin ingin mengundurkan diri dari kampanye ini?")) {
            try {
                await apiService.withdrawFromCampaign(campaignId);
                alert('Anda berhasil mengundurkan diri.');
                fetchMyCampaigns(); // Muat ulang data
            } catch (err) {
                alert(err.message || 'Gagal mengundurkan diri.');
            }
        }
    };

    const handleViewPosts = async (campaignId, campaignName) => {
        setIsModalOpen(true);
        setIsModalLoading(true);
        setSelectedCampaignName(campaignName);
        try {
            const response = await apiService.getPostsForInfluencerInCampaign(campaignId, user.id);
            setModalPosts(response.data || []);
        } catch (err) {
            console.error("Gagal memuat postingan untuk modal:", err);
            setModalPosts([]);
        } finally {
            setIsModalLoading(false);
        }
    };

    if (loading) return <div>Memuat kampanye Anda...</div>;
    if (error) return <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Kampanye Saya</h1>
            
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kampanye</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Partisipasi Anda</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode Kampanye</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {participations.length > 0 ? participations.map(p => (
                            <tr key={p.id}>
                                {/* PERBAIKAN: Ganti p.campaign.name menjadi p.name */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                                
                                {/* PERBAIKAN: Ganti p.status menjadi p.participant_status */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={p.participant_status} /></td>
                                
                                {/* PERBAIKAN: Ganti p.campaign.start_date/end_date menjadi p.start_date/end_date */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(p.start_date)} - {formatDate(p.end_date)}
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {/* PERBAIKAN: Ganti p.status menjadi p.participant_status */}
                                    {p.participant_status === 'approved' ? (
                                        <div className="flex justify-end items-center gap-4">
                                            <button onClick={() => handleViewPosts(p.id, p.name)} className="text-blue-600 hover:underline">Lihat Postingan</button>
                                            <button onClick={() => handleWithdraw(p.id)} className="text-red-600 hover:underline">Withdraw</button>
                                        </div>
                                    ) : (
                                        <Link to={`/campaigns/${p.id}`} className="text-indigo-600 hover:text-indigo-900">
                                            Lihat Detail
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Anda belum bergabung dengan kampanye apapun.</td>
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
                influencerName={user.name}
                campaignName={selectedCampaignName}
            />
        </div>
    );
}