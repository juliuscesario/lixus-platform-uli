import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import CampaignCard from '../components/CampaignCard';

export default function HomePage({ user }) {
    const { auth } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCampaigns = async () => {
            setLoading(true);
            setError(null);
            // It's good practice to clear previous data
            setCampaigns([]); 

            try {
                let response;

                if (user?.role === 'brand' || user?.role === 'admin') {
                    response = await apiService(auth).getAdminCampaigns();
                } else if (user?.role === 'influencer') {
                    response = await apiService(auth).getPublicCampaignsbyStatus();
                } else {
                    // This will run if 'user' is null or has a different role
                    response = await apiService(auth).getPublicCampaigns();
                }

                if (response?.data) {
                    setCampaigns(response.data);
                } else {
                    // If the API returns a success status but no data, 
                    // you might want to set an empty array instead of an error.
                    // Or display a "not found" message.
                    setError("Data kampanye tidak ditemukan.");
                }
            } catch (error) {
                console.error("Failed to fetch campaigns:", error);
                // Set a user-friendly error message
                setError("Tidak dapat memuat data kampanye. Silakan coba lagi nanti.");
            } finally {
                // This ensures loading is set to false even if an error occurs
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, [user]); 

    const renderActionButtons = () => {
        if (user) {
            if (user.role === 'influencer') {
                return (
                    <div className="inline-flex rounded-md shadow">
                        <Link 
                            to="/dashboard"
                            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-500 hover:bg-pink-600"
                        >
                            Menuju Dashboard Saya
                        </Link>
                    </div>
                );
            }
            if (user.role === 'brand' || user.role === 'admin') {
                return (
                    <div className="inline-flex rounded-md shadow">
                        <Link 
                            to="/admin/campaigns/create"
                            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-500 hover:bg-pink-600"
                        >
                            Buat Kampanye
                        </Link>
                    </div>
                );
            }
        }
        // Tampilan default jika user belum login
        return (
            <>
                <div className="inline-flex rounded-md shadow">
                    <Link 
                        to="/register"
                        className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-500 hover:bg-pink-600"
                    >
                        Jadi Influencer
                    </Link>
                </div>
                <div className="ml-3 inline-flex">
                    <Link 
                        to="/login" // Arahkan ke login untuk brand
                        className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-pink-700 bg-pink-100 hover:bg-pink-200"
                    >
                        Buat Kampanye
                    </Link>
                </div>
            </>
        );
    };

    return (
        <div>
            <div className="bg-pink-50">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                        <span className="block">Temukan Kampanye Impianmu</span>
                        <span className="block text-pink-500">Bergabung dengan Lixus Community</span>
                    </h1>
                    <p className="mt-6 max-w-lg mx-auto text-xl text-gray-500">
                        Hubungkan brand dengan influencer berbakat. Ciptakan kolaborasi yang luar biasa dan capai target audiens Anda.
                    </p>
                    <div className="mt-8 flex justify-center">
                        {renderActionButtons()}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Kampanye Terbaru</h2>
                {loading && (
                    <div className="text-center text-gray-500">Memuat kampanye...</div>
                )}
                {error && (
                    <div className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</div>
                )}
                {!loading && !error && (
                     <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {campaigns.length > 0 ? (
                            campaigns.map(campaign => (
                                <CampaignCard key={campaign.id} campaign={campaign} user={user} />
                            ))
                        ) : (
                            <p className="col-span-full text-center text-gray-500">Saat ini belum ada kampanye yang tersedia.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
