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
    const [loading, setLoading] = useState(false); // Used for login/logout operations
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
            try {
                // Check if we have stored credentials
                const storedUser = localStorage.getItem('authUser');
                const storedToken = localStorage.getItem('authToken');

                if (storedUser && storedToken) {
                    // Parse stored user data
                    const parsedUser = JSON.parse(storedUser);
                    
                    // Verify the token is still valid by checking with server
                    try {
                        const response = await apiService.checkAuthStatus({ showSessionExpiredModal });
                        if (response && response.user) {
                            // Server confirmed auth is valid
                            setUserData(response.user, storedToken);
                        } else {
                            // Invalid token, clear everything
                            setUserData(null, null);
                        }
                    } catch (error) {
                        // Token verification failed, clear everything
                        setUserData(null, null);
                    }
                } else {
                    // No stored credentials
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setUser(null);
            }
        };

        checkAuth();
    }, []);

    // Function to show session expired modal
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
                return response;
            } else {
                setUserData(null, null); // Clear data on failed login
                throw new Error('Login failed: Invalid server response.');
            }
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
            // Call server logout endpoint with auth context
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
    
    // Revalidate user session (useful for checking if session is still valid)
    const revalidateUser = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        try {
            const response = await apiService.checkAuthStatus({ showSessionExpiredModal });
            if (response && response.user) {
                // Use the existing token, as a new one isn't issued on profile check
                setUserData(response.user, token);
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