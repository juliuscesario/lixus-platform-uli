import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement, ArcElement, RadialLinearScale } from 'chart.js';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';
import { ChevronDown, TrendingUp, Users, Target, DollarSign, Eye, Heart, MessageCircle, Share2, Calendar, Award, BarChart3, PieChart, Activity } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale);

// Demo campaign data
const campaignDatabase = {
  'pepsodent-2025': {
    id: 'pepsodent-2025',
    name: 'Pepsodent Senyum Indonesia 2025',
    brand: 'Pepsodent',
    status: 'active',
    startDate: '2025-01-01',
    endDate: '2025-02-28',
    budget: 50000000,
    totalPosts: 342,
    validatedPosts: 325,
    totalInfluencers: 45,
    totalReach: 2847329,
    totalImpressions: 5234567,
    totalEngagement: 487234,
    avgEngagementRate: 4.2,
    roi: 3.4,
    metrics: {
      likes: 234567,
      comments: 45678,
      shares: 12345,
      saves: 8765
    },
    influencerTiers: {
      nano: 20,
      micro: 15,
      mid: 8,
      macro: 2,
      mega: 0
    },
    platformDistribution: {
      instagram: 65,
      tiktok: 30,
      twitter: 5
    },
    weeklyEngagement: [45000, 52000, 48000, 61000, 58000, 72000, 68000, 75000],
    topPerformers: [
      { name: '@beauty_jakarta', tier: 'Micro', engagement: 8.5, posts: 12 },
      { name: '@healthy_smile', tier: 'Nano', engagement: 12.3, posts: 8 },
      { name: '@senyum_indonesia', tier: 'Mid', engagement: 6.7, posts: 15 }
    ]
  },
  'lifebuoy-2025': {
    id: 'lifebuoy-2025',
    name: 'Lifebuoy Lindungi Keluarga',
    brand: 'Lifebuoy',
    status: 'completed',
    startDate: '2024-11-01',
    endDate: '2024-12-31',
    budget: 75000000,
    totalPosts: 456,
    validatedPosts: 445,
    totalInfluencers: 62,
    totalReach: 3456789,
    totalImpressions: 6789012,
    totalEngagement: 567890,
    avgEngagementRate: 3.8,
    roi: 4.1,
    metrics: {
      likes: 345678,
      comments: 67890,
      shares: 23456,
      saves: 12345
    },
    influencerTiers: {
      nano: 25,
      micro: 20,
      mid: 12,
      macro: 5,
      mega: 0
    },
    platformDistribution: {
      instagram: 55,
      tiktok: 40,
      twitter: 5
    },
    weeklyEngagement: [38000, 42000, 55000, 51000, 62000, 68000, 71000, 69000],
    topPerformers: [
      { name: '@clean_living', tier: 'Mid', engagement: 7.2, posts: 18 },
      { name: '@family_first', tier: 'Micro', engagement: 9.1, posts: 14 },
      { name: '@hygiene_tips', tier: 'Nano', engagement: 11.5, posts: 10 }
    ]
  },
  'rinso-2024': {
    id: 'rinso-2024',
    name: 'Rinso Active Clean',
    brand: 'Rinso',
    status: 'completed',
    startDate: '2024-09-01',
    endDate: '2024-10-31',
    budget: 40000000,
    totalPosts: 278,
    validatedPosts: 265,
    totalInfluencers: 35,
    totalReach: 1987654,
    totalImpressions: 3456789,
    totalEngagement: 298765,
    avgEngagementRate: 5.1,
    roi: 2.8,
    metrics: {
      likes: 187654,
      comments: 34567,
      shares: 8765,
      saves: 5432
    },
    influencerTiers: {
      nano: 15,
      micro: 12,
      mid: 6,
      macro: 2,
      mega: 0
    },
    platformDistribution: {
      instagram: 70,
      tiktok: 25,
      twitter: 5
    },
    weeklyEngagement: [32000, 35000, 38000, 41000, 39000, 42000, 40000, 38000],
    topPerformers: [
      { name: '@laundry_hacks', tier: 'Micro', engagement: 10.2, posts: 9 },
      { name: '@fresh_clothes', tier: 'Nano', engagement: 13.5, posts: 7 },
      { name: '@rinso_lover', tier: 'Mid', engagement: 5.8, posts: 11 }
    ]
  }
};

