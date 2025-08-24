import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

/**
 * Custom hook to use API service with auth context
 * This hook automatically passes the auth context to all API calls
 */
const useApi = () => {
    const auth = useAuth();

    // Create a memoized API caller that includes auth context
    const api = useCallback((serviceFunctionName, ...args) => {
        const serviceFunction = apiService[serviceFunctionName];
        
        if (typeof serviceFunction !== 'function') {
            throw new Error(`apiService function "${serviceFunctionName}" does not exist.`);
        }
        
        // Pass auth context as the last parameter to all API calls
        return serviceFunction(...args, auth);
    }, [auth]);

    // Return both the api caller and the raw apiService for flexibility
    return { api, apiService, auth };
};

export default useApi;