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
    const [loading, setLoading] = useState(true); // Set initial loading to true
    const [sessionExpired, setSessionExpired] = useState(false);

    // This function will be called to check auth status
    const checkAuth = async () => {
        setLoading(true);
        try {
            const response = await apiService.checkAuthStatus({ showSessionExpiredModal });
            console.log('checkAuth response:', response);
            
            // The response contains { user: UserResource } or { user: null }
            if (response && response.user) {
                setUser(response.user);
                localStorage.setItem('authUser', JSON.stringify(response.user));
            } else {
                localStorage.removeItem('authUser');
                setUser(null);
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            localStorage.removeItem('authUser');
            setUser(null);
        } finally {
            setLoading(false);
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
        setLoading(true);
        try {
            const response = await apiService.login(email, password);
            console.log('Login API response:', response);
            
            // Instead of calling checkAuth which makes another API call,
            // let's directly set the user from the login response
            if (response.user) {
                console.log('Setting user from login response:', response.user);
                setUser(response.user);
                localStorage.setItem('authUser', JSON.stringify(response.user));
            } else {
                console.log('No user in response, calling checkAuth');
                // If no user in response, try checkAuth as fallback
                await checkAuth();
            }
            return response;
        } catch (error) {
            console.error('Login error:', error);
            setUser(null);
            localStorage.removeItem('authUser');
            throw error;
        } finally {
            setLoading(false);
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
        isAuthenticated: !!user,
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