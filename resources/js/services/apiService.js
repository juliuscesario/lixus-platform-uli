// --- API Configuration ---
const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
const BASE_URL = isLocal ? "http://127.0.0.1:8000" : "https://jul-proto.lixus.id";
const API_BASE_URL = `${BASE_URL}/api`;

// --- Helper Functions ---

/**
 * Helper function to read a specific cookie from the browser
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

/**
 * Initialize CSRF cookie by calling sanctum/csrf-cookie
 */
const initializeCsrf = async () => {
    try {
        await fetch(`${BASE_URL}/sanctum/csrf-cookie`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Failed to initialize CSRF cookie:', error);
    }
};

/**
 * Global fetch wrapper with proper session handling
 */
const apiFetch = async (url, options = {}, auth = null) => {
    const isMutatingRequest = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
        (options.method || 'GET').toUpperCase()
    );
    
    // Always initialize CSRF for mutating requests to ensure fresh token
    if (isMutatingRequest) {
        await initializeCsrf();
    }

    // Get XSRF token for requests that modify data
    const xsrfToken = getCookie('XSRF-TOKEN');
    
    // Handle different body types
    let body = options.body;
    let contentType = 'application/json';
    
    if (body && !(body instanceof FormData)) {
        if (typeof body === 'object') {
            body = JSON.stringify(body);
        }
    } else if (body instanceof FormData) {
        contentType = null; // Let browser set multipart boundary
    }
    
    const defaultOptions = {
        credentials: 'include', // Always include cookies for sessions
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest', // Important for Sanctum SPA detection
            ...(contentType && { 'Content-Type': contentType }),
            ...(xsrfToken && isMutatingRequest && { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) }),
        },
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        body,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, mergedOptions);

        // Handle authentication errors
        if (response.status === 401) {
            if (auth && typeof auth.showSessionExpiredModal === 'function') {
                auth.showSessionExpiredModal();
            }
            throw new Error('Authentication failed');
        }

        // Handle CSRF token mismatch - retry once with fresh token
        if (response.status === 419) {
            await initializeCsrf();
            const freshToken = getCookie('XSRF-TOKEN');
            if (freshToken && isMutatingRequest) {
                mergedOptions.headers['X-XSRF-TOKEN'] = decodeURIComponent(freshToken);
                const retryResponse = await fetch(url, mergedOptions);
                return retryResponse; // Return the retry response regardless of status
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response;
    } catch (error) {
        // Don't log 401 errors as they're expected when not authenticated
        if (!error.message.includes('Authentication failed')) {
            console.error('API Fetch Error:', error);
        }
        throw error;
    }
};

