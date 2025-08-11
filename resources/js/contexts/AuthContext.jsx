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
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // For initial page load
    const [isAuthenticating, setIsAuthenticating] = useState(false); // For login process
    const [sessionExpired, setSessionExpired] = useState(false);

    // This function will be called to check auth status
    const checkAuth = async () => {
        try {
            const response = await apiService.checkAuthStatus({ showSessionExpiredModal });
            // The response from the API is { user: UserResource }
            if (response && response.user) {
                setUser(response.user);
                localStorage.setItem('authUser', JSON.stringify(response.user));
            } else {
                localStorage.removeItem('authUser');
                setUser(null);
            }
        } catch (error) {
            localStorage.removeItem('authUser');
            setUser(null);
        } finally {
            setLoading(false); // For initial load
            setIsAuthenticating(false); // Finish login process
        }
    };
    
    // Check authentication status when the app loads
    useEffect(() => {
        checkAuth();
    }, []);

    const showSessionExpiredModal = () => {
        setSessionExpired(true);
        localStorage.removeItem('authUser');
        setUser(null);
    };
    
    // Login function
    const login = async (email, password) => {
        setIsAuthenticating(true);
        try {
            const response = await apiService.login(email, password);
            if (response.user) {
                // Force navigation and a full page reload.
                // This is a robust way to ensure the app state is correctly initialized after login.
                window.location.href = '/dashboard';
            } else {
                setIsAuthenticating(false);
            }
            return response;
        } catch (error) {
            setUser(null);
            localStorage.removeItem('authUser');
            setIsAuthenticating(false);
            throw error;
        }
    };

    // Logout function
    const logout = async () => {
        try {
            // Pass auth context directly to the apiService call
            await apiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('authUser');
            setUser(null);
        }
    };

    // Update user function
    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('authUser', JSON.stringify(userData));
    };

    const value = {
        user,
        login,
        logout,
        updateUser,
        loading,
        isAuthenticating, // <-- Expose this new state
        isAuthenticated: !!user && !isAuthenticating, // <-- Modify this logic
        sessionExpired,
        showSessionExpiredModal,
        setSessionExpired,
        checkAuth // Expose checkAuth to be used manually if needed
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};