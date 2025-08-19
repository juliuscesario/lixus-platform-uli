import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/');
        }, 3000); // Redirect after 3 seconds

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-10 rounded-lg shadow-xl text-center">
                <h1 className="text-6xl font-extrabold text-pink-500 mb-4">404</h1>
                <h2 className="text-2xl font-semibold mb-4">Halaman Tidak Ditemukan</h2>
                <p className="text-gray-600 mb-8">
                    Maaf, halaman yang Anda cari tidak ada. Anda akan dialihkan ke halaman utama.
                </p>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            </div>
        </div>
    );
};

export default NotFoundPage;