// --- API Service Factory ---
export const apiService = (auth = null) => ({
    
    // ===================================
    // AUTHENTICATION ROUTES
    // ===================================
    login: async (email, password) => {
        const response = await apiFetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            body: { email, password },
        }, auth);
        
        return response.json();
    },

    register: async (name, email, password, password_confirmation) => {
        const response = await apiFetch(`${API_BASE_URL}/public/register`, {
            method: 'POST',
            body: { name, email, password, password_confirmation },
        }, auth);
        
        return response.json();
    },

    logout: async () => {
        const response = await apiFetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
        }, auth);
        
        return response.json();
    },

    checkAuthStatus: async () => {
        try {
            const response = await apiFetch(`${API_BASE_URL}/me`, {
                method: 'GET',
            }, auth);
            
            const data = await response.json();
            return data.user || data; // Handle both {user: ...} and direct user object
        } catch (error) {
            // Return null for auth failures instead of throwing
            if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('Authentication failed')) {
                return null;
            }
            // For other errors, re-throw them
            throw error;
        }
    },

    getCsrfCookie: async () => {
        await initializeCsrf();
    },

    // ===================================
    // PUBLIC ROUTES
    // ===================================
    getPublicCampaigns: async () => {
        const response = await apiFetch(`${API_BASE_URL}/public/campaigns`, {}, auth);
        return response.json();
    },

    getPublicCampaignsbyStatus: async () => {
        const response = await apiFetch(`${API_BASE_URL}/public/campaigns?status=active`, {}, auth);
        return response.json();
    },

    getCampaignDetail: async (id) => {
        const response = await apiFetch(`${API_BASE_URL}/public/campaigns/${id}`, {}, auth);
        return response.json();
    },

    getPublicInfluencers: async () => {
        const response = await apiFetch(`${API_BASE_URL}/public/influencers`, {}, auth);
        return response.json();
    },

    getInfluencerDetail: async (id) => {
        const response = await apiFetch(`${API_BASE_URL}/public/influencers/${id}`, {}, auth);
        return response.json();
    },

    getPublicPosts: async (url = null) => {
        const response = await apiFetch(url || `${API_BASE_URL}/public/posts`, {}, auth);
        return response.json();
    },

    getPostDetail: async (id) => {
        const response = await apiFetch(`${API_BASE_URL}/public/posts/${id}`, {}, auth);
        return response.json();
    },

    getCampaignLeaderboard: async (campaignId) => {
        const response = await apiFetch(`${API_BASE_URL}/public/campaigns/${campaignId}/leaderboard`, {}, auth);
        return response.json();
    },

    getCampaignRecommendations: async () => {
        const response = await apiFetch(`${API_BASE_URL}/campaigns/recommendations`, {}, auth);
        return response.json();
    },

    // ===================================
    // ADMIN & BRAND ROUTES
    // ===================================
    getAdminCampaigns: async () => {
        const response = await apiFetch(`${API_BASE_URL}/admin/campaigns`, {}, auth);
        return response.json();
    },

    getBrandCampaigns: async () => {
        const response = await apiFetch(`${API_BASE_URL}/brand/campaigns`, {}, auth);
        return response.json();
    },

    getAdminCampaignDetail: async (id) => {
        const response = await apiFetch(`${API_BASE_URL}/admin/campaigns/${id}`, {}, auth);
        return response.json();
    },

    createCampaign: async (campaignData) => {
        const response = await apiFetch(`${API_BASE_URL}/admin/campaigns`, {
            method: 'POST',
            body: campaignData,
        }, auth);
        
        return response.json();
    },

    updateCampaign: async (id, campaignData) => {
        const {
            name,
            description,
            start_date,
            end_date,
            budget,
            briefing_content,
            scoring_rules,
            status
        } = campaignData;

        const payload = {
            name,
            description,
            start_date,
            end_date,
            budget,
            briefing_content,
            scoring_rules,
            status
        };

        const response = await apiFetch(`${API_BASE_URL}/admin/campaigns/${id}`, {
            method: 'PUT',
            body: payload,
        }, auth);
        
        return response.json();
    },

    updateCampaignStatus: async (id, status) => {
        const response = await apiFetch(`${API_BASE_URL}/admin/campaigns/${id}/status`, {
            method: 'PATCH',
            body: { status }
        }, auth);
        
        return response.json();
    },

    getCampaignParticipants: async (campaignId) => {
        const response = await apiFetch(`${API_BASE_URL}/admin/campaigns/${campaignId}/participants`, {}, auth);
        return response.json();
    },

    updateParticipantStatus: async (campaignId, participantId, status) => {
        const response = await apiFetch(`${API_BASE_URL}/admin/campaigns/${campaignId}/participants/${participantId}/status`, {
            method: 'PATCH',
            body: { status }
        }, auth);
        
        return response.json();
    },

    getPublicCampaignPosts: async (campaignId, url = null) => {
        const response = await apiFetch(url || `${API_BASE_URL}/public/campaigns/${campaignId}/posts`, {}, auth);
        return response.json();
    },

    getAdminCampaignPosts: async (campaignId, queryParams = '') => {
        const response = await apiFetch(`${API_BASE_URL}/admin/campaigns/${campaignId}/posts?${queryParams}`, {}, auth);
        return response.json();
    },

    validatePost: async (postId, isValid, notes) => {
        const response = await apiFetch(`${API_BASE_URL}/admin/posts/${postId}`, {
            method: 'PUT',
            body: { is_valid_for_campaign: isValid, validation_notes: notes }
        }, auth);
        
        return response.json();
    },

    getPostsForInfluencerInCampaign: async (campaignId, userId) => {
        const response = await apiFetch(`${API_BASE_URL}/public/campaigns/${campaignId}/posts?user_id=${userId}`, {}, auth);
        return response.json();
    },

    fetchAbsoluteUrl: async (url) => {
        const response = await apiFetch(url, {}, auth);
        return response.json();
    },

    // ===================================
    // STRATEGIC REPORTING ROUTES
    // ===================================
    getBrandPerformanceReport: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const response = await apiFetch(`${API_BASE_URL}/admin/reports/brand-performance?${query}`, {}, auth);
        return response.json();
    },

    getCampaignComparisonReport: async (campaign_ids = []) => {
        const params = new URLSearchParams();
        campaign_ids.forEach(id => params.append('campaign_ids[]', id));
        const query = params.toString();
        const response = await apiFetch(`${API_BASE_URL}/admin/reports/campaign-comparison?${query}`, {}, auth);
        return response.json();
    },

    getInfluencerPerformanceReport: async (userId) => {
        const response = await apiFetch(`${API_BASE_URL}/admin/reports/influencer-performance/${userId}`, {}, auth);
        return response.json();
    },

    // ===================================
    // INFLUENCER ROUTES
    // ===================================
    getMyCampaigns: async () => {
        const response = await apiFetch(`${API_BASE_URL}/influencer/campaigns`, {}, auth);
        return response.json();
    },

    applyCampaign: async (campaignId) => {
        const response = await apiFetch(`${API_BASE_URL}/influencer/campaigns/${campaignId}/apply`, {
            method: 'POST'
        }, auth);
        
        return response.json();
    },

    withdrawFromCampaign: async (campaignId) => {
        const response = await apiFetch(`${API_BASE_URL}/influencer/campaigns/${campaignId}/withdraw`, {
            method: 'POST'
        }, auth);
        
        return response.json();
    },

    getInfluencerDashboardStats: async (userId) => {
        const response = await apiFetch(`${API_BASE_URL}/influencer/dashboard-stats/${userId}`, {}, auth);
        return response.json();
    },

    // ===================================
    // USER MANAGEMENT
    // ===================================
    updateProfile: async (profileData) => {
        const response = await apiFetch(`${API_BASE_URL}/profile`, {
            method: 'PUT',
            body: profileData,
        }, auth);
        
        return response.json();
    },

    // ===================================
    // APPLICATION MANAGEMENT
    // ===================================
    getApplications: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${API_BASE_URL}/applications?${queryString}` : `${API_BASE_URL}/applications`;
        
        const response = await apiFetch(url, {}, auth);
        return response.json();
    },

    createApplication: async (applicationData) => {
        const response = await apiFetch(`${API_BASE_URL}/applications`, {
            method: 'POST',
            body: applicationData,
        }, auth);
        
        return response.json();
    },

    updateApplicationStatus: async (id, status) => {
        const response = await apiFetch(`${API_BASE_URL}/applications/${id}/status`, {
            method: 'PUT',
            body: { status },
        }, auth);
        
        return response.json();
    },

    // ===================================
    // SOCIAL MEDIA MANAGEMENT
    // ===================================
    getSocialMediaAccounts: async () => {
        const response = await apiFetch(`${API_BASE_URL}/social-media-accounts`, {}, auth);
        return response.json();
    },

    // ===================================
    // ANALYTICS
    // ===================================
    getAnalytics: async (type, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString 
            ? `${API_BASE_URL}/analytics/${type}?${queryString}` 
            : `${API_BASE_URL}/analytics/${type}`;
        
        const response = await apiFetch(url, {}, auth);
        return response.json();
    },

    // ===================================
    // FILE UPLOAD
    // ===================================
    uploadFile: async (file, type = 'general') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const response = await apiFetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData, // FormData - don't stringify
        }, auth);

        return response.json();
    },
});

// Format helper functions
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