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
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('authUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading, setLoading] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false); // New state for session status

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkUser = async () => {
            setLoading(true);
            try {
                const { user: refreshedUser } = await apiService(value).checkAuthStatus();
                if (refreshedUser) {
                    setUser(refreshedUser);
                    localStorage.setItem('authUser', JSON.stringify(refreshedUser));
                } else {
                    // If check fails, clear local state and storage
                    setUser(null);
                    localStorage.removeItem('authUser');
                }
            } catch (error) {
                console.error("Authentication check failed on refresh:", error);
                setUser(null);
                localStorage.removeItem('authUser');
            } finally {
                setLoading(false);
            }
        };

        // Only run check if there's a user from localStorage initially
        if (user) {
            checkUser();
        }
    }, []);

    const showSessionExpiredModal = () => {
        setSessionExpired(true);
    };


    // Login function
    const login = async (email, password) => {
        try {
            const data = await apiService(null).login(email, password);
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
            await apiService(null).logout();
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