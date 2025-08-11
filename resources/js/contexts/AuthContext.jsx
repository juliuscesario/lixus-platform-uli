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
    const [loading, setLoading] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false); // New state for session status
    
    // Check if user is authenticated on app load
    useEffect(() => {
        // Only check localStorage, don't make API calls on mount
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('authUser');
                setUser(null);
            }
        }
        // Don't make API calls here to avoid 401 loops on public pages
    }, []);
    
    const showSessionExpiredModal = () => {
        setSessionExpired(true);
    };
    
    const auth = {
        user,
        showSessionExpiredModal,
        setSessionExpired,
        logout,
    };
    
    // Login function
    const login = async (email, password) => {
        setLoading(true);
        try {
            const data = await apiService(auth).login(email, password);
                setUser(data.user);
                localStorage.setItem('authUser', JSON.stringify(data.user));
                return data;
            } catch (error) {
                throw error;
            } finally {
                setLoading(false);
            }
        };
        
    // Logout function
    const logout = async () => {
        try {
            await apiService(auth).logout();
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
        isAuthenticated: !!user,
        sessionExpired,
        showSessionExpiredModal,
        setSessionExpired
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};