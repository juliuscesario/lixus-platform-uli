import React, { useState, useEffect, useMemo } from 'react';
import useApi from '../../hooks/useApi';
import { Link, useNavigate, useParams } from 'react-router-dom';

const IconArrowLeft = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> );
const IconTrophy = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M14 9h1.5a2.5 2.5 0 0 1 0 5H14"/><path d="M4 16v-6a6 6 0 0 1 12 0v6"/><path d="M8 20h8"/><path d="M12 18v2"/></svg> );
const IconMedal = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M12 14v8l-3-3 3-3 3 3z"/></svg> );
const IconRefresh = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg> );

const RankBadge = ({ rank }) => {
    if (rank === 1) {
        return <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">🥇</div>;
    } else if (rank === 2) {
        return <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold">🥈</div>;
    } else if (rank === 3) {
        return <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">🥉</div>;
    } else {
        return <div className="w-8 h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-bold">{rank}</div>;
    }
};

const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
};

export default function CampaignLeaderboardPage() {
    const { api } = useApi();
    const navigate = useNavigate();
    const { id: campaignId } = useParams();
    const [leaderboard, setLeaderboard] = useState([]);
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [timeRange, setTimeRange] = useState('all'); // 'all', 'week', 'month'

    const fetchLeaderboardData = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        setError(null);
        
        try {
            // Fetch campaign details
            const campaignResponse = await api('getAdminCampaignDetail', campaignId);
            setCampaign(campaignResponse.data);
            
            // Fetch leaderboard data
            const leaderboardResponse = await api('getCampaignLeaderboard', campaignId);
            setLeaderboard(leaderboardResponse.data || []);
        } catch (err) {
            if (err.message.includes('401') || err.message.includes('Session expired')) {
                // Session expired - handled by AuthContext automatically
            } else if (err.message.includes('403')) {
                setError("You don't have permission to view this campaign's leaderboard.");
            } else {
                setError('Failed to load leaderboard data.');
            }
        } finally {
            setLoading(false);
            if (showRefresh) setRefreshing(false);
        }
    };

    useEffect(() => {
        if (campaignId) {
            fetchLeaderboardData();
        }
    }, [campaignId]);

    const handleRefresh = () => {
        fetchLeaderboardData(true);
    };

    // Filter leaderboard based on time range
    const filteredLeaderboard = useMemo(() => {
        if (timeRange === 'all') return leaderboard;
        
        const now = new Date();
        const cutoffDate = new Date();
        
        if (timeRange === 'week') {
            cutoffDate.setDate(now.getDate() - 7);
        } else if (timeRange === 'month') {
            cutoffDate.setMonth(now.getMonth() - 1);
        }
        
        return leaderboard.filter(entry => {
            const entryDate = new Date(entry.last_activity || entry.created_at);
            return entryDate >= cutoffDate;
        });
    }, [leaderboard, timeRange]);

    if (loading) return <div className="flex justify-center items-center h-64"><div>Loading leaderboard...</div></div>;
    if (error) return <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <Link to="/admin/campaigns" className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
                    <IconArrowLeft /> Back to Campaign Management
                </Link>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <IconTrophy />
                            Campaign Leaderboard
                        </h1>
                        <p className="text-lg text-gray-600">{campaign?.name || 'Loading...'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Time Range Filter */}
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm text-sm"
                        >
                            <option value="all">All Time</option>
                            <option value="month">Last Month</option>
                            <option value="week">Last Week</option>
                        </select>
                        
                        {/* Refresh Button */}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                        >
                            <IconRefresh className={refreshing ? 'animate-spin' : ''} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Campaign Summary */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-blue-600">{filteredLeaderboard.length}</p>
                        <p className="text-sm text-gray-600">Total Participants</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-green-600">
                            {formatNumber(filteredLeaderboard.reduce((sum, entry) => sum + (entry.total_score || 0), 0))}
                        </p>
                        <p className="text-sm text-gray-600">Total Points</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-purple-600">
                            {formatNumber(filteredLeaderboard.reduce((sum, entry) => sum + (entry.total_posts || 0), 0))}
                        </p>
                        <p className="text-sm text-gray-600">Total Posts</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-orange-600">
                            {formatNumber(filteredLeaderboard.reduce((sum, entry) => sum + (entry.total_engagement || 0), 0))}
                        </p>
                        <p className="text-sm text-gray-600">Total Engagement</p>
                    </div>
                </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {filteredLeaderboard.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <IconTrophy className="mx-auto mb-4 text-gray-300" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Leaderboard Data</h3>
                        <p>No participants have scored points yet for this time period.</p>
                    </div>
                ) : (
                    <>
                        {/* Top 3 Podium */}
                        {filteredLeaderboard.slice(0, 3).length > 0 && (
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 border-b">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">🏆 Top Performers</h3>
                                <div className="flex justify-center items-end gap-4">
                                    {/* 2nd Place */}
                                    {filteredLeaderboard[1] && (
                                        <div className="text-center">
                                            <div className="bg-gray-200 rounded-lg p-4 h-20 flex items-end justify-center">
                                                <div className="text-center">
                                                    <div className="w-12 h-12 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">2</div>
                                                    <p className="text-xs font-medium text-gray-700">{filteredLeaderboard[1].user?.name}</p>
                                                    <p className="text-xs text-gray-600">{formatNumber(filteredLeaderboard[1].total_score)} pts</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* 1st Place */}
                                    {filteredLeaderboard[0] && (
                                        <div className="text-center">
                                            <div className="bg-yellow-200 rounded-lg p-4 h-28 flex items-end justify-center">
                                                <div className="text-center">
                                                    <div className="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">1</div>
                                                    <p className="text-sm font-bold text-gray-800">{filteredLeaderboard[0].user?.name}</p>
                                                    <p className="text-sm text-gray-700">{formatNumber(filteredLeaderboard[0].total_score)} pts</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* 3rd Place */}
                                    {filteredLeaderboard[2] && (
                                        <div className="text-center">
                                            <div className="bg-orange-200 rounded-lg p-4 h-16 flex items-end justify-center">
                                                <div className="text-center">
                                                    <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">3</div>
                                                    <p className="text-xs font-medium text-gray-700">{filteredLeaderboard[2].user?.name}</p>
                                                    <p className="text-xs text-gray-600">{formatNumber(filteredLeaderboard[2].total_score)} pts</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Full Leaderboard Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posts</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredLeaderboard.map((entry, index) => (
                                        <tr key={entry.user_id} className={`hover:bg-gray-50 ${index < 3 ? 'bg-yellow-50' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <RankBadge rank={index + 1} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {entry.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {entry.user?.name || 'Unknown'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {entry.user?.email || 'No email'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-lg font-bold text-blue-600">
                                                    {formatNumber(entry.total_score || 0)}
                                                </div>
                                                <div className="text-xs text-gray-500">points</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {entry.total_posts || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">posts</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatNumber(entry.total_engagement || 0)}
                                                </div>
                                                <div className="text-xs text-gray-500">interactions</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {entry.last_activity ? new Date(entry.last_activity).toLocaleDateString() : 'Never'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* Export/Actions */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={() => {
                        // Export functionality can be added here
                        alert('Export functionality would be implemented here');
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                >
                    Export Leaderboard
                </button>
            </div>
        </div>
    );
}