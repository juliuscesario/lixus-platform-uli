import { useAuth } from '../contexts/AuthContext';

// --- API Configuration ---
const isLocal = window.location.hostname === "127.0.0.1";
const BASE_URL = isLocal ? "http://127.0.0.1:8000" : "https://jul-proto.lixus.id";

const API_BASE_URL = `${BASE_URL}/api`;
// This URL is for initializing the CSRF cookie session with Sanctum.
const SANCTUM_URL = BASE_URL;

// --- Helper Functions ---

/**
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
 * @param {string} url - The URL to fetch.
 * @param {object} options - The fetch options, including a custom 'suppressAuthRedirect' flag.
 * @param {object} auth - The auth context object with showSessionExpiredModal.
 * @returns {Promise<Response>}
 */
const apiFetch = async (url, options = {}, auth) => {
    // Destructure our custom option out so it's not passed to fetch()
    const { suppressAuthRedirect, ...fetchOptions } = options;

    const xsrfToken = getCookie('XSRF-TOKEN');
    
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
        },
        ...fetchOptions,
    };
    
    // ** THE FIX IS HERE **: Corrected 'xsriToken' to 'xsrfToken'
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(defaultOptions.method?.toUpperCase()) && xsrfToken) {
        defaultOptions.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }
    
    // Automatically stringify body unless it's FormData
    if (defaultOptions.body && typeof defaultOptions.body === 'object' && !(defaultOptions.body instanceof FormData)) {
        defaultOptions.body = JSON.stringify(defaultOptions.body);
    }

    const response = await fetch(url, defaultOptions);

    const isPublicRoute = url.includes('/public/') || url.includes('/sanctum/');
    
    // Only show the modal if the request failed AND the suppress flag is false.
    if ((response.status === 401 || response.status === 419) && !isPublicRoute && !suppressAuthRedirect) {
        if (auth && auth.showSessionExpiredModal) {
            auth.showSessionExpiredModal();
        }
        // We still throw the error to stop the promise chain
        throw new Error('Your session has expired. Please log in again.');
    }

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            // If parsing JSON fails, throw a generic error
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const message = errorData.message || `HTTP error! Status: ${response.status}`;
        const validationErrors = errorData.errors ? Object.values(errorData.errors).flat().join(' ') : '';
        throw new Error(`${message} ${validationErrors}`);
    }
    
    // Handle 204 No Content response
    if (response.status === 204) {
        return {};
    }

    return response.json();
}