export default function EnhancedCampaignComparison() {
  const [selectedCampaignA, setSelectedCampaignA] = useState(null);
  const [selectedCampaignB, setSelectedCampaignB] = useState(null);
  const [showDropdownA, setShowDropdownA] = useState(false);
  const [showDropdownB, setShowDropdownB] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);

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

  const calculatePercentageDiff = (valA, valB) => {
    if (!valA || !valB) return 0;
    return ((valA - valB) / valB * 100).toFixed(1);
  };

  const getComparisonColor = (valA, valB) => {
    if (!valA || !valB) return 'text-gray-500';
    return valA > valB ? 'text-green-600' : valA < valB ? 'text-red-600' : 'text-gray-500';
  };

  const CampaignSelector = ({ selected, onSelect, isA, showDropdown, setShowDropdown }) => {
    const otherSelected = isA ? selectedCampaignB : selectedCampaignA;
    const availableCampaigns = Object.values(campaignDatabase).filter(c => c.id !== otherSelected?.id);

    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 text-left hover:border-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Campaign {isA ? 'A' : 'B'}</p>
              {selected ? (
                <div>
                  <p className="font-semibold text-gray-900">{selected.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{selected.brand} • {selected.status}</p>
                </div>
              ) : (
                <p className="text-gray-400">Select a campaign...</p>
              )}
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
            {availableCampaigns.map(campaign => (
              <button
                key={campaign.id}
                onClick={() => {
                  onSelect(campaign);
                  setShowDropdown(false);
                }}
                className="w-full p-3 text-left hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-0"
              >
                <p className="font-medium text-gray-900">{campaign.name}</p>
                <p className="text-sm text-gray-500">{campaign.brand} • {formatCurrency(campaign.budget)} • {campaign.status}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const MetricCard = ({ label, valueA, valueB, format = 'number', icon: Icon }) => {
    const formattedA = format === 'currency' ? formatCurrency(valueA || 0) : 
                       format === 'percent' ? `${valueA || 0}%` : 
                       formatNumber(valueA || 0);
    const formattedB = format === 'currency' ? formatCurrency(valueB || 0) : 
                       format === 'percent' ? `${valueB || 0}%` : 
                       formatNumber(valueB || 0);
    
    const diff = calculatePercentageDiff(valueA, valueB);
    const colorClass = getComparisonColor(valueA, valueB);

    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-600">{label}</p>
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className={`${selectedCampaignA ? colorClass : 'text-gray-300'}`}>
            <p className="text-2xl font-bold">{selectedCampaignA ? formattedA : '-'}</p>
            {selectedCampaignA && selectedCampaignB && diff !== '0.0' && (
              <p className="text-xs mt-1">{diff > 0 ? '+' : ''}{diff}%</p>
            )}
          </div>
          <div className="text-gray-900">
            <p className="text-2xl font-bold">{selectedCampaignB ? formattedB : '-'}</p>
          </div>
        </div>
      </div>
    );
  };

  // Prepare chart data when both campaigns are selected
  const engagementComparisonData = selectedCampaignA && selectedCampaignB ? {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
    datasets: [
      {
        label: selectedCampaignA.name,
        data: selectedCampaignA.weeklyEngagement,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4
      },
      {
        label: selectedCampaignB.name,
        data: selectedCampaignB.weeklyEngagement,
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4
      }
    ]
  } : null;

  const platformComparisonData = selectedCampaignA && selectedCampaignB ? {
    labels: ['Instagram', 'TikTok', 'Twitter'],
    datasets: [
      {
        label: selectedCampaignA.name,
        data: [
          selectedCampaignA.platformDistribution.instagram,
          selectedCampaignA.platformDistribution.tiktok,
          selectedCampaignA.platformDistribution.twitter
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
      },
      {
        label: selectedCampaignB.name,
        data: [
          selectedCampaignB.platformDistribution.instagram,
          selectedCampaignB.platformDistribution.tiktok,
          selectedCampaignB.platformDistribution.twitter
        ],
        backgroundColor: 'rgba(236, 72, 153, 0.7)',
      }
    ]
  } : null;

  const influencerTierData = selectedCampaignA && selectedCampaignB ? {
    labels: ['Nano', 'Micro', 'Mid-tier', 'Macro', 'Mega'],
    datasets: [
      {
        label: selectedCampaignA.name,
        data: [
          selectedCampaignA.influencerTiers.nano,
          selectedCampaignA.influencerTiers.micro,
          selectedCampaignA.influencerTiers.mid,
          selectedCampaignA.influencerTiers.macro,
          selectedCampaignA.influencerTiers.mega
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
      },
      {
        label: selectedCampaignB.name,
        data: [
          selectedCampaignB.influencerTiers.nano,
          selectedCampaignB.influencerTiers.micro,
          selectedCampaignB.influencerTiers.mid,
          selectedCampaignB.influencerTiers.macro,
          selectedCampaignB.influencerTiers.mega
        ],
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        borderColor: 'rgba(236, 72, 153, 1)',
        pointBackgroundColor: 'rgba(236, 72, 153, 1)',
        pointBorderColor: '#fff',
      }
    ]
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Campaign Comparison Dashboard</h1>
          <p className="text-gray-600 mt-2">Select two campaigns to compare performance metrics and gain strategic insights</p>
        </div>

        {/* Campaign Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <CampaignSelector 
            selected={selectedCampaignA}
            onSelect={setSelectedCampaignA}
            isA={true}
            showDropdown={showDropdownA}
            setShowDropdown={setShowDropdownA}
          />
          <CampaignSelector 
            selected={selectedCampaignB}
            onSelect={setSelectedCampaignB}
            isA={false}
            showDropdown={showDropdownB}
            setShowDropdown={setShowDropdownB}
          />
        </div>

        {/* Comparison Content */}
        {(selectedCampaignA || selectedCampaignB) && (
          <>
            {/* Key Metrics Comparison */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Performance Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                  label="Total Budget" 
                  valueA={selectedCampaignA?.budget} 
                  valueB={selectedCampaignB?.budget}
                  format="currency"
                  icon={DollarSign}
                />
                <MetricCard 
                  label="ROI" 
                  valueA={selectedCampaignA?.roi} 
                  valueB={selectedCampaignB?.roi}
                  format="number"
                  icon={TrendingUp}
                />
                <MetricCard 
                  label="Total Reach" 
                  valueA={selectedCampaignA?.totalReach} 
                  valueB={selectedCampaignB?.totalReach}
                  icon={Eye}
                />
                <MetricCard 
                  label="Engagement Rate" 
                  valueA={selectedCampaignA?.avgEngagementRate} 
                  valueB={selectedCampaignB?.avgEngagementRate}
                  format="percent"
                  icon={Activity}
                />
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Engagement Trend</h3>
                {engagementComparisonData ? (
                  <Line data={engagementComparisonData} options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                    },
                    scales: {
                      y: { 
                        beginAtZero: true,
                        title: { display: true, text: 'Engagement' }
                      }
                    }
                  }} />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    Select both campaigns to see comparison
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-600">Likes</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-semibold text-indigo-600">
                        {selectedCampaignA ? formatNumber(selectedCampaignA.metrics.likes) : '-'}
                      </span>
                      <span className="font-semibold text-pink-600">
                        {selectedCampaignB ? formatNumber(selectedCampaignB.metrics.likes) : '-'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Comments</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-semibold text-indigo-600">
                        {selectedCampaignA ? formatNumber(selectedCampaignA.metrics.comments) : '-'}
                      </span>
                      <span className="font-semibold text-pink-600">
                        {selectedCampaignB ? formatNumber(selectedCampaignB.metrics.comments) : '-'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Shares</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-semibold text-indigo-600">
                        {selectedCampaignA ? formatNumber(selectedCampaignA.metrics.shares) : '-'}
                      </span>
                      <span className="font-semibold text-pink-600">
                        {selectedCampaignB ? formatNumber(selectedCampaignB.metrics.shares) : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform and Influencer Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution (%)</h3>
                {platformComparisonData ? (
                  <Bar data={platformComparisonData} options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                    },
                    scales: {
                      y: { 
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: 'Percentage (%)' }
                      }
                    }
                  }} />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    Select both campaigns to see comparison
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Influencer Tier Distribution</h3>
                {influencerTierData ? (
                  <Radar data={influencerTierData} options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                    },
                    scales: {
                      r: {
                        beginAtZero: true,
                        ticks: { stepSize: 5 }
                      }
                    }
                  }} />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    Select both campaigns to see comparison
                  </div>
                )}
              </div>
            </div>

            {/* Strategic Insights */}
            {selectedCampaignA && selectedCampaignB && (
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">Strategic Insights & Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <p className="text-indigo-100 text-sm mb-1">Best Performing</p>
                    <p className="text-lg font-bold">
                      {selectedCampaignA.roi > selectedCampaignB.roi ? selectedCampaignA.name : selectedCampaignB.name}
                    </p>
                    <p className="text-indigo-100 text-xs mt-1">
                      Higher ROI by {Math.abs(calculatePercentageDiff(selectedCampaignA.roi, selectedCampaignB.roi))}%
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <p className="text-indigo-100 text-sm mb-1">Efficiency Leader</p>
                    <p className="text-lg font-bold">
                      {(selectedCampaignA.totalEngagement/selectedCampaignA.budget) > 
                       (selectedCampaignB.totalEngagement/selectedCampaignB.budget) 
                       ? selectedCampaignA.name : selectedCampaignB.name}
                    </p>
                    <p className="text-indigo-100 text-xs mt-1">Better engagement per IDR spent</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <p className="text-indigo-100 text-sm mb-1">Recommended Strategy</p>
                    <p className="text-lg font-bold">
                      {selectedCampaignA.avgEngagementRate > selectedCampaignB.avgEngagementRate 
                       ? 'Replicate Campaign A' : 'Replicate Campaign B'}
                    </p>
                    <p className="text-indigo-100 text-xs mt-1">For future campaigns</p>
                  </div>
                </div>
              </div>
            )}

            {/* Top Performers Comparison */}
            {(selectedCampaignA || selectedCampaignB) && (
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedCampaignA && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Top Performers - {selectedCampaignA.name}
                    </h3>
                    <div className="space-y-3">
                      {selectedCampaignA.topPerformers.map((performer, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{performer.name}</p>
                            <p className="text-sm text-gray-500">{performer.tier} • {performer.posts} posts</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-indigo-600">{performer.engagement}%</p>
                            <p className="text-xs text-gray-500">Engagement</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCampaignB && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Top Performers - {selectedCampaignB.name}
                    </h3>
                    <div className="space-y-3">
                      {selectedCampaignB.topPerformers.map((performer, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{performer.name}</p>
                            <p className="text-sm text-gray-500">{performer.tier} • {performer.posts} posts</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-pink-600">{performer.engagement}%</p>
                            <p className="text-xs text-gray-500">Engagement</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}