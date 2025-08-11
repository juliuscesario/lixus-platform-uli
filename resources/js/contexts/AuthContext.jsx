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
        const checkUser = async () => {
            setLoading(true);
            try {
                // Now we can safely call this on load.
                const { user } = await apiService(value).checkAuthStatus();
                if (user) {
                    setUser(user);
                    localStorage.setItem('authUser', JSON.stringify(user));
                } else {
                    localStorage.removeItem('authUser');
                    setUser(null);
                }
            } catch (error) {
                console.error("Authentication check failed:", error);
                localStorage.removeItem('authUser');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const showSessionExpiredModal = () => {
        setSessionExpired(true);
    };


    // Login function
    const login = async (email, password) => {
        try {
            const data = await apiService(value).login(email, password);
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
            await apiService(value).logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('authUser');
            setUser(null);
            setSessionExpired(false); // Clear session expired flag on logout
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