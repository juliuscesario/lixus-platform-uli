import React, { useState, useEffect, useMemo } from 'react';
import { formatDate, formatCompactNumber } from '../../services/apiService';
import useApi from '../../hooks/useApi';
import AdminPostCard from '../../components/AdminPostCard';
import Pagination from '../../components/Pagination';
import { Link, useNavigate, useParams } from 'react-router-dom';

// --- Icons ---
const IconArrowLeft = () => ( 
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19-7-7 7-7"/>
        <path d="M19 12H5"/>
    </svg> 
);

const IconSearch = () => ( 
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg> 
);

const IconGrid = () => ( 
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="7" x="3" y="3" rx="1"></rect>
        <rect width="7" height="7" x="14" y="3" rx="1"></rect>
        <rect width="7" height="7" x="14" y="14" rx="1"></rect>
        <rect width="7" height="7" x="3" y="14" rx="1"></rect>
    </svg> 
);

const IconList = () => ( 
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" x2="21" y1="6" y2="6"></line>
        <line x1="8" x2="21" y1="12" y2="12"></line>
        <line x1="8" x2="21" y1="18" y2="18"></line>
        <line x1="3" x2="3.01" y1="6" y2="6"></line>
        <line x1="3" x2="3.01" y1="12" y2="12"></line>
        <line x1="3" x2="3.01" y1="18" y2="18"></line>
    </svg> 
);

const SocialIcon = ({ platform, className }) => {
    if (platform === 'instagram') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
            </svg>
        );
    }
    if (platform === 'tiktok') {
        return (
            <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
                <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
            </svg>
        );
    }
    return null;
};

