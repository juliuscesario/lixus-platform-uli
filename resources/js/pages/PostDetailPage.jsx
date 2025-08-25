// ========================================
// STEP 5: Migrate PostDetailPage.jsx
// ========================================

// FILE: resources/js/pages/PostDetailPage.jsx (MIGRATED)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { formatDate } from '../services/apiService';

export default function PostDetailPage() {
    const { api } = useApi();
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPostDetail = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await api('getPostDetail', id);
                setPost(response.data || response);
            } catch (err) {
                if (err.message.includes('401') || err.message.includes('Session expired')) {
                    // Session expired - handled by AuthContext automatically
                } else if (err.message.includes('403')) {
                    setError("You don't have permission to view this post.");
                } else if (err.message.includes('404')) {
                    setError("Post not found.");
                } else {
                    setError("Failed to load post details.");
                }
                console.error('Error fetching post detail:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPostDetail();
        }
    }, [id, api]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                    <p className="ml-4 text-gray-700">Loading post details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">Post not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {post.image_url && (
                    <div className="aspect-w-16 aspect-h-9">
                        <img 
                            src={post.image_url} 
                            alt={post.caption || "Post image"}
                            className="w-full h-96 object-cover"
                        />
                    </div>
                )}
                
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        {post.user?.profile_image && (
                            <img 
                                src={post.user.profile_image} 
                                alt={post.user.name}
                                className="w-12 h-12 rounded-full mr-4"
                            />
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {post.user?.name || 'Unknown User'}
                            </h2>
                            <p className="text-gray-600 text-sm">
                                {formatDate(post.created_at)}
                            </p>
                        </div>
                    </div>

                    {post.caption && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Caption</h3>
                            <p className="text-gray-800 whitespace-pre-wrap">{post.caption}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Platform</p>
                            <p className="text-lg font-bold capitalize">{post.platform}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Likes</p>
                            <p className="text-lg font-bold">{post.likes || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Comments</p>
                            <p className="text-lg font-bold">{post.comments || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Shares</p>
                            <p className="text-lg font-bold">{post.shares || 0}</p>
                        </div>
                    </div>

                    {post.external_url && (
                        <div className="border-t pt-4">
                            <a 
                                href={post.external_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-pink-500 hover:text-pink-600 font-medium"
                            >
                                View Original Post →
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}