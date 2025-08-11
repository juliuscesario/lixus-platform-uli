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
    const [user, setUser] = useState(undefined); // Start with undefined to signify "not yet checked"
    const [loading, setLoading] = useState(false); // Used for login/logout process
    const [sessionExpired, setSessionExpired] = useState(false);

    // Centralized function to handle setting user data consistently
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

    // On initial load, check for cached user and token
    useEffect(() => {
        const cachedUser = localStorage.getItem('authUser');
        const token = localStorage.getItem('authToken');
        if (cachedUser && token) {
            setUser(JSON.parse(cachedUser));
        } else {
            setUser(null); // Explicitly set to null if no cache
        }
    }, []);

    const showSessionExpiredModal = () => {
        setSessionExpired(true);
        setUserData(null, null); // Clear all user data
    };
    
    // Login function
    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await apiService.login(email, password);
            if (response.user && response.access_token) {
                setUserData(response.user, response.access_token);
            } else {
                setUserData(null, null); // Clear data on failed login
                throw new Error('Login failed: Invalid server response.');
            }
            return response;
        } catch (error) {
            setUserData(null, null); // Ensure cleanup on error
            throw error; // Let the component handle the error display
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        setLoading(true);
        try {
            // The `auth` object is now passed to apiFetch, so we pass `showSessionExpiredModal`
            await apiService.logout({ showSessionExpiredModal });
        } catch (error) {
            console.error('Logout failed:', error);
            // Still clear data locally even if server call fails
        } finally {
            setUserData(null, null);
            setLoading(false);
        }
    };

    // Update user function
     const updateUser = (newUserData) => {
        const token = localStorage.getItem('authToken');
        setUserData(newUserData, token);
    };
    
    // This function is still useful for silent re-authentication if ever needed,
    // for example, re-validating the user's session when the tab becomes active again.
    const revalidateUser = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return; // No token, nothing to revalidate
        
        try {
            const response = await apiService.checkAuthStatus({ showSessionExpiredModal });
            if (response) {
                // Use the existing token, as a new one isn't issued on profile check
                setUserData(response, token);
            } else {
                showSessionExpiredModal();
            }
        } catch (error) {
             showSessionExpiredModal();
        }
    };
    
    const value = {
        user,
        login,
        logout,
        updateUser,
        revalidateUser,
        loading,
        isAuthenticated: !!user, // If user object exists, they are authenticated
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