import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import { Link, useNavigate, useParams } from 'react-router-dom';

// Icons
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

export default function CampaignParticipantsPage() {
    const { api, auth } = useApi();
    const { user } = auth;
    const navigate = useNavigate();
    const { id: campaignId } = useParams();
    
    const [participants, setParticipants] = useState([]);
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('');
    const [viewMode, setViewMode] = useState('grid');

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
            setError('Gagal memuat data partisipan.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (campaignId) {
            setLoading(true);
            fetchCampaignData();
        }
    }, [campaignId, api]);

    const handleStatusChange = async (userId, newStatus) => {
        if (!window.confirm(`Apakah Anda yakin ingin mengubah status partisipan ini menjadi "${newStatus}"?`)) return;
        
        try {
            await api('updateParticipantStatus', campaignId, userId, newStatus);
            fetchCampaignData();
        } catch (err) {
            alert(err.message || 'Gagal mengubah status.');
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
            alert('Pilih partisipan dan status terlebih dahulu.');
            return;
        }
        
        if (!window.confirm(`Anda akan mengubah status ${selected.length} partisipan menjadi "${bulkStatus}". Lanjutkan?`)) return;
        
        try {
            for (const userId of selected) {
                await api('updateParticipantStatus', campaignId, userId, bulkStatus);
            }
            setSelected([]);
            setBulkStatus('');
            fetchCampaignData();
            alert('Status partisipan berhasil diperbarui.');
        } catch (err) {
            alert(err.message || 'Gagal memperbarui status.');
        }
    };

    // Filter participants based on search term
    const filteredParticipants = participants.filter(participant =>
        participant.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Memuat data partisipan...</div>;
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
                        <h1 className="text-2xl font-bold text-gray-800">Partisipan Kampanye</h1>
                        <p className="text-lg text-gray-600">{campaign?.name || 'Loading...'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IconSearch />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Cari partisipan..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-gray-900">{participants.length}</div>
                    <div className="text-sm text-gray-500">Total Partisipan</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-green-600">
                        {participants.filter(p => p.status === 'approved').length}
                    </div>
                    <div className="text-sm text-gray-500">Approved</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-yellow-600">
                        {participants.filter(p => p.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-500">Pending</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-red-600">
                        {participants.filter(p => p.status === 'rejected').length}
                    </div>
                    <div className="text-sm text-gray-500">Rejected</div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selected.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-blue-800">
                            {selected.length} partisipan dipilih
                        </span>
                        <div className="flex items-center gap-2">
                            <select 
                                value={bulkStatus} 
                                onChange={(e) => setBulkStatus(e.target.value)}
                                className="rounded-md border-gray-300 text-sm"
                            >
                                <option value="">Pilih Status</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="pending">Pending</option>
                            </select>
                            <button 
                                onClick={handleBulkUpdate}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm"
                                disabled={!bulkStatus}
                            >
                                Update Status
                            </button>
                            <button 
                                onClick={() => setSelected([])}
                                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm"
                            >
                                Batal Pilih
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Participants Display */}
            {filteredParticipants.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">
                        {searchTerm ? 'Tidak ada partisipan yang cocok dengan pencarian.' : 'Belum ada partisipan.'}
                    </div>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredParticipants.map(participant => (
                        <div key={participant.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(participant.user_id)}
                                        onChange={() => handleSelectOne(participant.user_id)}
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    <img 
                                        className="w-12 h-12 rounded-full object-cover ml-3" 
                                        src={participant.user?.profile_photo_path || '/default-avatar.png'} 
                                        alt=""
                                    />
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    participant.status === 'approved' 
                                        ? 'bg-green-100 text-green-800'
                                        : participant.status === 'rejected'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                                </span>
                            </div>
                            
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {participant.user?.name}
                                </h3>
                                <p className="text-sm text-gray-500">{participant.user?.email}</p>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                                {participant.status !== 'approved' && (
                                    <button
                                        onClick={() => handleStatusChange(participant.user_id, 'approved')}
                                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                    >
                                        Approve
                                    </button>
                                )}
                                {participant.status !== 'rejected' && (
                                    <button
                                        onClick={() => handleStatusChange(participant.user_id, 'rejected')}
                                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                    >
                                        Reject
                                    </button>
                                )}
                            </div>
                        </div>
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
                                        checked={selected.length === filteredParticipants.length && filteredParticipants.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Partisipan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tanggal Bergabung
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredParticipants.map(participant => (
                                <tr key={participant.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(participant.user_id)}
                                            onChange={() => handleSelectOne(participant.user_id)}
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img 
                                                    className="h-10 w-10 rounded-full object-cover" 
                                                    src={participant.user?.profile_photo_path || '/default-avatar.png'} 
                                                    alt=""
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {participant.user?.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {participant.user?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            participant.status === 'approved' 
                                                ? 'bg-green-100 text-green-800'
                                                : participant.status === 'rejected'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(participant.created_at).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            {participant.status !== 'approved' && (
                                                <button
                                                    onClick={() => handleStatusChange(participant.user_id, 'approved')}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {participant.status !== 'rejected' && (
                                                <button
                                                    onClick={() => handleStatusChange(participant.user_id, 'rejected')}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}