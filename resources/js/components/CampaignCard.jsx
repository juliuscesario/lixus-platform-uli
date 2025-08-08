import React from 'react';
import { formatDate, formatCurrency } from '../services/apiService';

export default function CampaignCard({ campaign, setPage, user }) {
    // ... (Salin seluruh kode fungsi CampaignCard dari app.jsx lama ke sini) ...
    const statusStyles = {
        active: 'bg-green-100 text-green-800',
        recruiting: 'bg-blue-100 text-blue-800',
        finished: 'bg-gray-100 text-gray-800',
        draft: 'bg-yellow-100 text-yellow-800',
    };
    
    const imageUrl = campaign.image || `https://placehold.co/600x400/f472b6/ffffff?text=${encodeURIComponent(campaign.name)}`;
    const isBrandOrAdmin = user && (user.role === 'brand' || user.role === 'admin');

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
            <img className="h-48 w-full object-cover" src={imageUrl} alt={`Campaign: ${campaign.name}`} />
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{campaign.name}</h3>
                        {user && (
                            <span className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[campaign.status] || 'bg-gray-100 text-gray-800'}`}>
                                {campaign.status}
                            </span>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{campaign.description}</p>
                </div>
                <div>
                    <div className="border-t border-gray-100 pt-4">
                        <div className="flex justify-between items-center text-sm text-gray-500">
                            {isBrandOrAdmin && (
                                <div>
                                    <p className="font-semibold text-gray-700">Budget</p>
                                    <p>{formatCurrency(campaign.budget)}</p>
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-gray-700">Mulai</p>
                                <p>{formatDate(campaign.start_date)}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700">Berakhir</p>
                                <p>{formatDate(campaign.end_date)}</p>
                            </div>
                        </div>
                    </div>
                     <button onClick={() => setPage('campaign-detail', { id: campaign.id })} className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors duration-300">
                        Lihat Detail
                    </button>
                </div>
            </div>
        </div>
    );
}