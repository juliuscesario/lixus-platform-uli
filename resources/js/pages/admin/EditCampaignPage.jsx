import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const IconArrowLeft = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> );
const IconPlay = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> );
const IconCheckCircle = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> );

import { Link, useNavigate, useParams } from 'react-router-dom';

export default function EditCampaignPage() {
    const { user, auth } = useAuth();
    const { id: campaignId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '', description: '', start_date: '', end_date: '', budget: '', status: 'draft',
        kpi: '', goals: '', hashtags: '', mentions: '', content_type: '', target_audience: '',
        instagram_likes_point: 0, instagram_comments_point: 0, instagram_shares_point: 0,
        tiktok_likes_point: 0, tiktok_comments_point: 0, tiktok_shares_point: 0,
        hashtag_bonus: 0, mention_bonus: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false); // State untuk tombol status

    useEffect(() => {
        if (!campaignId) {
            setError("Campaign ID tidak ditemukan.");
            setLoading(false);
            return;
        }

        const fetchCampaign = async () => {
            setLoading(true);
            try {
                const response = await apiService(auth).getAdminCampaignDetail(campaignId);
                const campaign = response.data;
                const briefing = campaign.briefing_content || {};
                const scoring = campaign.scoring_rules || {};
                const instagram_rules = scoring.instagram || {};
                const tiktok_rules = scoring.tiktok || {};

                setFormData({
                    name: campaign.name || '',
                    description: campaign.description || '',
                    start_date: campaign.start_date ? campaign.start_date.split('T')[0] : '',
                    end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '',
                    budget: campaign.budget || '',
                    status: campaign.status || 'draft',
                    kpi: briefing.kpi || '',
                    goals: briefing.goals || '',
                    hashtags: Array.isArray(briefing.hashtags) ? briefing.hashtags.join(', ') : '',
                    mentions: Array.isArray(briefing.mentions) ? briefing.mentions.join(', ') : '',
                    content_type: Array.isArray(briefing.content_type) ? briefing.content_type.join(', ') : '',
                    target_audience: briefing.target_audience || '',
                    instagram_likes_point: instagram_rules.likes_point || 0,
                    instagram_comments_point: instagram_rules.comments_point || 0,
                    instagram_shares_point: instagram_rules.shares_point || 0,
                    tiktok_likes_point: tiktok_rules.likes_point || 0,
                    tiktok_comments_point: tiktok_rules.comments_point || 0,
                    tiktok_shares_point: tiktok_rules.shares_point || 0,
                    hashtag_bonus: scoring.hashtag_bonus || 0,
                    mention_bonus: scoring.mention_bonus || 0,
                });
            } catch (err) {
                setError('Gagal memuat data kampanye.');
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaign();
    }, [campaignId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

     // --- FUNGSI BARU UNTUK UPDATE STATUS ---
    const handleStatusUpdate = async (newStatus) => {
        setIsUpdatingStatus(true);
        setError(null);
        try {
            await apiService(auth).updateCampaign(campaignId, { status: newStatus });
            setFormData(prev => ({ ...prev, status: newStatus }));
            alert(`Kampanye berhasil diubah menjadi ${newStatus}!`);
        } catch (err) {
            console.error("Status Update Error:", err.response || err);
            setError(err.message || `Gagal mengubah status.`);
        } finally {
            setIsUpdatingStatus(false);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        // --- PERBAIKAN UTAMA DI SINI ---
        // Mengirim objek JavaScript secara langsung, BUKAN string JSON
        const payload = {
            name: formData.name,
            description: formData.description,
            start_date: formData.start_date,
            end_date: formData.end_date,
            budget: formData.budget,
            status: formData.status,
            briefing_content: {
                kpi: formData.kpi,
                goals: formData.goals,
                hashtags: (formData.hashtags || '').split(',').map(tag => tag.trim()).filter(tag => tag),
                mentions: (formData.mentions || '').split(',').map(tag => tag.trim()).filter(tag => tag),
                content_type: (formData.content_type || '').split(',').map(tag => tag.trim()).filter(tag => tag),
                target_audience: formData.target_audience,
            },
            scoring_rules: {
                instagram: {
                    likes_point: parseFloat(formData.instagram_likes_point) || 0,
                    comments_point: parseFloat(formData.instagram_comments_point) || 0,
                    shares_point: parseFloat(formData.instagram_shares_point) || 0,
                },
                tiktok: {
                    likes_point: parseFloat(formData.tiktok_likes_point) || 0,
                    comments_point: parseFloat(formData.tiktok_comments_point) || 0,
                    shares_point: parseFloat(formData.tiktok_shares_point) || 0,
                },
                hashtag_bonus: parseInt(formData.hashtag_bonus, 10) || 0,
                mention_bonus: parseInt(formData.mention_bonus, 10) || 0,
            },
        };
        // ---------------------------------
        
        try {
            await apiService(auth).updateCampaign(campaignId, payload);
            alert('Kampanye berhasil diperbarui!');
            navigate('/admin/campaigns');
        } catch (err) {
            console.error("Submit Error:", err.response || err);
            if (err.response && err.response.data && err.response.data.errors) {
                const errorMessages = Object.values(err.response.data.errors).flat().join('\n');
                setError(`Gagal menyimpan. Periksa data Anda:\n${errorMessages}`);
            } else {
                setError(err.message || 'Gagal memperbarui kampanye.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-4">Memuat data...</div>;
    // Tampilkan error utama jika ada, kecuali saat sedang menyimpan/update status
    if (error && !isSaving && !isUpdatingStatus) return <div className="p-4 text-red-500 bg-red-100 rounded-md whitespace-pre-line">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <Link to="/admin/campaigns" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <IconArrowLeft />
                        Kembali ke Manajemen Kampanye
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800 mt-2">Edit Kampanye: {formData.name}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {['draft', 'pending'].includes(formData.status) && (
                        <button 
                            type="button"
                            onClick={() => handleStatusUpdate('active')}
                            disabled={isUpdatingStatus}
                            className="inline-flex items-center gap-2 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300">
                            <IconPlay />
                            {isUpdatingStatus ? 'Mengaktifkan...' : 'Aktifkan Kampanye'}
                        </button>
                    )}
                    {formData.status === 'active' && (
                        <button 
                            type="button"
                            onClick={() => handleStatusUpdate('completed')}
                            disabled={isUpdatingStatus}
                            className="inline-flex items-center gap-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300">
                            <IconCheckCircle />
                            {isUpdatingStatus ? 'Menyelesaikan...' : 'Selesaikan Kampanye'}
                        </button>
                    )}
                </div>
            </div>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8">
                {error && (
                    <div className="mb-4 text-red-700 bg-red-100 p-3 rounded-md whitespace-pre-line">{error}</div>
                )}
                
                <fieldset className="mb-8">
                    <legend className="text-lg font-semibold border-b pb-2 mb-4 w-full">Informasi Dasar</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Kampanye</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Budget</label>
                            <input type="number" name="budget" value={formData.budget} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                            <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal Selesai</label>
                            <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>
                </fieldset>
                
                <fieldset className="mb-8">
                    <legend className="text-lg font-semibold border-b pb-2 mb-4 w-full">Konten Briefing</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Goals</label>
                            <input type="text" name="goals" value={formData.goals} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">KPI</label>
                            <input type="text" name="kpi" value={formData.kpi} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                            <input type="text" name="target_audience" value={formData.target_audience} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Content Type (pisahkan dengan koma)</label>
                            <input type="text" name="content_type" value={formData.content_type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hashtags (pisahkan dengan koma)</label>
                            <input type="text" name="hashtags" value={formData.hashtags} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mentions (pisahkan dengan koma)</label>
                            <input type="text" name="mentions" value={formData.mentions} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                    </div>
                </fieldset>

                <fieldset className="mb-8">
                    <legend className="text-lg font-semibold border-b pb-2 mb-4 w-full">Aturan Skor</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-md font-semibold mb-2">Instagram</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700">Poin Likes</label><input type="number" step="0.001" name="instagram_likes_point" value={formData.instagram_likes_point} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Poin Comments</label><input type="number" step="0.001" name="instagram_comments_point" value={formData.instagram_comments_point} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Poin Shares</label><input type="number" step="0.001" name="instagram_shares_point" value={formData.instagram_shares_point} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-md font-semibold mb-2">TikTok</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700">Poin Likes</label><input type="number" step="0.001" name="tiktok_likes_point" value={formData.tiktok_likes_point} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Poin Comments</label><input type="number" step="0.001" name="tiktok_comments_point" value={formData.tiktok_comments_point} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Poin Shares</label><input type="number" step="0.001" name="tiktok_shares_point" value={formData.tiktok_shares_point} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                        <div><label className="block text-sm font-medium text-gray-700">Bonus Hashtag</label><input type="number" name="hashtag_bonus" value={formData.hashtag_bonus} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Bonus Mention</label><input type="number" name="mention_bonus" value={formData.mention_bonus} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                    </div>
                </fieldset>

                <div className="flex justify-end">
                    <button type="submit" disabled={isSaving} className="bg-pink-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-pink-700 transition-colors disabled:bg-pink-300">
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </div>
    );
}