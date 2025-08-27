import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the intended destination or default to dashboard
    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            // Navigate to intended destination
            navigate(from, { replace: true });
        } catch (error) {
            console.error('Login failed:', error);
            setError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    // Quick login buttons for testing
    const handleQuickLogin = async (userType) => {
        const credentials = {
            brand: { email: 'brand@lixus.id', password: 'password' },
            influencerA: { email: 'influencerA@example.com', password: 'password' },
            influencerB: { email: 'influencerB@example.com', password: 'password' }
        };

        const { email: quickEmail, password: quickPassword } = credentials[userType];
        setEmail(quickEmail);
        setPassword(quickPassword);

        // Auto-submit
        setError('');
        setIsLoading(true);

        try {
            await login(quickEmail, quickPassword);
            navigate(from, { replace: true });
        } catch (error) {
            console.error('Quick login failed:', error);
            setError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-auto flex items-center justify-center">
                        <h1 className="text-2xl font-bold text-gray-900">Lixus</h1>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Lixus Community Platform
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="text-sm text-red-700">
                                {error}
                            </div>
                        </div>
                    )}

                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </div>

                    {/* Quick Login Buttons for Development */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-6 space-y-2">
                            <div className="text-center text-sm text-gray-500 mb-2">
                                Quick Login (Development)
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleQuickLogin('brand')}
                                    disabled={isLoading}
                                    className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Login as Brand
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickLogin('influencerA')}
                                    disabled={isLoading}
                                    className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Login as Influencer A
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickLogin('influencerB')}
                                    disabled={isLoading}
                                    className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Login as Influencer B
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                <div className="mt-6">
                    <div className="text-center text-xs text-gray-500">
                        Lixus is a combine Creative & Technology as agency
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;