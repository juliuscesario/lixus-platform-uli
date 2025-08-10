import React from 'react';

const SocialIcon = ({ platform, className }) => {
    if (platform === 'instagram') {
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>;
    }
    if (platform === 'tiktok') {
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-tiktok" viewBox="0 0 16 16">
            <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
            </svg>;
    }
    return null;
};

import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
    const influencer = post.influencer || {};
    const influencerProfile = influencer.influencer_profile || {};
    const campaign = post.campaign || {};
    
    // Fallback jika media_url tidak ada
    const mediaUrl = post.media_url || `https://placehold.co/600x600/cccccc/ffffff?text=Post`;

    return (
        <Link 
            to={`/posts/${post.id}`} 
            className="bg-white rounded-lg shadow-lg overflow-hidden group cursor-pointer"
        >
            <div className="relative">
                <img src={mediaUrl} alt={`Post by ${influencer.name}`} className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                    <p className="text-white text-center text-sm">{post.caption}</p>
                </div>
            </div>
            <div className="p-4 flex items-center">
                <img 
                    src={influencerProfile.profile_picture || `https://placehold.co/100x100/eab308/ffffff?text=${influencer.name ? influencer.name.charAt(0) : 'I'}`} 
                    alt={influencer.name} 
                    className="w-10 h-10 rounded-full mr-3"
                />
                <div className="flex-grow">
                    <p className="font-bold text-gray-800">{influencer.name || 'Nama Influencer'}</p>
                    <p className="text-xs text-gray-500">di kampanye <span className="font-semibold">{campaign.name || 'Kampanye'}</span></p>
                </div>
                <SocialIcon platform={post.platform} className="w-6 h-6 text-gray-400" />
            </div>
        </div>
    );
}