import React, { useState, useEffect } from 'react';
import { apiService, formatDate } from '../services/apiService';

const IconArrowLeft = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> );

import { Link } from 'react-router-dom';

export default function PostDetailPage() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPostDetail = async () => {
            if (!id) {
                setError("ID Postingan tidak ditemukan.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const response = await apiService.getPostDetail(id);
                setPost(response.data);
            } catch (err) {
                setError(err.message || 'Gagal memuat detail postingan.');
            } finally {
                setLoading(false);
            }
        };
        fetchPostDetail();
    }, [id]);

    if (loading) { return <div className="max-w-4xl mx-auto py-12 px-4 text-center">Memuat detail postingan...</div>; }
    if (error) { return <div className="max-w-4xl mx-auto py-12 px-4 text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</div>; }
    if (!post) { return <div className="max-w-4xl mx-auto py-12 px-4 text-center">Postingan tidak ditemukan.</div>; }

    const influencer = post.influencer || {};
    const campaign = post.campaign || {};
    
    // PERBAIKAN: Parse metrics jika berupa string, jika tidak, gunakan object kosong
    let metrics = {};
    try {
        metrics = typeof post.metrics === 'string' ? JSON.parse(post.metrics) : (post.metrics || {});
    } catch (e) {
        console.error("Gagal mem-parsing metrics JSON:", e);
    }


    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Link to="/posts" className="mb-8 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <IconArrowLeft />
                Kembali ke Galeri
            </Link>
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <img className="w-full object-cover" src={post.media_url || 'https://placehold.co/800x600/cccccc/ffffff?text=Post'} alt={`Post by ${influencer.name}`} />
                <div className="p-8">
                    <div className="mb-6">
                        <p className="text-gray-600">{post.caption}</p>
                        <a href={post.post_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm mt-2 inline-block">Lihat di {post.platform}</a>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 border-t border-b border-gray-200 py-4 text-center">
                        <div><p className="text-sm text-gray-500">Likes</p><p className="font-bold text-lg">{metrics.likes_count || 0}</p></div>
                        <div><p className="text-sm text-gray-500">Comments</p><p className="font-bold text-lg">{metrics.comments_count || 0}</p></div>
                        <div><p className="text-sm text-gray-500">Shares</p><p className="font-bold text-lg">{metrics.shares_count || 0}</p></div>
                        <div><p className="text-sm text-gray-500">Views</p><p className="font-bold text-lg">{metrics.views_count || 0}</p></div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex"><p className="w-1/3 font-semibold">Influencer:</p><p className="w-2/3">{influencer.name}</p></div>
                        <div className="flex"><p className="w-1/3 font-semibold">Kampanye:</p><p className="w-2/3">{campaign.name}</p></div>
                        {/* PERBAIKAN: Menggunakan created_at dan updated_at */}
                        <div className="flex"><p className="w-1/3 font-semibold">Tanggal Dibuat:</p><p className="w-2/3">{formatDate(post.created_at)}</p></div>
                        <div className="flex"><p className="w-1/3 font-semibold">Terakhir Diperbarui:</p><p className="w-2/3">{formatDate(post.updated_at)}</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