// --- API Service Object ---
export const apiService = (auth) => ({
    // ===================================
    // AUTHENTICATION
    // ===================================
    getCsrfCookie: () => fetch(`${SANCTUM_URL}/sanctum/csrf-cookie`),

    login: async (email, password) => {
        await apiService(auth).getCsrfCookie();
        return apiFetch(`${API_BASE_URL}/public/login`, {
            method: 'POST',
            body: { email, password },
        }, auth);
    },

    getApplications: (status = 'pending', page = 1) => {
        return apiFetch(`${API_BASE_URL}/admin/influencer-applications?status=${status}&page=${page}`, { method: 'GET' }, auth);
    },

    approveApplication: (applicationId) => {
        return apiFetch(`${API_BASE_URL}/admin/influencer-applications/${applicationId}/approve`, { method: 'POST' }, auth);
    },

    rejectApplication: (applicationId, rejection_reason) => {
        return apiFetch(`${API_BASE_URL}/admin/influencer-applications/${applicationId}/reject`, { method: 'POST', body: { rejection_reason } }, auth);
    },

    applyAsInfluencer: (applicationData) => {
        return apiFetch(`${API_BASE_URL}/public/influencer-applications`, { method: 'POST', body: applicationData }, auth);
    },
    
    register: (name, email, password, password_confirmation) => {
        return apiFetch(`${API_BASE_URL}/public/register`, {
            method: 'POST',
            body: { name, email, password, password_confirmation },
        }, auth);
    },

    logout: () => {
        return apiFetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
        }, auth);
    },

    checkAuthStatus: async () => {
        try {
            // We pass our new option to this specific call.
            const response = await apiFetch(`${API_BASE_URL}/user/profile`, { suppressAuthRedirect: true }, auth);
            return { user: response.data || response }; // Handle cases where user is nested in 'data'
        } catch (error) {
            // If it fails with a 401, it's expected for a non-logged-in user. Return null.
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                return { user: null };
            }
            // For other errors, re-throw them so they can be caught elsewhere if needed.
            throw error;
        }
    },

    // ===================================
    // PUBLIC ROUTES
    // ===================================
    getPublicCampaigns: async () => {
        const response = await apiFetch(`${API_BASE_URL}/public/campaigns`, {}, auth);
        return response;
    },
    getPublicCampaignsbyStatus: async () => {
        const response = await apiFetch(`${API_BASE_URL}/public/campaigns?status=active`, {}, auth);
        return response;
    },
    getCampaignDetail: async (id) => {
        const response = await apiFetch(`${API_BASE_URL}/public/campaigns/${id}`, {}, auth);
        return response;
    },
    getPublicInfluencers: async () => {
        const response = await apiFetch(`${API_BASE_URL}/public/influencers`, {}, auth);
        return response;
    },
    getInfluencerDetail: async (id) => {
        const response = await apiFetch(`${API_BASE_URL}/public/influencers/${id}`, {}, auth);
        return response;
    },
    getPublicPosts: (url = null) => apiFetch(url || `${API_BASE_URL}/public/posts`, {}, auth),
    getPostDetail: (id) => apiFetch(`${API_BASE_URL}/public/posts/${id}`, {}, auth),
    getCampaignLeaderboard: (campaignId) => apiFetch(`${API_BASE_URL}/public/campaigns/${campaignId}/leaderboard`, {}, auth),
    
    // ===================================
    // ADMIN & BRAND ROUTES
    // ===================================
    getAdminCampaigns: () => apiFetch(`${API_BASE_URL}/admin/campaigns`, {}, auth),
    getAdminCampaignDetail: (id) => apiFetch(`${API_BASE_URL}/admin/campaigns/${id}`, {}, auth),
    createCampaign: async (campaignData) => {
        await apiService(auth).getCsrfCookie();
        return apiFetch(`${API_BASE_URL}/admin/campaigns`, { method: 'POST', body: campaignData }, auth);
    },
    updateCampaign: async (id, campaignData) => {
        await apiService(auth).getCsrfCookie();
        return apiFetch(`${API_BASE_URL}/admin/campaigns/${id}`, { method: 'PUT', body: campaignData }, auth);
    },
    updateCampaignStatus: (id, status) => apiFetch(`${API_BASE_URL}/admin/campaigns/${id}/status`, { method: 'PATCH', body: { status } }, auth),
    getCampaignParticipants: (campaignId) => apiFetch(`${API_BASE_URL}/admin/campaigns/${campaignId}/participants`, {}, auth),
    updateParticipantStatus: (campaignId, participantId, status) => apiFetch(`${API_BASE_URL}/admin/campaigns/${campaignId}/participants/${participantId}/status`, { method: 'PATCH', body: { status } }, auth),
    getPublicCampaignPosts: (campaignId, url = null) => apiFetch(url || `${API_BASE_URL}/public/campaigns/${campaignId}/posts`, {}, auth),
    getAdminCampaignPosts: (campaignId, queryParams = '') => apiFetch(`${API_BASE_URL}/admin/campaigns/${campaignId}/posts?${queryParams}`, {}, auth),
    validatePost: (postId, isValid, notes) => apiFetch(`${API_BASE_URL}/admin/posts/${postId}`, { method: 'PUT', body: { is_valid_for_campaign: isValid, validation_notes: notes } }, auth),
    getPostsForInfluencerInCampaign: (campaignId, userId) => apiFetch(`${API_BASE_URL}/public/campaigns/${campaignId}/posts?user_id=${userId}`, {}, auth),

    fetchAbsoluteUrl: (url) => apiFetch(url, {}, auth),
    
    // ===================================
    // STRATEGIC REPORTING ROUTES
    // ===================================
    getBrandPerformanceReport: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiFetch(`${API_BASE_URL}/admin/reports/brand-performance?${query}`, {}, auth);
    },

    getCampaignComparisonReport: (campaign_ids = []) => {
        const params = new URLSearchParams();
        campaign_ids.forEach(id => params.append('campaign_ids[]', id));
        const query = params.toString();
        return apiFetch(`${API_BASE_URL}/admin/reports/campaign-comparison?${query}`, {}, auth);
    },

    getInfluencerPerformanceReport: (userId) => {
        return apiFetch(`${API_BASE_URL}/admin/reports/influencer-performance/${userId}`, {}, auth);
    },

    // ===================================
    // INFLUENCER ROUTES
    // ===================================
    getMyCampaigns: () => apiFetch(`${API_BASE_URL}/influencer/campaigns`, {}, auth),
    applyCampaign: (campaignId) => apiFetch(`${API_BASE_URL}/influencer/campaigns/${campaignId}/apply`, { method: 'POST' }, auth),
    withdrawFromCampaign: (campaignId) => apiFetch(`${API_BASE_URL}/influencer/campaigns/${campaignId}/withdraw`, { method: 'POST' }, auth),
    disconnectTikTok: () => {
        return apiFetch(`${API_BASE_URL}/social/tiktok/disconnect`, {
            method: 'POST',
        }, auth);
    },
    fetchTiktokVideos: (campaignId) => apiFetch(`${API_BASE_URL}/influencer/campaigns/${campaignId}/fetch-tiktok-videos`, { method: 'POST', body: { campaign_id: campaignId } }, auth),
    getInfluencerDashboardStats: (userId) => apiFetch(`${API_BASE_URL}/influencer/dashboard-stats/${userId}`, {}, auth),
});