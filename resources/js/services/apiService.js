// resources/js/services/apiService.js
import { useAuth } from '../contexts/AuthContext';

// --- API Configuration ---
const API_BASE_URL = "https://jul-proto.lixus.id/api";
const SANCTUM_URL = "https://jul-proto.lixus.id";

// --- Helper Functions ---

/**
 * Helper function to read a specific cookie from the browser
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

/**
 * Clear all authentication-related cookies
 */
function clearAuthCookies() {
    // Clear session cookie
    document.cookie = 'laravel_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // Clear any other auth-related cookies
    document.cookie = 'lixus_platform_uli_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

export const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
};

export const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('id-ID', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

export const formatCurrency = (amount) => {
    if (isNaN(amount)) return "N/A";
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

export const formatCompactNumber = (number) => {
    if (number === null || number === undefined) return '0';
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short'
    }).format(number);
};

/**
 * Global fetch wrapper with hybrid authentication support
 * Supports both session-based (CSRF) and token-based authentication
 */
const apiFetch = async (url, options = {}, auth) => {
    // Determine authentication method based on what's available
    const token = localStorage.getItem('authToken');
    const xsrfToken = getCookie('XSRF-TOKEN');
    
    const defaultOptions = {
        credentials: 'include', // Always include cookies for session management
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };
    
    // Add Bearer token if available (for API token auth)
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add XSRF token for state-changing requests (for session auth)
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method?.toUpperCase()) && xsrfToken) {
        defaultOptions.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }
    
    // Automatically stringify body if it's an object and not FormData
    if (defaultOptions.body && typeof defaultOptions.body === 'object' && !(defaultOptions.body instanceof FormData)) {
        defaultOptions.body = JSON.stringify(defaultOptions.body);
    }

    try {
        const response = await fetch(url, defaultOptions);

        // Check if it's a public route
        const isPublicRoute = url.includes('/public/') || url.includes('/sanctum/');
        
        // Handle authentication errors
        if ((response.status === 401 || response.status === 419) && !isPublicRoute) {
            // Clear all auth data on session expiry
            clearAuthCookies();
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            
            if (auth && typeof auth.showSessionExpiredModal === 'function') {
                auth.showSessionExpiredModal();
            }
            throw new Error('Your session has expired. Please log in again.');
        }

        // Handle empty or non-JSON responses
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
            try {
                data = await response.json();
            } catch (e) {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                data = {};
            }
        } else {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            data = {};
        }

        if (!response.ok) {
            // Let login page handle its own 401s
            if (response.status === 401 && isPublicRoute) {
                throw new Error(data.message || 'Invalid credentials');
            }
            if (response.status === 403) {
                throw new Error(data.message || 'Forbidden: You do not have permission to access this resource.');
            }
            const message = data.message || `HTTP error! Status: ${response.status}`;
            const validationErrors = data.errors ? Object.values(data.errors).flat().join(' ') : '';
            throw new Error(`${message} ${validationErrors}`);
        }

        return data;
    } catch (error) {
        // Re-throw the error for the calling function to handle
        throw error;
    }
};

