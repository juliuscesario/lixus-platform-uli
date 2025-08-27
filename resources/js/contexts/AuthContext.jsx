import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    // Remove localStorage dependency - let session handle persistence
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Start with loading true
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Create the context value first (needed for apiService)
    const contextValue = {
        user,
        loading,
        isAuthenticating,
        sessionExpired,
        initialized,
        isAuthenticated: !!user,
        showSessionExpiredModal: () => {
            setSessionExpired(true);
            setUser(null);
        },
        setSessionExpired
    };

    // Check authentication status on app initialization
    useEffect(() => {
        let isMounted = true;

        const checkAuthStatus = async () => {
            try {
                setLoading(true);
                setIsAuthenticating(true);
                
                // Use session-based check instead of localStorage
                const userData = await apiService(contextValue).checkAuthStatus();
                
                if (isMounted) {
                    if (userData) {
                        setUser(userData);
                    } else {
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('Auth status check failed:', error);
                if (isMounted) {
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setIsAuthenticating(false);
                    setInitialized(true);
                }
            }
        };

        checkAuthStatus();

        return () => {
            isMounted = false;
        };
    }, []);

    const login = async (email, password) => {
        try {
            setIsAuthenticating(true);
            const data = await apiService(contextValue).login(email, password);
            
            if (data.user) {
                setUser(data.user);
                setSessionExpired(false);
            }
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsAuthenticating(false);
        }
    };

    const logout = async () => {
        try {
            setIsAuthenticating(true);
            await apiService(contextValue).logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setSessionExpired(false);
            setIsAuthenticating(false);
        }
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    const refreshUser = async () => {
        try {
            const userData = await apiService(contextValue).checkAuthStatus();
            if (userData) {
                setUser(userData);
                return userData;
            } else {
                setUser(null);
                return null;
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
            setUser(null);
            return null;
        }
    };

    // Update context value with all functions
    const value = {
        user,
        login,
        logout,
        updateUser,
        refreshUser,
        loading,
        isAuthenticating,
        initialized,
        isAuthenticated: !!user,
        sessionExpired,
        showSessionExpiredModal: contextValue.showSessionExpiredModal,
        setSessionExpired
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};