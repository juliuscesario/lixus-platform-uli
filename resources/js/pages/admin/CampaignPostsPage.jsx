import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiService, formatDate, formatCompactNumber } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import AdminPostCard from '../../components/AdminPostCard';
import Pagination from '../../components/Pagination';
import { Link, useNavigate, useParams } from 'react-router-dom';

// --- Icons ---
const IconArrowLeft = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> );
const IconSearch = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> );
const IconGrid = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg> );
const IconList = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"></line><line x1="8" x2="21" y1="12" y2="12"></line><line x1="8" x2="21" y1="18" y2="18"></line><line x1="3" x2="3.01" y1="6" y2="6"></line><line x1="3" x2="3.01" y1="12" y2="12"></line><line x1="3" x2="3.01" y1="18" y2="18"></line></svg> );
const SocialIcon = ({ platform, className }) => {
    if (platform === 'instagram') {
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>;
    }
    if (platform === 'tiktok') {
        return <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/></svg>;
    }
    return null;
};


export default function CampaignPostsPage() {
    const { auth } = useAuth();
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
    const [isRecalculating, setIsRecalculating] = useState(false);

    const fetchPosts = useCallback(async (pageUrl = null) => {
        setLoading(true);
        setError(null);
        
        let queryParams = new URLSearchParams();
        if (platformFilter !== 'all') queryParams.append('platform', platformFilter);
        if (dateRange.from) queryParams.append('start_date', dateRange.from);
        if (dateRange.to) queryParams.append('end_date', dateRange.to);
        if (searchQuery) queryParams.append('search', searchQuery);

        if (pageUrl) {
            const urlObj = new URL(pageUrl);
            const page = urlObj.searchParams.get('page');
            if (page) queryParams.set('page', page);
        }
        
        try {
            const [campaignRes, postsRes] = await Promise.all([
                campaign ? Promise.resolve({data: campaign}) : apiService(auth).getAdminCampaignDetail(campaignId),
                apiService(auth).getAdminCampaignPosts(campaignId, queryParams.toString())
            ]);

            setCampaign(campaignRes.data);
            setPosts(postsRes.data || []);
            setPagination({ links: postsRes.links, meta: postsRes.meta });
        } catch (err) {
            setError('Gagal memuat data postingan.');
        } finally {
            setLoading(false);
        }
    }, [campaignId, auth, platformFilter, dateRange, searchQuery, campaign]);

    useEffect(() => {
        fetchPosts();
    }, [platformFilter, dateRange, searchQuery]);

    const handleValidate = async (postId, isValid, notes) => {
        try {
            await apiService(auth).validatePost(postId, isValid, notes);
            fetchPosts();
        } catch (err) {
            alert(err.message || 'Gagal memvalidasi postingan.');
        }
    };
    
    const handleRecalculateScores = async () => {
        if (!window.confirm('Are you sure you want to recalculate scores for all posts in this campaign?')) {
            return;
        }
        setIsRecalculating(true);
        try {
            const response = await apiService(auth).recalculateCampaignScores(campaignId);
            alert(response.message);
            fetchPosts();
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsRecalculating(false);
        }
    };

    const handlePageChange = (url) => {
        if (url) {
            fetchPosts(url);
        }
    };
    
    const summaryStats = useMemo(() => {
        const safeParseMetrics = (post) => (post.metrics || {});
        const totalLikes = posts.reduce((sum, post) => sum + (safeParseMetrics(post).likes_count || 0), 0);
        const totalComments = posts.reduce((sum, post) => sum + (safeParseMetrics(post).comments_count || 0), 0);
        const totalShares = posts.reduce((sum, post) => sum + (safeParseMetrics(post).shares_count || 0), 0);
        const uniqueInfluencers = new Set(posts.map(post => post.user_id)).size;
        return { totalLikes, totalComments, totalShares, uniqueInfluencers, totalPosts: pagination?.meta?.total || 0 };
    }, [posts, pagination]);

    const sortedPosts = useMemo(() => {
        let sortableItems = [...posts];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue, bValue;
                const safeParseMetrics = (post) => (post.metrics || {});

                switch (sortConfig.key) {
                    case 'influencer':
                        // ✅ FIX: Use optional chaining here
                        aValue = a.user?.name || '';
                        bValue = b.user?.name || '';
                        break;
                    case 'metrics':
                        aValue = safeParseMetrics(a).likes_count || 0;
                        bValue = safeParseMetrics(b).likes_count || 0;
                        break;
                    case 'status':
                        aValue = a.is_valid_for_campaign;
                        bValue = b.is_valid_for_campaign;
                        break;
                    case 'created_at':
                        aValue = new Date(a.posted_at);
                        bValue = new Date(b.posted_at);
                        break;
                    default: return 0;
                }

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [posts, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const getSortIndicator = (key) => {
        if (sortConfig.key === key) return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
        return '';
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelected(sortedPosts.map(p => p.id));
        else setSelected([]);
    };
    
    const handleSelectOne = (postId) => {
        if (selected.includes(postId)) setSelected(selected.filter(id => id !== postId));
        else setSelected([...selected, postId]);
    };

    const handleBulkValidate = async () => {
        if (!window.confirm(`Anda akan memvalidasi ${selected.length} postingan terpilih. Lanjutkan?`)) return;
        for (const postId of selected) {
            try {
                await apiService(auth).validatePost(postId, true, 'Disetujui secara massal');
            } catch (err) {
                alert(`Gagal memvalidasi post ID ${postId}: ${err.message}`);
                break;
            }
        }
        setSelected([]);
        fetchPosts();
    };

    if (loading && !campaign) return <div>Memuat postingan...</div>;
    if (error) return <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;

    return (
        <div>
            <div className="mb-6">
                <Link to="/admin/campaigns" className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"><IconArrowLeft /> Kembali ke Manajemen Kampanye</Link>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Postingan Kampanye</h1>
                        <p className="text-lg text-gray-600">{campaign?.name || 'Loading...'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRecalculateScores}
                            disabled={isRecalculating}
                            className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 disabled:bg-purple-300 disabled:cursor-not-allowed"
                        >
                            {isRecalculating ? 'Calculating...' : 'Recalculate Scores'}
                        </button>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IconSearch /></div>
                            <input type="text" placeholder="Cari postingan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full md:w-64 rounded-md border-gray-300 shadow-sm pl-10 py-2"/>
                        </div>
                        <div className="flex items-center rounded-md shadow-sm bg-white border border-gray-300">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-l-md ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}><IconGrid /></button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-r-md ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}><IconList /></button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm text-center"><p className="text-2xl font-bold">{formatCompactNumber(summaryStats.totalPosts)}</p><p className="text-sm text-gray-500">Total Posts</p></div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center"><p className="text-2xl font-bold">{formatCompactNumber(summaryStats.uniqueInfluencers)}</p><p className="text-sm text-gray-500">Influencers</p></div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center"><p className="text-2xl font-bold">{formatCompactNumber(summaryStats.totalLikes)}</p><p className="text-sm text-gray-500">Likes</p></div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center"><p className="text-2xl font-bold">{formatCompactNumber(summaryStats.totalComments)}</p><p className="text-sm text-gray-500">Comments</p></div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center"><p className="text-2xl font-bold">{formatCompactNumber(summaryStats.totalShares)}</p><p className="text-sm text-gray-500">Shares</p></div>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => setPlatformFilter('all')} className={`px-3 py-1 rounded-md text-sm font-medium ${platformFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Semua</button>
                    <button onClick={() => setPlatformFilter('instagram')} className={`px-3 py-1 rounded-md text-sm font-medium ${platformFilter === 'instagram' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Instagram</button>
                    <button onClick={() => setPlatformFilter('tiktok')} className={`px-3 py-1 rounded-md text-sm font-medium ${platformFilter === 'tiktok' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>TikTok</button>
                </div>
                <div className="flex items-center gap-2">
                    <input type="date" value={dateRange.from} onChange={e => setDateRange(p => ({...p, from: e.target.value}))} className="rounded-md border-gray-300 shadow-sm text-sm" />
                    <span>-</span>
                    <input type="date" value={dateRange.to} onChange={e => setDateRange(p => ({...p, to: e.target.value}))} className="rounded-md border-gray-300 shadow-sm text-sm" />
                </div>
            </div>
            {selected.length > 0 && (
                <div className="bg-white shadow-md rounded-lg p-4 mb-6 flex justify-between items-center">
                    <div className="flex items-center">
                        <input id="select-all" type="checkbox" onChange={handleSelectAll} checked={selected.length === sortedPosts.length && sortedPosts.length > 0} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <label htmlFor="select-all" className="ml-3 text-sm font-medium text-gray-700">{selected.length} Postingan Dipilih</label>
                    </div>
                    <button onClick={handleBulkValidate} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 text-sm">Validasi Terpilih</button>
                </div>
            )}

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {sortedPosts.map(post => <AdminPostCard key={post.id} post={post} onValidate={handleValidate} onSelect={handleSelectOne} isSelected={selected.includes(post.id)} />)}
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={selected.length === sortedPosts.length && sortedPosts.length > 0} /></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Post</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"><button onClick={() => requestSort('influencer')} className="flex items-center">Influencer {getSortIndicator('influencer')}</button></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"><button onClick={() => requestSort('created_at')} className="flex items-center">Tanggal Post {getSortIndicator('created_at')}</button></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"><button onClick={() => requestSort('metrics')} className="flex items-center">Likes {getSortIndicator('metrics')}</button></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"><button onClick={() => requestSort('status')} className="flex items-center">Status {getSortIndicator('status')}</button></th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedPosts.map(post => {
                                const metrics = post.metrics || {};
                                return (
                                    <tr key={post.id} className={selected.includes(post.id) ? 'bg-gray-100' : ''}>
                                        <td className="p-4"><input type="checkbox" checked={selected.includes(post.id)} onChange={() => handleSelectOne(post.id)} /></td>
                                        <td className="px-6 py-4"><a href={post.post_url} target="_blank" rel="noopener noreferrer"><img className="h-10 w-10 rounded-md object-cover" src={post.media_url || 'https://placehold.co/100x100'} alt="Post media" /></a></td>
                                        {/* ✅ FIX: Use optional chaining on all nested properties */}
                                        <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900">{post.user?.name || 'N/A'}</div><div className="text-sm text-gray-500">@{post.social_media_account?.username || 'N/A'}</div></td>
                                        <td className="px-6 py-4"><SocialIcon platform={post.social_media_account?.platform} className="w-6 h-6 text-gray-500" /></td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(post.posted_at)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatCompactNumber(metrics.likes_count)}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-800">{formatCompactNumber(post.score)}</td>
                                        <td className="px-6 py-4 text-sm">{post.is_valid_for_campaign ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Disetujui</span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Belum Divalidasi</span>}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">{!post.is_valid_for_campaign && (<button onClick={() => handleValidate(post.id, true, 'Disetujui oleh Admin')} className="text-green-600 hover:text-green-900">Setujui</button>)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            {(sortedPosts.length === 0) && <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-md"><p>Tidak ada postingan yang cocok dengan filter Anda.</p></div>}
            
            <div className="mt-6">
                {pagination && <Pagination meta={pagination.meta} links={pagination.links} onPageChange={handlePageChange} />}
            </div>
        </div>
    );
}