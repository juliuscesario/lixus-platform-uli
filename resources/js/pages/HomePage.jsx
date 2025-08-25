import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import CampaignCard from '../components/CampaignCard';

export default function HomePage({ user }) {
    const { api } = useApi();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCampaigns = async () => {
            setLoading(true);
            setError(null);
            setCampaigns([]); 

            try {
                let response;

                if (user?.role === 'brand' || user?.role === 'admin') {
                    response = await api('getAdminCampaigns');
                } else if (user?.role === 'influencer') {
                    response = await api('getPublicCampaignsbyStatus');
                } else {
                    // This will run if 'user' is null or has a different role
                    response = await api('getPublicCampaigns');
                }

                if (response?.data) {
                    setCampaigns(response.data);
                } else {
                    setError("Campaign data not found.");
                }
            } catch (error) {
                console.error("Failed to fetch campaigns:", error);
                if (error.message.includes('401') || error.message.includes('Session expired')) {
                    // Session expired - handled by AuthContext automatically
                } else if (error.message.includes('403')) {
                    setError("You don't have permission to view campaigns.");
                } else if (error.message.includes('network')) {
                    setError("Network error. Please check your connection and try again.");
                } else {
                    setError("Unable to load campaign data. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, [user, api]); 

    const renderActionButtons = () => {
        if (user) {
            if (user.role === 'influencer') {
                return (
                    <div className="inline-flex rounded-md shadow">
                        <Link 
                            to="/dashboard"
                            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-500 hover:bg-pink-600"
                        >
                            Go to My Dashboard
                        </Link>
                    </div>
                );
            }
            if (user.role === 'brand' || user.role === 'admin') {
                return (
                    <div className="inline-flex rounded-md shadow">
                        <Link 
                            to="/admin/campaigns/create"
                            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-500 hover:bg-pink-600"
                        >
                            Create New Campaign
                        </Link>
                    </div>
                );
            }
        }

        // For non-authenticated users
        return (
            <div className="inline-flex rounded-md shadow">
                <Link 
                    to="/apply-influencer"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-500 hover:bg-pink-600"
                >
                    Join as Influencer
                </Link>
            </div>
        );
    };

    const renderCampaignSection = () => {
        if (loading) {
            return (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading campaigns...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-12">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        if (campaigns.length === 0) {
            return (
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns available</h3>
                    <p className="text-gray-600">Check back soon for new opportunities!</p>
                </div>
            );
        }

        return (
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    {user?.role === 'brand' || user?.role === 'admin' ? 'Your Campaigns' : 'Available Campaigns'}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {campaigns.slice(0, 6).map(campaign => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                </div>
                {campaigns.length > 6 && (
                    <div className="text-center mt-8">
                        <Link 
                            to={user?.role === 'brand' || user?.role === 'admin' ? "/admin/campaigns" : "/campaigns"}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-pink-600 bg-pink-100 hover:bg-pink-200"
                        >
                            View All Campaigns
                        </Link>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                            Connect Brands with Influencers
                        </h1>
                        <p className="mt-4 text-xl text-pink-100 max-w-3xl mx-auto">
                            The ultimate platform for brand activation campaigns. Join thousands of influencers and brands creating authentic connections.
                        </p>
                        <div className="mt-8">
                            {renderActionButtons()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Trusted by Industry Leaders
                        </h2>
                        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-pink-600">1000+</div>
                                <div className="text-gray-600">Active Influencers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-pink-600">500+</div>
                                <div className="text-gray-600">Campaigns Launched</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-pink-600">50M+</div>
                                <div className="text-gray-600">Total Reach</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-pink-600">95%</div>
                                <div className="text-gray-600">Success Rate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaigns Section */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {renderCampaignSection()}
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Why Choose Our Platform?
                        </h2>
                        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="text-center">
                                <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Influencers</h3>
                                <p className="text-gray-600">All influencers are verified with authentic followers and engagement rates.</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Analytics</h3>
                                <p className="text-gray-600">Track campaign performance with detailed analytics and insights.</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payments</h3>
                                <p className="text-gray-600">Automated and secure payment system with transparent pricing.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-pink-600">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-white">
                            Ready to Start Your Campaign?
                        </h2>
                        <p className="mt-4 text-xl text-pink-100">
                            Join thousands of successful brands and influencers today.
                        </p>
                        <div className="mt-8 flex justify-center space-x-4">
                            <Link 
                                to="/apply-influencer"
                                className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-pink-600 bg-white hover:bg-pink-50"
                            >
                                Join as Influencer
                            </Link>
                            <Link 
                                to="/login"
                                className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-pink-700"
                            >
                                Login as Brand
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}