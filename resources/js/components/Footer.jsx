import React from 'react';

export default function Footer() {
    // ... (Salin seluruh kode fungsi Footer dari app.jsx lama ke sini) ...
    return (
        <footer className="bg-gray-800 text-white mt-12">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <p className="text-lg font-bold"><a href="https://lixus.id" target='_blank'>Lixus.id</a></p>
                    <p className="mt-2 text-sm text-gray-400">Platform Komunitas Influencer Terdepan.</p>
                    <p className="mt-2 text-sm text-gray-400">&copy; {new Date().getFullYear()} PT Lintas Ekspansi Usaha. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}