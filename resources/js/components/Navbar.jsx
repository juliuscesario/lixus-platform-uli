import React, { useState } from 'react';

// --- ICONS ---
const IconMenu = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg> );
const IconX = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> );

export default function Navbar({ user, onLogout, setPage }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <a href="#" onClick={() => setPage('home')} className="text-2xl font-bold text-gray-800">
                                Lixus<span className="text-pink-500">.id</span>
                            </a>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <a href="#" onClick={() => setPage('home')} className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Kampanye</a>
                                <a href="#" onClick={() => setPage('influencers')} className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Influencers</a>
                                <a href="#" onClick={() => setPage('posts')} className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Posts</a>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            {user ? (
                                <>
                                    <span className="mr-4 text-gray-700">Welcome, {user.name}</span>
                                    <button onClick={() => setPage('dashboard-overview')} className="bg-pink-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-600 mr-2">Dashboard</button>
                                    <button onClick={onLogout} className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-300">Logout</button>
                                </>
                            ) : (
                                <>
                                    <a href="#" onClick={() => setPage('login')} className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Login</a>
                                    {/* MODIFIED: Changed Register to Apply Now */}
                                    <a href="#" onClick={() => setPage('influencer-application')} className="ml-2 bg-pink-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-pink-600">Apply Now</a>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-200 focus:outline-none">
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? <IconX /> : <IconMenu />}
                        </button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <a href="#" onClick={() => { setPage('home'); setIsMobileMenuOpen(false); }} className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">Kampanye</a>
                        <a href="#" onClick={() => { setPage('influencers'); setIsMobileMenuOpen(false); }} className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">Influencers</a>
                        <a href="#" onClick={() => { setPage('posts'); setIsMobileMenuOpen(false); }} className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">Posts</a>
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        {user ? (
                             <div className="px-4">
                                <div className="flex items-center mb-3">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-500 font-bold">{user.name ? user.name.charAt(0) : '?'}</span>
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-gray-800">{user.name}</div>
                                        <div className="text-sm font-medium text-gray-500">{user.email}</div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <button onClick={() => { setPage('dashboard-overview'); setIsMobileMenuOpen(false); }} className="w-full text-left block bg-pink-500 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-pink-600">Dashboard</button>
                                    <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left block bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-base font-medium hover:bg-gray-300">Logout</button>
                                </div>
                             </div>
                        ) : (
                            <div className="px-2 space-y-1">
                                <a href="#" onClick={() => { setPage('login'); setIsMobileMenuOpen(false); }} className="block bg-gray-100 text-gray-800 px-3 py-2 rounded-md text-base font-medium">Login</a>
                                {/* MODIFIED: Changed Register to Apply Now */}
                                <a href="#" onClick={() => { setPage('influencer-application'); setIsMobileMenuOpen(false); }} className="block bg-pink-500 text-white px-3 py-2 rounded-md text-base font-medium">Apply Now</a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}