import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardPage({ user }) {
    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="mt-8 bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-800">Selamat Datang, {user.name}!</h2>
                <p className="mt-2 text-gray-600">Ini adalah halaman dashboard Anda. Dari sini, Anda dapat mengelola profil, kampanye, dan akun sosial media Anda.</p>
                <p className="mt-1 text-gray-600">Email terdaftar: {user.email}</p>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-pink-100 p-6 rounded-lg">
                        <h3 className="font-bold text-pink-800">Profil Saya</h3>
                        <p className="text-pink-700 text-sm mt-1">Lengkapi dan perbarui profil influencer Anda.</p>
                        <Link to="/influencer/profile" className="mt-3 text-sm font-semibold text-pink-800 hover:underline">Kelola Profil &rarr;</Link>
                    </div>
                     <div className="bg-blue-100 p-6 rounded-lg">
                        <h3 className="font-bold text-blue-800">Kampanye Saya</h3>
                        <p className="text-blue-700 text-sm mt-1">Lihat kampanye yang sedang Anda ikuti.</p>
                        <Link to="/influencer/my-campaigns" className="mt-3 text-sm font-semibold text-blue-800 hover:underline">Lihat Kampanye &rarr;</Link>
                    </div>
                     <div className="bg-green-100 p-6 rounded-lg">
                        <h3 className="font-bold text-green-800">Akun Sosial Media</h3>
                        <p className="text-green-700 text-sm mt-1">Hubungkan dan kelola akun sosial media Anda.</p>
                        <Link to="/influencer/social-media" className="mt-3 text-sm font-semibold text-green-800 hover:underline">Hubungkan Akun &rarr;</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}