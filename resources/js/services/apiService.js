// --- API Configuration ---
const API_BASE_URL = "https://jul-proto.lixus.id/api";
// This URL is for initializing the CSRF cookie session with Sanctum.
const SANCTUM_URL = "https://jul-proto.lixus.id";

// --- Helper Functions ---

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


/**
 * A global fetch wrapper that handles credentials, headers, and authentication errors.
 * This is the core of the fix.
 * @param {string} url - The URL to fetch.
 * @param {object} options - The fetch options.
 * @returns {Promise<Response>}
 */
async function apiFetch(url, options = {}) {
    const defaultOptions = {
        // **THE FIX**: This ensures cookies (session, XSRF-TOKEN) are sent with every request.
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json', // Assume JSON content type for POST/PUT/PATCH
            ...options.headers,
        },
        ...options,
    };
    
    // Automatically stringify body if it's an object
    if (defaultOptions.body && typeof defaultOptions.body === 'object') {
        defaultOptions.body = JSON.stringify(defaultOptions.body);
    }

    const response = await fetch(url, defaultOptions);

    // If the session has expired, Laravel returns 401 or 419.
    // This will clear the user from local storage and force a page reload to the login screen.
    if (response.status === 401 || response.status === 419) {
        localStorage.removeItem('authUser');
        window.location.replace('/');
        throw new Error('Your session has expired. Please log in again.');
    }

    const data = await response.json();
    if (!response.ok) {
        const message = data.message || `HTTP error! Status: ${response.status}`;
        const validationErrors = data.errors ? Object.values(data.errors).flat().join(' ') : '';
        throw new Error(`${message} ${validationErrors}`);
    }

    return data;
}


// --- API Service Object ---
export const apiService = {
    // ===================================
    // AUTHENTICATION
    // ===================================
    getCsrfCookie: () => fetch(`${SANCTUM_URL}/sanctum/csrf-cookie`),

    login: async (email, password) => {
        await apiService.getCsrfCookie();
        return apiFetch(`${API_BASE_URL}/public/login`, {
            method: 'POST',
            body: { email, password },
        });
    },

    // NEW METHOD
    applyAsInfluencer: async (applicationData) => {
        const xsrfToken = getCookie('XSRF-TOKEN');
        try {
            const response = await fetch(`${API_BASE_URL}/public/influencer-applications`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken ? decodeURIComponent(xsrfToken) : '',
                },
                body: JSON.stringify(applicationData),
            });
            const responseData = await response.json();
            if (!response.ok) {
                const message = responseData.message || `HTTP error! status: ${response.status}`;
                const errors = responseData.errors ? Object.values(responseData.errors).flat().join(' ') : '';
                throw new Error(`${message} ${errors}`);
            }
            return responseData;
        } catch (error) {
            console.error("Gagal mengirim aplikasi influencer:", error);
            throw error;
        }
    },
    
/*    register: (name, email, password, password_confirmation) => {
        return apiFetch(`${API_BASE_URL}/public/register`, {
            method: 'POST',
            body: { name, email, password, password_confirmation },
        });
    },*/

    logout: () => {
        return apiFetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
        });
    },

    checkAuthStatus: () => {
        // This endpoint will return user data if authenticated, or 401 if not.
        return apiFetch(`${API_BASE_URL}/user/profile`);
    },

    // ===================================
    // PUBLIC ROUTES
    // ===================================
    getPublicCampaigns: () => apiFetch(`${API_BASE_URL}/public/campaigns`),
    getPublicCampaignsbyStatus: () => apiFetch(`${API_BASE_URL}/public/campaigns?status=active`),
    getCampaignDetail: (id) => apiFetch(`${API_BASE_URL}/public/campaigns/${id}`),
    getPublicInfluencers: () => apiFetch(`${API_BASE_URL}/public/influencers`),
    getInfluencerDetail: (id) => apiFetch(`${API_BASE_URL}/public/influencers/${id}`),
    getPublicPosts: (url = null) => apiFetch(url || `${API_BASE_URL}/public/posts`),
    getPostDetail: (id) => apiFetch(`${API_BASE_URL}/public/posts/${id}`),
    getCampaignLeaderboard: (campaignId) => apiFetch(`${API_BASE_URL}/public/campaigns/${campaignId}/leaderboard`),
    
    // ===================================
    // ADMIN & BRAND ROUTES
    // ===================================
    getAdminCampaigns: () => apiFetch(`${API_BASE_URL}/admin/campaigns`),
    getAdminCampaignDetail: (id) => apiFetch(`${API_BASE_URL}/admin/campaigns/${id}`),
    createCampaign: (campaignData) => apiFetch(`${API_BASE_URL}/admin/campaigns`, { method: 'POST', body: campaignData }),
    updateCampaign: (id, campaignData) => apiFetch(`${API_BASE_URL}/admin/campaigns/${id}`, { method: 'PUT', body: campaignData }),
    updateCampaignStatus: (id, status) => apiFetch(`${API_BASE_URL}/admin/campaigns/${id}/status`, { method: 'PATCH', body: { status } }),
    getCampaignParticipants: (campaignId) => apiFetch(`${API_BASE_URL}/admin/campaigns/${campaignId}/participants`),
    updateParticipantStatus: (campaignId, participantId, status) => apiFetch(`${API_BASE_URL}/admin/campaigns/${campaignId}/participants/${participantId}/status`, { method: 'PATCH', body: { status } }),
    getCampaignPosts: (campaignId, url = null) => apiFetch(url || `${API_BASE_URL}/public/posts/campaign/${campaignId}`),
    validatePost: (postId, isValid, notes) => apiFetch(`${API_BASE_URL}/admin/posts/${postId}`, { method: 'PUT', body: { is_valid_for_campaign: isValid, validation_notes: notes } }),
    getPostsForInfluencerInCampaign: (campaignId, userId) => apiFetch(`${API_BASE_URL}/public/campaigns/${campaignId}/posts?user_id=${userId}`),
    
    // ===================================
    // NEW! STRATEGIC REPORTING ROUTES
    // ===================================
    getBrandPerformanceReport: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiFetch(`${API_BASE_URL}/admin/reports/brand-performance?${query}`);
    },

    getCampaignComparisonReport: (campaign_ids = []) => {
        const params = new URLSearchParams();
        campaign_ids.forEach(id => params.append('campaign_ids[]', id));
        const query = params.toString();
        return apiFetch(`${API_BASE_URL}/admin/reports/campaign-comparison?${query}`);
    },

    getInfluencerPerformanceReport: (userId) => {
        return apiFetch(`${API_BASE_URL}/admin/reports/influencer-performance/${userId}`);
    },

    // ===================================
    // INFLUENCER ROUTES
    // ===================================
    getMyCampaigns: () => apiFetch(`${API_BASE_URL}/influencer/campaigns`),
    applyCampaign: (campaignId) => apiFetch(`${API_BASE_URL}/influencer/campaigns/${campaignId}/apply`, { method: 'POST' }),
    withdrawFromCampaign: (campaignId) => apiFetch(`${API_BASE_URL}/influencer/campaigns/${campaignId}/withdraw`, { method: 'POST' }),
};