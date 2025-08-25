import React, { useState, useEffect, useMemo } from 'react';
import useApi from '../../hooks/useApi';
import { Link, useNavigate } from 'react-router-dom';

const IconPlus = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> );
const IconSearch = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg> );
const IconFilter = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/></svg> );
const IconEdit = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> );
const IconEye = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> );
const IconUsers = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> );

const StatusBadge = ({ status }) => {
    const statusStyles = {
        draft: 'bg-gray-100 text-gray-800',
        pending: 'bg-yellow-100 text-yellow-800',
        active: 'bg-green-100 text-green-800',
        completed: 'bg-blue-100 text-blue-800',
        cancelled: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
};

const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export default function BrandCampaignsPage() {
    const { api } = useApi();
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    const fetchCampaigns = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api('getBrandCampaigns');
            setCampaigns(response.data || []);
        } catch (err) {
            if (err.message.includes('401') || err.message.includes('Session expired')) {
                // Session expired - handled by AuthContext automatically
            } else if (err.message.includes('403')) {
                setError("You don't have permission to view brand campaigns.");
            } else {
                setError('Failed to load campaigns.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleStatusChange = async (campaignId, newStatus) => {
        if (!confirm(`Are you sure you want to change the campaign status to "${newStatus}"?`)) return;
        
        try {
            await api('updateCampaignStatus', campaignId, newStatus);
            fetchCampaigns(); // Refresh the list
        } catch (err) {
            if (err.message.includes('403')) {
                alert("You don't have permission to change campaign status.");
            } else {
                alert('Failed to update campaign status: ' + err.message);
            }
        }
    };

    // Filter and sort campaigns
    const filteredAndSortedCampaigns = useMemo(() => {
        let filtered = campaigns;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(campaign =>
                campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(campaign => campaign.status === statusFilter);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            // Handle date sorting
            if (sortBy.includes('date')) {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            // Handle numeric sorting
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
            }

            // Handle string sorting
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === 'desc' 
                    ? bValue.localeCompare(aValue) 
                    : aValue.localeCompare(bValue);
            }

            // Handle date sorting
            if (aValue instanceof Date && bValue instanceof Date) {
                return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
            }

            return 0;
        });

        return filtered;
    }, [campaigns, searchTerm, statusFilter, sortBy, sortOrder]);

    const campaignStats = useMemo(() => {
        return {
            total: campaigns.length,
            active: campaigns.filter(c => c.status === 'active').length,
            draft: campaigns.filter(c => c.status === 'draft').length,
            completed: campaigns.filter(c => c.status === 'completed').length,
            totalBudget: campaigns.reduce((sum, c) => sum + (c.budget || 0), 0),
            totalParticipants: campaigns.reduce((sum, c) => sum + (c.total_participants || 0), 0),
        };
    }, [campaigns]);

    if (loading) return <div className="flex justify-center items-center h-64"><div>Loading campaigns...</div></div>;
    if (error) return <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">My Campaigns</h1>
                        <p className="text-gray-600">Manage and track your brand campaigns</p>
                    </div>
                    <Link 
                        to="/admin/campaigns/create"
                        className="bg-pink-600 text-white px-4 py-2 rounded-md text-sm hover:bg-pink-700 flex items-center gap-2 w-fit"
                    >
                        <IconPlus />
                        Create Campaign
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <div className="text-2xl font-bold text-blue-600">{campaignStats.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <div className="text-2xl font-bold text-green-600">{campaignStats.active}</div>
                    <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <div className="text-2xl font-bold text-gray-600">{campaignStats.draft}</div>
                    <div className="text-sm text-gray-600">Draft</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <div className="text-2xl font-bold text-blue-600">{campaignStats.completed}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <div className="text-2xl font-bold text-purple-600">${formatNumber(campaignStats.totalBudget)}</div>
                    <div className="text-sm text-gray-600">Budget</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <div className="text-2xl font-bold text-orange-600">{formatNumber(campaignStats.totalParticipants)}</div>
                    <div className="text-sm text-gray-600">Participants</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IconSearch />
                        </div>
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm pl-10 py-2"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm"
                    >
                        <option value="all">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Sort By */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm"
                    >
                        <option value="created_at">Created Date</option>
                        <option value="start_date">Start Date</option>
                        <option value="end_date">End Date</option>
                        <option value="name">Name</option>
                        <option value="status">Status</option>
                        <option value="budget">Budget</option>
                    </select>

                    {/* Sort Order */}
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm"
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Campaigns List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {filteredAndSortedCampaigns.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        {searchTerm || statusFilter !== 'all' ? (
                            <>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
                                <p>Try adjusting your filters or search terms.</p>
                                <button 
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                    }}
                                    className="mt-4 text-pink-600 hover:text-pink-700 text-sm font-medium"
                                >
                                    Clear filters
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                                <p>Create your first campaign to get started.</p>
                                <Link 
                                    to="/admin/campaigns/create"
                                    className="mt-4 inline-flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-md text-sm hover:bg-pink-700"
                                >
                                    <IconPlus />
                                    Create Campaign
                                </Link>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAndSortedCampaigns.map(campaign => (
                                    <tr key={campaign.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {campaign.description || 'No description'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={campaign.status}
                                                onChange={(e) => handleStatusChange(campaign.id, e.target.value)}
                                                className="text-xs rounded border-gray-300 py-1 px-2"
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="pending">Pending</option>
                                                <option value="active">Active</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>{formatDateTime(campaign.start_date)}</div>
                                            <div className="text-gray-500">to {formatDateTime(campaign.end_date)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${formatNumber(campaign.budget || 0)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center gap-1">
                                                <IconUsers />
                                                {campaign.total_participants || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="text-green-600 font-medium">
                                                {formatNumber(campaign.total_engagement || 0)} eng.
                                            </div>
                                            <div className="text-gray-500">
                                                {campaign.total_posts || 0} posts
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Link 
                                                    to={`/admin/campaigns/${campaign.id}`}
                                                    className="text-blue-600 hover:text-blue-700"
                                                    title="View Details"
                                                >
                                                    <IconEye />
                                                </Link>
                                                <Link 
                                                    to={`/admin/campaigns/edit/${campaign.id}`}
                                                    className="text-gray-600 hover:text-gray-700"
                                                    title="Edit Campaign"
                                                >
                                                    <IconEdit />
                                                </Link>
                                                <Link 
                                                    to={`/admin/campaigns/${campaign.id}/participants`}
                                                    className="text-green-600 hover:text-green-700"
                                                    title="View Participants"
                                                >
                                                    <IconUsers />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}