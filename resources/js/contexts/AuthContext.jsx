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
    const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in, object = logged in
    const [loading, setLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);

    // Centralized function to handle setting user data
    const setUserData = (userData, token) => {
        if (userData && token) {
            setUser(userData);
            localStorage.setItem('authUser', JSON.stringify(userData));
            localStorage.setItem('authToken', token);
        } else {
            setUser(null);
            localStorage.removeItem('authUser');
            localStorage.removeItem('authToken');
        }
    };

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            try {
                // Check if we have stored credentials
                const storedUser = localStorage.getItem('authUser');
                const storedToken = localStorage.getItem('authToken');

                if (storedUser && storedToken) {
                    // Verify the stored credentials are still valid
                    try {
                        const response = await apiService.checkAuthStatus();
                        if (response && response.id) {
                            // Update with fresh user data
                            setUserData(response, storedToken);
                        } else {
                            // Stored credentials are invalid
                            setUserData(null, null);
                        }
                    } catch (error) {
                        console.error('Auth check failed:', error);
                        // If auth check fails, clear stored data
                        setUserData(null, null);
                    }
                } else {
                    // No stored credentials
                    setUser(null);
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Show session expired modal
    const showSessionExpiredModal = () => {
        setSessionExpired(true);
        setUserData(null, null);
    };

    // Login function
    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await apiService.login(email, password, { showSessionExpiredModal });
            
            if (response.user && response.access_token) {
                setUserData(response.user, response.access_token);
                setSessionExpired(false); // Clear any session expired state
                return response;
            } else {
                throw new Error('Invalid server response');
            }
        } catch (error) {
            console.error('Login error:', error);
            setUserData(null, null);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        setLoading(true);
        try {
            await apiService.logout({ showSessionExpiredModal });
        } catch (error) {
            console.error('Logout error:', error);
            // Even if the server logout fails, clear local state
        } finally {
            setUserData(null, null);
            setSessionExpired(false);
            setLoading(false);
        }
    };

    // Register function
    const register = async (name, email, password, password_confirmation) => {
        setLoading(true);
        try {
            const response = await apiService.register(
                name, 
                email, 
                password, 
                password_confirmation,
                { showSessionExpiredModal }
            );
            
            if (response.user && response.access_token) {
                setUserData(response.user, response.access_token);
                return response;
            } else {
                throw new Error('Invalid server response');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setUserData(null, null);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Update user function
    const updateUser = (newUserData) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setUserData(newUserData, token);
        }
    };

    // Refresh user data from server
    const refreshUser = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setUser(null);
            return null;
        }

        try {
            const response = await apiService.checkAuthStatus({ showSessionExpiredModal });
            if (response && response.id) {
                setUserData(response, token);
                return response;
            } else {
                setUserData(null, null);
                return null;
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
            setUserData(null, null);
            return null;
        }
    };

    // Check if user has a specific role
    const hasRole = (roleName) => {
        return user?.role?.name === roleName;
    };

    // Check if user is admin
    const isAdmin = () => {
        return hasRole('admin');
    };

    // Check if user is influencer
    const isInfluencer = () => {
        return hasRole('influencer');
    };

    // Check if user is brand
    const isBrand = () => {
        return hasRole('brand');
    };

    const value = {
        user,
        login,
        logout,
        register,
        updateUser,
        refreshUser,
        loading,
        isAuthenticated: !!user,
        sessionExpired,
        setSessionExpired,
        showSessionExpiredModal,
        hasRole,
        isAdmin,
        isInfluencer,
        isBrand,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};