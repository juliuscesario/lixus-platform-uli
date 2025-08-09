import React, { useState, useEffect } from 'react';
import { apiService, formatCompactNumber, formatDate } from '../../services/apiService';
import Select from 'react-select';

export default function InfluencerPerformanceReport() {
    const [influencers, setInfluencers] = useState([]);
    const [selectedInfluencer, setSelectedInfluencer] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch list of all influencers for the selector
    useEffect(() => {
        const fetchInfluencers = async () => {
            try {
                const response = await apiService.getInfluencersList();
                const influencerOptions = response.data.map(i => ({ value: i.id, label: i.name }));
                setInfluencers(influencerOptions);
            } catch (err) {
                console.error("Failed to load influencers list", err);
            }
        };
        fetchInfluencers();
    }, []);

    useEffect(() => {
        if (!selectedInfluencer) {
            setReportData(null);
            return;
        }

        const fetchReport = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiService.getInfluencerPerformanceReport(selectedInfluencer.value);
                setReportData(response.data);
            } catch (err) {
                setError('Failed to load influencer report.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();

    }, [selectedInfluencer]);

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Influencer Performance Scorecard</h2>
            <div className="max-w-md mb-6">
                <label htmlFor="influencer" className="block text-sm font-medium text-gray-700 mb-1">Select an Influencer</label>
                <Select
                    name="influencer"
                    options={influencers}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable
                    isSearchable
                    onChange={setSelectedInfluencer}
                    value={selectedInfluencer}
                />
            </div>

            {loading && <div>Loading report...</div>}
            {error && <div className="mt-4 text-red-500 p-4 bg-red-100 rounded-md">{error}</div>}

            {reportData && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Performance by Campaign</h3>
                         <div className="mt-2 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posts</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Likes</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg. Score</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reportData.performance_by_campaign.map(perf => (
                                        <tr key={perf.campaign_name}>
                                            <td className="px-6 py-4 font-medium">{perf.campaign_name}</td>
                                            <td className="px-6 py-4">{perf.total_posts}</td>
                                            <td className="px-6 py-4">{formatCompactNumber(perf.total_likes)}</td>
                                            <td className="px-6 py-4 font-bold text-indigo-600">{parseFloat(perf.average_score).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
                        <div className="mt-2 space-y-3">
                            {reportData.recent_posts.map(post => (
                                 <a href={post.post_url} target="_blank" rel="noopener noreferrer" key={post.post_url} className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <img src={post.media_url || 'https://placehold.co/100x100'} alt="Post media" className="w-16 h-16 object-cover rounded-md" />
                                        <div className="flex-grow">
                                            <p className="text-sm text-gray-600 line-clamp-2">{post.caption}</p>
                                            <div className="text-xs text-gray-500 mt-1">{formatDate(post.created_at)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg text-indigo-600">{parseFloat(post.score).toFixed(2)}</div>
                                            <div className="text-xs text-gray-500">Score</div>
                                        </div>
                                    </div>
                                 </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}