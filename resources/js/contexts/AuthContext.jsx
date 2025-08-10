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
    const [loading, setLoading] = useState(true);

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // Check if user data exists in localStorage
                const storedUser = localStorage.getItem('authUser');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    // If no user in localStorage, check with API
                    const userData = await apiService.checkAuthStatus();
                    setUser(userData.user);
                    localStorage.setItem('authUser', JSON.stringify(userData.user));
                }
            } catch (error) {
                // If API check fails, clear any stored user data
                localStorage.removeItem('authUser');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            const data = await apiService.login(email, password);
            setUser(data.user);
            localStorage.setItem('authUser', JSON.stringify(data.user));
            return data;
        } catch (error) {
            throw error;
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await apiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('authUser');
            setUser(null);
            // Navigation will be handled by the component that calls logout
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
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};