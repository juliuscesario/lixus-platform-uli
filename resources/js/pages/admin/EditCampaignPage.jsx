import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import { Link, useNavigate, useParams } from 'react-router-dom';

const IconArrowLeft = () => ( 
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19-7-7 7-7"/>
        <path d="M19 12H5"/>
    </svg> 
);

const IconPlay = () => ( 
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
    </svg> 
);

const IconCheckCircle = () => ( 
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
    </svg> 
);

export default function EditCampaignPage() {
    const { api, auth } = useApi();
    const { user } = auth;
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
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    useEffect(() => {
        if (!campaignId) {
            setError("Campaign ID tidak ditemukan.");
            setLoading(false);
            return;
        }

        const fetchCampaign = async () => {
            setLoading(true);
            try {
                const response = await api('getAdminCampaignDetail', campaignId);
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
                setError(err.message || "Gagal memuat data kampanye.");
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaign();
    }, [campaignId, api]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusUpdate = async (newStatus) => {
        setIsUpdatingStatus(true);
        setError(null);
        try {
            await api('updateCampaign', campaignId, { status: newStatus });
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
        
        try {
            await api('updateCampaign', campaignId, payload);
            alert('Kampanye berhasil diperbarui!');
            navigate('/admin/campaigns');
        } catch (err) {
            console.error("Update Error:", err);
            setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div>Memuat data kampanye...</div>;
    if (error && !formData.name) return <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;

    return (
        <div>
            <Link 
                to="/admin/campaigns" 
                className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
                <IconArrowLeft />
                Kembali ke Manajemen Kampanye
            </Link>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Edit Kampanye</h1>
                    <p className="text-gray-600">{formData.name}</p>
                </div>
                <div className="flex gap-3">
                    {formData.status === 'draft' && (
                        <button
                            type="button"
                            onClick={() => handleStatusUpdate('active')}
                            disabled={isUpdatingStatus}
                            className="flex items-center gap-2 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                            <IconPlay className="w-4 h-4" />
                            {isUpdatingStatus ? 'Mengaktifkan...' : 'Aktifkan Kampanye'}
                        </button>
                    )}
                    {formData.status === 'active' && (
                        <button
                            type="button"
                            onClick={() => handleStatusUpdate('completed')}
                            disabled={isUpdatingStatus}
                            className="flex items-center gap-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            <IconCheckCircle className="w-4 h-4" />
                            {isUpdatingStatus ? 'Menyelesaikan...' : 'Selesaikan Kampanye'}
                        </button>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8">
                {error && (
                    <div className="mb-4 text-red-700 bg-red-100 p-3 rounded-md whitespace-pre-line">
                        {error}
                    </div>
                )}
                
                {/* Basic Information */}
                <fieldset className="mb-8">
                    <legend className="text-lg font-semibold border-b pb-2 mb-4 w-full">
                        Informasi Dasar
                    </legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Kampanye</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Budget</label>
                            <input 
                                type="number" 
                                name="budget" 
                                value={formData.budget} 
                                onChange={handleChange} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                            <input 
                                type="date" 
                                name="start_date" 
                                value={formData.start_date} 
                                onChange={handleChange} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal Selesai</label>
                            <input 
                                type="date" 
                                name="end_date" 
                                value={formData.end_date} 
                                onChange={handleChange} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                                required 
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                rows="4" 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select 
                                name="status" 
                                value={formData.status} 
                                onChange={handleChange} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </fieldset>

                {/* Content Brief */}
                <fieldset className="mb-8">
                    <legend className="text-lg font-semibold border-b pb-2 mb-4 w-full">
                        Brief Konten
                    </legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">KPI</label>
                            <textarea 
                                name="kpi" 
                                value={formData.kpi} 
                                onChange={handleChange} 
                                rows="3" 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Goals</label>
                            <textarea 
                                name="goals" 
                                value={formData.goals} 
                                onChange={handleChange} 
                                rows="3" 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hashtags (pisahkan dengan koma)</label>
                            <input 
                                type="text" 
                                name="hashtags" 
                                value={formData.hashtags} 
                                onChange={handleChange} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                                placeholder="#campaign, #brand, #promo"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mentions (pisahkan dengan koma)</label>
                            <input 
                                type="text" 
                                name="mentions" 
                                value={formData.mentions} 
                                onChange={handleChange} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                                placeholder="@brandname, @company"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipe Konten (pisahkan dengan koma)</label>
                            <input 
                                type="text" 
                                name="content_type" 
                                value={formData.content_type} 
                                onChange={handleChange} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                                placeholder="photo, video, story"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                            <input 
                                type="text" 
                                name="target_audience" 
                                value={formData.target_audience} 
                                onChange={handleChange} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </fieldset>

                {/* Scoring Rules */}
                <fieldset className="mb-8">
                    <legend className="text-lg font-semibold border-b pb-2 mb-4 w-full">
                        Aturan Scoring
                    </legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Instagram Scoring */}
                        <div>
                            <h3 className="font-medium text-gray-900 mb-3">Instagram</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Likes Point</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        name="instagram_likes_point" 
                                        value={formData.instagram_likes_point} 
                                        onChange={handleChange} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Comments Point</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        name="instagram_comments_point" 
                                        value={formData.instagram_comments_point} 
                                        onChange={handleChange} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Shares Point</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        name="instagram_shares_point" 
                                        value={formData.instagram_shares_point} 
                                        onChange={handleChange} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* TikTok Scoring */}
                        <div>
                            <h3 className="font-medium text-gray-900 mb-3">TikTok</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Likes Point</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        name="tiktok_likes_point" 
                                        value={formData.tiktok_likes_point} 
                                        onChange={handleChange} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Comments Point</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        name="tiktok_comments_point" 
                                        value={formData.tiktok_comments_point} 
                                        onChange={handleChange} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Shares Point</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        name="tiktok_shares_point" 
                                        value={formData.tiktok_shares_point} 
                                        onChange={handleChange} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bonus Points */}
                        <div className="md:col-span-2">
                            <h3 className="font-medium text-gray-900 mb-3">Bonus Points</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hashtag Bonus</label>
                                    <input 
                                        type="number" 
                                        name="hashtag_bonus" 
                                        value={formData.hashtag_bonus} 
                                        onChange={handleChange} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mention Bonus</label>
                                    <input 
                                        type="number" 
                                        name="mention_bonus" 
                                        value={formData.mention_bonus} 
                                        onChange={handleChange} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </fieldset>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button 
                        type="submit" 
                        disabled={isSaving} 
                        className="bg-pink-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Menyimpan...' : 'Update Kampanye'}
                    </button>
                </div>
            </form>
        </div>
    );
}