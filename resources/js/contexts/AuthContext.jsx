import React, { createContext, useState, useContext, useEffect } from 'react';
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
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);

    // This object will be passed to apiService, containing the functions it needs
    const authHelpers = {
        showSessionExpiredModal: () => setSessionExpired(true),
    };

    useEffect(() => {
        const checkUser = async () => {
            try {
                // This call now uses the updated apiService which won't trigger the modal
                const data = await apiService(authHelpers).checkAuthStatus();
                if (data && data.user) {
                    setUser(data.user);
                }
            } catch (error) {
                console.log("No active session found. Ready for login.");
                setUser(null);
            } finally {
                setLoading(false); // Done checking, allow app to render
            }
        };

        checkUser();
    }, []);

    const login = async (email, password) => {
        const data = await apiService(authHelpers).login(email, password);
        // Assuming login returns user data in a 'user' or 'data' property
        const userData = data.user || data.data;
        setUser(userData);
        return data;
    };

    const logout = async () => {
        try {
            await apiService(authHelpers).logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setSessionExpired(false);
            window.location.href = '/login';
        }
    };
    
    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        sessionExpired,
        setSessionExpired,
        showSessionExpiredModal: authHelpers.showSessionExpiredModal,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};