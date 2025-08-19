import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

const useApi = () => {
    const auth = useContext(AuthContext);

    const api = (serviceFunctionName, ...args) => {
        const serviceFunction = apiService[serviceFunctionName];
        if (typeof serviceFunction !== 'function') {
            throw new Error(`apiService function ${serviceFunctionName} does not exist.`);
        }
        return serviceFunction(...args, auth);
    };

    return api;
};

export default useApi;