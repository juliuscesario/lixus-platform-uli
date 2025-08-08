// --- API Configuration ---
const API_BASE_URL = "https://jul-proto.lixus.id/api";
// PENTING: URL ini harus menunjuk ke root domain backend Anda, bukan /api
const SANCTUM_URL = "https://jul-proto.lixus.id"; 

// --- Helper Functions ---
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
};

const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('id-ID', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const formatCurrency = (amount) => {
    if (isNaN(amount)) return "N/A";
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

// HELPER BARU
const formatCompactNumber = (number) => {
    if (number === null || number === undefined) return '0';
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short'
    }).format(number);
};

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Wrapper fetch global untuk menangani error otentikasi
async function authenticatedFetch(url, options = {}) {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...options.headers,
        },
        ...options,
    };

    const response = await fetch(url, defaultOptions);

    // Jika sesi kedaluwarsa, server akan merespons dengan 401 atau 419
    if (response.status === 401 || response.status === 419) {
        // Hapus data pengguna dari localStorage
        localStorage.removeItem('authUser');
        // Muat ulang halaman, yang akan secara otomatis mengarahkan ke halaman login
        window.location.replace('/'); 
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
    }

    return response;
}



// --- API Service ---
const apiService = {
    // ==================================================================
    // PUBLIC API (Tidak perlu token)
    // ==================================================================
    getPublicCampaigns: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/public/campaigns`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Gagal mengambil data kampanye:", error);
            return { data: [] };
        }
    },

    getPublicCampaignsbyStatus: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/public/campaigns?status=active`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Gagal mengambil data kampanye:", error);
            return { data: [] };
        }
    },
    
    getCampaignDetail: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/public/campaigns/${id}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Gagal mengambil detail kampanye (ID: ${id}):`, error);
            return null;
        }
    },

    getPublicInfluencers: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/public/influencers`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            return { data: responseData };
        } catch (error) {
            console.error("Gagal mengambil data influencer:", error);
            return { data: [] };
        }
    },

    getInfluencerDetail: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/public/influencers/${id}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            return { data: responseData };
        } catch (error) {
            console.error(`Gagal mengambil detail influencer (ID: ${id}):`, error);
            return null;
        }
    },
    
    getPublicPosts: async (url = null) => {
        const fetchUrl = url || `${API_BASE_URL}/public/posts`;
        try {
            const response = await fetch(fetchUrl);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Gagal mengambil data post:", error);
            return { data: [], links: {}, meta: {} };
        }
    },

    getPostDetail: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/public/posts/${id}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Gagal mengambil detail post (ID: ${id}):`, error);
            return null;
        }
    },
    
    // ==================================================================
    // AUTHENTICATION API (Untuk Login, Register, Logout)
    // ==================================================================
    // FUNGSI BARU: Untuk mengambil CSRF cookie sebelum login/register
    getCsrfCookie: async () => {
        try {
            await fetch(`${SANCTUM_URL}/sanctum/csrf-cookie`, {
                credentials: 'include',
            });
            console.log("CSRF cookie obtained.");
        } catch (error) {
            console.error("Could not get CSRF cookie:", error);
        }
    },
    
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/public/login`, {
                method: 'POST',
                // PERBAIKAN: Menambahkan credentials: 'include' agar cookie dikirim
                credentials: 'include', 
                headers: { 
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');
            return data;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    },
    
    register: async (name, email, password, password_confirmation) => {
        try {
            const response = await fetch(`${API_BASE_URL}/public/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ name, email, password, password_confirmation }),
            });
            const data = await response.json();
            if (!response.ok) {
                const errorMessage = data.message || 'Registration failed.';
                const validationErrors = data.errors ? Object.values(data.errors).flat().join(' ') : '';
                throw new Error(`${errorMessage} ${validationErrors}`);
            }
            return data;
        } catch (error) {
            console.error("Register error:", error);
            throw error;
        }
    },
    
    logout: async () => { 
        try {
            await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
        } catch (error) {
            console.error("Logout error:", error);
            throw error;
        }
    },

    checkAuthStatus: async () => {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/user/profile`);
            if (!response.ok) return null;
            const responseData = await response.json();
            // PERBAIKAN: Kembalikan data pengguna dari dalam properti 'data' jika ada.
            return responseData.data || responseData;
        } catch (error) {
            console.error("Pengecekan status otentikasi gagal:", error);
            return null;
        }
    },

    // ==================================================================
    // AUTHENTICATED API (Perlu token)
    // ==================================================================
    // --- Admin & Brand ---

    
    getAdminCampaigns: async () => {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/admin/campaigns`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Gagal mengambil data kampanye admin:", error);
            return { data: [] };
        }
    },

    getAdminCampaignDetail: async (id) => {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/admin/campaigns/${id}`, {
                credentials: 'include',
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
            });
            if (!response.ok) throw new Error('Gagal mengambil detail kampanye');
            return await response.json();
        } catch (error) {
            console.error("Gagal mengambil detail kampanye admin:", error);
            throw error;
        }
    },

    createCampaign: async (campaignData) => {
        try {
            // PERBAIKAN: Ambil nilai token dari cookie yang sudah ada
            const xsrfToken = getCookie('XSRF-TOKEN');

            const response = await authenticatedFetch(`${API_BASE_URL}/admin/campaigns`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    // PERBAIKAN: Kirim token di header X-XSRF-TOKEN
                    'X-XSRF-TOKEN': xsrfToken ? decodeURIComponent(xsrfToken) : '',
                },
                body: JSON.stringify(campaignData),
            });
            
            const responseData = await response.json();
            if (!response.ok) {
                const message = responseData.message || `HTTP error! status: ${response.status}`;
                const errors = responseData.errors ? Object.values(responseData.errors).flat().join(' ') : '';
                throw new Error(`${message} ${errors}`);
            }
            return responseData;
        } catch (error) {
            console.error("Gagal membuat kampanye:", error);
            throw error;
        }
    },

    updateCampaign: async (id, campaignData) => {
        const xsrfToken = getCookie('XSRF-TOKEN');
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/admin/campaigns/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken ? decodeURIComponent(xsrfToken) : '',
                },
                body: JSON.stringify(campaignData),
            });
            const responseData = await response.json();
            if (!response.ok) throw new Error(responseData.message || 'Gagal mengupdate kampanye');
            return responseData;
        } catch (error) {
            console.error("Gagal mengupdate kampanye:", error);
            throw error;
        }
    },

    updateCampaignStatus: async (id, status) => {
        const xsrfToken = getCookie('XSRF-TOKEN');
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/admin/campaigns/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken ? decodeURIComponent(xsrfToken) : '',
                },
                body: JSON.stringify({ status }),
            });
            const responseData = await response.json();
            if (!response.ok) throw new Error(responseData.message || 'Gagal mengupdate status kampanye');
            return responseData;
        } catch (error) {
            console.error("Gagal mengupdate status kampanye:", error);
            throw error;
        }
    },

    getCampaignParticipants: async (campaignId) => {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/admin/campaigns/${campaignId}/participants`, {
                credentials: 'include',
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
            });
            if (!response.ok) throw new Error('Gagal mengambil data partisipan');
            return await response.json();
        } catch (error) {
            console.error("Gagal mengambil data partisipan:", error);
            throw error;
        }
    },

    updateParticipantStatus: async (campaignId, participantId, status) => {
        const xsrfToken = getCookie('XSRF-TOKEN');
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/admin/campaigns/${campaignId}/participants/${participantId}/status`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken ? decodeURIComponent(xsrfToken) : '',
                },
                body: JSON.stringify({ status }),
            });
            const responseData = await response.json();
            if (!response.ok) throw new Error(responseData.message || 'Gagal mengupdate status partisipan');
            return responseData;
        } catch (error) {
            console.error("Gagal mengupdate status partisipan:", error);
            throw error;
        }
    },

    getCampaignPosts: async (campaignId) => {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/public/posts/campaign/${campaignId}`, {
                credentials: 'include',
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
            });
            if (!response.ok) throw new Error('Gagal mengambil data postingan kampanye');
            return await response.json();
        } catch (error) {
            console.error("Gagal mengambil data postingan kampanye:", error);
            throw error;
        }
    },

    validatePost: async (postId, isValid, notes) => {
        const xsrfToken = getCookie('XSRF-TOKEN');
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/admin/posts/${postId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken ? decodeURIComponent(xsrfToken) : '',
                },
                body: JSON.stringify({ 
                    is_valid_for_campaign: isValid,
                    validation_notes: notes 
                }),
            });
            const responseData = await response.json();
            if (!response.ok) throw new Error(responseData.message || 'Gagal memvalidasi post');
            return responseData;
        } catch (error) {
            console.error("Gagal memvalidasi post:", error);
            throw error;
        }
    },

    getCampaignLeaderboard: async (campaignId) => {
        try {
            // Menggunakan endpoint public karena leaderboard bisa dilihat publik
            const response = await authenticatedFetch(`${API_BASE_URL}/public/campaigns/${campaignId}/leaderboard`, {
                credentials: 'include',
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
            });
            if (!response.ok) throw new Error('Gagal mengambil data leaderboard');
            return await response.json();
        } catch (error) {
            console.error("Gagal mengambil data leaderboard:", error);
            throw error;
        }
    },
    
    getPostsForInfluencerInCampaign: async (campaignId, userId) => {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/public/campaigns/${campaignId}/posts?user_id=${userId}`, {
                credentials: 'include',
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
            });
            if (!response.ok) throw new Error('Gagal mengambil data postingan influencer');
            return await response.json();
        } catch (error) {
            console.error("Gagal mengambil data postingan influencer:", error);
            throw error;
        }
    },

     // --- Influencer ---
    getMyCampaigns: async () => {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/influencer/campaigns`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal mengambil data kampanye saya');
            }
            return await response.json();
        } catch (error) {
            console.error("Gagal mengambil data kampanye saya:", error);
            // Mengembalikan array kosong agar tidak error di frontend
            return []; 
        }
    },

    applyCampaign: async (campaignId, status) => {
        const xsrfToken = getCookie('XSRF-TOKEN');
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/influencer/campaigns/${campaignId}/apply`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken ? decodeURIComponent(xsrfToken) : '',
                },
                body: JSON.stringify({ status }),
            });
            const responseData = await response.json();
            if (!response.ok) throw new Error(responseData.message || 'Gagal mendaftar kampanye');
            return responseData;
        } catch (error) {
            console.error("Gagal mendaftar kampanye:", error);
            throw error;
        }
    },

     // FUNGSI BARU
    withdrawFromCampaign: async (campaignId) => {
        const xsrfToken = getCookie('XSRF-TOKEN');
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/influencer/my-campaigns/${campaignId}/withdraw`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken ? decodeURIComponent(xsrfToken) : '',
                },
            });
            const responseData = await response.json();
            if (!response.ok) throw new Error(responseData.message || 'Gagal mengundurkan diri dari kampanye');
            return responseData;
        } catch (error) {
            console.error("Gagal withdraw dari kampanye:", error);
            throw error;
        }
    },
};

export { apiService, formatDate, formatCurrency, formatDateTime, formatCompactNumber };
