<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\User;
use App\Models\Post;
use App\Models\CampaignParticipant; // Pastikan model ini diimport jika Anda punya
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log; // Untuk logging
use App\Http\Resources\CampaignResource; // Import CampaignResource
use App\Http\Resources\CampaignParticipantResource; // Import CampaignParticipantResource
use App\Http\Resources\UserResource; // Untuk detail user jika perlu di leaderboard/participants
use App\Http\Resources\PostResource; // Pastikan PostResource diimport
use App\Http\Resources\CampaignLeaderboardResource; // Jika Anda punya resource khusus untuk leaderboard
use Illuminate\Validation\Rule; // Untuk validasi Rule::in
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder; // <-- ✅ ADD THIS LINE

class CampaignController extends Controller
{
    /**
     * Display a listing of campaigns accessible to the public.
     * Endpoint: GET /api/public/campaigns
     */
    public function indexPublic(Request $request)
    {
        Log::info('Fetching public campaigns with filter status.');
        
        // Hanya tampilkan kampanye aktif atau yang akan datang
        $campaignsQuery = Campaign::whereIn('status', ['active', 'pending']); // Menggunakan whereIn lebih baik
        if ($request->has('status')) {
            $statusFilter = $request->query('status');
            // Validasi status filter
            if (!in_array($statusFilter, ['active', 'pending', 'completed'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid status filter.'
                ], 400);
            }
            $campaignsQuery->where('status', $statusFilter);
        }
        $campaigns = $campaignsQuery->orderBy('start_date', 'asc')
                    ->get();

        return CampaignResource::collection($campaigns); // Gunakan CampaignResource::collection
    }

    /**
     * Display the specified campaign accessible to the public.
     * Endpoint: GET /api/public/campaigns/{campaign}
     */
    public function showPublic(Campaign $campaign)
    {
        Log::info('Fetching public campaign details.', ['campaign_id' => $campaign->id]);
        // Pastikan kampanye yang diakses publik memang berstatus yang bisa dilihat publik
        if (!in_array($campaign->status, ['active', 'pending', 'completed'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Campaign not found or not publicly accessible.'
            ], 404);
        }
        return new CampaignResource($campaign);
    }

