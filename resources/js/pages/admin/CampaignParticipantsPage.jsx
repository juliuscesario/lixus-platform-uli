import React, { useState, useEffect, useMemo } from 'react';
import useApi from '../../hooks/useApi';
import ParticipantCard from '../../components/ParticipantCard';
import { Link, useNavigate, useParams } from 'react-router-dom';

const IconArrowLeft = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> );
const IconSearch = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> );
const IconGrid = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg> );
const IconList = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"></line><line x1="8" x2="21" y1="12" y2="12"></line><line x1="8" x2="21" y1="18" y2="18"></line><line x1="3" x2="3.01" y1="6" y2="6"></line><line x1="3" x2="3.01" y1="12" y2="12"></line><line x1="3" x2="3.01" y1="18" y2="18"></line></svg> );

const StatusBadge = ({ status }) => {
    const statusStyles = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        completed: 'bg-blue-100 text-blue-800',
        withdrawn: 'bg-gray-100 text-gray-800',
    };
    return (
        <span className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

export default function CampaignParticipantsPage() {
    const { api } = useApi();
    const navigate = useNavigate();
    const { id: campaignId } = useParams();
    const [participants, setParticipants] = useState([]);
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    const fetchCampaignData = async () => {
        setError(null);
        try {
            // Fetch campaign details first
            const campaignResponse = await api('getAdminCampaignDetail', campaignId);
            setCampaign(campaignResponse.data);
            
            // Then fetch participants
            const response = await api('getCampaignParticipants', campaignId);
            setParticipants(response.data || []);
        } catch (err) {
            if (err.message.includes('401') || err.message.includes('Session expired')) {
                // Session expired - handled by AuthContext automatically
            } else if (err.message.includes('403')) {
                setError("You don't have permission to view participants for this campaign.");
            } else {
                setError('Failed to load participant data.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (campaignId) {
            setLoading(true);
            fetchCampaignData();
        }
    }, [campaignId]);

    const handleStatusChange = async (userId, newStatus) => {
        if (!confirm(`Are you sure you want to change this participant's status to "${newStatus}"?`)) return;
        try {
            await api('updateParticipantStatus', campaignId, userId, newStatus);
            fetchCampaignData();
        } catch (err) {
            if (err.message.includes('403')) {
                alert("You don't have permission to change participant status.");
            } else {
                alert(err.message || 'Failed to change status.');
            }
        }
    };

    const handleSelectOne = (userId) => {
        if (selected.includes(userId)) {
            setSelected(selected.filter(item => item !== userId));
        } else {
            setSelected([...selected, userId]);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(filteredParticipants.map(p => p.user_id));
        } else {
            setSelected([]);
        }
    };

    const handleBulkUpdate = async () => {
        if (!bulkStatus || selected.length === 0) {
            alert('Please select participants and status first.');
            return;
        }
        if (!confirm(`You will change the status of ${selected.length} participants to "${bulkStatus}". Continue?`)) return;
        
        for (const userId of selected) {
            try {
                await api('updateParticipantStatus', campaignId, userId, bulkStatus);
            } catch (err) {
                alert(`Failed to update participant ID ${userId}: ${err.message}`);
                break;
            }
        }
        setSelected([]);
        setBulkStatus('');
        fetchCampaignData();
    };

    // Filter participants based on search term
    const filteredParticipants = useMemo(() => {
        if (!searchTerm) return participants;
        return participants.filter(participant =>
            participant.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            participant.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [participants, searchTerm]);

    if (loading) return <div className="flex justify-center items-center h-64"><div>Loading participants...</div></div>;
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
                        <h1 className="text-2xl font-bold text-gray-800">Campaign Participants</h1>
                        <p className="text-lg text-gray-600">{campaign?.name || 'Loading...'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IconSearch />
                            </div>
                            <input
                                type="text"
                                placeholder="Search participants..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-64 rounded-md border-gray-300 shadow-sm pl-10 py-2"
                            />
                        </div>
                        
                        {/* View Mode Toggle */}
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

            {/* Summary */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-blue-600">{participants.length}</p>
                        <p className="text-sm text-gray-600">Total Participants</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-green-600">
                            {participants.filter(p => p.status === 'approved').length}
                        </p>
                        <p className="text-sm text-gray-600">Approved</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-yellow-600">
                            {participants.filter(p => p.status === 'pending').length}
                        </p>
                        <p className="text-sm text-gray-600">Pending</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-red-600">
                            {participants.filter(p => p.status === 'rejected').length}
                        </p>
                        <p className="text-sm text-gray-600">Rejected</p>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selected.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <span className="text-sm text-blue-700 font-medium">
                            {selected.length} participants selected
                        </span>
                        <div className="flex items-center gap-2">
                            <select
                                value={bulkStatus}
                                onChange={(e) => setBulkStatus(e.target.value)}
                                className="rounded-md border-gray-300 shadow-sm text-sm"
                            >
                                <option value="">Change status to...</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="pending">Pending</option>
                            </select>
                            <button
                                onClick={handleBulkUpdate}
                                className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700"
                            >
                                Apply
                            </button>
                            <button
                                onClick={() => setSelected([])}
                                className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-300"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Participants List */}
            <div className="bg-white rounded-lg shadow-sm">
                {filteredParticipants.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        {searchTerm ? 'No participants found matching your search.' : 'No participants found.'}
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {filteredParticipants.map(participant => (
                            <ParticipantCard
                                key={participant.user_id}
                                participant={participant}
                                selected={selected.includes(participant.user_id)}
                                onSelect={() => handleSelectOne(participant.user_id)}
                                onStatusChange={(newStatus) => handleStatusChange(participant.user_id, newStatus)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        <div className="bg-gray-50 p-3 grid grid-cols-12 gap-2 text-sm font-medium text-gray-700">
                            <div className="col-span-1">
                                <input
                                    type="checkbox"
                                    checked={selected.length === filteredParticipants.length && filteredParticipants.length > 0}
                                    onChange={handleSelectAll}
                                    className="rounded border-gray-300"
                                />
                            </div>
                            <div className="col-span-3">Name</div>
                            <div className="col-span-3">Email</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2">Joined Date</div>
                            <div className="col-span-1">Actions</div>
                        </div>
                        {filteredParticipants.map(participant => (
                            <div key={participant.user_id} className="p-3 grid grid-cols-12 gap-2 items-center hover:bg-gray-50">
                                <div className="col-span-1">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(participant.user_id)}
                                        onChange={() => handleSelectOne(participant.user_id)}
                                        className="rounded border-gray-300"
                                    />
                                </div>
                                <div className="col-span-3 text-sm font-medium text-gray-900">
                                    {participant.user?.name || 'N/A'}
                                </div>
                                <div className="col-span-3 text-sm text-gray-600">
                                    {participant.user?.email || 'N/A'}
                                </div>
                                <div className="col-span-2">
                                    <StatusBadge status={participant.status} />
                                </div>
                                <div className="col-span-2 text-sm text-gray-600">
                                    {participant.joined_at ? new Date(participant.joined_at).toLocaleDateString() : 'N/A'}
                                </div>
                                <div className="col-span-1">
                                    <select
                                        value={participant.status}
                                        onChange={(e) => handleStatusChange(participant.user_id, e.target.value)}
                                        className="text-xs rounded border-gray-300 py-1 px-2"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}