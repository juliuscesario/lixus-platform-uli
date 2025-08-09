import React, { useState, useEffect } from 'react';
import { apiService, formatCompactNumber } from '../../services/apiService';
import Select from 'react-select';

export default function CampaignComparisonReport() {
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaigns, setSelectedCampaigns] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch list of all campaigns for the selector
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await apiService.getCampaigns();
                const campaignOptions = response.data.map(c => ({ value: c.uuid, label: c.name }));
                setCampaigns(campaignOptions);
            } catch (err) {
                console.error("Failed to load campaigns list", err);
            }
        };
        fetchCampaigns();
    }, []);

    const handleCompare = async () => {
        if (selectedCampaigns.length < 2) {
            alert('Please select at least two campaigns to compare.');
            return;
        }
        setLoading(true);
        setError(null);
        setComparisonData([]);
        try {
            const campaignIds = selectedCampaigns.map(c => c.value);
            const response = await apiService.getCampaignComparisonReport(campaignIds);
            setComparisonData(response.data || []);
        } catch (err) {
            setError('Failed to load comparison data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Campaign Comparison</h2>
            <div className="bg-gray-100 p-4 rounded-lg flex flex-col md:flex-row items-center gap-4">
                <div className="flex-grow w-full">
                     <label htmlFor="campaigns" className="block text-sm font-medium text-gray-700 mb-1">Select Campaigns to Compare</label>
                    <Select
                        isMulti
                        name="campaigns"
                        options={campaigns}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={setSelectedCampaigns}
                        value={selectedCampaigns}
                    />
                </div>
                <button
                    onClick={handleCompare}
                    disabled={loading || selectedCampaigns.length < 2}
                    className="w-full md:w-auto bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                >
                    {loading ? 'Comparing...' : 'Compare'}
                </button>
            </div>

            {error && <div className="mt-4 text-red-500 p-4 bg-red-100 rounded-md">{error}</div>}

            {comparisonData.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                                {comparisonData.map(c => (
                                    <th key={c.campaign_id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{c.campaign_name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[
                                { label: 'Total Posts', key: 'total_posts' },
                                { label: 'Unique Influencers', key: 'unique_influencers' },
                                { label: 'Total Engagement', key: 'total_engagement' },
                                { label: 'Total Likes', key: 'total_likes' },
                                { label: 'Total Comments', key: 'total_comments' },
                            ].map(metric => (
                                <tr key={metric.key}>
                                    <td className="px-6 py-4 font-medium text-gray-900">{metric.label}</td>
                                    {comparisonData.map(c => (
                                        <td key={c.campaign_id} className="px-6 py-4">{formatCompactNumber(c[metric.key])}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}