import React, { useState } from 'react';
import BrandPerformanceReport from '../../components/reports/BrandPerformanceReport';
import CampaignComparisonReport from '../../components/reports/CampaignComparisonReport';
import InfluencerPerformanceReport from '../../components/reports/InfluencerPerformanceReport';

const IconChart = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>;
const IconCompare = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/><path d="M3 12h18"/></svg>;
const IconUserCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>;

const TABS = {
    BRAND_PERFORMANCE: 'Brand Performance',
    CAMPAIGN_COMPARISON: 'Campaign Comparison',
    INFLUENCER_PERFORMANCE: 'Influencer Performance',
};

// This component accepts `MapsTo` but does not use it, which is fine.
export default function ReportingPage({ navigateTo }) {
    const [activeTab, setActiveTab] = useState(TABS.BRAND_PERFORMANCE);

    const renderActiveTab = () => {
        switch (activeTab) {
            case TABS.BRAND_PERFORMANCE: return <BrandPerformanceReport />;
            case TABS.CAMPAIGN_COMPARISON: return <CampaignComparisonReport />;
            case TABS.INFLUENCER_PERFORMANCE: return <InfluencerPerformanceReport />;
            default: return <BrandPerformanceReport />;
        }
    };

    const TabButton = ({ title, icon, isActive, onClick }) => (
        <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
            {icon} {title}
        </button>
    );

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Analytics & Reports</h1>
                <p className="text-gray-600 mt-1">Gain strategic insights from your campaign and influencer data.</p>
            </div>
            <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
                <TabButton title={TABS.BRAND_PERFORMANCE} icon={<IconChart />} isActive={activeTab === TABS.BRAND_PERFORMANCE} onClick={() => setActiveTab(TABS.BRAND_PERFORMANCE)} />
                <TabButton title={TABS.CAMPAIGN_COMPARISON} icon={<IconCompare />} isActive={activeTab === TABS.CAMPAIGN_COMPARISON} onClick={() => setActiveTab(TABS.CAMPAIGN_COMPARISON)} />
                <TabButton title={TABS.INFLUENCER_PERFORMANCE} icon={<IconUserCheck />} isActive={activeTab === TABS.INFLUENCER_PERFORMANCE} onClick={() => setActiveTab(TABS.INFLUENCER_PERFORMANCE)} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {renderActiveTab()}
            </div>
        </div>
    );
}