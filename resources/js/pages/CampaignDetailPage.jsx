import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiService, formatDate, formatCurrency } from '../services/apiService';

const IconArrowLeft = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> );

function BriefingItem({ title, content, isTag = false }) {
    if (!content || (Array.isArray(content) && content.length === 0)) {
        return null;
    }
    return (
        <div className="flex flex-col md:flex-row">
            <p className="w-full md:w-1/3 font-semibold text-gray-700">{title}</p>
            <div className="w-full md:w-2/3">
                {isTag && Array.isArray(content) ? (
                    <div className="flex flex-wrap gap-2">
                        {content.map((item, index) => (
                            <span key={index} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">{item}</span>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">{content.toString()}</p>
                )}
            </div>
        </div>
    );
}

export default function CampaignDetailPage({ user }) {
    const { id } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ▼▼▼ STATE BARU UNTUK MODAL DAN PROSES APPLY ▼▼▼
    const [isConfirming, setIsConfirming] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    // ▲▲▲ STATE BARU ▲▲▲

    useEffect(() => {
        const fetchCampaignDetail = async () => {
            if (!id) {
                setError("ID Kampanye tidak ditemukan.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            const response = await apiService.getCampaignDetail(id);
            if (response && response.data) {
                setCampaign(response.data);
            } else {
                setError("Tidak dapat memuat detail kampanye. Mungkin kampanye tersebut tidak ada.");
            }
            setLoading(false);
        };
        fetchCampaignDetail();
    }, [id]);

     // ▼▼▼ FUNGSI BARU UNTUK PROSES APPLY DENGAN API ▼▼▼
    const handleConfirmApply = async () => {
        setIsApplying(true);
        setFeedbackMessage('');
        try {
            // Memanggil fungsi API sesuai spesifikasi Anda
            await apiService.applyCampaign(campaign.id, { status: 'pending' });
            
            setFeedbackMessage('Sukses! Anda telah berhasil mendaftar untuk kampanye ini.');
            // Opsional: Anda bisa memperbarui state untuk menonaktifkan tombol daftar
            // Contoh: setCampaign(prev => ({ ...prev, participation_status: 'pending' }));
            
        } catch (err) {
            setFeedbackMessage(err.message || 'Gagal mendaftar. Silakan coba lagi nanti.');
        } finally {
            setIsApplying(false);
            setIsConfirming(false); // Selalu tutup modal setelah selesai
        }
    };
    // ▲▲▲ FUNGSI BARU ▲▲▲
    
    if (loading) { return <div className="max-w-4xl mx-auto py-12 px-4 text-center">Memuat detail kampanye...</div>; }
    if (error) { return <div className="max-w-4xl mx-auto py-12 px-4 text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</div>; }
    if (!campaign) { return <div className="max-w-4xl mx-auto py-12 px-4 text-center">Kampanye tidak ditemukan.</div>; }
    
    const briefing = campaign.briefing_content || {};
    const isBrandOrAdmin = user && (user.role === 'brand' || user.role === 'admin');

    const renderActionButton = () => {
        if (!user) {
            return <Link to="/login" className="bg-pink-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-700 transition-colors duration-300 text-lg">Login untuk Mendaftar</Link>;
        }
        if (user.role === 'influencer') {
            // ▼▼▼ Tombol ini sekarang membuka modal konfirmasi ▼▼▼
            return <button onClick={() => setIsConfirming(true)} className="bg-pink-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-700 transition-colors duration-300 text-lg">Daftar untuk Kampanye Ini</button>;
        }
        if (isBrandOrAdmin) {
            return <Link to={`/admin/campaigns/edit/${campaign.id}`} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-lg">Kelola Campaign</Link>;
        }
        return null;
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Link to="/" className="mb-8 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <IconArrowLeft />
                Kembali ke Daftar Kampanye
            </Link>
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                 <img className="h-64 w-full object-cover" src={campaign.image || `https://placehold.co/800x400/f472b6/ffffff?text=${encodeURIComponent(campaign.name)}`} alt={campaign.name} />
                 <div className="p-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{campaign.name}</h1>
                    <p className="text-lg text-gray-500 mb-6">{campaign.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 border-t border-b border-gray-200 py-6">
                        {user && <div><p className="text-sm font-semibold text-gray-500">Status</p><p className="text-lg font-bold text-gray-800 capitalize">{campaign.status}</p></div>}
                        {isBrandOrAdmin && <div><p className="text-sm font-semibold text-gray-500">Budget</p><p className="text-lg font-bold text-gray-800">{formatCurrency(campaign.budget)}</p></div>}
                        <div><p className="text-sm font-semibold text-gray-500">Tanggal Mulai</p><p className="text-lg font-bold text-gray-800">{formatDate(campaign.start_date)}</p></div>
                        <div><p className="text-sm font-semibold text-gray-500">Tanggal Selesai</p><p className="text-lg font-bold text-gray-800">{formatDate(campaign.end_date)}</p></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Brief Kampanye</h2>
                    <div className="space-y-4">
                    {/* <BriefingItem title="Goals" content={briefing.goals} />
                        <BriefingItem title="KPI" content={briefing.kpi} />
                        <BriefingItem title="Target Audience" content={briefing.target_audience} />*/}
                        <BriefingItem title="Content Type" content={briefing.content_type} isTag />
                        <BriefingItem title="Hashtags" content={briefing.hashtags} isTag />
                        <BriefingItem title="Mentions" content={briefing.mentions} isTag />
                    </div>
                    <div className="mt-10 text-center">
                        {renderActionButton()}
                        {/* ▼▼▼ Menampilkan pesan feedback setelah apply ▼▼▼ */}
                        {feedbackMessage && (
                            <p className={`mt-4 text-sm ${feedbackMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                                {feedbackMessage}
                            </p>
                        )}
                    </div>
                 </div>
            </div>
            {/* ▼▼▼ MODAL KONFIRMASI ▼▼▼ */}
            {isConfirming && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full text-center">
                        <h3 className="text-xl font-bold mb-4">Konfirmasi Pendaftaran</h3>
                        <p className="text-gray-600 mb-6">
                            Apakah Anda yakin ingin mendaftar untuk kampanye: <br /><strong>"{campaign.name}"</strong>?
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setIsConfirming(false)}
                                disabled={isApplying}
                                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                            >
                                Tidak
                            </button>
                            <button
                                onClick={handleConfirmApply}
                                disabled={isApplying}
                                className="px-6 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition-colors disabled:bg-pink-300 disabled:cursor-not-allowed"
                            >
                                {isApplying ? 'Memproses...' : 'Ya, Daftar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ▲▲▲ AKHIR MODAL ▲▲▲ */}
        </div>
    );
}
