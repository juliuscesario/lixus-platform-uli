import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useApi from '../hooks/useApi';

const IconArrowLeft = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> );
const IconInstagram = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg> );
const IconYoutube = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg> );
const IconFacebook = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> );
const IconTiktok = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg> );
const IconExternalLink = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg> );
const IconMapPin = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> );
const IconCalendar = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> );

const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
};

const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
        case 'instagram': return <IconInstagram />;
        case 'youtube': return <IconYoutube />;
        case 'facebook': return <IconFacebook />;
        case 'tiktok': return <IconTiktok />;
        default: return <IconExternalLink />;
    }
};

const getPlatformColor = (platform) => {
    switch (platform.toLowerCase()) {
        case 'instagram': return 'bg-pink-500';
        case 'youtube': return 'bg-red-500';
        case 'facebook': return 'bg-blue-600';
        case 'tiktok': return 'bg-black';
        default: return 'bg-gray-500';
    }
};

export default function InfluencerDetailPage() {
    const { api } = useApi();
    const { id } = useParams();
    const [influencer, setInfluencer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInfluencer = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await api('getInfluencerDetail', id);
                if (response && response.data) {
                    setInfluencer(response.data);
                } else {
                    setError("Influencer not found.");
                }
            } catch (err) {
                console.error("Failed to fetch influencer:", err);
                if (err.message.includes('401') || err.message.includes('Session expired')) {
                    // Session expired - handled by AuthContext automatically
                } else if (err.message.includes('404')) {
                    setError("Influencer not found.");
                } else if (err.message.includes('network')) {
                    setError("Network error. Please check your connection and try again.");
                } else {
                    setError("Unable to load influencer data. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchInfluencer();
        }
    }, [id, api]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading influencer profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                    <div className="space-x-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
                        >
                            Try Again
                        </button>
                        <Link 
                            to="/influencers"
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Back to Influencers
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!influencer) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Influencer Not Found</h2>
                    <Link 
                        to="/influencers"
                        className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
                    >
                        Back to Influencers
                    </Link>
                </div>
            </div>
        );
    }

    const profile = influencer.influencer_profile || {};
    const socialAccounts = influencer.social_media_accounts || [];
    const totalFollowers = socialAccounts.reduce((sum, account) => sum + (parseInt(account.followers_count) || 0), 0);

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <div className="mb-6">
                <Link 
                    to="/influencers" 
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
                >
                    <IconArrowLeft /> Back to Influencers
                </Link>
            </div>

            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-32"></div>
                <div className="relative px-6 pb-6">
                    {/* Profile Picture */}
                    <div className="absolute -top-16">
                        <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                            {profile.avatar_url ? (
                                <img 
                                    src={profile.avatar_url} 
                                    alt={influencer.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-4xl font-bold text-gray-400">
                                    {influencer.name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="pt-20">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{influencer.name}</h1>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                                    {profile.city && (
                                        <div className="flex items-center gap-1">
                                            <IconMapPin />
                                            {profile.city}
                                        </div>
                                    )}
                                    {profile.date_of_birth && (
                                        <div className="flex items-center gap-1">
                                            <IconCalendar />
                                            {new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()} years old
                                        </div>
                                    )}
                                    {profile.gender && (
                                        <div className="capitalize">{profile.gender}</div>
                                    )}
                                </div>
                                {profile.bio && (
                                    <p className="text-gray-700 mb-6 leading-relaxed">{profile.bio}</p>
                                )}
                            </div>
                            
                            {/* Stats */}
                            <div className="bg-gray-50 rounded-lg p-6 md:ml-6 md:w-64">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Followers</span>
                                        <span className="font-bold text-pink-600">{formatNumber(totalFollowers)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Platforms</span>
                                        <span className="font-bold">{socialAccounts.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Member Since</span>
                                        <span className="font-bold">
                                            {new Date(influencer.created_at).toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                year: 'numeric' 
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Media Accounts */}
            {socialAccounts.length > 0 && (
                <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Social Media Presence</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {socialAccounts.map((account, index) => (
                            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 ${getPlatformColor(account.platform)} rounded-full flex items-center justify-center text-white`}>
                                            {getPlatformIcon(account.platform)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold capitalize">{account.platform}</h3>
                                            <p className="text-sm text-gray-600">@{account.username}</p>
                                        </div>
                                    </div>
                                    {account.account_url && (
                                        <a 
                                            href={account.account_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <IconExternalLink />
                                        </a>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-gray-600">Followers</div>
                                        <div className="font-bold text-lg">{formatNumber(account.followers_count || 0)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Posts</div>
                                        <div className="font-bold text-lg">{formatNumber(account.total_posts || 0)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Following</div>
                                        <div className="font-bold">{formatNumber(account.total_following || 0)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Active Since</div>
                                        <div className="font-bold">
                                            {account.account_created_date ? 
                                                new Date(account.account_created_date).getFullYear() : 
                                                'Unknown'
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Engagement Metrics */}
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Engagement Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            {((totalFollowers > 0 ? (socialAccounts.reduce((sum, acc) => sum + (acc.average_engagement_rate || 0), 0) / socialAccounts.length) : 0) * 100).toFixed(1)}%
                        </div>
                        <div className="text-gray-600">Avg Engagement Rate</div>
                    </div>
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {socialAccounts.reduce((sum, acc) => sum + (acc.total_posts || 0), 0)}
                        </div>
                        <div className="text-gray-600">Total Posts</div>
                    </div>
                    <div className="text-center p-6 bg-purple-50 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                            {socialAccounts.length}
                        </div>
                        <div className="text-gray-600">Active Platforms</div>
                    </div>
                </div>
            </div>

            {/* Contact CTA */}
            <div className="mt-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-8 text-center text-white">
                <h2 className="text-2xl font-bold mb-4">Interested in Collaborating?</h2>
                <p className="mb-6 opacity-90">
                    Connect with {influencer.name} through our platform for authentic brand partnerships.
                </p>
                <div className="space-x-4">
                    <Link
                        to="/login"
                        className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white hover:text-pink-600 transition-colors"
                    >
                        Login to Connect
                    </Link>
                    <Link
                        to="/apply-influencer"
                        className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-pink-600 bg-white hover:bg-pink-50 transition-colors"
                    >
                        Join as Influencer
                    </Link>
                </div>
            </div>
        </div>
    );
}