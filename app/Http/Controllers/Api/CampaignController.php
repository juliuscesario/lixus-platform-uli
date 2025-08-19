<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\User;
use App\Models\Post;
use App\Models\CampaignParticipant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\CampaignResource;
use App\Http\Resources\CampaignParticipantResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\PostResource;
use App\Http\Resources\CampaignLeaderboardResource;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;

class CampaignController extends Controller
{
    /**
     * Display a listing of campaigns accessible to the public.
     * Endpoint: GET /api/public/campaigns
     */
    public function indexPublic(Request $request)
    {
        Log::info('Fetching public campaigns with filter status.');
        
        $campaignsQuery = Campaign::whereIn('status', ['active', 'pending']);
        if ($request->has('status')) {
            $statusFilter = $request->query('status');
            if (!in_array($statusFilter, ['active', 'pending', 'completed'])) {
                return response()->json(['status' => 'error', 'message' => 'Invalid status filter.'], 400);
            }
            $campaignsQuery->where('status', $statusFilter);
        }
        $campaigns = $campaignsQuery->orderBy('start_date', 'asc')->get();

        return CampaignResource::collection($campaigns);
    }

    /**
     * Display the specified campaign accessible to the public.
     * Endpoint: GET /api/public/campaigns/{campaign}
     */
    public function showPublic(Campaign $campaign)
    {
        Log::info('Fetching public campaign details.', ['campaign_id' => $campaign->id]);
        if (!in_array($campaign->status, ['active', 'pending', 'completed'])) {
            return response()->json(['status' => 'error', 'message' => 'Campaign not found or not publicly accessible.'], 404);
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

        $postsQuery = $campaign->posts();

        if ($request->has('user_id')) {
            $userId = $request->query('user_id');
            if (!\Illuminate\Support\Str::isUuid($userId)) {
                return response()->json(['status' => 'error', 'message' => 'Invalid user ID format.'], 400);
            }
            $postsQuery->where('user_id', $userId);
        }

        $posts = $postsQuery->with(['user', 'campaign', 'socialMediaAccount'])
                            ->orderByDesc('posted_at')
                            ->get();

        return PostResource::collection($posts);
    }

    /**
     * Get posts for a specific campaign (Admin/Brand).
     * Endpoint: GET /api/admin/campaigns/{campaign}/posts
     */
    public function getCampaignPostsAdmin(Request $request, Campaign $campaign)
    {
       Log::info('Fetching admin campaign posts with optional filters.', [
            'campaign_id' => $campaign->id,
            'user_id_filter' => $request->query('user_id'),
            'platform_filter' => $request->query('platform'),
            'start_date_filter' => $request->query('start_date'),
            'end_date_filter' => $request->query('end_date'),
            'search_query' => $request->query('search')
        ]);

        $user = $request->user();
        if ($user->role->name === 'brand' && $campaign->brand_id !== $user->id) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized to view posts for this campaign.'], 403);
        }

        $postsQuery = $campaign->posts()->with(['user.influencerProfile', 'socialMediaAccount']);

        Log::debug('Base posts query for campaign:', ['campaign_id' => $campaign->id]);

        Log::info('Base posts query for campaign:', ['campaign_id' => $campaign->id, 'count' => $postsQuery->count()]);

        // Temporarily remove filters for debugging
        // if ($request->has('user_id')) {
        //     $userId = $request->query('user_id');
        //     if (!\Illuminate\Support\Str::isUuid($userId)) {
        //         return response()->json(['status' => 'error', 'message' => 'Invalid user ID format.'], 400);
        //     }
        //     $postsQuery->where('user_id', $userId);
        // }

        // if ($request->has('platform') && $request->query('platform') !== 'all') {
        //     $postsQuery->whereHas('socialMediaAccount', function ($q) use ($request) {
        //         $q->where('platform', $request->query('platform'));
        //     });
        // }

        // if ($request->has('start_date')) {
        //     $postsQuery->where('posted_at', '>=', $request->query('start_date'));
        // }

        // if ($request->has('end_date')) {
        //     $postsQuery->where('posted_at', '<=', $request->query('end_date'));
        // }

        // if ($request->has('search')) {
        //     $search = $request->query('search');
        //     $postsQuery->where(function ($query) use ($search) {
        //         $query->where('caption', 'like', '%' . $search . '%')
        //               ->orWhere('platform_post_id', 'like', '%' . $search . '%')
        //               ->orWhereHas('user', function ($q) use ($search) {
        //                   $q->where('name', 'like', '%' . $search . '%');
        //               });
        //     });
        // }

        // Log::info('Posts query before pagination:', ['sql' => $postsQuery->toSql(), 'bindings' => $postsQuery->getBindings()]);
        // Log::debug('Posts query before pagination:', ['sql' => $postsQuery->toSql(), 'bindings' => $postsQuery->getBindings()]);
        $posts = $postsQuery->orderByDesc('posted_at')->get(); // Get all posts without pagination
        dd($posts); // Dump and die to inspect the data
        // Log::debug('Posts retrieved count:', ['count' => $posts->count()]);
        // Log::info('Posts retrieved count:', ['count' => $posts->count()]);

        // return PostResource::collection($posts);
    }

