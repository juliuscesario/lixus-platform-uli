// resources/js/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from '../services/apiService';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(undefined); // undefined = not checked, null = not authenticated
    const [loading, setLoading] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);

    /**
     * Centralized function to handle setting user data consistently
     */
    const setUserData = (userData, token = null) => {
        if (userData) {
            setUser(userData);
            localStorage.setItem('authUser', JSON.stringify(userData));
            if (token) {
                localStorage.setItem('authToken', token);
            }
        } else {
            // Clear all user data
            setUser(null);
            localStorage.removeItem('authUser');
            localStorage.removeItem('authToken');
            // Clear any session cookies
            document.cookie = 'laravel_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'lixus_platform_uli_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
    };

    /**
     * Show session expired modal and clear all auth data
     */
    const showSessionExpiredModal = () => {
        setSessionExpired(true);
        setUserData(null);
    };

    /**
     * Check authentication status on mount
     */
    useEffect(() => {
        const checkAuth = async () => {
            const cachedUser = localStorage.getItem('authUser');
            const token = localStorage.getItem('authToken');
            
            if (cachedUser) {
                // Temporarily set the cached user
                setUser(JSON.parse(cachedUser));
                
                // Verify the session is still valid
                try {
                    const response = await apiService({ showSessionExpiredModal }).checkAuthStatus();
                    if (response && response.id) {
                        // Update with fresh user data
                        setUserData(response, token);
                    } else {
                        // Session invalid, clear everything
                        setUserData(null);
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    // Session invalid, clear everything
                    setUserData(null);
                }
            } else {
                // No cached user, set to null (not authenticated)
                setUser(null);
            }
        };

        checkAuth();
    }, []);

    /**
     * Login function with proper session management
     */
    const login = async (email, password) => {
        setLoading(true);
        try {
            // Clear any existing session data before login
            setUserData(null);
            
            // Call login API
            const response = await apiService({ showSessionExpiredModal }).login(email, password);
            
            if (response.user && response.access_token) {
                // Set new user data
                setUserData(response.user, response.access_token);
                setSessionExpired(false); // Clear any session expired state
                return response;
            } else {
                throw new Error('Invalid server response');
            }
        } catch (error) {
            // Clear data on failed login
            setUserData(null);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logout function with complete cleanup
     */
    const logout = async () => {
        setLoading(true);
        try {
            // Call logout API (will handle cleanup on server side)
            await apiService({ showSessionExpiredModal }).logout();
        } catch (error) {
            console.error('Logout API error:', error);
            // Continue with local cleanup even if API fails
        } finally {
            // Clear all local data
            setUserData(null);
            setSessionExpired(false);
            setLoading(false);
            
            // Redirect to login page after logout
            // Using replace to prevent back button issues
            window.location.replace('/login');
        }
    };

    /**
     * Update user data (for profile updates, etc.)
     */
    const updateUser = (userData) => {
        const token = localStorage.getItem('authToken');
        setUserData(userData, token);
    };

    /**
     * Revalidate user session
     */
    const revalidateUser = async () => {
        const token = localStorage.getItem('authToken');
        if (!token && !document.cookie.includes('laravel_session')) {
            setUserData(null);
            return false;
        }
        
        try {
            const response = await apiService({ showSessionExpiredModal }).checkAuthStatus();
            if (response && response.id) {
                setUserData(response, token);
                return true;
            } else {
                showSessionExpiredModal();
                return false;
            }
        } catch (error) {
            showSessionExpiredModal();
            return false;
        }
    };

    // Context value
    const value = {
        user,
        login,
        logout,
        updateUser,
        revalidateUser,
        loading,
        isAuthenticated: !!user,
        sessionExpired,
        setSessionExpired,
        showSessionExpiredModal
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};