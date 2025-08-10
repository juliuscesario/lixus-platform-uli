import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement, ArcElement, RadialLinearScale } from 'chart.js';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale);

// Icons
const IconTrendingUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconDollar = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;

export default function BrandPerformanceReport() {
    const [activeTab, setActiveTab] = useState('executive');
    const [dateRange, setDateRange] = useState('month');
    const [comparisonPeriod, setComparisonPeriod] = useState('previous');
    
    // Executive Overview Metrics
    const executiveMetrics = {
        totalCampaigns: 12,
        activeCampaigns: 4,
        totalInfluencers: 156,
        totalEngagement: 2847329,
        avgEngagementRate: 4.2,
        totalInvestment: 25000000,
        estimatedReach: 8234000,
        roi: 3.4
    };

    // Heatmap data for engagement
    const engagementHeatmap = {
        labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
        datasets: [
            { label: 'Monday', data: [20, 15, 25, 65, 78, 82, 95, 76], backgroundColor: 'rgba(255, 99, 132, 0.6)' },
            { label: 'Tuesday', data: [22, 18, 28, 70, 75, 85, 92, 73], backgroundColor: 'rgba(54, 162, 235, 0.6)' },
            { label: 'Wednesday', data: [25, 20, 30, 68, 80, 88, 98, 78], backgroundColor: 'rgba(255, 206, 86, 0.6)' },
            { label: 'Thursday', data: [23, 17, 27, 72, 77, 90, 94, 75], backgroundColor: 'rgba(75, 192, 192, 0.6)' },
            { label: 'Friday', data: [28, 22, 35, 75, 82, 92, 100, 80], backgroundColor: 'rgba(153, 102, 255, 0.6)' },
            { label: 'Saturday', data: [35, 30, 42, 60, 70, 78, 85, 88], backgroundColor: 'rgba(255, 159, 64, 0.6)' },
            { label: 'Sunday', data: [32, 28, 40, 58, 68, 75, 82, 85], backgroundColor: 'rgba(199, 199, 199, 0.6)' }
        ]
    };

    // Campaign comparison data
    const campaignComparison = {
        labels: ['Pepsodent Senyum', 'Lifebuoy Sehat', 'Rinso Active', 'Molto Fresh', 'Sunlight Clean'],
        datasets: [
            {
                label: 'Total Engagement',
                data: [450000, 380000, 420000, 350000, 390000],
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
            },
            {
                label: 'ROI (x)',
                data: [3.2, 2.8, 3.5, 2.5, 3.0],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            }
        ]
    };

    // Influencer tier performance
    const influencerTierData = {
        labels: ['Nano', 'Micro', 'Mid-tier', 'Macro', 'Mega'],
        datasets: [{
            label: 'Avg Engagement Rate (%)',
            data: [8.5, 6.2, 4.8, 3.2, 2.1],
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
        }]
    };

    // Content type performance radar
    const contentPerformanceData = {
        labels: ['Likes', 'Comments', 'Shares', 'Saves', 'Reach', 'Impressions'],
        datasets: [
            {
                label: 'Photo Posts',
                data: [85, 72, 65, 78, 88, 92],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                pointBackgroundColor: 'rgba(255, 99, 132, 1)',
            },
            {
                label: 'Video Posts',
                data: [92, 88, 85, 82, 95, 98],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            },
            {
                label: 'Stories',
                data: [78, 65, 55, 70, 82, 85],
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                pointBackgroundColor: 'rgba(255, 206, 86, 1)',
            }
        ]
    };

    // Engagement velocity over time
    const engagementVelocityData = {
        labels: ['1h', '2h', '3h', '6h', '12h', '24h', '48h', '72h', '1w'],
        datasets: [
            {
                label: 'Engagement Accumulation (%)',
                data: [25, 45, 60, 75, 85, 92, 95, 97, 100],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.4
            }
        ]
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const formatCurrency = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    const renderExecutiveDashboard = () => (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-xs sm:text-sm">Total Investment</p>
                            <p className="text-xl sm:text-2xl font-bold">{formatCurrency(executiveMetrics.totalInvestment)}</p>
                            <p className="text-blue-100 text-xs mt-1">+12% vs last period</p>
                        </div>
                        <IconDollar className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-xs sm:text-sm">ROI</p>
                            <p className="text-xl sm:text-2xl font-bold">{executiveMetrics.roi}x</p>
                            <p className="text-green-100 text-xs mt-1">+0.5x vs target</p>
                        </div>
                        <IconTrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-xs sm:text-sm">Total Reach</p>
                            <p className="text-xl sm:text-2xl font-bold">{formatNumber(executiveMetrics.estimatedReach)}</p>
                            <p className="text-purple-100 text-xs mt-1">156 influencers</p>
                        </div>
                        <IconUsers className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-xs sm:text-sm">Avg Engagement</p>
                            <p className="text-xl sm:text-2xl font-bold">{executiveMetrics.avgEngagementRate}%</p>
                            <p className="text-orange-100 text-xs mt-1">Above industry avg</p>
                        </div>
                        <IconCalendar className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                </div>
            </div>

            {/* Campaign Comparison Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Campaign Performance Comparison</h3>
                <Bar data={campaignComparison} options={{
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }} />
            </div>

            {/* Influencer Tier Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                    <h3 className="text-base sm:text-lg font-semibold mb-4">Influencer Tier Performance</h3>
                    <Doughnut data={influencerTierData} options={{
                        responsive: true,
                        plugins: {
                            legend: { position: 'bottom' }
                        }
                    }} />
                </div>
                
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                    <h3 className="text-base sm:text-lg font-semibold mb-4">Content Type Effectiveness</h3>
                    <Radar data={contentPerformanceData} options={{
                        responsive: true,
                        plugins: {
                            legend: { position: 'top' }
                        },
                        scales: {
                            r: {
                                min: 0,
                                max: 100,
                                ticks: { stepSize: 20 }
                            }
                        }
                    }} />
                </div>
            </div>
        </div>
    );

    const renderEngagementAnalytics = () => (
        <div className="space-y-6">
            {/* Engagement Heatmap */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Engagement Heatmap - Best Times</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">Darker colors indicate higher engagement</p>
                <Bar data={engagementHeatmap} options={{
                    responsive: true,
                    plugins: {
                        legend: { display: true, position: 'bottom' },
                        title: { display: false }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true,
                            title: { display: true, text: 'Engagement Score' }
                        },
                        x: {
                            title: { display: true, text: 'Time of Day' }
                        }
                    }
                }} />
            </div>

            {/* Engagement Velocity */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Engagement Velocity Curve</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">Content engagement accumulation rate</p>
                <Line data={engagementVelocityData} options={{
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: { display: false }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true,
                            max: 100,
                            title: { display: true, text: 'Cumulative Engagement (%)' }
                        },
                        x: {
                            title: { display: true, text: 'Time After Posting' }
                        }
                    }
                }} />
            </div>

            {/* Optimal Posting Windows */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold mb-4">AI Posting Schedule</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="border-l-4 border-green-500 p-3">
                        <p className="text-xs sm:text-sm text-gray-600">Primary Window</p>
                        <p className="text-base sm:text-lg font-semibold">18:00-21:00</p>
                        <p className="text-xs text-gray-500">95% potential</p>
                    </div>
                    <div className="border-l-4 border-yellow-500 p-3">
                        <p className="text-xs sm:text-sm text-gray-600">Secondary Window</p>
                        <p className="text-base sm:text-lg font-semibold">12:00-13:00</p>
                        <p className="text-xs text-gray-500">78% potential</p>
                    </div>
                    <div className="border-l-4 border-blue-500 p-3">
                        <p className="text-xs sm:text-sm text-gray-600">Weekend Window</p>
                        <p className="text-base sm:text-lg font-semibold">20:00-22:00</p>
                        <p className="text-xs text-gray-500">88% potential</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPredictiveAnalytics = () => (
        <div className="space-y-6">
            {/* Campaign Success Predictor */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 sm:p-6 rounded-xl text-white">
                <h3 className="text-base sm:text-xl font-semibold mb-4">Campaign Success Predictions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
                        <p className="text-indigo-100 text-xs sm:text-sm">Pepsodent Campaign</p>
                        <p className="text-xl sm:text-2xl font-bold">87%</p>
                        <p className="text-indigo-100 text-xs">Likelihood to succeed</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
                        <p className="text-indigo-100 text-xs sm:text-sm">Predicted Reach</p>
                        <p className="text-xl sm:text-2xl font-bold">12.5M</p>
                        <p className="text-indigo-100 text-xs">Based on velocity</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
                        <p className="text-indigo-100 text-xs sm:text-sm">Recommendation</p>
                        <p className="text-base sm:text-lg font-bold">Add 5 Micro Influencers</p>
                        <p className="text-indigo-100 text-xs">To ensure target</p>
                    </div>
                </div>
            </div>

            {/* Budget Optimization Recommendations */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Budget Optimization</h3>
                <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="mb-2 sm:mb-0">
                            <p className="font-medium text-sm sm:text-base">Increase Nano allocation</p>
                            <p className="text-xs sm:text-sm text-gray-600">ROI: 4.2x | Rec: +20% budget</p>
                        </div>
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">High</span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="mb-2 sm:mb-0">
                            <p className="font-medium text-sm sm:text-base">Optimize Macro selection</p>
                            <p className="text-xs sm:text-sm text-gray-600">ROI: 2.1x | Use performance contracts</p>
                        </div>
                        <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">Medium</span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="mb-2 sm:mb-0">
                            <p className="font-medium text-sm sm:text-base">Test TikTok campaigns</p>
                            <p className="text-xs sm:text-sm text-gray-600">Predicted ROI: 3.8x | Test budget: 5M</p>
                        </div>
                        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">Opportunity</span>
                    </div>
                </div>
            </div>

            {/* Influencer Recommendations */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Top Influencer Recommendations</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Influencer</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Tier</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Eng.</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Match</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">@fashion_jakarta</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm hidden sm:table-cell">Micro</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">8.5%</td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">95%</span>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">@healthy_life_id</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm hidden sm:table-cell">Nano</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">12.3%</td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">92%</span>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">@jakarta_foodie</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm hidden sm:table-cell">Mid-tier</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">6.7%</td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">88%</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900">Strategic Analytics</h1>
                    <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Real-time insights for campaign optimization</p>
                </div>

                {/* Date Range Selector */}
                <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm mb-6 flex flex-col sm:flex-row flex-wrap gap-4 items-center">
                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-700">Period:</label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="rounded-md border-gray-300 text-xs sm:text-sm w-full"
                        >
                            <option value="week">Last Week</option>
                            <option value="month">Last Month</option>
                            <option value="quarter">Last Quarter</option>
                            <option value="year">Last Year</option>
                        </select>
                    </div>
                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-700">Compare:</label>
                        <select
                            value={comparisonPeriod}
                            onChange={(e) => setComparisonPeriod(e.target.value)}
                            className="rounded-md border-gray-300 text-xs sm:text-sm w-full"
                        >
                            <option value="previous">Previous Period</option>
                            <option value="year">Same Period Last Year</option>
                            <option value="target">Target/Budget</option>
                        </select>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mb-6">
                    <div className="sm:hidden">
                        <select
                            id="report-tabs"
                            name="report-tabs"
                            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            onChange={(e) => setActiveTab(e.target.value)}
                            value={activeTab}
                        >
                            <option value="executive">Executive Overview</option>
                            <option value="engagement">Engagement Analytics</option>
                            <option value="predictive">Predictive Insights</option>
                        </select>
                    </div>
                    <div className="hidden sm:block bg-white rounded-xl shadow-sm">
                        <div className="flex flex-wrap border-b">
                            <button
                                onClick={() => setActiveTab('executive')}
                                className={`px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${activeTab === 'executive' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('engagement')}
                                className={`px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${activeTab === 'engagement' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Engagement
                            </button>
                            <button
                                onClick={() => setActiveTab('predictive')}
                                className={`px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${activeTab === 'predictive' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Predictive
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'executive' && renderExecutiveDashboard()}
                    {activeTab === 'engagement' && renderEngagementAnalytics()}
                    {activeTab === 'predictive' && renderPredictiveAnalytics()}
                </div>
            </div>
        </div>
    );
}