    /**
     * Get posts for a specific campaign (Public).
     * Endpoint: GET /api/public/campaigns/{campaign}/posts
     */
    public function campaignPostsPublic(Request $request, Campaign $campaign)
    {
       Log::info('Fetching public campaign posts with optional user filter.', [
            'campaign_id' => $campaign->id,
            'user_id_filter' => $request->query('user_id')
        ]);

        // Mulai query untuk post yang valid dalam kampanye ini
        $postsQuery = $campaign->posts()
                               ->where('is_valid_for_campaign', true);

        // Jika ada user_id di query parameter, tambahkan filter
        if ($request->has('user_id')) {
            $userId = $request->query('user_id');
            // Opsional: Validasi user_id adalah UUID yang valid
            if (!\Illuminate\Support\Str::isUuid($userId)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid user ID format.'
                ], 400);
            }
            $postsQuery->where('user_id', $userId);
        }

        // Ambil posts dengan eager loading relasi yang dibutuhkan oleh PostResource
        $posts = $postsQuery->with(['user', 'campaign', 'socialMediaAccount'])
                            ->orderByDesc('posted_at')
                            ->get();

        // Menggunakan PostResource untuk format respons yang konsisten
        return PostResource::collection($posts);
    }

    /**
     * Get leaderboard for a specific campaign (Public).
     * Endpoint: GET /api/public/campaigns/{campaign}/leaderboard
     */
    public function leaderboardPublic(Campaign $campaign)
    {
        Log::info('Fetching public campaign leaderboard.', ['campaign_id' => $campaign->id]);
        // Ambil semua skor dari kampanye ini, group by user, dan order by total score
        // Pastikan relasi 'scores' ada di model Campaign
        $leaderboard = $campaign->scores()
                                ->selectRaw('user_id, SUM(score_value) as total_score')
                                ->groupBy('user_id')
                                ->orderByDesc('total_score')
                                ->with('user') // Load relasi user untuk mendapatkan nama influencer
                                ->get()
                                ->map(function($item) {
                                    // Transformasi data untuk leaderboard
                                    return [
                                        'user_id' => $item->user_id,
                                        'user_name' => $item->user ? $item->user->name : 'N/A', // Pastikan user ada
                                        'total_score' => (float)$item->total_score,
                                    ];
                                });

        return response()->json($leaderboard);
    }

    /**
     * Display a listing of campaigns for Admin/Brand.
     * Endpoint: GET /api/admin/campaigns
     */
    public function index(Request $request)
    {
        Log::info('Fetching campaigns for admin/brand.', ['user_id' => $request->user()->id]);
        $user = $request->user();

        if ($user->role->name === 'admin') {
            $campaigns = Campaign::orderBy('created_at', 'desc')->paginate(15); // Admin lihat semua
        } elseif ($user->role->name === 'brand') {
            $campaigns = Campaign::where('brand_id', $user->id) // Brand hanya lihat miliknya
                                 ->orderBy('created_at', 'desc')
                                 ->paginate(15);
        } else {
             // Ini seharusnya ditangani oleh middleware 'can:admin_or_brand'
             return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access.'
            ], 403);
        }

        return CampaignResource::collection($campaigns);
    }

    /**
     * Store a newly created campaign in storage (Admin/Brand Only).
     * Endpoint: POST /api/admin/campaigns
     */
    public function store(Request $request)
    {
        Log::info('Attempting to create a new campaign.', $request->all());

        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255|unique:campaigns,name',
                'description' => 'nullable|string',
                'start_date' => 'required|date|after_or_equal:today',
                'end_date' => 'required|date|after_or_equal:start_date',
                'budget' => 'required|numeric|min:0',
                'briefing_content' => 'nullable|array', // Mengubah ke array untuk JSON column
                'scoring_rules' => 'nullable|array', // Mengubah ke array untuk JSON column
                'status' => ['nullable', 'string', Rule::in(['draft', 'pending', 'active', 'completed', 'cancelled'])],
            ]);

            $user = $request->user();
            // brand_id akan otomatis terisi dari user yang sedang login
            $validatedData['brand_id'] = $user->id;

            if (!isset($validatedData['status'])) {
                $validatedData['status'] = 'draft'; // Default status
            }

            $campaign = Campaign::create($validatedData);

            Log::info('Campaign created successfully.', ['campaign_id' => $campaign->id, 'campaign_name' => $campaign->name]);
            return response()->json([
                'status' => 'success',
                'message' => 'Campaign created successfully.',
                'data' => new CampaignResource($campaign)
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Campaign creation validation failed.', ['errors' => $e->errors(), 'request' => $request->all()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Throwable $e) {
            Log::error('An unexpected error occurred during campaign creation: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred.',
                'debug' => $e->getMessage() // Hapus di production
            ], 500);
        }
    }

    /**
     * Display the specified campaign for Admin/Brand.
     * Endpoint: GET /api/admin/campaigns/{campaign}
     */
    public function show(Campaign $campaign)
    {
        Log::info('Fetching campaign details for admin/brand.', ['campaign_id' => $campaign->id, 'user_id' => request()->user()->id]);
        $user = request()->user();

        // Pastikan admin bisa melihat semua, brand hanya yang miliknya
        if ($user->role->name === 'brand' && $campaign->brand_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access to this campaign.'
            ], 403);
        }
        return new CampaignResource($campaign);
    }

    /**
     * Update the specified campaign in storage (Admin/Brand Only).
     * Endpoint: PUT /api/admin/campaigns/{campaign}
     */
    public function update(Request $request, Campaign $campaign)
    {
        Log::info('Attempting to update campaign.', ['campaign_id' => $campaign->id, 'request' => $request->all()]);

        $user = $request->user();
        if ($user->role->name === 'brand' && $campaign->brand_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to update this campaign.'
            ], 403);
        }

        try {
            $validatedData = $request->validate([
                'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('campaigns')->ignore($campaign->id)],
                'description' => 'nullable|string',
                'start_date' => 'sometimes|required|date|after_or_equal:today',
                'end_date' => 'sometimes|required|date|after_or_equal:start_date',
                'budget' => 'sometimes|required|numeric|min:0',
                'briefing_content' => 'nullable|array',
                'scoring_rules' => 'nullable|array',
                'status' => ['sometimes', 'required', 'string', Rule::in(['draft', 'pending', 'active', 'completed', 'cancelled'])],
            ]);

            $campaign->update($validatedData);

            Log::info('Campaign updated successfully.', ['campaign_id' => $campaign->id]);
            return response()->json([
                'status' => 'success',
                'message' => 'Campaign updated successfully.',
                'data' => new CampaignResource($campaign->fresh())
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Campaign update validation failed.', ['errors' => $e->errors(), 'campaign_id' => $campaign->id]);
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Throwable $e) {
            Log::error('An unexpected error occurred during campaign update: ' . $e->getMessage(), ['campaign_id' => $campaign->id, 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred.',
                'debug' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified campaign from storage (Admin Only).
     * Endpoint: DELETE /api/admin/campaigns/{campaign}
     */
    public function destroy(Campaign $campaign)
    {
        Log::info('Attempting to delete campaign.', ['campaign_id' => $campaign->id, 'user_id' => request()->user()->id]);
        $user = request()->user();

        // Hanya admin yang bisa menghapus kampanye (atau admin dan brand yang memiliki kampanye)
        if ($user->role->name === 'brand' && $campaign->brand_id !== $user->id) {
             return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to delete this campaign.'
            ], 403);
        }
        // Jika Anda hanya ingin admin yang bisa delete, maka $user->role->name === 'admin'
        // dan middleware 'can:admin' harus diatur di route

        try {
            $campaign->delete();
            Log::info('Campaign deleted successfully.', ['campaign_id' => $campaign->id]);
            return response()->json(null, 204); // No Content
        } catch (\Throwable $e) {
            Log::error('Error deleting campaign: ' . $e->getMessage(), ['campaign_id' => $campaign->id, 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete campaign.'
            ], 500);
        }
    }

    /**
     * Update campaign status (Admin/Brand Only).
     * Endpoint: PATCH /api/admin/campaigns/{campaign}/status
     */
    public function updateStatus(Request $request, Campaign $campaign)
    {
        Log::info('Attempting to update campaign status.', ['campaign_id' => $campaign->id, 'request_status' => $request->status]);

        $user = $request->user();
        if ($user->role->name === 'brand' && $campaign->brand_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to update status for this campaign.'
            ], 403);
        }

        try {
            $validatedData = $request->validate([
                'status' => ['required', 'string', Rule::in(['draft', 'pending', 'active', 'completed', 'cancelled'])],
            ]);

            $campaign->update(['status' => $validatedData['status']]);

            Log::info('Campaign status updated successfully.', ['campaign_id' => $campaign->id, 'new_status' => $campaign->status]);
            return response()->json([
                'status' => 'success',
                'message' => 'Campaign status updated successfully.',
                'data' => new CampaignResource($campaign->fresh())
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Campaign status update validation failed.', ['errors' => $e->errors(), 'campaign_id' => $campaign->id]);
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Throwable $e) {
            Log::error('An unexpected error occurred during campaign status update: ' . $e->getMessage(), ['campaign_id' => $campaign->id, 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred.',
                'debug' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get participants for a specific campaign (Admin/Brand Only).
     * Endpoint: GET /api/admin/campaigns/{campaign}/participants
     */
    public function getParticipants(Campaign $campaign)
    {
        Log::info('Fetching campaign participants.', ['campaign_id' => $campaign->id, 'user_id' => request()->user()->id]);
        $user = request()->user();

        if ($user->role->name === 'brand' && $campaign->brand_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view participants for this campaign.'
            ], 403);
        }

        // Pastikan relasi 'participants' ada di model Campaign
        // dan ia adalah Many-to-Many ke User melalui CampaignParticipant
        $participants = $campaign->participants()->with(['user.influencerProfile', 'user.socialMediaAccounts'])->get(); // Load user dan influencer profile

        return CampaignParticipantResource::collection($participants);
    }

    /**
     * Update participation status for an influencer in a campaign (Admin/Brand Only).
     * Endpoint: PATCH /api/admin/campaigns/{campaign}/participants/{user}/status
     */
    public function updateParticipantStatus(Request $request, Campaign $campaign, User $user)
    {
        Log::info('Attempting to update participant status.', ['campaign_id' => $campaign->id, 'user_id' => $user->id, 'request_status' => $request->status]);

        $authUser = $request->user();
        if ($authUser->role->name === 'brand' && $campaign->brand_id !== $authUser->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to update participant status for this campaign.'
            ], 403);
        }

        try {
            $request->validate([
                'status' => ['required', 'string', Rule::in(['pending', 'approved', 'rejected', 'completed', 'withdrawn'])],
            ]);

            // Dapatkan entri di tabel pivot (CampaignParticipant)
            $participant = CampaignParticipant::where('campaign_id', $campaign->id)
                                              ->where('user_id', $user->id)
                                              ->first();

            if (!$participant) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User is not a participant in this campaign.'
                ], 404);
            }

            $participant->update(['status' => $request->status]);

            Log::info('Participant status updated successfully.', ['campaign_id' => $campaign->id, 'user_id' => $user->id, 'new_status' => $participant->status]);
            return response()->json([
                'status' => 'success',
                'message' => 'Participation status updated successfully.',
                'data' => new CampaignParticipantResource($participant->fresh())
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Participant status update validation failed.', ['errors' => $e->errors(), 'campaign_id' => $campaign->id, 'user_id' => $user->id]);
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Throwable $e) {
            Log::error('An unexpected error occurred during participant status update: ' . $e->getMessage(), ['campaign_id' => $campaign->id, 'user_id' => $user->id, 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => 'error',
                'message' => 'An internal server error occurred.',
                'debug' => $e->getMessage()
            ], 500);
        }
    }

    // --- INFLUENCER SPECIFIC CAMPAIGN ACTIONS ---

    /**
     * Get campaigns available/relevant to the authenticated influencer.
     * Endpoint: GET /api/influencer/campaigns
     */
    public function indexForInfluencer(Request $request) // Atau myCampaigns()
    {
        Log::info('Fetching campaigns for influencer.', ['user_id' => $request->user()->id]);
        $user = $request->user();

       $campaigns = Campaign::where('status', 'active')
        // Filter Campaigns that have a 'currentParticipant' relationship...
        ->whereHas('currentParticipant', function (Builder $query) {
            // ...where that participant's 'status' column is not null.
            $query->whereNotNull('status');
        })
        // Eager load the participant data for the filtered campaigns
        ->with('currentParticipant')
        ->orderBy('start_date', 'asc')
        ->get();

        return CampaignResource::collection($campaigns);
    }

    /**
     * Display the specified campaign for an influencer.
     * Endpoint: GET /api/influencer/campaigns/{campaign}
     */
    public function showForInfluencer(Campaign $campaign, Request $request)
    {
        Log::info('Fetching influencer campaign details.', ['campaign_id' => $campaign->id, 'user_id' => $request->user()->id]);
        // Influencer bisa melihat kampanye aktif atau kampanye yang mereka ikuti
        if (!in_array($campaign->status, ['active', 'completed'])) {
            // Periksa jika user adalah partisipan meskipun statusnya tidak aktif/completed
            $isParticipant = $campaign->participants()->where('user_id', $request->user()->id)->exists();
            if (!$isParticipant) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Campaign not found or not accessible to you.'
                ], 404);
            }
        }

        // Load status partisipasi jika influencer sudah mendaftar
        $campaign->load([
            'participants' => function($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            }
        ]);

        return new CampaignResource($campaign);
    }


    /**
     * Influencer applies for a campaign.
     * Endpoint: POST /api/influencer/campaigns/{campaign}/apply
     */
    public function applyForCampaign(Request $request, Campaign $campaign)
    {
        Log::info('Influencer attempting to apply for campaign.', ['campaign_id' => $campaign->id, 'user_id' => $request->user()->id]);
        $user = $request->user();

        // Pastikan kampanye aktif dan belum berakhir
        if ($campaign->status !== 'active' || now()->greaterThan($campaign->end_date)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Campaign is not active or has ended.'
            ], 400);
        }

        // Pastikan influencer belum pernah apply untuk kampanye ini
        $existingParticipant = CampaignParticipant::where('campaign_id', $campaign->id)
                                                ->where('user_id', $user->id)
                                                ->first();

        if ($existingParticipant) {
            if ($existingParticipant->status === 'pending') {
                return response()->json([
                    'status' => 'info',
                    'message' => 'You have already applied for this campaign and your application is pending.'
                ], 409); // Conflict
            }
            if ($existingParticipant->status === 'approved') {
                return response()->json([
                    'status' => 'info',
                    'message' => 'You are already an approved participant for this campaign.'
                ], 409); // Conflict
            }
            // Jika status lain (rejected, withdrawn), izinkan apply ulang? Tergantung kebijakan
            // Untuk sekarang, kita anggap hanya bisa apply sekali dan status pending/approved mencegah
             $existingParticipant->update(['status' => 'pending']); // Jika sebelumnya rejected/withdrawn, set ke pending lagi
             Log::info('Influencer re-applied for campaign.', ['campaign_id' => $campaign->id, 'user_id' => $user->id]);
             return response()->json([
                'status' => 'success',
                'message' => 'You have successfully re-applied for the campaign.'
            ], 200);
        }

        try {
            // Buat entri partisipasi baru
            $participant = CampaignParticipant::create([
                'campaign_id' => $campaign->id,
                'user_id' => $user->id,
                'status' => 'pending', // Status awal saat mendaftar
            ]);

            Log::info('Influencer applied for campaign successfully.', ['campaign_id' => $campaign->id, 'user_id' => $user->id]);
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully applied for the campaign. Your application is pending review.',
                'data' => new CampaignParticipantResource($participant)
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Error applying for campaign: ' . $e->getMessage(), ['campaign_id' => $campaign->id, 'user_id' => $user->id, 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to apply for campaign.'
            ], 500);
        }
    }

    /**
     * Get campaigns the authenticated influencer is actively participating in.
     * This method might be redundant with myCampaigns if myCampaigns also filters status.
     * @deprecated Use myCampaigns and filter on frontend or add status filter to myCampaigns.
     */
    // public function myActiveCampaigns(Request $request) { ... }

    /**
     * Influencer withdraws from a campaign.
     * Endpoint: POST /api/influencer/my-campaigns/{campaign}/withdraw
     */
    public function withdrawFromCampaign(Request $request, Campaign $campaign)
    {
         $user = $request->user(); // Influencer yang sedang login

        Log::info('Influencer attempting to withdraw from campaign.', [
            'campaign_id' => $campaign->id,
            'user_id' => $user->id
        ]);

        // Cari partisipasi influencer untuk campaign ini
        $participant = CampaignParticipant::where('campaign_id', $campaign->id)
                                          ->where('user_id', $user->id)
                                          ->first();

        if (!$participant) {
            Log::warning('Withdrawal failed: Participant not found for campaign.', [
                'campaign_id' => $campaign->id,
                'user_id' => $user->id
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'You are not a participant in this campaign, or your application does not exist.'
            ], 404);
        }

        // Validasi status saat ini
        // Influencer hanya bisa menarik diri jika statusnya 'pending' atau 'approved'
        // Jika sudah 'completed' atau 'rejected', mungkin tidak bisa withdraw
        if (!in_array($participant->status, ['pending', 'approved'])) {
             Log::warning('Withdrawal failed: Current participant status does not allow withdrawal.', [
                'campaign_id' => $campaign->id,
                'user_id' => $user->id,
                'current_status' => $participant->status
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot withdraw application with current status: ' . $participant->status
            ], 400); // 400 Bad Request
        }

        try {
            // Update status partisipasi menjadi 'withdrawn'
            $participant->update(['status' => 'withdrawn']);

            Log::info('Influencer successfully withdrew from campaign.', [
                'campaign_id' => $campaign->id,
                'user_id' => $user->id,
                'new_status' => $participant->status
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Successfully withdrew from the campaign.',
                'data' => new CampaignParticipantResource($participant->fresh()) // Memuat ulang data
            ]);

        } catch (\Exception $e) {
            Log::error('Error withdrawing from campaign.', [
                'campaign_id' => $campaign->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to withdraw from campaign.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * [Public] Get leaderboard for a specific campaign.
     * Endpoint: GET /api/public/campaigns/{uuid}/leaderboard
     * Roadmap: 4.13 Mendapatkan leaderboard untuk kampanye tertentu
     */
    public function getLeaderboard(Request $request, Campaign $campaign)
    {
        try {
            // Mengambil data leaderboard
            // Menggunakan GROUP BY untuk menjumlahkan skor per user (influencer)
            $leaderboardData = Post::select(
                'user_id',
                DB::raw('SUM(score) as total_score') // Sum total score for each user
            )
            ->where('campaign_id', $campaign->id)
            ->where('is_valid_for_campaign', true) // Hanya post yang valid untuk kampanye
            ->whereNotNull('score') // Hanya post yang sudah memiliki skor
            ->groupBy('user_id')
            ->orderByDesc('total_score')
            ->with(['user.influencerProfile', 'user.socialMediaAccounts']) // Load user dan profilnya
            ->limit($request->query('limit', 10)) // Default 10, bisa diatur dari request
            ->offset($request->query('offset', 0)) // Paginasi
            ->get();

            Log::info('Leaderboard accessed for campaign.', ['campaign_id' => $campaign->id]);

            return response()->json([
                'status' => 'success',
                'message' => 'Campaign leaderboard retrieved successfully.',
                'campaign_name' => $campaign->name,
                // Menggunakan resource collection
                'data' => CampaignLeaderboardResource::collection($leaderboardData)
            ], 200);


        } catch (\Throwable $e) {
            Log::error('Failed to retrieve campaign leaderboard.', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString(), 'campaign_id' => $campaign->id]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve campaign leaderboard.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

}