export default function CampaignPostsPage() {
    const { api, auth } = useApi();
    const { user } = auth;
    const navigate = useNavigate();
    const { id: campaignId } = useParams();
    
    const [campaign, setCampaign] = useState(null);
    const [posts, setPosts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState([]);
    const [viewMode, setViewMode] = useState('list');
    const [platformFilter, setPlatformFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
    const [searchQuery, setSearchQuery] = useState('');

    // Filter posts based on current filters
    const filteredPosts = useMemo(() => {
        return posts
            .filter(post => platformFilter === 'all' || post.social_media_account?.platform === platformFilter)
            .filter(post => {
                if (!dateRange.from && !dateRange.to) return true;
                const postDate = new Date(post.posted_at);
                postDate.setHours(0, 0, 0, 0);
                const fromDate = dateRange.from ? new Date(dateRange.from) : null;
                const toDate = dateRange.to ? new Date(dateRange.to) : null;
                if (fromDate) fromDate.setHours(0, 0, 0, 0);
                if (toDate) toDate.setHours(0, 0, 0, 0);
                
                if (fromDate && postDate < fromDate) return false;
                if (toDate && postDate > toDate) return false;
                return true;
            });
    }, [posts, platformFilter, dateRange]);

    // Fetch campaign data
    const fetchCampaignData = async () => {
        try {
            const response = await api('getAdminCampaignDetail', campaignId);
            setCampaign(response.data);
        } catch (err) {
            console.error('Failed to fetch campaign:', err);
        }
    };
    
    // Fetch posts with filtering
    const fetchPosts = async (pageUrl = null) => {
        setLoading(true);
        setError(null);
        window.scrollTo(0, 0);

        let queryParams = {};
        if (platformFilter !== 'all') {
            queryParams.platform = platformFilter;
        }
        if (dateRange.from) {
            queryParams.start_date = dateRange.from;
        }
        if (dateRange.to) {
            queryParams.end_date = dateRange.to;
        }
        if (searchQuery) {
            queryParams.search = searchQuery;
        }

        // Extract page number from pageUrl if provided
        if (pageUrl) {
            const urlObj = new URL(pageUrl);
            const page = urlObj.searchParams.get('page');
            if (page) {
                queryParams.page = page;
            }
        }
        
        try {
            const response = await api('getAdminCampaignPosts', campaignId, queryParams);
            setPosts(response.data || []);
            setPagination({ links: response.links, meta: response.meta });
        } catch (err) {
            setError('Gagal memuat data postingan.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (campaignId) {
            fetchCampaignData();
            fetchPosts();
        }
    }, [campaignId, platformFilter, dateRange, searchQuery, api]);

    // Handle individual post validation
    const handleValidate = async (postId, isValid, notes) => {
        try {
            await api('validatePost', postId, isValid, notes);
            fetchPosts(pagination?.meta?.current_page ? `${pagination.meta.path}?page=${pagination.meta.current_page}` : null);
        } catch (err) {
            alert(err.message || 'Gagal memvalidasi postingan.');
        }
    };

    // Handle selecting posts
    const handleSelectOne = (postId) => {
        if (selected.includes(postId)) {
            setSelected(selected.filter(item => item !== postId));
        } else {
            setSelected([...selected, postId]);
        }
    };

    // Handle page changes
    const handlePageChange = (url) => {
        if (url) {
            fetchPosts(url);
        }
    };

    // Calculate summary stats
    const summaryStats = useMemo(() => {
        const safeParseMetrics = (post) => {
            try {
                return typeof post.metrics === 'string' ? JSON.parse(post.metrics) : (post.metrics || {});
            } catch {
                return {};
            }
        };
        const totalLikes = posts.reduce((sum, post) => sum + (safeParseMetrics(post).likes_count || 0), 0);
        const totalComments = posts.reduce((sum, post) => sum + (safeParseMetrics(post).comments_count || 0), 0);
        const totalShares = posts.reduce((sum, post) => sum + (safeParseMetrics(post).shares_count || 0), 0);
        const uniqueInfluencers = new Set(posts.map(post => post.user_id)).size;
        return { totalLikes, totalComments, totalShares, uniqueInfluencers, totalPosts: posts.length };
    }, [posts]);

    // Sort posts
    const sortedPosts = useMemo(() => {
        let sortableItems = [...filteredPosts];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue, bValue;
                const safeParseMetrics = (post) => {
                    try { 
                        return typeof post.metrics === 'string' ? JSON.parse(post.metrics) : (post.metrics || {}); 
                    } catch { 
                        return {}; 
                    }
                };

                if (sortConfig.key === 'likes') {
                    aValue = safeParseMetrics(a).likes_count || 0;
                    bValue = safeParseMetrics(b).likes_count || 0;
                } else if (sortConfig.key === 'comments') {
                    aValue = safeParseMetrics(a).comments_count || 0;
                    bValue = safeParseMetrics(b).comments_count || 0;
                } else if (sortConfig.key === 'created_at') {
                    aValue = new Date(a.posted_at);
                    bValue = new Date(b.posted_at);
                } else if (sortConfig.key === 'score') {
                    aValue = a.calculated_score || 0;
                    bValue = b.calculated_score || 0;
                } else {
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredPosts, sortConfig]);

    // Handle bulk validation
    const handleBulkValidate = async () => {
        if (!window.confirm(`Validasi ${selected.length} postingan yang dipilih? Lanjutkan?`)) return;
        
        for (const postId of selected) {
            try {
                await api('validatePost', postId, true, 'Disetujui secara massal');
            } catch (err) {
                alert(`Gagal memvalidasi post ID ${postId}: ${err.message}`);
                break;
            }
        }
        setSelected([]);
        fetchPosts(pagination?.meta?.current_page ? `${pagination.meta.path}?page=${pagination.meta.current_page}` : null);
    };

    if (loading) return <div>Memuat postingan...</div>;
    if (error) return <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <Link 
                    to="/admin/campaigns" 
                    className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
                >
                    <IconArrowLeft /> Kembali ke Manajemen Kampanye
                </Link>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Postingan Kampanye</h1>
                        <p className="text-lg text-gray-600">{campaign?.name || 'Loading...'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IconSearch />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Cari postingan..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-64 rounded-md border-gray-300 shadow-sm pl-10 py-2"
                            />
                        </div>
                        <div className="flex items-center rounded-md shadow-sm bg-white border border-gray-300">
                            <button 
                                onClick={() => setViewMode('grid')} 
                                className={`p-2 rounded-l-md ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                <IconGrid />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')} 
                                className={`p-2 rounded-r-md ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                <IconList />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-gray-900">{summaryStats.totalPosts}</div>
                    <div className="text-sm text-gray-500">Total Posts</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-gray-900">{formatCompactNumber(summaryStats.totalLikes)}</div>
                    <div className="text-sm text-gray-500">Total Likes</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-gray-900">{formatCompactNumber(summaryStats.totalComments)}</div>
                    <div className="text-sm text-gray-500">Total Comments</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-gray-900">{formatCompactNumber(summaryStats.totalShares)}</div>
                    <div className="text-sm text-gray-500">Total Shares</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-gray-900">{summaryStats.uniqueInfluencers}</div>
                    <div className="text-sm text-gray-500">Influencers</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Platform</label>
                        <select 
                            value={platformFilter} 
                            onChange={(e) => setPlatformFilter(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        >
                            <option value="all">Semua Platform</option>
                            <option value="instagram">Instagram</option>
                            <option value="tiktok">TikTok</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tanggal Dari</label>
                        <input 
                            type="date" 
                            value={dateRange.from} 
                            onChange={(e) => setDateRange(prev => ({...prev, from: e.target.value}))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tanggal Hingga</label>
                        <input 
                            type="date" 
                            value={dateRange.to} 
                            onChange={(e) => setDateRange(prev => ({...prev, to: e.target.value}))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={() => {
                                setPlatformFilter('all');
                                setDateRange({from: '', to: ''});
                                setSearchQuery('');
                            }}
                            className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                        >
                            Reset Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selected.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-blue-800">
                            {selected.length} postingan dipilih
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleBulkValidate}
                                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                            >
                                Validasi Semua
                            </button>
                            <button 
                                onClick={() => setSelected([])}
                                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                            >
                                Batal Pilih
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Posts Display */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedPosts.map(post => (
                        <AdminPostCard 
                            key={post.id} 
                            post={post} 
                            onValidate={handleValidate}
                            onSelect={handleSelectOne}
                            isSelected={selected.includes(post.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input 
                                        type="checkbox"
                                        checked={selected.length === sortedPosts.length && sortedPosts.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelected(sortedPosts.map(p => p.id));
                                            } else {
                                                setSelected([]);
                                            }
                                        }}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Post
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Platform
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Metrics
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedPosts.map(post => {
                                const metrics = typeof post.metrics === 'string' ? JSON.parse(post.metrics || '{}') : (post.metrics || {});
                                return (
                                    <tr key={post.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input 
                                                type="checkbox"
                                                checked={selected.includes(post.id)}
                                                onChange={() => handleSelectOne(post.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <img 
                                                        className="h-10 w-10 rounded-full object-cover" 
                                                        src={post.image_url || '/default-avatar.png'} 
                                                        alt=""
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {post.user?.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {formatDate(post.posted_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <SocialIcon 
                                                    platform={post.social_media_account?.platform} 
                                                    className="h-5 w-5 mr-2"
                                                />
                                                <span className="capitalize text-sm text-gray-900">
                                                    {post.social_media_account?.platform}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>👍 {formatCompactNumber(metrics.likes_count || 0)}</div>
                                            <div>💬 {formatCompactNumber(metrics.comments_count || 0)}</div>
                                            <div>🔄 {formatCompactNumber(metrics.shares_count || 0)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {post.calculated_score || 0} pts
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                post.is_validated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {post.is_validated ? 'Validated' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {!post.is_validated && (
                                                <button
                                                    onClick={() => handleValidate(post.id, true, 'Approved')}
                                                    className="text-green-600 hover:text-green-900 mr-2"
                                                >
                                                    Validate
                                                </button>
                                            )}
                                            <a 
                                                href={post.post_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                View
                                            </a>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pagination && (
                <div className="mt-6">
                    <Pagination 
                        meta={pagination.meta} 
                        links={pagination.links} 
                        onPageChange={handlePageChange} 
                    />
                </div>
            )}
        </div>
    );
}