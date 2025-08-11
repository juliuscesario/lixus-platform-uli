import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-10 rounded-lg shadow-xl text-center">
                <h1 className="text-4xl font-bold text-red-500 mb-4">403</h1>
                <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-8">
                    Sorry, you do not have permission to access this page.
                </p>
                <Link
                    to="/dashboard"
                    className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default UnauthorizedPage;