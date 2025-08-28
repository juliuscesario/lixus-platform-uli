import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const SessionExpiredModal = () => {
    const { sessionExpired, setSessionExpired } = useAuth();

    if (!sessionExpired) {
        return null;
    }

    const handleLoginRedirect = () => {
        setSessionExpired(false);
        localStorage.removeItem('authUser');
        window.location.replace('/login');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl text-center">
                <h2 className="text-2xl font-bold mb-4">Session Expired</h2>
                <p className="mb-6">Your session has expired. Please log in again to continue.</p>
                <button
                    onClick={handleLoginRedirect}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                    Login
                </button>
            </div>
        </div>
    );
};

export default SessionExpiredModal;