// resources/js/components/SessionExpiredModal.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const SessionExpiredModal = () => {
    const { sessionExpired, setSessionExpired } = useAuth();

    if (!sessionExpired) {
        return null;
    }

    const handleLoginRedirect = () => {
        // Clear session expired state
        setSessionExpired(false);
        
        // Clear all authentication data from localStorage
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
        
        // Clear all session cookies
        document.cookie = 'laravel_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'lixus_platform_uli_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Force reload to login page to ensure fresh state
        window.location.replace('/login');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl text-center max-w-md">
                <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Session Expired</h2>
                <p className="mb-6 text-gray-600">
                    Your session has expired for security reasons. Please log in again to continue.
                </p>
                <button
                    onClick={handleLoginRedirect}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                >
                    Go to Login
                </button>
            </div>
        </div>
    );
};

export default SessionExpiredModal;