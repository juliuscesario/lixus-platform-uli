import React from 'react';

export default function PlaceholderPage({ title }) {
     return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <div className="mt-8 bg-white p-8 rounded-lg shadow-lg text-center">
                <p className="text-gray-600">Halaman ini sedang dalam pengembangan.</p>
            </div>
        </div>
    );
}
