import React, { useState } from 'react';

// --- Ikon ---
const IconHome = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> );
const IconCampaign = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6c-3.5 0-7 1.5-7 5s3.5 5 7 5 7-1.5 7-5-3.5-5-7-5z"/><path d="M12 6v12"/></svg> );
const IconUsers = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> );
const IconMenu = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg> );
const IconBriefcase = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> );
const IconMegaphone = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>;
const IconPower = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" x2="12" y1="2" y2="12"/></svg>;
const IconChartBar = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>;



export default function DashboardLayout({ user, onLogout, children, setPage, activePage }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const menuItems = [
        { name: 'Dashboard', page: 'dashboard-overview', icon: <IconHome />, roles: ['admin', 'brand', 'influencer'] },
        // Menu Influencer
        { name: 'Menuju ke Laman Utama', page: 'influencer-my-campaigns', icon: <IconMegaphone />, roles: ['influencer'] },
        // Menu Admin/Brand
        { name: 'Manajemen Kampanye', page: 'admin-campaigns', icon: <IconMegaphone />, roles: ['admin', 'brand'] },
        { name: 'Reporting', page: 'admin-analytics', icon: <IconChartBar />, roles: ['admin', 'brand'] },
        { name: 'Manajemen User', page: 'admin-users', icon: <IconUsers />, roles: ['admin'] },
    ];

    const SidebarContent = () => (
        <>
            <div className="p-4">
                <h1 className="text-2xl font-bold text-gray-800">Lixus<span className="text-pink-500">.id</span></h1>
                <p className="text-sm text-gray-500 capitalize">{user.role} Dashboard</p>
            </div>
            <nav className="mt-5">
                {menuItems.map(item => (
                    item.roles.includes(user.role) && (
                        <a 
                            key={item.name}
                            href="#"
                            onClick={() => {
                                setPage(item.page);
                                setIsSidebarOpen(false);
                            }}
                            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-200 ${activePage === item.page ? 'bg-gray-200 border-r-4 border-pink-500' : ''}`}
                        >
                            {item.icon}
                            <span className="mx-4 font-medium">{item.name}</span>
                        </a>
                    )
                ))}
            </nav>
        </>
    );

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar untuk Desktop */}
            <aside className="w-64 bg-white shadow-md hidden md:block flex-shrink-0">
                <SidebarContent />
            </aside>

            {/* Sidebar untuk Mobile (Slide-out) */}
            {isSidebarOpen && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
                    <aside className={`fixed top-0 left-0 w-64 h-full bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <SidebarContent />
                    </aside>
                </>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-4 bg-white border-b-2 border-gray-200">
                    <button className="text-gray-600 md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <IconMenu />
                    </button>
                    <div className="hidden md:block"></div>
                    <div className="flex items-center">
                        <span className="mr-4 text-sm md:text-base">Welcome, {user.name}</span>
                        <button onClick={onLogout} className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-300">Logout</button>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}