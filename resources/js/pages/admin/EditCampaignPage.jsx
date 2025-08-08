import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

const IconArrowLeft = () => ( <svg xmlns="http://www.w.3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> );

export default function EditCampaignPage({ pageProps, setPage }) {
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        const fetchCampaign = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiService.getAdminCampaignDetail(pageProps.id);
                const campaign = response.data;
                setFormData({
                    ...campaign,
                    start_date: campaign.start_date.split('T')[0],
                    end_date: campaign.end_date.split('T')[0],
                    ...campaign.briefing_content,
                    ...campaign.scoring_rules,
                    hashtags: (campaign.briefing_content.hashtags || []).join(', '),
                    mentions: (campaign.briefing_content.mentions || []).join(', '),
                    content_type: (campaign.briefing_content.content_type || []).join(', '),
                });
            } catch (err) {
                setError('Gagal memuat data kampanye.');
            } finally {
                setLoading(false);
            }
        };
        fetchCampaign();
    }, [pageProps.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!confirm(`Apakah Anda yakin ingin mengubah status menjadi "${newStatus}"?`)) return;
        
        setIsSaving(true);
        setError(null);
        try {
            await apiService.updateCampaignStatus(pageProps.id, newStatus);
            setFormData(prev => ({ ...prev, status: newStatus }));
            alert('Status berhasil diperbarui!');
        } catch (err) {
            setError(err.message || 'Gagal memperbarui status.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
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
                likes_point: parseFloat(formData.likes_point),
                comments_point: parseFloat(formData.comments_point),
                shares_point: parseFloat(formData.shares_point),
                hashtag_bonus: parseInt(formData.hashtag_bonus, 10),
                mention_bonus: parseInt(formData.mention_bonus, 10),
            },
            status: formData.status,
        };

        try {
            await apiService.updateCampaign(pageProps.id, payload);
            alert('Kampanye berhasil diperbarui!');
            setPage('admin-campaigns');
        } catch (err) {
            setError(err.message || 'Gagal memperbarui kampanye.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div>Memuat data...</div>;
    if (error && !formData) return <div className="text-red-500">{error}</div>;
    if (!formData) return <div>Data kampanye tidak ditemukan.</div>;

    return (
        <div>
            <button onClick={() => setPage('admin-campaigns')} className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <IconArrowLeft />
                Kembali ke Manajemen Kampanye
            </button>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Edit Kampanye: {formData.name}</h1>
            
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold mb-3">Manajemen Status</h2>
                <div className="flex items-center gap-4 flex-wrap">
                    <p>Status Saat Ini: <span className="font-bold text-lg capitalize px-3 py-1 bg-blue-100 text-blue-800 rounded-full">{formData.status}</span></p>
                    {formData.status === 'draft' && (
                        <button onClick={() => handleStatusUpdate('active')} disabled={isSaving} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400">Aktifkan Kampanye</button>
                    )}
                    {formData.status === 'active' && (
                        <button onClick={() => handleStatusUpdate('completed')} disabled={isSaving} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400">Selesaikan Kampanye</button>
                    )}
                    {(formData.status === 'draft' || formData.status === 'active') && (
                         <button onClick={() => handleStatusUpdate('cancelled')} disabled={isSaving} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 disabled:bg-gray-400">Batalkan Kampanye</button>
                    )}
                </div>
            </div>

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
                            <label className="block text-sm font-medium text-gray-700">Tipe Konten (pisahkan dengan koma)</label>
                            <input type="text" name="content_type" value={formData.content_type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="foto, video singkat" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hashtags (pisahkan dengan koma)</label>
                            <input type="text" name="hashtags" value={formData.hashtags} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="#SunsilkID, #Lixus" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mentions (pisahkan dengan koma)</label>
                            <input type="text" name="mentions" value={formData.mentions} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="@sunsilkID, @lixus_id" />
                        </div>
                    </div>
                </fieldset>
                
                {/* Bagian Aturan Skor */}
                <fieldset className="mb-8">
                    <legend className="text-lg font-semibold border-b pb-2 mb-4 w-full">Aturan Skor</legend>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        <div><label className="block text-sm font-medium text-gray-700">Poin Likes</label><input type="number" step="0.01" name="likes_point" value={formData.likes_point} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Poin Comments</label><input type="number" step="0.01" name="comments_point" value={formData.comments_point} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Poin Shares</label><input type="number" step="0.01" name="shares_point" value={formData.shares_point} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Bonus Hashtag</label><input type="number" name="hashtag_bonus" value={formData.hashtag_bonus} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Bonus Mention</label><input type="number" name="mention_bonus" value={formData.mention_bonus} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                    </div>
                </fieldset>

                <div className="flex justify-end">
                    <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300">
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </div>
    );
}
