import React, { useState, useEffect } from 'react';
import { formatDate } from '../../services/apiService';
import useApi from '../../hooks/useApi';
import Pagination from '../../components/Pagination';

const socialIcons = {
    instagram: ( 
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg> 
    ),
    tiktok: ( 
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.34 6.34 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg> 
    ),
    youtube: ( 
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 17a24.12 24.12 0 0 1 0-10C2.5 4.8 3.7 3.5 5.2 3.5h13.7c1.5 0 2.7 1.3 2.7 2.8v10c0 1.5-1.2 2.8-2.7 2.8H5.2c-1.5 0-2.7-1.3-2.7-2.8z"></path>
            <polygon points="9.3,14.7 15.2,11 9.3,7.3"></polygon>
        </svg> 
    ),
    facebook: ( 
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg> 
    ),
};

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md ${
            active ?
            'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
    >
        {children}
    </button>
);

export default function ManageApplicationsPage() {
    const { api, auth } = useApi();
    const { user } = auth;
    
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [pagination, setPagination] = useState(null);

    // For modals
    const [modal, setModal] = useState({ type: null, data: null });
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchApplications = async (status, page = 1) => {
        setLoading(true);
        setError(null);
        
        try {
            const data = await api('getApplications', status, page);
            setApplications(data.data);
            setPagination(data.meta);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications(activeTab);
    }, [activeTab, api]);

    const handlePageChange = (page) => {
        if (page > 0 && page <= pagination.last_page) {
            fetchApplications(activeTab, page);
        }
    };

    const handleApprove = async (appId) => {
        try {
            const data = await api('approveApplication', appId);
            setModal({ type: 'approveSuccess', data });
            fetchApplications(activeTab); // Refresh list
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };
    
    const handleRejectSubmit = async () => {
        if (rejectionReason.length < 10) {
            alert('Please provide a more detailed reason for rejection.');
            return;
        }

        try {
            await api('rejectApplication', modal.data.id, rejectionReason);
            setModal({ type: null, data: null });
            setRejectionReason('');
            fetchApplications(activeTab); // Refresh list
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleReject = (application) => {
        setModal({ type: 'reject', data: application });
    };

    const closeModal = () => {
        setModal({ type: null, data: null });
        setRejectionReason('');
    };

    if (loading) return <div>Loading applications...</div>;
    if (error) return <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Influencer Applications</h1>
            
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
                <TabButton 
                    active={activeTab === 'pending'} 
                    onClick={() => setActiveTab('pending')}
                >
                    Pending Applications
                </TabButton>
                <TabButton 
                    active={activeTab === 'approved'} 
                    onClick={() => setActiveTab('approved')}
                >
                    Approved
                </TabButton>
                <TabButton 
                    active={activeTab === 'rejected'} 
                    onClick={() => setActiveTab('rejected')}
                >
                    Rejected
                </TabButton>
            </div>

            {/* Applications List */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {applications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No {activeTab} applications found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Applicant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Social Media
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Applied Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    {activeTab === 'pending' && (
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {applications.map(application => (
                                    <tr key={application.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <img 
                                                        className="h-10 w-10 rounded-full object-cover" 
                                                        src={application.user?.profile_photo_path || '/default-avatar.png'} 
                                                        alt=""
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {application.user?.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {application.user?.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-2">
                                                {application.social_media_accounts?.map(account => (
                                                    <div key={account.id} className="flex items-center space-x-2">
                                                        {socialIcons[account.platform] || (
                                                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                                                        )}
                                                        <span className="text-sm text-gray-900">
                                                            @{account.username}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            ({account.follower_count?.toLocaleString()} followers)
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(application.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                application.status === 'approved' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : application.status === 'rejected'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                            </span>
                                        </td>
                                        {activeTab === 'pending' && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleApprove(application.id)}
                                                        className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 text-xs"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(application)}
                                                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-xs"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
                <div className="mt-6 flex justify-center">
                    <div className="flex space-x-1">
                        <button
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page <= 1}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        
                        {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                                    page === pagination.current_page
                                        ? 'bg-pink-500 text-white border-pink-500'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        
                        <button
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                            disabled={pagination.current_page >= pagination.last_page}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {modal.type === 'reject' && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Reject Application
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Please provide a reason for rejecting {modal.data?.user?.name}'s application:
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md resize-none"
                                rows="4"
                                placeholder="Enter rejection reason..."
                            ></textarea>
                            <div className="flex justify-end space-x-3 mt-4">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRejectSubmit}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modal.type === 'approveSuccess' && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Application Approved!
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                The application has been successfully approved and the user has been notified.
                            </p>
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}