// --- API Service Object ---
export const apiService = (auth) => ({
    // ===================================
    // AUTHENTICATION
    // ===================================
    
    /**
     * Get CSRF cookie for session-based authentication
     */
    getCsrfCookie: async () => {
        try {
            await fetch(`${SANCTUM_URL}/sanctum/csrf-cookie`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });
        } catch (error) {
            console.error('Failed to get CSRF cookie:', error);
        }
    },

    /**
     * Login with proper session initialization
     */
    login: async (email, password) => {
        // First, get fresh CSRF cookie
        await apiService(auth).getCsrfCookie();
        
        // Clear any existing auth data before login
        clearAuthCookies();
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        
        return apiFetch(`${API_BASE_URL}/public/login`, {
            method: 'POST',
            body: { email, password },
        }, auth);
    },

    /**
     * Logout with complete session cleanup
     */
    logout: async () => {
        try {
            await apiFetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
            }, auth);
        } catch (error) {
            console.error('Logout API call failed:', error);
            // Continue with local cleanup even if API call fails
        } finally {
            // Clear all authentication data
            clearAuthCookies();
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            
            // Get fresh CSRF cookie for next session
            await apiService(auth).getCsrfCookie();
        }
    },

    /**
     * Check authentication status
     */
    checkAuthStatus: async () => {
        return apiFetch(`${API_BASE_URL}/user`, {}, auth);
    },

    /**
     * Register new user
     */
    register: async (name, email, password, password_confirmation) => {
        await apiService(auth).getCsrfCookie();
        return apiFetch(`${API_BASE_URL}/public/register`, {
            method: 'POST',
            body: { name, email, password, password_confirmation },
        }, auth);
    },

    // ===================================
    // ADMIN ENDPOINTS
    // ===================================
    
    getApplications: async (status = 'pending', page = 1) => {
        return apiFetch(`${API_BASE_URL}/admin/influencer-applications?status=${status}&page=${page}`, {}, auth);
    },

    approveApplication: async (applicationId) => {
        return apiFetch(`${API_BASE_URL}/admin/influencer-applications/${applicationId}/approve`, {
            method: 'POST'
        }, auth);
    },

    rejectApplication: async (applicationId, rejection_reason) => {
        return apiFetch(`${API_BASE_URL}/admin/influencer-applications/${applicationId}/reject`, {
            method: 'POST',
            body: { rejection_reason },
        }, auth);
    },

    // ===================================
    // INFLUENCER ENDPOINTS
    // ===================================
    
    applyAsInfluencer: async (applicationData) => {
        return apiFetch(`${API_BASE_URL}/public/influencer-applications`, {
            method: 'POST',
            body: applicationData,
        }, auth);
    },

    getInfluencerDashboardStats: async (influencerId) => {
        return apiFetch(`${API_BASE_URL}/influencer/dashboard-stats/${influencerId}`, {}, auth);
    },

    getInfluencerCampaigns: async (influencerId, status = 'all') => {
        return apiFetch(`${API_BASE_URL}/influencer/${influencerId}/campaigns?status=${status}`, {}, auth);
    },

    // ===================================
    // BRAND ENDPOINTS
    // ===================================
    
    getBrandDashboardStats: async (brandId) => {
        return apiFetch(`${API_BASE_URL}/brand/dashboard-stats/${brandId}`, {}, auth);
    },

    getBrandCampaigns: async (brandId, status = 'all') => {
        return apiFetch(`${API_BASE_URL}/brand/${brandId}/campaigns?status=${status}`, {}, auth);
    },

    // ===================================
    // CAMPAIGN ENDPOINTS
    // ===================================
    
    getCampaigns: async (page = 1, perPage = 10, filters = {}) => {
        const queryParams = new URLSearchParams({
            page,
            per_page: perPage,
            ...filters
        });
        return apiFetch(`${API_BASE_URL}/campaigns?${queryParams}`, {}, auth);
    },

    getCampaignDetails: async (campaignId) => {
        return apiFetch(`${API_BASE_URL}/campaigns/${campaignId}`, {}, auth);
    },

    createCampaign: async (campaignData) => {
        return apiFetch(`${API_BASE_URL}/campaigns`, {
            method: 'POST',
            body: campaignData,
        }, auth);
    },

    updateCampaign: async (campaignId, campaignData) => {
        return apiFetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
            method: 'PUT',
            body: campaignData,
        }, auth);
    },

    deleteCampaign: async (campaignId) => {
        return apiFetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
            method: 'DELETE',
        }, auth);
    },

    // ===================================
    // USER PROFILE
    // ===================================
    
    getUserProfile: async () => {
        return apiFetch(`${API_BASE_URL}/user`, {}, auth);
    },

    updateUserProfile: async (profileData) => {
        return apiFetch(`${API_BASE_URL}/user/profile`, {
            method: 'PUT',
            body: profileData,
        }, auth);
    },

    changePassword: async (currentPassword, newPassword, newPasswordConfirmation) => {
        return apiFetch(`${API_BASE_URL}/user/change-password`, {
            method: 'POST',
            body: {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: newPasswordConfirmation,
            },
        }, auth);
    },
});

// Export a default instance for backward compatibility
export default apiService;