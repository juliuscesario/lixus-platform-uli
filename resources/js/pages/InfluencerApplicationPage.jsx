import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/apiService';

const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

export default function InfluencerApplicationPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        gender: '',
        date_of_birth: '',
        city: '',
        bio: '',
        social_media_profiles: [
            { platform: 'instagram', username: '', followers: '', account_created_date: '', total_posts: '', total_following: '' }
        ]
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileChange = (index, e) => {
        const { name, value } = e.target;
        const profiles = [...formData.social_media_profiles];
        profiles[index][name] = value;
        setFormData(prev => ({ ...prev, social_media_profiles: profiles }));
    };

    const addProfile = () => {
        setFormData(prev => ({
            ...prev,
            social_media_profiles: [
                ...prev.social_media_profiles,
                { platform: 'tiktok', username: '', followers: '', account_created_date: '', total_posts: '', total_following: '' }
            ]
        }));
    };

    const removeProfile = (index) => {
        const profiles = formData.social_media_profiles.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, social_media_profiles: profiles }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const response = await apiService.applyAsInfluencer(formData);
            setSuccess(response.message || 'Aplikasi Anda telah berhasil dikirim! Tim kami akan segera meninjaunya.');
            // Optionally clear the form
            setFormData({
                name: '', email: '', gender: '', date_of_birth: '', city: '', bio: '',
                social_media_profiles: [{ platform: 'instagram', username: '', followers: '', account_created_date: '', total_posts: '', total_following: '' }]
            });
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan. Mohon periksa kembali data Anda dan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center text-center px-4">
                <div className="bg-white p-10 rounded-lg shadow-xl max-w-lg">
                    <h2 className="text-2xl font-bold text-green-600 mb-4">Terima Kasih!</h2>
                    <p className="text-gray-700 mb-6">{success}</p>
                    <Link
                        to="/"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                        Kembali ke Halaman Utama
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Jadilah Bagian dari Lixus</h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Isi form di bawah ini untuk bergabung dengan komunitas influencer kami.
                    </p>
                </div>

                <div className="mt-12 bg-white shadow-xl rounded-lg">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">{error}</div>}

                        {/* Personal Information */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">Informasi Personal</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                                    <input type="text" name="name" id="name" required value={formData.name} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"/>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Alamat Email</label>
                                    <input type="email" name="email" id="email" required value={formData.email} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"/>
                                </div>
                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                                    <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
                                        <option value="">Pilih Gender</option>
                                        <option value="Male">Laki-laki</option>
                                        <option value="Female">Perempuan</option>
                                        <option value="Other">Lainnya</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                                    <input type="date" name="date_of_birth" id="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"/>
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">Kota Domisili</label>
                                    <input type="text" name="city" id="city" value={formData.city} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"/>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio Singkat</label>
                                    <textarea id="bio" name="bio" rows="3" value={formData.bio} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500" placeholder="Ceritakan tentang diri Anda dan konten yang Anda buat..."></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Social Media Profiles */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">Akun Media Sosial</h3>
                            {formData.social_media_profiles.map((profile, index) => (
                                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4 relative">
                                    {formData.social_media_profiles.length > 1 && (
                                        <button type="button" onClick={() => removeProfile(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                                            <IconTrash />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Platform</label>
                                            <select name="platform" value={profile.platform} onChange={(e) => handleProfileChange(index, e)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                                <option value="instagram">Instagram</option>
                                                <option value="tiktok">TikTok</option>
                                                <option value="youtube">YouTube</option>
                                                <option value="facebook">Facebook</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Username</label>
                                            <input type="text" name="username" required value={profile.username} onChange={(e) => handleProfileChange(index, e)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Jumlah Followers</label>
                                            <input type="number" name="followers" required value={profile.followers} onChange={(e) => handleProfileChange(index, e)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tgl. Akun Dibuat</label>
                                            <input type="date" name="account_created_date" value={profile.account_created_date} onChange={(e) => handleProfileChange(index, e)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Total Posts</label>
                                            <input type="number" name="total_posts" value={profile.total_posts} onChange={(e) => handleProfileChange(index, e)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Total Following</label>
                                            <input type="number" name="total_following" value={profile.total_following} onChange={(e) => handleProfileChange(index, e)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addProfile} className="flex items-center space-x-2 text-sm font-medium text-pink-600 hover:text-pink-800">
                                <IconPlus />
                                <span>Tambah Akun Media Sosial Lain</span>
                            </button>
                        </div>
                        
                        <div className="pt-5">
                            <div className="flex justify-end">
                                <button type="submit" disabled={loading} className="w-full md:w-auto flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:bg-pink-300">
                                    {loading ? 'Mengirim...' : 'Kirim Aplikasi'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
