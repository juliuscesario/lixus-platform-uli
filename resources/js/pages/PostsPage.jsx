// ========================================
// STEP 4: Migrate PostsPage.jsx
// ========================================

// FILE: resources/js/pages/PostsPage.jsx (MIGRATED)
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import useApi from '../hooks/useApi';
import PostCard from '../components/PostCard';
import PaginationComponent from '../components/Pagination';

export default function PostsPage() {
    const { api } = useApi();
    const { campaignId } = useParams();
    const [searchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPosts = async (url = null) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api('getPublicPosts', url);
            setPosts(response.data || []);
            setPagination({ 
                links: response.links || [], 
                meta: response.meta || {} 
            });
        } catch (err) {
            if (err.message.includes('401') || err.message.includes('Session expired')) {
                // Session expired - handled by AuthContext automatically
            } else if (err.message.includes('403')) {
                setError("You don't have permission to view posts.");
            } else {
                setError("Failed to load posts.");
            }
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [api, campaignId, searchParams]);

    const handlePageChange = (url) => {
        fetchPosts(url);
        window.scrollTo(0, 0);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                    <p className="ml-4 text-gray-700">Loading posts...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Posts</h1>
            
            {posts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">No posts found.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                    
                    <PaginationComponent 
                        links={pagination.links}
                        meta={pagination.meta}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
}