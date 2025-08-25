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
 * Initialize CSRF cookie for SPA authentication
 */
async function initCSRFCookie() {
    try {
        await fetch(SANCTUM_URL, {
            method: 'GET',
            credentials: 'include',
        });
    } catch (error) {
        console.warn('Failed to initialize CSRF cookie:', error);
    }
}

/**
 * Core API fetch function with auth context support
 */
const apiFetch = async (url, options = {}, auth = null) => {
    try {
        // Ensure CSRF cookie exists
        await initCSRFCookie();

        // Get auth token
        const token = localStorage.getItem('authToken');
        
        // Setup headers
        const headers = {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(options.headers || {}),
        };

        // Add CSRF token to headers
        const csrfToken = getCSRFToken();
        if (csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
        }

        // Add Authorization header if token exists
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Handle request body
        let body = options.body;
        if (body && typeof body === 'object' && !(body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(body);
        }

        // Make the request
        const response = await fetch(url, {
            ...options,
            headers,
            body,
            credentials: 'include', // Include cookies
        });

        // Handle 401 responses (session expired)
        if (response.status === 401) {
            // If we have an auth context and showSessionExpiredModal function, use it
            if (auth && typeof auth.showSessionExpiredModal === 'function') {
                auth.showSessionExpiredModal();
            }
            throw new Error('Session expired. Please refresh the page.');
        }

        // Handle 419 responses (CSRF token mismatch)
        if (response.status === 419) {
            throw new Error('Security token expired. Please refresh the page.');
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

// --- Utility Functions ---
/**
 * THIS IS THE MISSING FUNCTION
 * A helper function to read a specific cookie from the browser.
 * It's needed to retrieve the XSRF-TOKEN for secure POST requests.
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
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

// --- API Service Object ---
export const apiService = {
    // ===================================
    // AUTHENTICATION
    // ===================================
    
    // Initialize CSRF cookie for SPA authentication
    getCsrfCookie: () => initCSRFCookie(),

    login: (email, password, auth = null) => {
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

    register: (name, email, password, password_confirmation, auth = null) => {
        return apiFetch(`${API_BASE_URL}/public/register`, {
            method: 'POST',
            body: { name, email, password, password_confirmation },
        }, auth);
    },

    checkAuthStatus: (auth = null) => {
        return apiFetch(`${API_BASE_URL}/user/profile`, {}, auth);
    },

    // ===================================
    // PUBLIC ROUTES
    // ===================================
    getPublicCampaigns: (auth = null) => {
        return apiFetch(`${API_BASE_URL}/public/campaigns`, {}, auth);
    },

    getPublicCampaignsbyStatus: (auth = null) => {
        return apiFetch(`${API_BASE_URL}/public/campaigns?status=active`, {}, auth);
    },

    getCampaignDetail: (id, auth = null) => {
        return apiFetch(`${API_BASE_URL}/public/campaigns/${id}`, {}, auth);
    },

    getPublicInfluencers: (auth = null) => {
        return apiFetch(`${API_BASE_URL}/public/influencers`, {}, auth);
    },

    getInfluencerDetail: (id, auth = null) => {
        return apiFetch(`${API_BASE_URL}/public/influencers/${id}`, {}, auth);
    },

    getPublicPosts: (url = null, auth = null) => {
        return apiFetch(url || `${API_BASE_URL}/public/posts`, {}, auth);
    },

    getPostDetail: (id, auth = null) => {
        return apiFetch(`${API_BASE_URL}/public/posts/${id}`, {}, auth);
    },

    getCampaignLeaderboard: (campaignId, auth = null) => {
        return apiFetch(`${API_BASE_URL}/public/campaigns/${campaignId}/leaderboard`, {}, auth);
    },

    // ===================================
    // CAMPAIGN APPLICATIONS
    // ===================================
    applyCampaign: (campaignId, applicationData, auth = null) => {
        return apiFetch(`${API_BASE_URL}/campaigns/${campaignId}/apply`, {
            method: 'POST',
            body: applicationData,
        }, auth);
    },

    applyAsInfluencer: (applicationData, auth = null) => {
        return apiFetch(`${API_BASE_URL}/public/influencer-applications`, {
            method: 'POST',
            body: applicationData,
        }, auth);
    },

    // ===================================
    // ADMIN & BRAND ROUTES
    // ===================================
    getCampaigns: (params = {}, auth = null) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? 
            `${API_BASE_URL}/campaigns?${queryString}` : 
            `${API_BASE_URL}/campaigns`;
        
        return apiFetch(url, {}, auth);
    },

    getCampaign: (id, auth = null) => {
        return apiFetch(`${API_BASE_URL}/campaigns/${id}`, {}, auth);
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

    // Legacy admin methods (for backward compatibility)
    getAdminCampaigns: (auth = null) => {
        return apiFetch(`${API_BASE_URL}/admin/campaigns`, {}, auth);
    },

    getAdminCampaignDetail: (id, auth = null) => {
        return apiFetch(`${API_BASE_URL}/admin/campaigns/${id}`, {}, auth);
    },

    getBrandCampaigns: (auth = null) => {
        return apiFetch(`${API_BASE_URL}/brand/campaigns`, {}, auth);
    },

    // ===================================
    // CAMPAIGN MANAGEMENT
    // ===================================
    getCampaignParticipants: (campaignId, auth = null) => {
        return apiFetch(`${API_BASE_URL}/campaigns/${campaignId}/participants`, {}, auth);
    },

    getCampaignSubmissions: (campaignId, params = {}, auth = null) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? 
            `${API_BASE_URL}/campaigns/${campaignId}/submissions?${queryString}` : 
            `${API_BASE_URL}/campaigns/${campaignId}/submissions`;
        
        return apiFetch(url, {}, auth);
    },

    // Legacy method for admin campaign posts
    getAdminCampaignPosts: (campaignId, queryParams = {}, auth = null) => {
        const queryString = new URLSearchParams(queryParams).toString();
        const url = queryString ? 
            `${API_BASE_URL}/admin/campaigns/${campaignId}/posts?${queryString}` : 
            `${API_BASE_URL}/admin/campaigns/${campaignId}/posts`;
        
        return apiFetch(url, {}, auth);
    },

    validatePost: (postId, isValid, notes, auth = null) => {
        return apiFetch(`${API_BASE_URL}/admin/posts/${postId}/validate`, {
            method: 'POST',
            body: { is_valid: isValid, notes },
        }, auth);
    },

    // ===================================
    // APPLICATION MANAGEMENT
    // ===================================
    getApplications: (status = 'pending', page = 1, auth = null) => {
        return apiFetch(`${API_BASE_URL}/admin/influencer-applications?status=${status}&page=${page}`, {}, auth);
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

    // ===================================
    // USER SUBMISSIONS
    // ===================================
    getMyCampaigns: (auth = null) => {
        return apiFetch(`${API_BASE_URL}/my-campaigns`, {}, auth);
    },

    getMySubmissions: (campaignId = null, auth = null) => {
        const url = campaignId ? 
            `${API_BASE_URL}/my-submissions?campaign_id=${campaignId}` : 
            `${API_BASE_URL}/my-submissions`;
        
        return apiFetch(url, {}, auth);
    },

    submitContent: (campaignId, submissionData, auth = null) => {
        return apiFetch(`${API_BASE_URL}/campaigns/${campaignId}/submit`, {
            method: 'POST',
            body: submissionData,
        }, auth);
    },

    // ===================================
    // SOCIAL MEDIA ACCOUNTS
    // ===================================
    getSocialAccounts: (auth = null) => {
        return apiFetch(`${API_BASE_URL}/social-accounts`, {}, auth);
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
    // ADMIN ENDPOINTS
    // ===================================
    getDashboardStats: (auth = null) => {
        return apiFetch(`${API_BASE_URL}/admin/dashboard-stats`, {}, auth);
    },

    getUsers: (params = {}, auth = null) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? 
            `${API_BASE_URL}/admin/users?${queryString}` : 
            `${API_BASE_URL}/admin/users`;
        
        return apiFetch(url, {}, auth);
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
    // LEADERBOARD
    // ===================================
    getLeaderboard: (campaignId, auth = null) => {
        return apiFetch(`${API_BASE_URL}/campaigns/${campaignId}/leaderboard`, {}, auth);
    },

    // ===================================
    // NOTIFICATIONS
    // ===================================
    getNotifications: (auth = null) => {
        return apiFetch(`${API_BASE_URL}/notifications`, {}, auth);
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
        return apiFetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=${type}`, {}, auth);
    },
};

// Export default for convenience
export default apiService;