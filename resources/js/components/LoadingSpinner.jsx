import React from 'react';

const LoadingSpinner = ({ size = 'large', text = 'Loading...' }) => {
    const sizeClasses = {
        small: 'h-4 w-4',
        medium: 'h-8 w-8',
        large: 'h-12 w-12'
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="flex flex-col items-center space-y-4">
                <div 
                    className={`animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
                ></div>
                
                {text && (
                    <p className="text-gray-600 text-sm font-medium">
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoadingSpinner;