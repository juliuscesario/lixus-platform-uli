// FILE: resources/js/hooks/useApi.js (STANDARDIZED VERSION)
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

const useApi = () => {
    const auth = useAuth();

    const api = useCallback((serviceFunctionName, ...args) => {
        const serviceFunction = apiService[serviceFunctionName];
        
        if (typeof serviceFunction !== 'function') {
            const availableFunctions = Object.keys(apiService).join(', ');
            throw new Error(`apiService function "${serviceFunctionName}" does not exist. Available: ${availableFunctions}`);
        }
        
        return serviceFunction(...args);
    }, [auth]);

    return { api };
};

export default useApi;