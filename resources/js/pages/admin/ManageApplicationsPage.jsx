import React, { useState, useEffect } from 'react';
import { apiService, formatDate } from '../../services/apiService';
import Pagination from '../../components/Pagination';

const socialIcons = {
    instagram: ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> ),
    tiktok: ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.34 6.34 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
</svg> ),
    youtube: ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10C2.5 4.8 3.7 3.5 5.2 3.5h13.7c1.5 0 2.7 1.3 2.7 2.8v10c0 1.5-1.2 2.8-2.7 2.8H5.2c-1.5 0-2.7-1.3-2.7-2.8z"></path><polygon points="9.3,14.7 15.2,11 9.3,7.3"></polygon></svg> ),
    facebook: ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg> ),
};

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md ${
            active ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
    >
        {children}
    </button>
);

export default function ManageApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [pagination, setPagination] = useState(null);

    // For modals
    const [modal, setModal] = useState({ type: null, data: null });
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchApplications = (status, page = 1) => {
        setLoading(true);
        setError(null);
        apiService.getApplications(status, page)
            .then(data => {
                setApplications(data.data);
                setPagination(data.meta);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchApplications(activeTab);
    }, [activeTab]);

    const handlePageChange = (page) => {
        if (page > 0 && page <= pagination.last_page) {
            fetchApplications(activeTab, page);
        }
    };

    const handleApprove = (appId) => {
        apiService.approveApplication(appId)
            .then(data => {
                setModal({ type: 'approveSuccess', data });
                fetchApplications(activeTab); // Refresh list
            })
            .catch(err => alert(`Error: ${err.message}`));
    };
    
    const handleRejectSubmit = () => {
        if (rejectionReason.length < 10) {
            alert('Please provide a more detailed reason for rejection.');
            return;
        }
        apiService.rejectApplication(modal.data.id, rejectionReason)
            .then(() => {
                setModal({ type: null, data: null });
                setRejectionReason('');
                fetchApplications(activeTab); // Refresh list
            })
            .catch(err => alert(`Error: ${err.message}`));
    };


    const renderContent = () => {
        if (loading) return <div className="text-center p-8">Loading applications...</div>;
        if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;
        if (applications.length === 0) return <div className="text-center p-8 text-gray-500">No {activeTab} applications found.</div>;

        return (
            <div className="space-y-4">
                {applications.map(app => (
                    <div key={app.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-1">
                                <h3 className="font-bold text-lg text-gray-800">{app.name}</h3>
                                <p className="text-sm text-gray-500">{app.email}</p>
                                <p className="text-xs text-gray-400 mt-1">Applied on: {formatDate(app.created_at)}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-700 mb-2">{app.bio || 'No bio provided.'}</p>
                                <div className="flex flex-wrap gap-4">
                                    {app.social_media_profiles.map((profile, index) => (
                                        <a key={index} href={`https://www.${profile.platform}.com/${profile.username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-pink-600 hover:underline">
                                           {socialIcons[profile.platform]}
                                           <span>{profile.followers.toLocaleString('en-US')} followers</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-1 flex items-center justify-end gap-2">
                                {activeTab === 'pending' && (
                                    <>
                                        <button onClick={() => setModal({ type: 'rejectConfirm', data: app })} className="bg-red-100 text-red-700 px-4 py-2 rounded-md font-semibold text-sm hover:bg-red-200">Reject</button>
                                        <button onClick={() => handleApprove(app.id)} className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-green-700">Approve</button>
                                    </>
                                )}
                                {activeTab === 'rejected' && (
                                     <p className="text-xs text-red-500 p-2 bg-red-50 rounded-md">Reason: {app.rejection_reason}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Manage Influencer Applications</h1>
            <div className="flex space-x-2 mb-4">
                <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>Pending</TabButton>
                <TabButton active={activeTab === 'approved'} onClick={() => setActiveTab('approved')}>Approved</TabButton>
                <TabButton active={activeTab === 'rejected'} onClick={() => setActiveTab('rejected')}>Rejected</TabButton>
            </div>
            
            {renderContent()}

            {pagination && pagination.total > 0 && (
                <div className="mt-6">
                    <Pagination meta={pagination} onPageChange={handlePageChange} />
                </div>
            )}

            {/* Modals */}
            {modal.type === 'rejectConfirm' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-lg font-bold mb-4">Reject Application for {modal.data.name}?</h2>
                        <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejection. This will be recorded internally.</p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            rows="4"
                            placeholder="e.g., Follower count does not meet our minimum criteria."
                        ></textarea>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setModal({ type: null, data: null })} className="bg-gray-200 px-4 py-2 rounded-md">Cancel</button>
                            <button onClick={handleRejectSubmit} className="bg-red-600 text-white px-4 py-2 rounded-md">Confirm Rejection</button>
                        </div>
                    </div>
                </div>
            )}

            {modal.type === 'approveSuccess' && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md text-center">
                        <h2 className="text-xl font-bold mb-4 text-green-600">Success!</h2>
                        <p className="text-gray-700 mb-2">Account for <strong>{modal.data.user.name}</strong> has been created.</p>
                        <p className="text-gray-700 mb-4">Please securely share the following temporary password with them:</p>
                        <div className="bg-gray-100 p-3 rounded-md border-2 border-dashed">
                           <p className="text-lg font-mono font-bold tracking-widest">{modal.data.generated_password}</p>
                        </div>
                        <button onClick={() => setModal({ type: null, data: null })} className="bg-pink-600 text-white px-6 py-2 rounded-md mt-6">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}