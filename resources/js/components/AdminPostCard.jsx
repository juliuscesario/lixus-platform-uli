import React from 'react';
import { formatCompactNumber, formatDate } from '../services/apiService';

const SocialIcon = ({ platform, className }) => {
    if (platform === 'instagram') {
        return <svg xmlns="http://www.w.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>;
    }
    if (platform === 'tiktok') {
        return <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/></svg>;
    }
    return null;
};

export default function AdminPostCard({ post, onValidate, onSelect, isSelected }) {
    const influencer = post.influencer || {};
    const socialAccount = post.social_media_account || {};
    const metrics = typeof post.metrics === 'string' ? JSON.parse(post.metrics) : (post.metrics || {});
    const mediaUrl = post.media_url || `https://placehold.co/600x600/cccccc/ffffff?text=Post`;

    return (
        <div className={`bg-white rounded-lg shadow-md overflow-hidden relative transition-all duration-200 ${isSelected ? 'ring-2 ring-indigo-500' : 'hover:shadow-xl'}`}>
            <input 
                type="checkbox" 
                className="absolute top-3 left-3 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 z-10"
                checked={isSelected}
                onChange={() => onSelect(post.id)}
            />
            <a href={post.post_url} target="_blank" rel="noopener noreferrer">
                <img src={mediaUrl} alt={`Post by ${influencer.name}`} className="w-full h-64 object-cover" />
            </a>
            <div className="p-4">
                <div className="flex items-center mb-2">
                    <img 
                        src={influencer.influencer_profile?.profile_picture || `https://placehold.co/100x100/eab308/ffffff?text=${influencer.name ? influencer.name.charAt(0) : 'I'}`} 
                        alt={influencer.name} 
                        className="w-10 h-10 rounded-full mr-3"
                    />
                    <div className="flex-grow">
                        <p className="font-bold text-gray-800">{influencer.name || 'Nama Influencer'}</p>
                        <p className="text-xs text-gray-500">@{socialAccount.username || 'username'}</p>
                    </div>
                    <SocialIcon platform={socialAccount.platform} className="w-6 h-6 text-gray-400" />
                </div>
                {/* REFACTOR: Menambahkan tanggal posting */}
                <p className="text-xs text-gray-400 mb-2">Diposting: {formatDate(post.created_at)}</p>
                <p className="text-sm text-gray-600 mb-3 h-10 overflow-hidden">{post.caption}</p>
                <div className="grid grid-cols-3 gap-2 text-center text-sm border-t border-b py-2 mb-3">
                    <div><p className="font-bold">{formatCompactNumber(metrics.likes_count)}</p><p className="text-xs text-gray-500">Likes</p></div>
                    <div><p className="font-bold">{formatCompactNumber(metrics.comments_count)}</p><p className="text-xs text-gray-500">Comments</p></div>
                    <div><p className="font-bold">{formatCompactNumber(metrics.shares_count)}</p><p className="text-xs text-gray-500">Shares</p></div>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-sm">Validasi:</p>
                    {post.is_valid_for_campaign ? (
                        <span className="font-bold text-green-600">Disetujui</span>
                    ) : (
                        <button 
                            onClick={() => onValidate(post.id, true, 'Disetujui oleh admin.')}
                            className="bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-md hover:bg-green-600"
                        >
                            Setujui
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
