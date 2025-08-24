import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const SocialConnect = () => {
    const { user } = useAuth();

    // Check if a TikTok account is present in the user's social media accounts
    const hasTikTokConnection = user?.social_media_accounts?.some(
        account => account.platform === 'tiktok'
    );

    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    if (hasTikTokConnection) {
        // Find the specific tiktok account to show the username
        const tiktokAccount = user.social_media_accounts.find(acc => acc.platform === 'tiktok');
        
        return (
            <div className="bg-green-100 p-6 rounded-lg text-center">
                <h3 className="font-bold text-green-800">TikTok Connected</h3>
                <p className="text-green-700 text-sm mt-1">
                    Connected as: <strong>@{tiktokAccount.username}</strong>
                </p>
                {/* Use a form for the POST request to the web route */}
                <form action="/social/tiktok/disconnect" method="POST" className="mt-3">
                    <input type="hidden" name="_token" value={csrfToken} />
                    <button 
                        type="submit" 
                        className="text-sm font-semibold text-red-800 hover:underline"
                    >
                        Disconnect Account &rarr;
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
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