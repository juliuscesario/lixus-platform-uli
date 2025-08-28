import React, { useEffect } from 'react';
import { formatCompactNumber, formatDate } from '../services/apiService';

const IconX = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> );
const SocialIcon = ({ platform, className }) => {
    if (platform === 'instagram') {
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>;
    }
    if (platform === 'tiktok') {
        return <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/></svg>;
    }
    return null;
};

export default function PostsModal({ isOpen, onClose, posts, loading, influencerName, campaignName }) {
    useEffect(() => {
        const handleEsc = (event) => {
           if (event.keyCode === 27) {
            onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    const handleDownloadExcel = () => {
        // 1. Format data untuk Excel
        const dataToExport = posts.map(post => {
            const metrics = typeof post.metrics === 'string' ? JSON.parse(post.metrics) : (post.metrics || {});
            const socialAccount = post.social_media_account || {};
            return {
                'Influencer': post.influencer?.name || 'N/A',
                'Platform': socialAccount.platform || 'N/A',
                'Username': socialAccount.username || 'N/A',
                'URL Postingan': post.post_url,
                'Tanggal Post': formatDate(post.created_at),
                'Likes': metrics.likes_count || 0,
                'Comments': metrics.comments_count || 0,
                'Shares': metrics.shares_count || 0,
                'Skor': parseFloat(post.score).toFixed(2),
                'Caption': post.caption,
            };
        });

        // 2. Buat worksheet dan workbook
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Postingan");

        // 3. Trigger download
        XLSX.writeFile(workbook, `${campaignName} - ${influencerName} - Posts.xlsx`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Postingan oleh {influencerName}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><IconX /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {loading ? (
                        <p>Memuat postingan...</p>
                    ) : posts && posts.length > 0 ? ( // MODIFICATION HERE: Check if 'posts' is truthy before checking length.
                        <div className="space-y-4">
                            {posts
                                .filter(post => post && post.id) // MODIFICATION: Add a filter to remove any null/invalid posts
                                .map(post => {
                                const metrics = typeof post.metrics === 'string' ? JSON.parse(post.metrics) : (post.metrics || {});
                                const socialAccount = post.social_media_account || {};
                                return (
                                    <a href={post.post_url} target="_blank" rel="noopener noreferrer" key={post.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <img src={post.media_url || 'https://placehold.co/150x150'} alt="Post media" className="w-24 h-24 object-cover rounded-md" />
                                        <div className="flex-grow">
                                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.caption}</p>
                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                <span>{formatDate(post.created_at)}</span>
                                                <div className="flex items-center gap-3 font-medium">
                                                    <span>❤️ {formatCompactNumber(metrics.likes_count)}</span>
                                                    <span>💬 {formatCompactNumber(metrics.comments_count)}</span>
                                                    <span>🔗 {formatCompactNumber(metrics.shares_count)}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-2 pt-2 border-t">
                                                <div className="flex items-center gap-2">
                                                    <SocialIcon platform={socialAccount.platform} className="w-4 h-4" />
                                                    <span className="text-xs font-semibold capitalize">{socialAccount.platform}</span>
                                                </div>
                                                <span className="text-sm font-bold text-indigo-600">Skor: {parseFloat(post.score).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    ) : (
                        <p>Tidak ada postingan yang ditemukan untuk influencer ini.</p>
                    )}
                </div>
                {/* Footer Modal dengan Tombol Download */}
                <div className="p-4 border-t flex justify-end">
                    <button 
                        onClick={handleDownloadExcel}
                        disabled={loading || posts.length === 0}
                        className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
                    >
                        Download Excel
                    </button>
                </div>
            </div>
        </div>
    );
}