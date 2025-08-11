
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

    const response = await fetch(url, defaultOptions);

    // Check if it's a public route by examining the URL
    const isPublicRoute = url.includes('/public/') || url.includes('/sanctum/') || url.includes('/user/profile');
    
    // If the session has expired, Laravel returns 401 or 419.
    // Only redirect to login if it's not a public route
    if ((response.status === 401 || response.status === 419) && !isPublicRoute) {
        if (auth && typeof auth.showSessionExpiredModal === 'function') {
            auth.showSessionExpiredModal();
        } else {
            // Fallback for when auth context is not available
            console.error('Session expired, but no auth context was provided to show the modal.');
        }
        throw new Error(`Your session has expired. Please log in again. Status: ${response.status}`);
    }

    // For public routes, let 401 errors pass through without redirecting
    if (!response.ok && (response.status === 401 || response.status === 419) && isPublicRoute) {
        localStorage.removeItem('authUser');
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
        if (response.status === 403) {
            throw new Error(data.message || 'Forbidden: You do not have permission to access this resource.');
        }
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
    getCsrfCookie: () => fetch(`${SANCTUM_URL}/sanctum/csrf-cookie`, {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
        }
    }),

    login: async (email, password) => {
        // Ensure CSRF cookie is set before login
        await apiService.getCsrfCookie();
        return apiFetch(`${API_BASE_URL}/public/login`, {
            method: 'POST',
            body: { email, password },
        });
    },

    getApplications: (status = 'pending', page = 1) => {
        return apiFetch(`${API_BASE_URL}/admin/influencer-applications?status=${status}&page=${page}`, {});
    },

    approveApplication: (applicationId) => {
        return apiFetch(`${API_BASE_URL}/admin/influencer-applications/${applicationId}/approve`, {
            method: 'POST'
        });
    },

    rejectApplication: (applicationId, rejection_reason) => {
        return apiFetch(`${API_BASE_URL}/admin/influencer-applications/${applicationId}/reject`, {
            method: 'POST',
            body: { rejection_reason },
        });
    },

    // NEW METHOD
    applyAsInfluencer: (applicationData) => {
        return apiFetch(`${API_BASE_URL}/public/influencer-applications`, {
            method: 'POST',
            body: applicationData,
        });
    },
    
    register: (name, email, password, password_confirmation) => {
        return apiFetch(`${API_BASE_URL}/public/register`, {
            method: 'POST',
            body: { name, email, password, password_confirmation },
        });
    },

    logout: () => {
        return apiFetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
        });
    },

    checkAuthStatus: async (auth) => {
        // This endpoint will return user data if authenticated, or 401 if not.
        const response = await apiFetch(`${API_BASE_URL}/user/profile`, {},auth);
        // Extract user from response since UserResource wraps it
        return { user: response.user };
    },

    // ===================================
    // PUBLIC ROUTES
    // ===================================
    getPublicCampaigns: async () => {
        const response = await apiFetch(`${API_BASE_URL}/public/campaigns`, {});
        return response;
    },
    getPublicCampaignsbyStatus: async () => {
        const response = await apiFetch(`${API_BASE_URL}/public/campaigns?status=active`, {});
        return response;
    },
    getCampaignDetail: async (id) => {
        const response = await apiFetch(`${API_BASE_URL}/public/campaigns/${id}`, {});
        return response;
    },
    getPublicInfluencers: async () => {
        const response = await apiFetch(`${API_BASE_URL}/public/influencers`, {});
        return response;
    },
    getInfluencerDetail: async (id) => {
        const response = await apiFetch(`${API_BASE_URL}/public/influencers/${id}`,{});
        return response;
    },
    getPublicPosts: (url = null) => apiFetch(url || `${API_BASE_URL}/public/posts`, {}),
    getPostDetail: (id) => apiFetch(`${API_BASE_URL}/public/posts/${id}`, {}),
    getCampaignLeaderboard: (campaignId) => apiFetch(`${API_BASE_URL}/public/campaigns/${campaignId}/leaderboard`, {}),
    
    // ===================================
    // ADMIN & BRAND ROUTES
    // ===================================
    getAdminCampaigns: () => apiFetch(`${API_BASE_URL}/admin/campaigns`, {}),
    getBrandCampaigns: () => apiFetch(`${API_BASE_URL}/brand/campaigns`, {}),
    getAdminCampaignDetail: (id) => apiFetch(`${API_BASE_URL}/admin/campaigns/${id}`, {}),
    createCampaign: (campaignData) => {
        return apiFetch(`${API_BASE_URL}/admin/campaigns`, {
            method: 'POST',
            body: campaignData
        });
    },
    updateCampaign: (id, campaignData) => {
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

        // If you are using PUT, Laravel expects the _method field for form-data, but for JSON it's fine.
        // For partial updates, PATCH is more appropriate. The backend route must support PATCH.
        return apiFetch(`${API_BASE_URL}/admin/campaigns/${id}`, {
            method: 'PUT', // or 'PATCH'
            body: payload,
        });
    },
    updateCampaignStatus: (id, status) => apiFetch(`${API_BASE_URL}/admin/campaigns/${id}/status`, { method: 'PATCH', body: { status } }),
    getCampaignParticipants: (campaignId) => apiFetch(`${API_BASE_URL}/admin/campaigns/${campaignId}/participants`, {}),
    updateParticipantStatus: (campaignId, participantId, status) => apiFetch(`${API_BASE_URL}/admin/campaigns/${campaignId}/participants/${participantId}/status`, { method: 'PATCH', body: { status } }),
    getCampaignPosts: (campaignId, url = null) => apiFetch(url || `${API_BASE_URL}/public/posts/campaign/${campaignId}`, {}),
    validatePost: (postId, isValid, notes) => apiFetch(`${API_BASE_URL}/admin/posts/${postId}`, { method: 'PUT', body: { is_valid_for_campaign: isValid, validation_notes: notes } }),
    getPostsForInfluencerInCampaign: (campaignId, userId) => apiFetch(`${API_BASE_URL}/public/campaigns/${campaignId}/posts?user_id=${userId}`, {}),
    
    // ===================================
    // NEW! STRATEGIC REPORTING ROUTES
    // ===================================
    getBrandPerformanceReport: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiFetch(`${API_BASE_URL}/admin/reports/brand-performance?${query}`, {});
    },

    getCampaignComparisonReport: (campaign_ids = []) => {
        const params = new URLSearchParams();
        campaign_ids.forEach(id => params.append('campaign_ids[]', id));
        const query = params.toString();
        return apiFetch(`${API_BASE_URL}/admin/reports/campaign-comparison?${query}`, {});
    },

    getInfluencerPerformanceReport: (userId) => {
        return apiFetch(`${API_BASE_URL}/admin/reports/influencer-performance/${userId}`, {});
    },

    // =-=================================
    // INFLUENCER ROUTES
    // ===================================
    getMyCampaigns: () => apiFetch(`${API_BASE_URL}/influencer/campaigns`, {}),
    applyCampaign: (campaignId) => apiFetch(`${API_BASE_URL}/influencer/campaigns/${campaignId}/apply`, { method: 'POST' }),
    withdrawFromCampaign: (campaignId) => apiFetch(`${API_BASE_URL}/influencer/campaigns/${campaignId}/withdraw`, { method: 'POST' }),
};