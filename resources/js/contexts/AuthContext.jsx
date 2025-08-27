import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [sessionExpiredModalVisible, setSessionExpiredModalVisible] = useState(false);

    // Create API service instance with auth context
    const api = apiService({
        showSessionExpiredModal: () => setSessionExpiredModalVisible(true)
    });

    // Initialize CSRF and check authentication
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Initialize CSRF cookie first
                await api.getCsrfCookie();
                
                // Then check if user is authenticated
                await checkAuthStatus();
            } catch (error) {
                console.log('Auth initialization failed:', error);
            } finally {
                setLoading(false);
                setInitialized(true);
            }
        };

        initializeAuth();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const user = await api.checkAuthStatus();
            if (user) {
                setUser(user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const login = async (email, password) => {
        setIsAuthenticating(true);
        try {
            // Initialize CSRF before login
            await api.getCsrfCookie();
            
            const response = await api.login(email, password);
            
            if (response.user) {
                setUser(response.user);
                setIsAuthenticated(true);
                return response;
            }
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            throw error;
        } finally {
            setIsAuthenticating(false);
        }
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const showSessionExpiredModal = () => {
        setSessionExpiredModalVisible(true);
    };

    const hideSessionExpiredModal = () => {
        setSessionExpiredModalVisible(false);
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        isAuthenticating,
        initialized,
        login,
        logout,
        checkAuthStatus,
        sessionExpiredModalVisible,
        showSessionExpiredModal,
        hideSessionExpiredModal,
        // Provide the API service instance to components
        api,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}