    /**
     * Get leaderboard for a specific campaign (Public).
     * Endpoint: GET /api/public/campaigns/{campaign}/leaderboard
     */
    public function leaderboardPublic(Campaign $campaign)
    {
        Log::info('Fetching public campaign leaderboard.', ['campaign_id' => $campaign->id]);
        $leaderboard = $campaign->scores()
                                ->selectRaw('user_id, SUM(score_value) as total_score')
                                ->groupBy('user_id')
                                ->orderByDesc('total_score')
                                ->with('user')
                                ->get()
                                ->map(function($item) {
                                    return [
                                        'user_id' => $item->user_id,
                                        'user_name' => $item->user ? $item->user->name : 'N/A',
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
        $query = Campaign::query();

        if ($user->role->name === 'brand') {
            $query->where('brand_id', $user->id);
        }

        // ✅ FIX: Eager load relationships needed for stats calculation
        $campaigns = $query->with(['participants', 'posts'])
                           ->orderBy('created_at', 'desc')
                           ->paginate(15);
        
        // ✅ FIX: Add aggregate stats to each campaign after fetching
        $campaigns->getCollection()->transform(function ($campaign) {
            $campaign->total_participants = $campaign->participants->where('status', 'approved')->count();
            $campaign->total_posts = $campaign->posts->count();
            
            $total_likes = 0;
            $total_comments = 0;

            foreach ($campaign->posts as $post) {
                // The 'metrics' attribute is cast to an array by the Post model
                $metrics = $post->metrics ?? [];
                $total_likes += (int)($metrics['likes_count'] ?? 0);
                $total_comments += (int)($metrics['comments_count'] ?? 0);
            }
            
            $campaign->total_likes = $total_likes;
            $campaign->total_comments = $total_comments;
            $campaign->total_points = $campaign->posts->sum('score');
            
            return $campaign;
        });

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
                'briefing_content' => 'nullable|array',
                'scoring_rules' => 'nullable|array',
                'status' => ['nullable', 'string', Rule::in(['draft', 'pending', 'active', 'completed', 'cancelled'])],
            ]);

            $user = $request->user();
            $validatedData['brand_id'] = $user->id;
            $validatedData['status'] = $validatedData['status'] ?? 'draft';

            $campaign = Campaign::create($validatedData);

            Log::info('Campaign created successfully.', ['campaign_id' => $campaign->id]);
            return response()->json([
                'status' => 'success',
                'message' => 'Campaign created successfully.',
                'data' => new CampaignResource($campaign)
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Campaign creation validation failed.', ['errors' => $e->errors()]);
            return response()->json(['status' => 'error', 'message' => 'Validation failed.', 'errors' => $e->errors()], 422);
        } catch (\Throwable $e) {
            Log::error('An unexpected error occurred during campaign creation: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'An internal server error occurred.'], 500);
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

        if ($user->role->name === 'brand' && $campaign->brand_id !== $user->id) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized access to this campaign.'], 403);
        }
        return new CampaignResource($campaign);
    }

    /**
     * Update the specified campaign in storage (Admin/Brand Only).
     * Endpoint: PUT /api/admin/campaigns/{campaign}
     */
    public function update(Request $request, Campaign $campaign)
    {
        Log::info('Attempting to update campaign.', ['campaign_id' => $campaign->id]);

        $user = $request->user();
        if ($user->role->name === 'brand' && $campaign->brand_id !== $user->id) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized to update this campaign.'], 403);
        }

        try {
            $rules = [
                'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('campaigns')->ignore($campaign->id)],
                'description' => 'nullable|string',
                'budget' => 'sometimes|required|numeric|min:0',
                'briefing_content' => 'nullable|array',
                'scoring_rules' => 'nullable|array',
                'status' => ['sometimes', 'required', 'string', Rule::in(['draft', 'pending', 'active', 'completed', 'cancelled'])],
            ];
            
            if ($request->has('start_date')) {
                $rules['start_date'] = 'required|date|' . ($campaign->start_date->isFuture() ? 'after_or_equal:today' : '');
            }
            
            if ($request->has('end_date')) {
                $rules['end_date'] = 'required|date|after_or_equal:start_date';
            }
            
            $validatedData = $request->validate($rules);
            $campaign->update($validatedData);

            Log::info('Campaign updated successfully.', ['campaign_id' => $campaign->id]);
            return response()->json([
                'status' => 'success',
                'message' => 'Campaign updated successfully.',
                'data' => new CampaignResource($campaign->fresh())
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Campaign update validation failed.', ['errors' => $e->errors(), 'campaign_id' => $campaign->id]);
            return response()->json(['status' => 'error', 'message' => 'Validation failed.', 'errors' => $e->errors()], 422);
        } catch (\Throwable $e) {
            Log::error('An unexpected error occurred during campaign update: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'An internal server error occurred.'], 500);
        }
    }

    /**
     * Remove the specified campaign from storage (Admin Only).
     * Endpoint: DELETE /api/admin/campaigns/{campaign}
     */
    public function destroy(Campaign $campaign)
    {
        Log::info('Attempting to delete campaign.', ['campaign_id' => $campaign->id]);
        $user = request()->user();

        if ($user->role->name === 'brand' && $campaign->brand_id !== $user->id) {
             return response()->json(['status' => 'error', 'message' => 'Unauthorized to delete this campaign.'], 403);
        }

        try {
            $campaign->delete();
            Log::info('Campaign deleted successfully.', ['campaign_id' => $campaign->id]);
            return response()->json(null, 204);
        } catch (\Throwable $e) {
            Log::error('Error deleting campaign: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Failed to delete campaign.'], 500);
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
            return response()->json(['status' => 'error', 'message' => 'Unauthorized to update status for this campaign.'], 403);
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
            Log::error('Campaign status update validation failed.', ['errors' => $e->errors()]);
            return response()->json(['status' => 'error', 'message' => 'Validation failed.', 'errors' => $e->errors()], 422);
        } catch (\Throwable $e) {
            Log::error('An unexpected error occurred during campaign status update: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'An internal server error occurred.'], 500);
        }
    }

    /**
     * Get participants for a specific campaign (Admin/Brand Only).
     * Endpoint: GET /api/admin/campaigns/{campaign}/participants
     */
    public function getParticipants(Campaign $campaign)
    {
        Log::info('Fetching campaign participants.', ['campaign_id' => $campaign->id]);
        $user = request()->user();
        if ($user->role->name === 'brand' && $campaign->brand_id !== $user->id) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized to view participants for this campaign.'], 403);
        }

        $participants = $campaign->participants()->with(['user.influencerProfile', 'user.socialMediaAccounts'])->get();
        return CampaignParticipantResource::collection($participants);
    }

    /**
     * Update participation status for an influencer in a campaign (Admin/Brand Only).
     * Endpoint: PATCH /api/admin/campaigns/{campaign}/participants/{user}/status
     */
    public function updateParticipantStatus(Request $request, Campaign $campaign, User $user)
    {
        Log::info('Attempting to update participant status.', ['campaign_id' => $campaign->id, 'user_id' => $user->id]);
        $authUser = $request->user();
        if ($authUser->role->name === 'brand' && $campaign->brand_id !== $authUser->id) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized to update participant status.'], 403);
        }

        try {
            $request->validate(['status' => ['required', 'string', Rule::in(['pending', 'approved', 'rejected', 'completed', 'withdrawn'])]]);
            $participant = CampaignParticipant::where('campaign_id', $campaign->id)->where('user_id', $user->id)->firstOrFail();
            $participant->update(['status' => $request->status]);
            Log::info('Participant status updated successfully.', ['campaign_id' => $campaign->id, 'user_id' => $user->id, 'new_status' => $participant->status]);
            return response()->json([
                'status' => 'success',
                'message' => 'Participation status updated successfully.',
                'data' => new CampaignParticipantResource($participant->fresh())
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Participant status update validation failed.', ['errors' => $e->errors()]);
            return response()->json(['status' => 'error', 'message' => 'Validation failed.', 'errors' => $e->errors()], 422);
        } catch (\Throwable $e) {
            Log::error('An unexpected error occurred during participant status update: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'An internal server error occurred.'], 500);
        }
    }

    // --- INFLUENCER SPECIFIC CAMPAIGN ACTIONS ---

    public function indexForInfluencer(Request $request)
    {
        Log::info('Fetching campaigns for influencer.', ['user_id' => $request->user()->id]);
        $campaigns = Campaign::where('status', 'active')
            ->whereHas('currentParticipant', fn (Builder $query) => $query->whereNotNull('status'))
            ->with('currentParticipant')
            ->orderBy('start_date', 'asc')
            ->get();
        return CampaignResource::collection($campaigns);
    }

    public function showForInfluencer(Campaign $campaign, Request $request)
    {
        Log::info('Fetching influencer campaign details.', ['campaign_id' => $campaign->id, 'user_id' => $request->user()->id]);
        if (!in_array($campaign->status, ['active', 'completed']) && !$campaign->participants()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['status' => 'error', 'message' => 'Campaign not found or not accessible to you.'], 404);
        }
        $campaign->load(['participants' => fn($query) => $query->where('user_id', $request->user()->id)]);
        return new CampaignResource($campaign);
    }

    public function applyForCampaign(Request $request, Campaign $campaign)
    {
        Log::info('Influencer attempting to apply for campaign.', ['campaign_id' => $campaign->id, 'user_id' => $request->user()->id]);
        $user = $request->user();

        if ($campaign->status !== 'active' || now()->greaterThan($campaign->end_date)) {
            return response()->json(['status' => 'error', 'message' => 'Campaign is not active or has ended.'], 400);
        }

        $existingParticipant = CampaignParticipant::where('campaign_id', $campaign->id)->where('user_id', $user->id)->first();
        if ($existingParticipant) {
            if (in_array($existingParticipant->status, ['pending', 'approved'])) {
                return response()->json(['status' => 'info', 'message' => 'You have already applied for this campaign.'], 409);
            }
            $existingParticipant->update(['status' => 'pending']);
            Log::info('Influencer re-applied for campaign.', ['campaign_id' => $campaign->id, 'user_id' => $user->id]);
            return response()->json(['status' => 'success', 'message' => 'You have successfully re-applied for the campaign.'], 200);
        }

        try {
            $participant = CampaignParticipant::create(['campaign_id' => $campaign->id, 'user_id' => $user->id, 'status' => 'pending']);
            Log::info('Influencer applied for campaign successfully.', ['campaign_id' => $campaign->id, 'user_id' => $user->id]);
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully applied for the campaign. Your application is pending review.',
                'data' => new CampaignParticipantResource($participant)
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Error applying for campaign: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Failed to apply for campaign.'], 500);
        }
    }

    public function withdrawFromCampaign(Request $request, Campaign $campaign)
    {
         $user = $request->user();
        Log::info('Influencer attempting to withdraw from campaign.', ['campaign_id' => $campaign->id, 'user_id' => $user->id]);
        $participant = CampaignParticipant::where('campaign_id', $campaign->id)->where('user_id', $user->id)->first();

        if (!$participant) {
            Log::warning('Withdrawal failed: Participant not found.');
            return response()->json(['status' => 'error', 'message' => 'You are not a participant in this campaign.'], 404);
        }
        if (!in_array($participant->status, ['pending', 'approved'])) {
             Log::warning('Withdrawal failed: Invalid status for withdrawal.');
            return response()->json(['status' => 'error', 'message' => 'Cannot withdraw application with current status: ' . $participant->status], 400);
        }

        try {
            $participant->update(['status' => 'withdrawn']);
            Log::info('Influencer successfully withdrew from campaign.');
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully withdrew from the campaign.',
                'data' => new CampaignParticipantResource($participant->fresh())
            ]);
        } catch (\Exception $e) {
            Log::error('Error withdrawing from campaign: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Failed to withdraw from campaign.'], 500);
        }
    }

    public function getLeaderboard(Request $request, Campaign $campaign)
    {
        try {
            $leaderboardData = Post::select('user_id', DB::raw('SUM(score) as total_score'))
                ->where('campaign_id', $campaign->id)
                ->where('is_valid_for_campaign', true)
                ->groupBy('user_id')
                ->orderByDesc('total_score')
                ->with(['user.influencerProfile', 'user.socialMediaAccounts'])
                ->limit($request->query('limit', 10))
                ->offset($request->query('offset', 0))
                ->get();
            Log::info('Leaderboard accessed for campaign.', ['campaign_id' => $campaign->id]);
            return response()->json([
                'status' => 'success',
                'message' => 'Campaign leaderboard retrieved successfully.',
                'campaign_name' => $campaign->name,
                'data' => CampaignLeaderboardResource::collection($leaderboardData)
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Failed to retrieve campaign leaderboard: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Failed to retrieve campaign leaderboard.'], 500);
        }
    }
}