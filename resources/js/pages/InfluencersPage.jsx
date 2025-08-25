import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi';
import InfluencerCard from '../components/InfluencerCard';

const IconSearch = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> );
const IconFilter = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/></svg> );

export default function InfluencersPage() {
    const { api } = useApi();
    const [influencers, setInfluencers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [platformFilter, setPlatformFilter] = useState('all');
    const [minFollowers, setMinFollowers] = useState('');
    const [maxFollowers, setMaxFollowers] = useState('');

    useEffect(() => {
        const fetchInfluencers = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await api('getPublicInfluencers');
                if (response && response.data) {
                    setInfluencers(response.data);
                } else {
                    setError("Unable to load influencer data. Please try again later.");
                }
            } catch (err) {
                console.error("Failed to fetch influencers:", err);
                if (err.message.includes('401') || err.message.includes('Session expired')) {
                    // Session expired - handled by AuthContext automatically
                } else if (err.message.includes('network')) {
                    setError("Network error. Please check your connection and try again.");
                } else {
                    setError("Unable to load influencer data. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchInfluencers();
    }, [api]);

    // Filter influencers based on search and filters
    const filteredInfluencers = influencers.filter(influencer => {
        // Search filter
        const matchesSearch = !searchTerm || 
            influencer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            influencer.influencer_profile?.bio?.toLowerCase().includes(searchTerm.toLowerCase());

        // Platform filter
        const matchesPlatform = platformFilter === 'all' || 
            influencer.social_media_accounts?.some(account => 
                account.platform?.toLowerCase() === platformFilter.toLowerCase()
            );

        // Followers range filter
        const totalFollowers = influencer.social_media_accounts?.reduce(
            (sum, account) => sum + (parseInt(account.followers_count) || 0), 0
        ) || 0;
        
        const matchesMinFollowers = !minFollowers || totalFollowers >= parseInt(minFollowers);
        const matchesMaxFollowers = !maxFollowers || totalFollowers <= parseInt(maxFollowers);

        return matchesSearch && matchesPlatform && matchesMinFollowers && matchesMaxFollowers;
    });

    const clearFilters = () => {
        setSearchTerm('');
        setPlatformFilter('all');
        setMinFollowers('');
        setMaxFollowers('');
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading talented influencers...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
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
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900">Discover Talented Influencers</h1>
                <p className="mt-4 text-lg text-gray-600">
                    Connect with verified content creators and build authentic partnerships
                </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IconSearch />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or bio..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm pl-10 py-2 focus:ring-pink-500 focus:border-pink-500"
                            />
                        </div>
                    </div>

                    {/* Platform Filter */}
                    <div>
                        <select
                            value={platformFilter}
                            onChange={(e) => setPlatformFilter(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm py-2 focus:ring-pink-500 focus:border-pink-500"
                        >
                            <option value="all">All Platforms</option>
                            <option value="instagram">Instagram</option>
                            <option value="tiktok">TikTok</option>
                            <option value="youtube">YouTube</option>
                            <option value="facebook">Facebook</option>
                            <option value="twitter">Twitter</option>
                        </select>
                    </div>

                    {/* Min Followers */}
                    <div>
                        <input
                            type="number"
                            placeholder="Min followers"
                            value={minFollowers}
                            onChange={(e) => setMinFollowers(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm py-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>

                    {/* Max Followers */}
                    <div>
                        <input
                            type="number"
                            placeholder="Max followers"
                            value={maxFollowers}
                            onChange={(e) => setMaxFollowers(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm py-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>
                </div>

                {/* Active Filters & Clear */}
                {(searchTerm || platformFilter !== 'all' || minFollowers || maxFollowers) && (
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                            {searchTerm && (
                                <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">
                                    Search: {searchTerm}
                                </span>
                            )}
                            {platformFilter !== 'all' && (
                                <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm capitalize">
                                    Platform: {platformFilter}
                                </span>
                            )}
                            {minFollowers && (
                                <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">
                                    Min: {parseInt(minFollowers).toLocaleString()} followers
                                </span>
                            )}
                            {maxFollowers && (
                                <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">
                                    Max: {parseInt(maxFollowers).toLocaleString()} followers
                                </span>
                            )}
                        </div>
                        <button
                            onClick={clearFilters}
                            className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Results Count */}
            <div className="mb-6">
                <p className="text-gray-600">
                    {filteredInfluencers.length === influencers.length 
                        ? `Showing all ${influencers.length} influencers`
                        : `Showing ${filteredInfluencers.length} of ${influencers.length} influencers`
                    }
                </p>
            </div>

            {/* Influencers Grid */}
            {filteredInfluencers.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {filteredInfluencers.map(influencer => (
                        <InfluencerCard key={influencer.id} influencer={influencer} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    {influencers.length === 0 ? (
                        <>
                            <div className="mb-4">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No influencers yet</h3>
                            <p className="text-gray-600 mb-6">Be the first to join our platform and start collaborating with brands!</p>
                            <Link
                                to="/apply-influencer"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                            >
                                Apply to Become an Influencer
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="mb-4">
                                <IconFilter className="mx-auto h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No influencers match your filters</h3>
                            <p className="text-gray-600 mb-6">Try adjusting your search criteria or clear all filters to see more results.</p>
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                            >
                                Clear All Filters
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* CTA Section */}
            <div className="mt-16 bg-pink-50 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Are you an influencer?
                </h2>
                <p className="text-gray-600 mb-6">
                    Join our platform and connect with amazing brands looking for authentic partnerships.
                </p>
                <Link
                    to="/apply-influencer"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                >
                    Apply Now
                </Link>
            </div>
        </div>
    );
}