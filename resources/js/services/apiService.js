import { useAuth } from '../contexts/AuthContext';

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
const apiFetch = async (url, options = {}, auth) => {
    // Get XSRF token for POST/PUT/PATCH/DELETE requests
    const xsrfToken = getCookie('XSRF-TOKEN');
    
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
    
    // Add XSRF token for state-changing requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method?.toUpperCase()) && xsrfToken) {
        defaultOptions.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }
    
    // Automatically stringify body if it's an object
    if (defaultOptions.body && typeof defaultOptions.body === 'object') {
        defaultOptions.body = JSON.stringify(defaultOptions.body);
    }

    console.log('Fetching URL:', url, 'with options:', defaultOptions);
    const response = await fetch(url, defaultOptions);

    // Check if it's a public route by examining the URL
    const isPublicRoute = url.includes('/public/') || url.includes('/sanctum/');
    
    // If the session has expired, Laravel returns 401 or 419.
    // Only redirect to login if it's not a public route
    if ((response.status === 401 || response.status === 419) && !isPublicRoute) {
        if (auth) {
            auth.showSessionExpiredModal();
        }
        throw new Error('Your session has expired. Please log in again.');
    }

    // For public routes, let 401 errors pass through without redirecting
    if (!response.ok && (response.status === 401 || response.status === 419) && isPublicRoute) {
        throw new Error('Unauthorized');
    }

    // Handle empty response
    let data;
    try {
        data = await response.json();
    } catch (e) {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        data = {};
    }

    if (!response.ok) {
        const message = data.message || `HTTP error! Status: ${response.status}`;
        const validationErrors = data.errors ? Object.values(data.errors).flat().join(' ') : '';
        throw new Error(`${message} ${validationErrors}`);
    }

    return data;
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

    getApplications: async (status = 'pending', page = 1) => {
        const xsrfToken = getCookie('XSRF-TOKEN');
        try {
            const response = await fetch(`${API_BASE_URL}/admin/influencer-applications?status=${status}&page=${page}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken ? decodeURIComponent(xsrfToken) : '',
                },
            });
            if (!response.ok) throw new Error('Failed to fetch applications.');
            return await response.json();
        } catch (error) {
            console.error('API Error getApplications:', error);
            throw error;
        }
    },

    approveApplication: async (applicationId) => {
        const xsrfToken = getCookie('XSRF-TOKEN');
        try {
            const response = await fetch(`${API_BASE_URL}/admin/influencer-applications/${applicationId}/approve`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken ? decodeURIComponent(xsrfToken) : '',
                },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to approve application.');
            return data;
        } catch (error) {
            console.error('API Error approveApplication:', error);
            throw error;
        }
    },

    rejectApplication: async (applicationId, rejection_reason) => {
        const xsrfToken = getCookie('XSRF-TOKEN');
        try {
            const response = await fetch(`${API_BASE_URL}/admin/influencer-applications/${applicationId}/reject`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken ? decodeURIComponent(xsrfToken) : '',
                },
                body: JSON.stringify({ rejection_reason }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to reject application.');
            return data;
        } catch (error) {
            console.error('API Error rejectApplication:', error);
            throw error;
        }
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
            // This will succeed if the user is authenticated
            const response = await apiFetch(`${API_BASE_URL}/user/profile`, {}, auth);
            return { user: response.user };
        } catch (error) {
            // If it fails with a 401, it means the user is not logged in. Return null.
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                return { user: null };
            }
            // For other errors, re-throw them.
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
    getAdminCampaignPosts: (campaignId, url = null) => apiFetch(url || `${API_BASE_URL}/admin/campaigns/${campaignId}/posts`, {}, auth),
    validatePost: (postId, isValid, notes) => apiFetch(`${API_BASE_URL}/admin/posts/${postId}`, { method: 'PUT', body: { is_valid_for_campaign: isValid, validation_notes: notes } }, auth),
    getPostsForInfluencerInCampaign: (campaignId, userId) => apiFetch(`${API_BASE_URL}/public/campaigns/${campaignId}/posts?user_id=${userId}`, {}, auth),
    
    // ===================================
    // NEW! STRATEGIC REPORTING ROUTES
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

    // =-=================================
    // INFLUENCER ROUTES
    // ===================================
    getMyCampaigns: () => apiFetch(`${API_BASE_URL}/influencer/campaigns`, {}, auth),
    applyCampaign: (campaignId) => apiFetch(`${API_BASE_URL}/influencer/campaigns/${campaignId}/apply`, { method: 'POST' }, auth),
    withdrawFromCampaign: (campaignId) => apiFetch(`${API_BASE_URL}/influencer/campaigns/${campaignId}/withdraw`, { method: 'POST' }, auth),
    
    // New endpoint for influencer dashboard stats
    getInfluencerDashboardStats: (userId) => apiFetch(`${API_BASE_URL}/influencer/dashboard-stats/${userId}`, {}, auth),
});