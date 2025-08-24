// --- API Configuration ---
const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
const BASE_URL = isLocal ? "http://127.0.0.1:8000" : "https://jul-proto.lixus.id";
const API_BASE_URL = `${BASE_URL}/api`;
const SANCTUM_URL = `${BASE_URL}/sanctum/csrf-cookie`;

// --- Helper Functions ---

/**
 * Get CSRF token from meta tag
 */
function getCSRFToken() {
    const token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute('content') : null;
}

/**
 * Get XSRF token from cookie (used by Sanctum)
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
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
 * Initialize CSRF cookie for Sanctum SPA authentication
 */
const initCSRFCookie = async () => {
    try {
        await fetch(SANCTUM_URL, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        });
    } catch (error) {
        console.error('Failed to initialize CSRF cookie:', error);
    }
};

/**
 * Global fetch wrapper with proper CSRF and session handling
 */
const apiFetch = async (url, options = {}, auth = null) => {
    // For state-changing requests, ensure we have CSRF cookie
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method?.toUpperCase())) {
        // Initialize CSRF cookie if not present
        const xsrfToken = getCookie('XSRF-TOKEN');
        if (!xsrfToken && !url.includes('/public/')) {
            await initCSRFCookie();
        }
    }

    // Get tokens
    const csrfToken = getCSRFToken();
    const xsrfToken = getCookie('XSRF-TOKEN');
    const authToken = localStorage.getItem('authToken');

    const defaultOptions = {
        credentials: 'include', // Always include cookies for session
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest', // Identify as AJAX request
            ...options.headers,
        },
        ...options,
    };

    // Set appropriate content type
    if (!(options.body instanceof FormData)) {
        defaultOptions.headers['Content-Type'] = 'application/json';
    }

    // Add CSRF token from meta tag (for forms)
    if (csrfToken) {
        defaultOptions.headers['X-CSRF-TOKEN'] = csrfToken;
    }

    // Add XSRF token from cookie (for Sanctum)
    if (xsrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method?.toUpperCase())) {
        defaultOptions.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }

    // Add Bearer token if available (for API authentication)
    if (authToken) {
        defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Stringify body if it's an object and not FormData
    if (defaultOptions.body && typeof defaultOptions.body === 'object' && !(defaultOptions.body instanceof FormData)) {
        defaultOptions.body = JSON.stringify(defaultOptions.body);
    }

    console.log('Fetching:', url, 'with options:', {
        ...defaultOptions,
        headers: { ...defaultOptions.headers }
    });

    try {
        const response = await fetch(url, defaultOptions);

        // Check if it's a public route
        const isPublicRoute = url.includes('/public/') || url.includes('/sanctum/');

        // Handle authentication errors
        if (response.status === 401 && !isPublicRoute) {
            if (auth && typeof auth.showSessionExpiredModal === 'function') {
                auth.showSessionExpiredModal();
            }
            throw new Error('Session expired. Please log in again.');
        }

        // Handle CSRF token mismatch
        if (response.status === 419) {
            // Try to refresh CSRF token and retry once
            await initCSRFCookie();
            
            // Retry the request with new token
            const retryXsrfToken = getCookie('XSRF-TOKEN');
            if (retryXsrfToken) {
                defaultOptions.headers['X-XSRF-TOKEN'] = decodeURIComponent(retryXsrfToken);
                const retryResponse = await fetch(url, defaultOptions);
                
                if (retryResponse.ok) {
                    const contentType = retryResponse.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        return await retryResponse.json();
                    }
                    return {};
                }
            }
            
            throw new Error('CSRF token mismatch. Please refresh the page.');
        }

        // Handle empty or non-JSON responses
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
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
            if (response.status === 403) {
                throw new Error(data.message || 'Forbidden: You do not have permission to access this resource.');
            }
            const message = data.message || `HTTP error! Status: ${response.status}`;
            const validationErrors = data.errors ? Object.values(data.errors).flat().join(' ') : '';
            throw new Error(`${message} ${validationErrors}`.trim());
        }

        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

