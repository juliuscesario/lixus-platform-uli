import React from 'react';
import { formatDateTime } from '../services/apiService';

const StatusBadge = ({ status }) => {
    const statusStyles = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        completed: 'bg-blue-100 text-blue-800',
        withdrawn: 'bg-gray-100 text-gray-800',
    };
    return (
        <span className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

export default function ParticipantCard({ participant, onSelect, isSelected, onStatusChange }) {
    const influencer = participant.influencer || {};
    const profile = influencer.influencer_profile || {};
    const imageUrl = profile.profile_picture || `https://placehold.co/100x100/eab308/ffffff?text=${influencer.name ? influencer.name.charAt(0) : 'I'}`;

    return (
        <div className={`bg-white rounded-lg shadow-md relative transition-all duration-200 ${isSelected ? 'ring-2 ring-indigo-500' : 'hover:shadow-xl'}`}>
            <div className="absolute top-3 left-3">
                <input 
                    type="checkbox" 
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={isSelected}
                    onChange={() => onSelect(participant.user_id)}
                />
            </div>
            <div className="p-5 flex flex-col items-center text-center">
                <img src={imageUrl} alt={influencer.name} className="w-24 h-24 rounded-full mb-4" />
                <h3 className="font-bold text-gray-800 text-lg">{influencer.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{influencer.email}</p>
                <StatusBadge status={participant.status} />
                <p className="text-xs text-gray-400 mt-3">Mendaftar: {formatDateTime(participant.applied_at)}</p>
            </div>
            {participant.status === 'pending' && (
                <div className="border-t border-gray-100 grid grid-cols-2">
                    <button 
                        onClick={() => onStatusChange(participant.user_id, 'rejected')}
                        className="w-full py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                        Reject
                    </button>
                    <button 
                        onClick={() => onStatusChange(participant.user_id, 'approved')}
                        className="w-full py-3 text-sm font-medium text-green-600 hover:bg-green-50 border-l border-gray-100"
                    >
                        Approve
                    </button>
                </div>
            )}
        </div>
    );
}
