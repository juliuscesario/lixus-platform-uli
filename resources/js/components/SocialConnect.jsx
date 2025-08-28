import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

const SocialConnect = () => {
    const { user, checkAuthStatus } = useAuth();

    const tiktokAccount = user?.social_media_accounts?.find(
        (account) => account.platform === 'tiktok'
    );

    const handleDisconnect = async () => {
        if (!window.confirm('Are you sure you want to disconnect your TikTok account?')) {
            return;
        }

        try {
            await apiService({ useAuth }).disconnectTikTok();
            // After disconnecting, refresh the user data to update the UI
            await checkAuthStatus(); 
        } catch (error) {
            console.error('Failed to disconnect TikTok:', error);
            alert('Could not disconnect account. Please try again.');
        }
    };

    if (tiktokAccount) {
        // If connected, show the disconnect button
        return (
            <div className="bg-green-100 p-6 rounded-lg">
                <h3 className="font-bold text-green-800">TikTok Connected</h3>
                <p className="text-green-700 text-sm mt-1">
                    Connected as: <strong>@{tiktokAccount.username}</strong>
                </p>
                <button 
                    onClick={handleDisconnect}
                    className="mt-3 text-sm font-semibold text-red-800 hover:underline"
                >
                    Disconnect Account &rarr;
                </button>
            </div>
        );
    }

    // If not connected, show the connect link
    return (
        <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="font-bold text-gray-800">Connect Social Media</h3>
            <p className="text-gray-700 text-sm mt-1">Connect your TikTok account to participate.</p>
            <a 
              href="/social/tiktok/redirect" 
              className="mt-3 inline-block text-sm font-semibold text-indigo-800 hover:underline"
            >
              Hubungkan Akun TikTok &rarr;
            </a>
        </div>
    );
};

export default SocialConnect;