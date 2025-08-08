import React, { useState, useEffect, useMemo } from 'react';
import { apiService, formatDateTime } from '../../services/apiService';
import ParticipantCard from '../../components/ParticipantCard';

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

export default function CampaignParticipantsPage({ pageProps, setPage }) {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    const fetchParticipants = async () => {
        setError(null);
        try {
            const response = await apiService.getCampaignParticipants(pageProps.id);
            setParticipants(response.data || []);
        } catch (err) {
            setError('Gagal memuat data partisipan.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchParticipants();
    }, [pageProps.id]);

    const handleStatusChange = async (userId, newStatus) => {
        if (!confirm(`Apakah Anda yakin ingin mengubah status partisipan ini menjadi "${newStatus}"?`)) return;
        try {
            await apiService.updateParticipantStatus(pageProps.id, userId, newStatus);
            fetchParticipants();
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
        if (!confirm(`Anda akan mengubah status ${selected.length} partisipan menjadi "${bulkStatus}". Lanjutkan?`)) return;

        for (const userId of selected) {
            try {
                await apiService.updateParticipantStatus(pageProps.id, userId, bulkStatus);
            } catch (err) {
                alert(`Gagal mengubah status untuk partisipan ID ${userId}: ${err.message}`);
                break;
            }
        }
        setSelected([]);
        fetchParticipants();
    };
    
    const filteredParticipants = useMemo(() => {
        if (!searchTerm) return participants;
        return participants.filter(p => 
            p.influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.influencer.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [participants, searchTerm]);

    if (loading) return <div>Memuat data partisipan...</div>;
    if (error) return <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;

    return (
        <div>
            {/* --- HEADER BARU --- */}
            <div className="mb-6">
                <button onClick={() => setPage('admin-campaigns')} className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
                    <IconArrowLeft />
                    Kembali ke Manajemen Kampanye
                </button>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Partisipan Kampanye</h1>
                        <p className="text-lg text-gray-600">{pageProps.name}</p>
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
                                className="w-full md:w-64 rounded-md border-gray-300 shadow-sm pl-10 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                        <div className="flex items-center rounded-md shadow-sm bg-white border border-gray-300">
                             <button onClick={() => setViewMode('grid')} className={`p-2 rounded-l-md ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                                <IconGrid />
                             </button>
                             <button onClick={() => setViewMode('list')} className={`p-2 rounded-r-md ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                                <IconList />
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- PANEL AKSI MASSAL BARU --- */}
            {selected.length > 0 && (
                <div className="bg-white shadow-md rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center">
                        <input 
                            id="select-all"
                            type="checkbox"
                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            onChange={handleSelectAll}
                            checked={selected.length === filteredParticipants.length && filteredParticipants.length > 0}
                        />
                        <label htmlFor="select-all" className="ml-3 text-sm font-medium text-gray-700">
                            {selected.length} Partisipan Dipilih
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="rounded-md border-gray-300 shadow-sm text-sm">
                            <option value="">Ubah Status</option>
                            <option value="approved">Approve</option>
                            <option value="rejected">Reject</option>
                        </select>
                        <button onClick={handleBulkUpdate} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 text-sm">
                            Terapkan
                        </button>
                    </div>
                </div>
            )}

            {/* --- KONTEN KONDISIONAL: GRID ATAU LIST --- */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredParticipants.length > 0 ? filteredParticipants.map(p => (
                        <ParticipantCard 
                            key={p.id} participant={p} onSelect={handleSelectOne}
                            isSelected={selected.includes(p.user_id)} onStatusChange={handleStatusChange}
                        />
                    )) : (
                        <div className="col-span-full text-center text-gray-500 py-10 bg-white rounded-lg shadow-md">
                            <p>{searchTerm ? 'Tidak ada partisipan yang cocok.' : 'Belum ada partisipan.'}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4">
                                    <input 
                                        type="checkbox" 
                                        onChange={handleSelectAll} 
                                        checked={selected.length === filteredParticipants.length && filteredParticipants.length > 0} 
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Influencer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Daftar</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Update</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredParticipants.length > 0 ? filteredParticipants.map(p => (
                                <tr key={p.id} className={selected.includes(p.user_id) ? 'bg-gray-100' : ''}>
                                    <td className="p-4">
                                        <input 
                                            type="checkbox" 
                                            checked={selected.includes(p.user_id)} 
                                            onChange={() => handleSelectOne(p.user_id)} 
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.influencer.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.influencer.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(p.applied_at)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(p.updated_at)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={p.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {p.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleStatusChange(p.user_id, 'approved')} className="text-green-600 hover:text-green-900 mr-4">Approve</button>
                                                <button onClick={() => handleStatusChange(p.user_id, 'rejected')} className="text-red-600 hover:text-red-900">Reject</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        {searchTerm ? 'Tidak ada partisipan yang cocok dengan pencarian.' : 'Belum ada partisipan yang mendaftar.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>                    
                    </table>
                </div>
            )}
        </div>
    );
}
