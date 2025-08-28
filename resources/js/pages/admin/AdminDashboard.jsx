import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    return (
        <div className="mt-8 bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800">Admin Dashboard Overview</h2>
            <p className="mt-2 text-gray-600">Welcome to the Admin Dashboard. Here you can manage campaigns, influencer applications, and view reports.</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-purple-100 p-6 rounded-lg">
                    <h3 className="font-bold text-purple-800">Manage Campaigns</h3>
                    <p className="text-purple-700 text-sm mt-1">Create, edit, and oversee all campaigns.</p>
                    <Link to="/admin/campaigns" className="mt-3 text-sm font-semibold text-purple-800 hover:underline">View Campaigns &rarr;</Link>
                </div>
                <div className="bg-yellow-100 p-6 rounded-lg">
                    <h3 className="font-bold text-yellow-800">Influencer Applications</h3>
                    <p className="text-yellow-700 text-sm mt-1">Review and manage incoming influencer applications.</p>
                    <Link to="/admin/applications" className="mt-3 text-sm font-semibold text-yellow-800 hover:underline">Manage Applications &rarr;</Link>
                </div>
                <div className="bg-red-100 p-6 rounded-lg">
                    <h3 className="font-bold text-red-800">Reporting & Analytics</h3>
                    <p className="text-red-700 text-sm mt-1">Access detailed reports on campaign performance and brand metrics.</p>
                    <Link to="/admin/reporting" className="mt-3 text-sm font-semibold text-red-800 hover:underline">View Reports &rarr;</Link>
                </div>
            </div>
        </div>
    );
}