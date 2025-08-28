import React, { useState } from 'react';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const IconArrowLeft = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> );

import { useNavigate } from 'react-router-dom';

export default function CreateCampaignPage() {
    const { user, auth } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        budget: '',
        kpi: '',
        goals: '',
        hashtags: '',
        mentions: '',
        content_type: '',
        target_audience: '',
        instagram_likes_point: 0.01,
        instagram_comments_point: 0.05,
        instagram_shares_point: 0.1,
        tiktok_likes_point: 0.02,
        tiktok_comments_point: 0.06,
        tiktok_shares_point: 0.15,
        hashtag_bonus: 5,
        mention_bonus: 10,
        status: 'draft'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            name: formData.name,
            description: formData.description,
            start_date: new Date(formData.start_date).toISOString(),
            end_date: new Date(formData.end_date).toISOString(),
            budget: formData.budget,
            briefing_content: {
                kpi: formData.kpi,
                goals: formData.goals,
                hashtags: formData.hashtags.split(',').map(tag => tag.trim()),
                mentions: formData.mentions.split(',').map(tag => tag.trim()),
                content_type: formData.content_type.split(',').map(tag => tag.trim()),
                target_audience: formData.target_audience,
            },
            scoring_rules: {
                instagram: {
                    likes_point: parseFloat(formData.instagram_likes_point),
                    comments_point: parseFloat(formData.instagram_comments_point),
                    shares_point: parseFloat(formData.instagram_shares_point),
                },
                tiktok: {
                    likes_point: parseFloat(formData.tiktok_likes_point),
                    comments_point: parseFloat(formData.tiktok_comments_point),
                    shares_point: parseFloat(formData.tiktok_shares_point),
                },
                hashtag_bonus: parseInt(formData.hashtag_bonus, 10),
                mention_bonus: parseInt(formData.mention_bonus, 10),
            },
            status: formData.status,
        };

        try {
            await apiService(auth).createCampaign(payload);
            alert('Kampanye berhasil dibuat!');
            navigate('/admin/campaigns');
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={() => navigate('/admin/campaigns')} className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <IconArrowLeft />
                Kembali ke Manajemen Kampanye
            </button>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Buat Kampanye Baru</h1>

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8">
                {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-6">{error}</div>}

                {/* Bagian Informasi Dasar */}
                <fieldset className="mb-8">
                    <legend className="text-lg font-semibold border-b pb-2 mb-4 w-full">Informasi Dasar</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Kampanye</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
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
                    </div>
                </fieldset>

                {/* Bagian Briefing Content */}
                <fieldset className="mb-8">
                    <legend className="text-lg font-semibold border-b pb-2 mb-4 w-full">Konten Briefing</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Goals</label>
                            <input type="text" name="goals" value={formData.goals} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">KPI</label>
                            <input type="text" name="kpi" value={formData.kpi} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                            <input type="text" name="target_audience" value={formData.target_audience} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Content Type (pisahkan dengan koma)</label>
                            <input type="text" name="content_type" value={formData.content_type} onChange={handleChange} placeholder="Reels, Feed Post, Story" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hashtags (pisahkan dengan koma)</label>
                            <input type="text" name="hashtags" value={formData.hashtags} onChange={handleChange} placeholder="#campaign, #brand" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mentions (pisahkan dengan koma)</label>
                            <input type="text" name="mentions" value={formData.mentions} onChange={handleChange} placeholder="@brand, @product" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                    </div>
                </fieldset>

                {/* Bagian Aturan Skor */}
                <fieldset className="mb-8">
                    <legend className="text-lg font-semibold border-b pb-2 mb-4 w-full">Aturan Skor</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-md font-semibold mb-2">Instagram</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700">Poin Likes</label><input type="number" step="0.01" name="instagram_likes_point" value={formData.instagram_likes_point} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Poin Comments</label><input type="number" step="0.01" name="instagram_comments_point" value={formData.instagram_comments_point} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Poin Shares</label><input type="number" step="0.01" name="instagram_shares_point" value={formData.instagram_shares_point} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-md font-semibold mb-2">TikTok</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700">Poin Likes</label><input type="number" step="0.01" name="tiktok_likes_point" value={formData.tiktok_likes_point} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Poin Comments</label><input type="number" step="0.01" name="tiktok_comments_point" value={formData.tiktok_comments_point} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Poin Shares</label><input type="number" step="0.01" name="tiktok_shares_point" value={formData.tiktok_shares_point} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                        <div><label className="block text-sm font-medium text-gray-700">Bonus Hashtag</label><input type="number" name="hashtag_bonus" value={formData.hashtag_bonus} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Bonus Mention</label><input type="number" name="mention_bonus" value={formData.mention_bonus} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                    </div>
                </fieldset>

                <div className="flex justify-end">
                    <button type="submit" disabled={loading} className="bg-pink-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-pink-700 transition-colors disabled:bg-pink-300">
                        {loading ? 'Menyimpan...' : 'Simpan Kampanye'}
                    </button>
                </div>
            </form>
        </div>
    );
}