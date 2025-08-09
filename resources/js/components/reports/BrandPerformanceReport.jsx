import React, { useState, useEffect } from 'react';
import { apiService, formatCompactNumber } from '../../services/apiService';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BrandPerformanceReport() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ period: 'monthly' });
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiService.getBrandPerformanceReport(filters);
                const apiData = response.data || [];
                setData(apiData);

                // --- FIX: Create a much better chart for Engagement Trends ---
                const labels = apiData.map(d => d.date_key);
                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Total Likes',
                            data: apiData.map(d => d.total_likes || 0),
                            backgroundColor: 'rgba(255, 99, 132, 0.6)', // Red
                        },
                        {
                            label: 'Total Comments',
                            data: apiData.map(d => d.total_comments || 0),
                            backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue
                        },
                        {
                            label: 'Total Shares',
                            data: apiData.map(d => d.total_shares || 0),
                            backgroundColor: 'rgba(75, 192, 192, 0.6)', // Teal
                        },
                    ],
                });

            } catch (err) {
                setError('Failed to fetch or process brand performance data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: `Monthly Engagement Trends`, font: { size: 16 } },
        },
        scales: {
            x: { stacked: true }, // Stack bars for each month
            y: { stacked: true, beginAtZero: true },
        },
    };

    if (loading) return <div>Loading report...</div>;
    if (error) return <div className="text-red-500 p-4 bg-red-100 rounded-md">{error}</div>;

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Brand Performance Over Time</h2>
            <div className="flex gap-4 mb-6">
                <div>
                    <label htmlFor="period" className="block text-sm font-medium text-gray-700">Group By</label>
                    <select name="period" id="period" value={filters.period} onChange={handleFilterChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option value="monthly">Month</option>
                        <option value="yearly">Year</option>
                    </select>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
                {data.length > 0 ? <Bar options={chartOptions} data={chartData} /> : <div className='text-center py-10 text-gray-500'>No data available for this period.</div>}
            </div>

            <h3 className="text-lg font-semibold text-gray-700 mb-4">Detailed Data</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Posts</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Likes</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Comments</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Shares</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item) => (
                            <tr key={item.date_key}>
                                <td className="px-6 py-4 font-medium text-gray-900">{item.date_key}</td>
                                <td className="px-6 py-4">{formatCompactNumber(item.total_posts)}</td>
                                <td className="px-6 py-4">{formatCompactNumber(item.total_likes)}</td>
                                <td className="px-6 py-4">{formatCompactNumber(item.total_comments)}</td>
                                <td className="px-6 py-4">{formatCompactNumber(item.total_shares)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}