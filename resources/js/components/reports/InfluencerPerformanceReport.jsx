import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement, ArcElement, RadialLinearScale } from 'chart.js';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale);

// Icons
const IconFilter = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const IconTrendingUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconInstagram = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const IconTiktok = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/></svg>;

export default function InfluencerPerformanceAnalytics() {
  const [viewMode, setViewMode] = useState('all'); // 'all', 'single', 'comparison'
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterCampaign, setFilterCampaign] = useState('all');
  const [timeFrame, setTimeFrame] = useState('30days');
  const [selectedInfluencers, setSelectedInfluencers] = useState([]);
  const [influencerSearch, setInfluencerSearch] = useState('');
  const [selectedInfluencerId, setSelectedInfluencerId] = useState(null);

  useEffect(() => {
    if (selectedInfluencers.length === 2) {
      setViewMode('comparison');
    }
  }, [selectedInfluencers]);
  
  // Mock data - in production this would come from your API
  const influencersData = [
    { id: 1, name: '@fashion_jakarta', platform: 'instagram', tier: 'Micro', followers: 45000, avgEngagement: 8.5, totalPosts: 125, totalReach: 2850000 },
    { id: 2, name: '@healthy_life_id', platform: 'tiktok', tier: 'Nano', followers: 8500, avgEngagement: 12.3, totalPosts: 89, totalReach: 890000 },
    { id: 3, name: '@jakarta_foodie', platform: 'instagram', tier: 'Mid-tier', followers: 125000, avgEngagement: 6.7, totalPosts: 203, totalReach: 8500000 },
    { id: 4, name: '@beauty_trends', platform: 'tiktok', tier: 'Micro', followers: 35000, avgEngagement: 9.8, totalPosts: 156, totalReach: 3200000 },
    { id: 5, name: '@lifestyle_indo', platform: 'instagram', tier: 'Macro', followers: 550000, avgEngagement: 4.2, totalPosts: 342, totalReach: 25000000 },
  ];

  const campaignsData = [
    { id: 1, name: 'Pepsodent Senyum Indonesia', status: 'active' },
    { id: 2, name: 'Lifebuoy Sehat', status: 'completed' },
    { id: 3, name: 'Rinso Active Clean', status: 'active' },
    { id: 4, name: 'Molto Fresh', status: 'completed' },
  ];

  // Filter influencers based on selected filters
  const filteredInfluencers = influencersData.filter(inf => {
    if (filterPlatform !== 'all' && inf.platform !== filterPlatform) return false;
    // Note: Campaign filtering logic is mocked. In a real app, you'd have influencer-campaign relations.
    if (filterCampaign !== 'all' && inf.id % 2 === 0) return false; // Example logic
    if (influencerSearch && !inf.name.toLowerCase().includes(influencerSearch.toLowerCase())) return false;
    return true;
  });

  const selectedInfluencer = influencersData.find(inf => inf.id === selectedInfluencerId);

  // Platform distribution chart
  const platformDistribution = {
    labels: ['Instagram', 'TikTok', 'YouTube', 'Facebook'],
    datasets: [{
      label: 'Influencer Distribution',
      data: [65, 45, 15, 8],
      backgroundColor: [
        'rgba(225, 48, 108, 0.8)',
        'rgba(0, 0, 0, 0.8)',
        'rgba(255, 0, 0, 0.8)',
        'rgba(66, 103, 178, 0.8)'
      ],
    }]
  };

  // Performance over time
  const performanceOverTime = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Average Engagement Rate (%)',
        data: [7.2, 7.8, 8.1, 8.5, 9.2, 8.9],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Total Reach (Millions)',
        data: [2.5, 3.1, 3.8, 4.2, 5.1, 4.8],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
      }
    ]
  };

  // Tier performance comparison
  const tierPerformance = {
    labels: ['Engagement Rate', 'Cost Efficiency', 'Reach', 'Content Quality', 'Brand Fit', 'Consistency'],
    datasets: [
      {
        label: 'Nano (1K-10K)',
        data: [95, 98, 45, 78, 82, 88],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
      },
      {
        label: 'Micro (10K-100K)',
        data: [85, 88, 65, 85, 88, 92],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
      },
      {
        label: 'Macro (100K-1M)',
        data: [65, 70, 95, 92, 85, 85],
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
      }
    ]
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const renderInfluencerCard = (influencer, index) => (
    <div key={influencer.id} className="bg-white rounded-lg shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
            {index + 1}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{influencer.name}</h4>
            <p className="text-xs sm:text-sm text-gray-500">{influencer.tier} • {formatNumber(influencer.followers)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {influencer.platform === 'instagram' ? <IconInstagram className="w-4 h-4 sm:w-5 sm:h-5" /> : <IconTiktok className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-500">Eng.</p>
          <p className="text-base sm:text-lg font-bold text-green-600">{influencer.avgEngagement}%</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-500">Posts</p>
          <p className="text-base sm:text-lg font-bold text-blue-600">{influencer.totalPosts}</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-500">Reach</p>
          <p className="text-base sm:text-lg font-bold text-purple-600">{formatNumber(influencer.totalReach)}</p>
        </div>
      </div>
      
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            setViewMode('single');
            setSelectedInfluencerId(influencer.id);
          }}
          className="flex-1 bg-indigo-600 text-white py-1.5 px-3 rounded text-xs sm:text-sm hover:bg-indigo-700"
        >
          Details
        </button>
        <button
          onClick={() => {
            if (selectedInfluencers.find(i => i.id === influencer.id)) {
              setSelectedInfluencers(selectedInfluencers.filter(i => i.id !== influencer.id));
            } else if (selectedInfluencers.length < 2) {
              setSelectedInfluencers([...selectedInfluencers, influencer]);
            }
          }}
          className={`flex-1 py-1.5 px-3 rounded text-xs sm:text-sm border ${
            selectedInfluencers.find(i => i.id === influencer.id)
              ? 'bg-green-50 border-green-500 text-green-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {selectedInfluencers.find(i => i.id === influencer.id) ? 'Selected' : 'Compare'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Influencer Performance</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Analytics across all influencers and platforms</p>
          </div>
        </div>
      </div>
      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* View Mode */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">View</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="w-full rounded-md border-gray-300 text-sm"
            >
              <option value="all">All Influencers</option>
              <option value="single">Single Analysis</option>
              <option value="comparison">Comparison Mode</option>
            </select>
          </div>

          {/* Platform Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Platform</label>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="w-full rounded-md border-gray-300 text-sm"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>

          {/* Campaign Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Campaign</label>
            <select
              value={filterCampaign}
              onChange={(e) => setFilterCampaign(e.target.value)}
              className="w-full rounded-md border-gray-300 text-sm"
            >
              <option value="all">All Campaigns</option>
              {campaignsData.map(campaign => (
                <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
              ))}
            </select>
          </div>

          {/* Time Frame */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="w-full rounded-md border-gray-300 text-sm"
            >
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
          </div>

          {/* Search */}
          <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Find influencer..."
              value={influencerSearch}
              onChange={(e) => setInfluencerSearch(e.target.value)}
              className="w-full rounded-md border-gray-300 text-sm"
            />
          </div>
        </div>

        {/* Selected for Comparison */}
        {viewMode !== 'comparison' && selectedInfluencers.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <p className="text-sm font-medium text-blue-900 mb-2 sm:mb-0">
                {selectedInfluencers.length} selected for comparison
              </p>
              <div className="flex gap-2 self-stretch sm:self-auto">
                <button
                  onClick={() => setViewMode('comparison')}
                  className="flex-1 sm:flex-initial px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  disabled={selectedInfluencers.length < 2}
                >
                  Compare ({selectedInfluencers.length})
                </button>
                <button
                  onClick={() => setSelectedInfluencers([])}
                  className="flex-1 sm:flex-initial px-3 py-1 bg-white text-blue-600 border border-blue-300 rounded text-sm hover:bg-blue-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Influencers</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{filteredInfluencers.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <IconUsers className="text-blue-600 w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Avg. Eng.</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {(filteredInfluencers.reduce((acc, curr) => acc + curr.avgEngagement, 0) / filteredInfluencers.length).toFixed(1) || 0}%
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <IconTrendingUp className="text-green-600 w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Reach</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {formatNumber(filteredInfluencers.reduce((acc, curr) => acc + curr.totalReach, 0))}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Content</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {formatNumber(filteredInfluencers.reduce((acc, curr) => acc + curr.totalPosts, 0))}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'all' && (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Platform Distribution</h3>
              <Doughnut data={platformDistribution} options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' }
                }
              }} />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Performance Trends</h3>
              <Line data={performanceOverTime} options={{
                responsive: true,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                      display: true,
                      text: 'Engagement Rate (%)'
                    }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                      display: true,
                      text: 'Reach (Millions)'
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                },
              }} />
            </div>
          </div>

          {/* Tier Performance Analysis */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Tier Performance Analysis</h3>
            <div className="mb-4 text-xs sm:text-sm text-gray-600">
              <p>Compare performance metrics across influencer tiers to optimize strategy.</p>
            </div>
            <Radar data={tierPerformance} options={{
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

          {/* Top Performing Influencers */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h3 className="text-base sm:text-lg font-semibold">Top Performing Influencers</h3>
              <select className="text-sm border-gray-300 rounded-md w-full sm:w-auto">
                <option>Sort by Engagement</option>
                <option>Sort by Reach</option>
                <option>Sort by Posts</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInfluencers.map((influencer, index) => renderInfluencerCard(influencer, index))}
            </div>
          </div>
        </>
      )}

      {viewMode === 'comparison' && selectedInfluencers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Influencer Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Influencer</th>
                  <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Platform</th>
                  <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Eng.</th>
                  <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Reach</th>
                  <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedInfluencers.map((inf) => (
                  <tr key={inf.id}>
                    <td className="px-2 py-3 sm:px-4 sm:py-4 whitespace-nowrap font-medium">{inf.name}</td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4 whitespace-nowrap hidden md:table-cell">
                      <span className="capitalize">{inf.platform}</span>
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4 whitespace-nowrap">
                      <span className="text-green-600 font-semibold">{inf.avgEngagement}%</span>
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4 whitespace-nowrap hidden sm:table-cell">{formatNumber(inf.totalReach)}</td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-semibold">
                          {Math.round(inf.avgEngagement * 5 + (inf.totalReach / 500000))}
                        </span>
                        <div className="ml-2 w-12 sm:w-16 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{width: `${Math.min(100, inf.avgEngagement * 10)}%`}}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Comparison Charts */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-semibold mb-3">Engagement Comparison</h4>
              <Bar data={{
                labels: selectedInfluencers.map(i => i.name),
                datasets: [{
                  label: 'Engagement Rate (%)',
                  data: selectedInfluencers.map(i => i.avgEngagement),
                  backgroundColor: 'rgba(34, 197, 94, 0.8)',
                }]
              }} options={{
                responsive: true,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }} />
            </div>

            <div>
              <h4 className="text-md font-semibold mb-3">Reach Comparison</h4>
              <Bar data={{
                labels: selectedInfluencers.map(i => i.name),
                datasets: [{
                  label: 'Total Reach',
                  data: selectedInfluencers.map(i => i.totalReach),
                  backgroundColor: 'rgba(139, 92, 246, 0.8)',
                }]
              }} options={{
                responsive: true,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: { 
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return value >= 1000000 ? (value/1000000) + 'M' : value >= 1000 ? (value/1000) + 'K' : value;
                      }
                    }
                  }
                }
              }} />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'single' && (
        <div className="space-y-6">
          {/* Single Influencer Selector */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Detailed Influencer Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Choose Influencer</label>
                <select
                  className="w-full rounded-md border-gray-300 text-sm"
                  value={selectedInfluencerId || ''}
                  onChange={(e) => setSelectedInfluencerId(Number(e.target.value))}
                >
                  <option value="" disabled>Select an influencer...</option>
                  {filteredInfluencers.map(inf => (
                    <option key={inf.id} value={inf.id}>
                      {inf.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Detailed Performance Metrics */}
          {selectedInfluencer && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                  {selectedInfluencer.name.substring(1, 3).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold">{selectedInfluencer.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{selectedInfluencer.platform} • {selectedInfluencer.tier}</p>
                </div>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className="text-xs sm:text-sm text-gray-500">Performance Score</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {Math.round(selectedInfluencer.avgEngagement * 5 + (selectedInfluencer.totalReach / 500000))}/100
                </p>
              </div>
            </div>

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600">Followers</p>
                <p className="text-lg sm:text-2xl font-bold">{formatNumber(selectedInfluencer.followers)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600">Avg Eng.</p>
                <p className="text-lg sm:text-2xl font-bold">{selectedInfluencer.avgEngagement}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600">Content</p>
                <p className="text-lg sm:text-2xl font-bold">{selectedInfluencer.totalPosts}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600">Est. Reach</p>
                <p className="text-lg sm:text-2xl font-bold">{formatNumber(selectedInfluencer.totalReach)}</p>
              </div>
            </div>

            {/* Campaign Performance History */}
            <div className="border-t pt-6">
              <h4 className="text-base sm:text-lg font-semibold mb-4">Campaign History</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <p className="font-medium truncate">Pepsodent Senyum Indonesia</p>
                    <p className="text-xs text-gray-500">Jun 2024 • 12 posts</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">8.2%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <p className="font-medium truncate">Lifebuoy Sehat</p>
                    <p className="text-xs text-gray-500">May 2024 • 8 posts</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">7.5%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <p className="font-medium truncate">Rinso Active Clean</p>
                    <p className="text-xs text-gray-500">Apr 2024 • 15 posts</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">6.9%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Performance Breakdown */}
            <div className="border-t pt-6 mt-6">
              <h4 className="text-lg font-semibold mb-4">Content Type Performance</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="mb-2">
                    <svg className="w-12 h-12 mx-auto text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-semibold">Photo Posts</p>
                  <p className="text-2xl font-bold text-purple-600">7.2%</p>
                  <p className="text-sm text-gray-500">Avg engagement</p>
                </div>
                <div className="text-center">
                  <div className="mb-2">
                    <svg className="w-12 h-12 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-semibold">Video/Reels</p>
                  <p className="text-2xl font-bold text-blue-600">9.8%</p>
                  <p className="text-sm text-gray-500">Avg engagement</p>
                </div>
                <div className="text-center">
                  <div className="mb-2">
                    <svg className="w-12 h-12 mx-auto text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold">Stories</p>
                  <p className="text-2xl font-bold text-pink-600">5.4%</p>
                  <p className="text-sm text-gray-500">Avg engagement</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="border-t pt-6 mt-6">
              <h4 className="text-lg font-semibold mb-4">AI Recommendations</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-blue-900">Performance Insights</p>
                    <ul className="mt-2 space-y-1 text-sm text-blue-800">
                      <li>• Video content performs 36% better than photos for this influencer</li>
                      <li>• Best posting time: 7-9 PM on weekdays</li>
                      <li>• Food and lifestyle content generates highest engagement</li>
                      <li>• Consider increasing video content allocation by 20%</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="border-t pt-6 mt-6">
              <h4 className="text-lg font-semibold mb-4">AI Recommendations</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-blue-900">Performance Insights</p>
                    <ul className="mt-2 space-y-1 text-sm text-blue-800">
                      <li>• Video content performs 36% better than photos for this influencer</li>
                      <li>• Best posting time: 7-9 PM on weekdays</li>
                      <li>• Food and lifestyle content generates highest engagement</li>
                      <li>• Consider increasing video content allocation by 20%</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      )}

      {/* Export Options Modal (Hidden by default) */}
      <div className="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <h3 className="text-lg font-semibold mb-4">Export Report</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" name="export" className="text-indigo-600" />
              <div>
                <p className="font-medium">Excel Report</p>
                <p className="text-sm text-gray-500">Detailed data with charts</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" name="export" className="text-indigo-600" />
              <div>
                <p className="font-medium">PDF Presentation</p>
                <p className="text-sm text-gray-500">Executive summary format</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" name="export" className="text-indigo-600" />
              <div>
                <p className="font-medium">CSV Data</p>
                <p className="text-sm text-gray-500">Raw data for analysis</p>
              </div>
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
              Download
            </button>
            <button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}