// --- API Service Object ---
export const apiService = {
    // ===================================
    // AUTHENTICATION
    // ===================================
    
    // Initialize CSRF cookie for SPA authentication
    getCsrfCookie: () => initCSRFCookie(),

    login: async (email, password, auth = null) => {
        // Ensure CSRF cookie is set before login
        await initCSRFCookie();
        
        return apiFetch(`${API_BASE_URL}/public/login`, {
            method: 'POST',
            body: { email, password },
        }, auth);
    },

    logout: (auth = null) => {
        return apiFetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
        }, auth);
    },

    register: async (name, email, password, password_confirmation, auth = null) => {
        // Ensure CSRF cookie is set before registration
        await initCSRFCookie();
        
        return apiFetch(`${API_BASE_URL}/public/register`, {
            method: 'POST',
            body: { name, email, password, password_confirmation },
        }, auth);
    },

    checkAuthStatus: (auth = null) => {
        return apiFetch(`${API_BASE_URL}/me`, {
            method: 'GET',
        }, auth);
    },

    // ===================================
    // USER PROFILE
    // ===================================
    getProfile: (auth = null) => {
        return apiFetch(`${API_BASE_URL}/profile`, {
            method: 'GET',
        }, auth);
    },

    updateProfile: (profileData, auth = null) => {
        return apiFetch(`${API_BASE_URL}/profile`, {
            method: 'PUT',
            body: profileData,
        }, auth);
    },

    // ===================================
    // INFLUENCER APPLICATIONS
    // ===================================
    getApplications: (status = 'pending', page = 1, auth = null) => {
        return apiFetch(`${API_BASE_URL}/admin/influencer-applications?status=${status}&page=${page}`, {
            method: 'GET',
        }, auth);
    },

    approveApplication: (applicationId, auth = null) => {
        return apiFetch(`${API_BASE_URL}/admin/influencer-applications/${applicationId}/approve`, {
            method: 'POST'
        }, auth);
    },

    rejectApplication: (applicationId, rejection_reason, auth = null) => {
        return apiFetch(`${API_BASE_URL}/admin/influencer-applications/${applicationId}/reject`, {
            method: 'POST',
            body: { rejection_reason },
        }, auth);
    },

    applyAsInfluencer: async (applicationData, auth = null) => {
        await initCSRFCookie();
        return apiFetch(`${API_BASE_URL}/public/influencer-applications`, {
            method: 'POST',
            body: applicationData,
        }, auth);
    },

    // ===================================
    // CAMPAIGNS
    // ===================================
    getCampaigns: (params = {}, auth = null) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? 
            `${API_BASE_URL}/campaigns?${queryString}` : 
            `${API_BASE_URL}/campaigns`;
        
        return apiFetch(url, {
            method: 'GET',
        }, auth);
    },

    getCampaign: (id, auth = null) => {
        return apiFetch(`${API_BASE_URL}/campaigns/${id}`, {
            method: 'GET',
        }, auth);
    },

    createCampaign: (campaignData, auth = null) => {
        return apiFetch(`${API_BASE_URL}/campaigns`, {
            method: 'POST',
            body: campaignData,
        }, auth);
    },

    updateCampaign: (id, campaignData, auth = null) => {
        return apiFetch(`${API_BASE_URL}/campaigns/${id}`, {
            method: 'PUT',
            body: campaignData,
        }, auth);
    },

    deleteCampaign: (id, auth = null) => {
        return apiFetch(`${API_BASE_URL}/campaigns/${id}`, {
            method: 'DELETE',
        }, auth);
    },

    joinCampaign: (campaignId, auth = null) => {
        return apiFetch(`${API_BASE_URL}/campaigns/${campaignId}/join`, {
            method: 'POST',
        }, auth);
    },

    leaveCampaign: (campaignId, auth = null) => {
        return apiFetch(`${API_BASE_URL}/campaigns/${campaignId}/leave`, {
            method: 'POST',
        }, auth);
    },

    getCampaignParticipants: (campaignId, auth = null) => {
        return apiFetch(`${API_BASE_URL}/campaigns/${campaignId}/participants`, {
            method: 'GET',
        }, auth);
    },

    getCampaignSubmissions: (campaignId, auth = null) => {
        return apiFetch(`${API_BASE_URL}/campaigns/${campaignId}/submissions`, {
            method: 'GET',
        }, auth);
    },

    // ===================================
    // SOCIAL MEDIA ACCOUNTS
    // ===================================
    getSocialAccounts: (auth = null) => {
        return apiFetch(`${API_BASE_URL}/social-accounts`, {
            method: 'GET',
        }, auth);
    },

    connectSocialAccount: (platform, accountData, auth = null) => {
        return apiFetch(`${API_BASE_URL}/social-accounts/connect`, {
            method: 'POST',
            body: { platform, ...accountData },
        }, auth);
    },

    disconnectSocialAccount: (accountId, auth = null) => {
        return apiFetch(`${API_BASE_URL}/social-accounts/${accountId}/disconnect`, {
            method: 'DELETE',
        }, auth);
    },

    // ===================================
    // CONTENT SUBMISSIONS
    // ===================================
    submitContent: (campaignId, submissionData, auth = null) => {
        return apiFetch(`${API_BASE_URL}/campaigns/${campaignId}/submit`, {
            method: 'POST',
            body: submissionData,
        }, auth);
    },

    getMySubmissions: (campaignId = null, auth = null) => {
        const url = campaignId ? 
            `${API_BASE_URL}/my-submissions?campaign_id=${campaignId}` : 
            `${API_BASE_URL}/my-submissions`;
        
        return apiFetch(url, {
            method: 'GET',
        }, auth);
    },

    // ===================================
    // LEADERBOARD
    // ===================================
    getLeaderboard: (campaignId, auth = null) => {
        return apiFetch(`${API_BASE_URL}/campaigns/${campaignId}/leaderboard`, {
            method: 'GET',
        }, auth);
    },

    // ===================================
    // ADMIN ENDPOINTS
    // ===================================
    getDashboardStats: (auth = null) => {
        return apiFetch(`${API_BASE_URL}/admin/dashboard-stats`, {
            method: 'GET',
        }, auth);
    },

    getUsers: (params = {}, auth = null) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? 
            `${API_BASE_URL}/admin/users?${queryString}` : 
            `${API_BASE_URL}/admin/users`;
        
        return apiFetch(url, {
            method: 'GET',
        }, auth);
    },

    updateUser: (userId, userData, auth = null) => {
        return apiFetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'PUT',
            body: userData,
        }, auth);
    },

    deleteUser: (userId, auth = null) => {
        return apiFetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'DELETE',
        }, auth);
    },

    // ===================================
    // NOTIFICATIONS
    // ===================================
    getNotifications: (auth = null) => {
        return apiFetch(`${API_BASE_URL}/notifications`, {
            method: 'GET',
        }, auth);
    },

    markNotificationAsRead: (notificationId, auth = null) => {
        return apiFetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
            method: 'POST',
        }, auth);
    },

    markAllNotificationsAsRead: (auth = null) => {
        return apiFetch(`${API_BASE_URL}/notifications/read-all`, {
            method: 'POST',
        }, auth);
    },

    // ===================================
    // SEARCH
    // ===================================
    search: (query, type = 'all', auth = null) => {
        return apiFetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=${type}`, {
            method: 'GET',
        }, auth);
    },
};

// Export default for convenience
export default apiService;