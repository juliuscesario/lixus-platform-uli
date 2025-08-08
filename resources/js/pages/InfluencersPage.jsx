import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import InfluencerCard from '../components/InfluencerCard';

export default function InfluencersPage({ setPage }) {
    const [influencers, setInfluencers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInfluencers = async () => {
            setLoading(true);
            setError(null);
            const response = await apiService.getPublicInfluencers();
            if (response && response.data) {
                setInfluencers(response.data);
            } else {
                setError("Tidak dapat memuat data influencer. Silakan coba lagi nanti.");
            }
            setLoading(false);
        };
        fetchInfluencers();
    }, []);

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Temukan Influencer Berbakat</h1>
            {loading && <div className="text-center text-gray-500">Memuat influencer...</div>}
            {error && <div className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</div>}
            {!loading && !error && (
                 <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {influencers.length > 0 ? (
                        influencers.map(influencer => (
                            <InfluencerCard key={influencer.id} influencer={influencer} setPage={setPage} />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500">Saat ini belum ada influencer yang terdaftar.</p>
                    )}
                </div>
            )}
        </div>
    );
}