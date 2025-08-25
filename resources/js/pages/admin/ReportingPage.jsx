import React, { useState, useEffect, useMemo } from 'react';
import useApi from '../../hooks/useApi';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const IconDownload = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> );
const IconCalendar = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> );
const IconTrendingUp = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg> );
const IconFilter = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/></svg> );

const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
};

export default function ReportingPage() {
    const { api } = useApi();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState('all');
    const [dateRange, setDateRange] = useState('30'); // days
    const [reportData, setReportData] = useState({
        overview: {},
        campaignMetrics: [],
        influencerMetrics: [],
        engagementData: [],
        performanceByPlatform: {}
    });

    const fetchReportingData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Fetch campaigns for filter dropdown
            const campaignsResponse = await api('getAdminCampaigns');
            setCampaigns(campaignsResponse.data || []);
            
            // Fetch reporting data
            const params = {
                campaign_id: selectedCampaign !== 'all' ? selectedCampaign : null,
                date_range: dateRange
            };
            
            // Get overview stats
            const overviewResponse = await api('getDashboardStats');
            
            // Get campaign metrics
            const campaignMetricsResponse = await api('getCampaignMetrics', params);
            
            // Get influencer performance
            const influencerMetricsResponse = await api('getInfluencerMetrics', params);
            
            setReportData({
                overview: overviewResponse.data || {},
                campaignMetrics: campaignMetricsResponse.data || [],
                influencerMetrics: influencerMetricsResponse.data || [],
                engagementData: campaignMetricsResponse.engagement_timeline || [],
                performanceByPlatform: campaignMetricsResponse.platform_breakdown || {}
            });
            
        } catch (err) {
            if (err.message.includes('401') || err.message.includes('Session expired')) {
                // Session expired - handled by AuthContext automatically
            } else if (err.message.includes('403')) {
                setError("You don't have permission to view reporting data.");
            } else {
                setError('Failed to load reporting data.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportingData();
    }, [selectedCampaign, dateRange]);

    const exportReport = async (format = 'csv') => {
        try {
            const params = {
                campaign_id: selectedCampaign !== 'all' ? selectedCampaign : null,
                date_range: dateRange,
                format: format
            };
            
            const response = await api('exportReport', params);
            
            // Create download link
            const blob = new Blob([response.data], { 
                type: format === 'csv' ? 'text/csv' : 'application/pdf' 
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `campaign-report-${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (err) {
            alert('Failed to export report: ' + err.message);
        }
    };

    // Chart configurations
    const engagementChartData = {
        labels: reportData.engagementData.map(item => item.date),
        datasets: [
            {
                label: 'Likes',
                data: reportData.engagementData.map(item => item.likes),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            },
            {
                label: 'Comments',
                data: reportData.engagementData.map(item => item.comments),
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            },
            {
                label: 'Shares',
                data: reportData.engagementData.map(item => item.shares),
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4
            }
        ]
    };

    const campaignPerformanceData = {
        labels: reportData.campaignMetrics.map(campaign => campaign.name),
        datasets: [
            {
                label: 'Total Engagement',
                data: reportData.campaignMetrics.map(campaign => campaign.total_engagement),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ]
            }
        ]
    };

    const platformPerformanceData = {
        labels: Object.keys(reportData.performanceByPlatform),
        datasets: [
            {
                data: Object.values(reportData.performanceByPlatform),
                backgroundColor: [
                    '#E1306C', // Instagram
                    '#000000', // TikTok
                    '#1DA1F2', // Twitter
                    '#4267B2', // Facebook
                    '#FF0000'  // YouTube
                ]
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Engagement Over Time'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div>Loading reports...</div></div>;
    if (error) return <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <IconTrendingUp />
                            Campaign Analytics & Reports
                        </h1>
                        <p className="text-gray-600">Track performance and generate insights from your campaigns</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Campaign Filter */}
                        <select
                            value={selectedCampaign}
                            onChange={(e) => setSelectedCampaign(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm text-sm"
                        >
                            <option value="all">All Campaigns</option>
                            {campaigns.map(campaign => (
                                <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                            ))}
                        </select>
                        
                        {/* Date Range Filter */}
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm text-sm"
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 3 months</option>
                            <option value="365">Last year</option>
                        </select>
                        
                        {/* Export Buttons */}
                        <button
                            onClick={() => exportReport('csv')}
                            className="bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 flex items-center gap-1"
                        >
                            <IconDownload />
                            CSV
                        </button>
                        <button
                            onClick={() => exportReport('pdf')}
                            className="bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700 flex items-center gap-1"
                        >
                            <IconDownload />
                            PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="text-sm font-medium text-gray-500">Total Campaigns</div>
                    <div className="text-3xl font-bold text-blue-600">{reportData.overview.total_campaigns || 0}</div>
                    <div className="text-sm text-green-600">+12% from last month</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="text-sm font-medium text-gray-500">Active Influencers</div>
                    <div className="text-3xl font-bold text-green-600">{reportData.overview.active_influencers || 0}</div>
                    <div className="text-sm text-green-600">+8% from last month</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="text-sm font-medium text-gray-500">Total Engagement</div>
                    <div className="text-3xl font-bold text-purple-600">{formatNumber(reportData.overview.total_engagement || 0)}</div>
                    <div className="text-sm text-green-600">+23% from last month</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="text-sm font-medium text-gray-500">Content Created</div>
                    <div className="text-3xl font-bold text-orange-600">{reportData.overview.total_posts || 0}</div>
                    <div className="text-sm text-green-600">+15% from last month</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Engagement Timeline */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Engagement Over Time</h3>
                    <Line data={engagementChartData} options={chartOptions} />
                </div>

                {/* Platform Performance */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance by Platform</h3>
                    <Doughnut 
                        data={platformPerformanceData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Campaign Performance */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Campaign Performance Comparison</h3>
                <Bar 
                    data={campaignPerformanceData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }}
                />
            </div>

            {/* Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Campaigns */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Campaigns</h3>
                    <div className="space-y-3">
                        {reportData.campaignMetrics.slice(0, 5).map((campaign, index) => (
                            <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{campaign.name}</div>
                                        <div className="text-sm text-gray-500">{campaign.total_participants} participants</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-green-600">{formatNumber(campaign.total_engagement)}</div>
                                    <div className="text-xs text-gray-500">engagement</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Influencers */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Influencers</h3>
                    <div className="space-y-3">
                        {reportData.influencerMetrics.slice(0, 5).map((influencer, index) => (
                            <div key={influencer.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{influencer.name}</div>
                                        <div className="text-sm text-gray-500">{influencer.total_posts} posts</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-purple-600">{formatNumber(influencer.total_score)}</div>
                                    <div className="text-xs text-gray-500">points</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}