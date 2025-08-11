import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination'; // Import komponen baru

export default function PostsPage() {
    const { user, auth } = useAuth();
    const [posts, setPosts] = useState([]);
    const [pagination, setPagination] = useState(null); // State untuk data paginasi
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fungsi untuk mengambil data, bisa dipanggil ulang untuk halaman berbeda
    const fetchPosts = async (url = null) => {
        setLoading(true);
        setError(null);
        window.scrollTo(0, 0); // Scroll ke atas setiap ganti halaman
        const response = await apiService(auth).getPublicPosts(url);
        if (response && response.data) {
            setPosts(response.data);
            setPagination({ links: response.links, meta: response.meta });
        } else {
            setError("Tidak dapat memuat data postingan. Silakan coba lagi nanti.");
        }
        setLoading(false);
    };

    // Panggil fetchPosts saat komponen pertama kali dimuat
    useEffect(() => {
        fetchPosts();
    }, []);

    // Handler untuk saat tombol paginasi diklik
    const handlePageChange = (url) => {
        if (url) {
            fetchPosts(url);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Galeri Postingan Kampanye</h1>
            {loading && <div className="text-center text-gray-500">Memuat postingan...</div>}
            {error && <div className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</div>}
            {!loading && !error && (
                <>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <p className="col-span-full text-center text-gray-500">Saat ini belum ada postingan yang tersedia.</p>
                        )}
                    </div>
                    {/* Render komponen paginasi di bawah grid */}
                    {pagination && (
                        <Pagination 
                            meta={pagination.meta} 
                            links={pagination.links} 
                            onPageChange={handlePageChange} 
                        />
                    )}
                </>
            )}
        </div>
    );
}
