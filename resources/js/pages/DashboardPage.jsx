import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const role = user?.role?.name;
            if (role === 'admin') {
                navigate('/admin/campaigns');
            } else if (role === 'influencer') {
                navigate('/influencer/my-campaigns');
            } else if (role === 'brand') {
                // Assuming a brand dashboard will be at /brand/campaigns
                navigate('/brand/campaigns');
            }
        }
    }, [user, navigate]);

    // Render a loading state while redirecting
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            <p className="ml-4 text-gray-700">Loading your dashboard...</p>
        </div>
    );
}