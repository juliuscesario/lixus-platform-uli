import React from 'react';

const IconUsers = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1.5 text-gray-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> );
const IconMapPin = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1.5 text-gray-400"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> );

import { Link } from 'react-router-dom';

export default function InfluencerCard({ influencer }) {
    // PERBAIKAN: Akses data profil dari object `influencer_profile`
    const profile = influencer.influencer_profile || {};
    const imageUrl = profile.profile_picture || `https://placehold.co/400x400/eab308/ffffff?text=${encodeURIComponent(influencer.name.charAt(0))}`;

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden text-center transform hover:-translate-y-1 transition-transform duration-300">
            <img className="w-32 h-32 mx-auto rounded-full mt-8 border-4 border-white shadow-md" src={imageUrl} alt={influencer.name} />
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{influencer.name}</h3>
                <p className="text-gray-500 text-sm mb-4 h-10 overflow-hidden">{profile.bio || "Bio belum diatur"}</p>
                <div className="flex justify-center gap-4 text-sm text-gray-600 mb-6">
                    <span className="inline-flex items-center">
                        <IconUsers /> {profile.follower_range || 'N/A'}
                    </span>
                    <span className="inline-flex items-center capitalize">
                        <IconMapPin /> {profile.city || 'N/A'}
                    </span>
                </div>
                <Link 
                    to={`/influencers/${influencer.id}`} 
                    className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors duration-300"
                >
                    Lihat Profil
                </Link>
            </div>
        </div>
    );
}
