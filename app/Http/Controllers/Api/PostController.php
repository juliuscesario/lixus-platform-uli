<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use App\Models\Campaign;
use App\Models\Post;
use App\Models\CampaignParticipant;
use App\Http\Resources\PostResource;
use App\Http\Resources\CampaignResource; // Pastikan ini diimpor jika digunakan di PostResource
use App\Models\User; // Pastikan ini diimpor jika digunakan di PostResource (untuk influencer)

class PostController extends Controller
{
    /**
     * [Public] Mendapatkan detail postingan publik.
     * Endpoint: GET /public/posts/{post}
     */
    public function showPublicPost(Request $request, Post $post)
    {
        $request->validate([
            'post' => 'required|uuid|exists:posts,id',
        ]);
        Log::info('Fetching single public post detail.', ['post_id' => $post->id]);
        return new PostResource($post->load(['campaign', 'user']));
    }
    /**
     * [Public] Mendapatkan detail postingan publik dengan filter campaign.
     * Endpoint: GET /public/posts/campaign/{campaign}
     */
    public function showPublicbyCampaign(Request $request, Campaign $campaign)
    {
        $request->validate([
            'campaign' => 'required|uuid|exists:campaigns,id',
        ]);
        Log::info('Fetching public posts by campaign.');
    
        // Mengambil semua posts dari campaign yang diberikan
        $posts = $campaign->posts()
                          ->with(['user', 'socialMediaAccount']) // Eager load relasi yang diperlukan
                          ->where('is_valid_for_campaign', true) // Hanya post yang valid
                          ->latest() // Urutkan berdasarkan yang terbaru
                          ->paginate(15);
    
    
        return PostResource::collection($posts);
    }
    /**
     * [4.2] Mendapatkan daftar postingan publik (tanpa otentikasi).
     * Endpoint: GET /api/public/posts
     */   
    public function indexPublic(Request $request)
    {
        Log::info('Fetching public posts.');
        $posts = Post::with(['campaign', 'user'])
                    ->where('is_valid_for_campaign', true) // Hanya tampilkan post yang valid
                    ->latest()
                    ->paginate(15);
        return PostResource::collection($posts);
    }
    /**
     * [4.4] Influencer mengunggah postingan baru untuk sebuah kampanye.
     * Endpoint: POST /api/my-posts
     */
    public function store(Request $request)
    {
        $user = $request->user(); // Influencer yang sedang login

        Log::info('Influencer attempting to upload new post.', [
            'user_id' => $user->id,
        ]);

        // 1. Validasi Input
        try {
            $validatedData = $request->validate([
                'campaign_id' => ['required', 'uuid', 'exists:campaigns,id'],
                'platform' => ['required', 'string', Rule::in(['instagram', 'tiktok', 'youtube', 'facebook', 'twitter'])],
                'post_url' => ['required', 'url', 'max:2048'],
                // Anda bisa menambahkan validasi lain seperti format URL spesifik platform
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Post upload validation failed.', ['errors' => $e->errors()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid input for post upload.',
                'errors' => $e->errors()
            ], 422);
        }

        // Temukan campaign berdasarkan ID yang dikirim dari request body
        $campaign = Campaign::find($validatedData['campaign_id']);

        if (!$campaign) {
             Log::warning('Post upload failed: Campaign not found.', [
                'campaign_id' => $validatedData['campaign_id'],
                'user_id' => $user->id
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Campaign not found.'
            ], 404);
        }

        // 2. Periksa apakah influencer adalah partisipan campaign ini dan statusnya memungkinkan
        $participant = CampaignParticipant::where('campaign_id', $campaign->id)
                                          ->where('user_id', $user->id)
                                          ->first();

        if (!$participant) {
            Log::warning('Post upload failed: Influencer is not a participant of this campaign.', [
                'campaign_id' => $campaign->id,
                'user_id' => $user->id
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'You are not a participant in this campaign.'
            ], 403);
        }

        // Influencer hanya bisa upload jika status partisipasinya 'approved'
        if ($participant->status !== 'approved') {
            Log::warning('Post upload failed: Participant status not approved.', [
                'campaign_id' => $campaign->id,
                'user_id' => $user->id,
                'status' => $participant->status
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Your participation status (' . $participant->status . ') does not allow post upload yet. Must be approved.'
            ], 403);
        }

        // 3. Periksa apakah post_url sudah pernah diunggah oleh influencer ini untuk campaign ini
        $existingPost = Post::where('campaign_id', $campaign->id)
                              ->where('user_id', $user->id)
                              ->where('post_url', $validatedData['post_url'])
                              ->first();

        if ($existingPost) {
            Log::warning('Post upload failed: Duplicate post URL.', [
                'campaign_id' => $campaign->id,
                'user_id' => $user->id,
                'post_url' => $validatedData['post_url']
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'This post URL has already been submitted by you for this campaign.'
            ], 409);
        }

        // 4. Buat Postingan Baru
        try {
            $post = Post::create([
                'campaign_id' => $campaign->id,
                'user_id' => $user->id,
                'platform' => $validatedData['platform'],
                'post_url' => $validatedData['post_url'],
                'platform_post_id' => null, // Ini akan diisi nanti jika ada ID spesifik platform
                'post_type' => 'feed_photo', // Atau bisa diambil dari request jika ada
                'caption' => $request->input('caption', null), // Ambil caption dari request, bisa null
                'raw_data' => $request->input('raw_data', null), // Ambil raw_data dari request, bisa null
                'posted_at' => now(), // Atau bisa diambil dari request jika ada
                'is_valid_for_campaign' => true, // Default validasi, bisa diubah nanti
                'validation_notes' => null, // Catatan validasi, bisa diubah nanti
                // Metrik dan skor akan  diisi nanti oleh admin atau sistem
                'metrics' => $request->input('metrics', null),// Metrik akan diisi nanti
                'score' => null,   // Skor akan dihitung nanti
            ]);

            Log::info('Post uploaded successfully.', ['post_id' => $post->id, 'campaign_id' => $campaign->id]);

            return response()->json([
                'status' => 'success',
                'message' => 'Post submitted successfully. Metrics and score will be calculated soon.',
                'data' => new PostResource($post)
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error uploading post for campaign.', [
                'campaign_id' => $campaign->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to submit post.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * [4.3] Mendapatkan daftar postingan Influencer terautentikasi.
     * Endpoint: GET /api/my-posts
     */
    public function index(Request $request)
    {
        $user = $request->user(); // Influencer yang sedang login

        Log::info('Fetching posts for authenticated influencer.', ['user_id' => $user->id]);

        $posts = Post::where('user_id', $user->id)
                     ->with('campaign') // Muat relasi campaign
                     ->latest()
                     ->paginate(10); // Contoh pagination

        return PostResource::collection($posts);
    }

    /**
     * [4.5] Mendapatkan detail postingan milik saya.
     * Endpoint: GET /api/my-posts/{post}
     */
    public function show(Request $request, Post $post)
    {
        $user = $request->user(); // Influencer yang sedang login

        // Pastikan post ini milik influencer yang sedang login
        if ($post->user_id !== $user->id) {
            Log::warning('Unauthorized access attempt to post detail.', [
                'post_id' => $post->id,
                'attempted_by_user_id' => $user->id,
                'owner_user_id' => $post->user_id
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'You are not authorized to view this post.'
            ], 403);
        }

        Log::info('Fetching single post detail for influencer.', ['post_id' => $post->id, 'user_id' => $user->id]);

        return new PostResource($post->load('campaign')); // Load relasi campaign
    }

    /**
     * [4.6] Memperbarui postingan milik saya.
     * Endpoint: PUT /api/my-posts/{post}
     */
    public function update(Request $request, Post $post)
    {
        $user = $request->user();

        // Pastikan post ini milik influencer yang sedang login
        if ($post->user_id !== $user->id) {
            Log::warning('Unauthorized update attempt on post.', [
                'post_id' => $post->id,
                'attempted_by_user_id' => $user->id,
                'owner_user_id' => $post->user_id
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'You are not authorized to update this post.'
            ], 403);
        }

        Log::info('Influencer attempting to update post.', ['post_id' => $post->id, 'user_id' => $user->id]);

        // Validasi hanya field yang bisa diupdate oleh influencer
        try {
            $validatedData = $request->validate([
                // Contoh: hanya post_url dan platform yang boleh diupdate
                'platform' => ['sometimes', 'string', Rule::in(['instagram', 'tiktok', 'youtube', 'facebook', 'twitter'])],
                'post_url' => ['sometimes', 'url', 'max:2048'],
                // Jangan izinkan update metrics atau score dari sini
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Post update validation failed.', ['errors' => $e->errors()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid input for post update.',
                'errors' => $e->errors()
            ], 422);
        }

        try {
            $post->update($validatedData);

            Log::info('Post updated successfully.', ['post_id' => $post->id, 'user_id' => $user->id]);

            return response()->json([
                'status' => 'success',
                'message' => 'Post updated successfully.',
                'data' => new PostResource($post->fresh()) // Memuat ulang data post
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating post.', [
                'post_id' => $post->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update post.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * [4.7] Menghapus postingan milik saya.
     * Endpoint: DELETE /api/my-posts/{post}
     */
    public function destroy(Request $request, Post $post)
    {
        $user = $request->user();

        // Pastikan post ini milik influencer yang sedang login
        if ($post->user_id !== $user->id) {
            Log::warning('Unauthorized delete attempt on post.', [
                'post_id' => $post->id,
                'attempted_by_user_id' => $user->id,
                'owner_user_id' => $post->user_id
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'You are not authorized to delete this post.'
            ], 403);
        }

        try {
            $post->delete();

            Log::info('Post deleted successfully.', ['post_id' => $post->id, 'user_id' => $user->id]);

            return response()->json([
                'status' => 'success',
                'message' => 'Post deleted successfully.'
            ], 204); // 204 No Content
        } catch (\Exception $e) {
            Log::error('Error deleting post.', [
                'post_id' => $post->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete post.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * [4.8] Admin: Mendapatkan daftar semua postingan.
     * Endpoint: GET /api/admin/posts
     */
    public function indexForAdmin(Request $request)
    {
        // Pastikan hanya admin yang bisa mengakses ini (via middleware 'can:admin')
        Log::info('Admin fetching all posts.');

        $posts = Post::with(['campaign', 'user']) // Muat relasi campaign dan user (influencer)
                     ->latest()
                     ->paginate(10);

        return PostResource::collection($posts);
    }

    /**
     * [4.9] Admin: Memvalidasi postingan (mengupdate status atau field validasi lainnya).
     * Endpoint: PUT /api/admin/posts/{post}/validate
     * [Admin] Validate a post.
     * Endpoint: PUT /api/admin/posts/{uuid}
     * Roadmap: 4.9 Validasi postingan oleh Admin
     */
    public function validatePost(Request $request, Post $post)
    {
        Log::info('Admin/Brand attempting to validate post.', ['post_id' => $post->id, 'admin_id' => $request->user()->id]);
        //Pastikan hanya admin yang bisa mengakses ini (akan diimplementasikan dengan middleware peran nantinya)
        if ($request->user()->isInfluencer()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized.'], 403);
        }

        $validatedData = $request->validate([
            'is_valid_for_campaign' => 'required|boolean',
            'validation_notes' => 'nullable|string',
        ]);

        try {
            $post->is_valid_for_campaign = $validatedData['is_valid_for_campaign'];
            $post->validation_notes = $validatedData['validation_notes'] ?? null;
            $post->save();

            Log::info('Post validation status updated successfully.', ['post_id' => $post->id, 'admin_id' => $request->user()->id]);

            return response()->json([
                'status' => 'success',
                'message' => 'Post validation status updated successfully.',
                'data' => new PostResource($post)
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Post validation failed.', ['errors' => $e->errors(), 'post_id' => $post->id, 'admin_id' => $request->user()->id]);
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed for post validation.',
                'details' => $e->errors()
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Failed to update post validation status.', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString(), 'post_id' => $post->id, 'admin_id' => $request->user()->id]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update post validation status.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * [4.10] Admin: Memicu perhitungan ulang skor postingan.
     * Endpoint: POST /api/admin/posts/{post}/calculate-score
     * Ini bisa dipanggil secara manual oleh admin atau dari cron job.
     */
    public function calculateScore(Request $request, Post $post)
    {
        // Pastikan hanya admin yang bisa mengakses ini (via middleware 'can:admin')
        Log::info('Admin attempting to calculate score for post.', ['post_id' => $post->id]);

        // Di sini, Anda akan memanggil service atau logika yang:
        // 1. Mengambil metrik terbaru dari post_url (misal: via API Instagram/TikTok)
        // 2. Mengambil scoring_rules dari campaign terkait ($post->campaign->scoring_rules)
        // 3. Menghitung skor berdasarkan metrik dan aturan
        // 4. Mengupdate kolom 'metrics' dan 'score' di model Post

        // --- Contoh Pseudo-code untuk Logic Perhitungan Skor ---
        try {
            // STEP 1: Fetch Metrics (Placeholder)
            $fetchedMetrics = $this->fetchMetricsFromSocialMedia($post->post_url, $post->platform); // Fungsi placeholder

            if (!$fetchedMetrics) {
                Log::warning('Failed to fetch metrics for post.', ['post_id' => $post->id, 'url' => $post->post_url]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Could not fetch metrics for this post. Please check the URL or API connection.'
                ], 400);
            }

            // STEP 2: Get Scoring Rules from Campaign
            $scoringRules = $post->campaign->scoring_rules ?? []; // Pastikan scoring_rules adalah array/jsonb di Campaign model

            // STEP 3: Calculate Score
            $calculatedScore = $this->applyScoringRules($fetchedMetrics, $scoringRules); // Fungsi placeholder

            // STEP 4: Update Post
            $post->update([
                'metrics' => $fetchedMetrics,
                'score' => $calculatedScore,
            ]);

            Log::info('Score calculated and post updated successfully.', [
                'post_id' => $post->id,
                'calculated_score' => $calculatedScore,
                'fetched_metrics' => $fetchedMetrics
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Post metrics and score calculated successfully.',
                'data' => new PostResource($post->fresh())
            ]);

        } catch (\Exception $e) {
            Log::error('Error calculating score for post.', [
                'post_id' => $post->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to calculate score for post.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * [Admin] Get details of a specific post (Admin View).
     * Endpoint: GET /api/admin/posts/{uuid}
     * Roadmap: 4.11 Mendapatkan metrik postingan (admin view) dan detail lainnya
     */
    public function showAdminPost(Request $request, Post $post)
    {
        // Pastikan hanya admin yang bisa mengakses ini (akan diimplementasikan dengan middleware peran nantinya)
        // if ($request->user()->role->name !== 'admin') {
        //     return response()->json(['status' => 'error', 'message' => 'Unauthorized.'], 403);
        // }

        try {
            // Memuat relasi yang relevan untuk ditampilkan di resource
            $post->load(['campaign', 'user', 'socialMediaAccount']);

            Log::info('Admin accessed post details.', ['post_id' => $post->id, 'admin_id' => $request->user()->id]);

            return response()->json([
                'status' => 'success',
                'message' => 'Post details retrieved successfully.',
                'data' => new PostResource($post) // Menggunakan PostResource yang sama
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Failed to retrieve admin post details.', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString(), 'post_id' => $post->id, 'admin_id' => $request->user()->id]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve post details.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Placeholder function to simulate fetching metrics from social media.
     * In a real application, this would involve API calls (e.g., Instagram Graph API).
     */
    protected function fetchMetricsFromSocialMedia(string $url, string $platform): ?array
    {
        // Ini adalah logika dummy. Anda perlu menggantinya dengan integrasi API media sosial nyata.
        Log::info("Simulating fetching metrics for {$platform} URL: {$url}");

        // Contoh dummy metrics
        $metrics = [
            'likes_count' => rand(100, 10000),
            'comments_count' => rand(10, 500),
            'shares_count' => rand(0, 100),
            'views_count' => rand(500, 50000), // Untuk video
            // ... metrik lain yang relevan
        ];

        return $metrics;
    }

    /**
     * Placeholder function to apply scoring rules.
     * In a real application, this would parse campaign's scoring_rules.
     
    protected function applyScoringRules(array $metrics, array $rules): float
    {
        $score = 0;

        // Contoh sederhana: 1 like = 1 poin, 1 komentar = 5 poin, 1 share = 10 poin
        // Anda harus membuat logika ini lebih kompleks berdasarkan `scoring_rules` di Campaign
        $score += ($metrics['likes_count'] ?? 0) * ($rules['like_weight'] ?? 1);
        $score += ($metrics['comments_count'] ?? 0) * ($rules['comment_weight'] ?? 5);
        $score += ($metrics['shares_count'] ?? 0) * ($rules['share_weight'] ?? 10);
        // ... Tambahkan aturan lain sesuai kebutuhan

        return (float) $score;
    }
    */


    /**
     * [4.11] Admin: Mendapatkan metrik postingan (admin view) - Ini sebenarnya sama dengan show() tapi untuk admin.
     * Endpoint: GET /api/admin/posts/{post}
     */
    public function showForAdmin(Request $request, Post $post)
    {
        // Pastikan hanya admin yang bisa mengakses ini (via middleware 'can:admin')
        Log::info('Admin fetching single post detail.', ['post_id' => $post->id]);

        return new PostResource($post->load(['campaign', 'user'])); // Muat relasi campaign dan user
    }

    /**
     * [Admin] Recalculate scores for all posts in a specific campaign.
     * Endpoint: POST /api/admin/campaigns/{uuid}/recalculate-scores
     * Roadmap: 4.10 Hitung ulang skor untuk SEMUA postingan dalam kampanye tertentu
     */
    public function recalculateAllCampaignScores(Request $request, Campaign $campaign)
    {
        // Pastikan hanya admin yang bisa mengakses ini (akan diimplementasikan dengan middleware peran nantinya)
        // if ($request->user()->role->name !== 'admin') {
        //     return response()->json(['status' => 'error', 'message' => 'Unauthorized.'], 403);
        // }

        try {
            // Ambil semua post yang terkait dengan campaign ini
            $posts = $campaign->posts; // Pastikan model Campaign memiliki relasi hasMany(Post::class)

            if ($posts->isEmpty()) {
                return response()->json([
                    'status' => 'info',
                    'message' => 'No posts found for this campaign to recalculate scores.'
                ], 200);
            }

            $updatedCount = 0;
            $scoringRules = $campaign->scoring_rules ?? []; // Dapatkan aturan scoring dari Campaign

           foreach ($posts as $post) {
                // Hanya hitung ulang jika post memiliki metrik
                if ($post->metrics) {
                    $calculatedScore = $this->applyScoringRules($post->metrics, $scoringRules, $post->platform);
                    $post->score = $calculatedScore;
                    $post->save();
                    $updatedCount++;
                }
            }

            Log::info('Scores recalculated for campaign.', ['campaign_id' => $campaign->id, 'updated_posts' => $updatedCount, 'admin_id' => $request->user()->id]);

            return response()->json([
                'status' => 'success',
                'message' => "Scores recalculated for {$updatedCount} posts in campaign '{$campaign->name}'.",
                'updated_count' => $updatedCount
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Failed to recalculate scores for campaign.', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString(), 'campaign_id' => $campaign->id, 'admin_id' => $request->user()->id]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to recalculate scores for campaign.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

   /**
     * Helper function to apply scoring rules (from ScoreSeeder, can be moved to a service class).
     */
    protected function applyScoringRules(array $metrics, array $rules, string $platform): float
    {
        $score = 0;
        $platformRules = $rules[$platform] ?? [];

        // Default weights if not specified in rules
        $likeWeight = $platformRules['likes_point'] ?? 0;
        $commentWeight = $platformRules['comments_point'] ?? 0;
        $shareWeight = $platformRules['shares_point'] ?? 0;
        $viewWeight = $platformRules['views_point'] ?? 0;

        $score += ($metrics['likes_count'] ?? 0) * $likeWeight;
        $score += ($metrics['comments_count'] ?? 0) * $commentWeight;
        $score += ($metrics['shares_count'] ?? 0) * $shareWeight;
        $score += ($metrics['views_count'] ?? 0) * $viewWeight;

        // Pastikan skor tidak negatif atau terlalu tinggi jika ada batasan
        return (float) max(0, $score);
    }
    /**
     * [Admin] Fetch latest live metrics for all posts in a specific campaign.
     * Endpoint: POST /api/admin/campaigns/{uuid}/fetch-metrics
     * Roadmap: 4.12 Meminta metrik live dari platform media sosial untuk SEMUA postingan dalam kampanye tertentu
     */
    public function fetchAllCampaignMetrics(Request $request, Campaign $campaign)
    {
        // Pastikan hanya admin yang bisa mengakses ini (akan diimplementasikan dengan middleware peran nantinya)
        if ($request->user()->isInfluencer()) {
             return response()->json(['status' => 'error', 'message' => 'Unauthorized.'], 403);
         }

        try {
            $posts = $campaign->posts; // Dapatkan semua post dalam campaign

            if ($posts->isEmpty()) {
                return response()->json([
                    'status' => 'info',
                    'message' => 'No posts found for this campaign to fetch metrics.'
                ], 200);
            }

            $fetchedCount = 0;
            foreach ($posts as $post) {
                // Di sini Anda akan memanggil layanan yang berinteraksi dengan API pihak ketiga (Meta, TikTok, dll.)
                // Contoh:
                // $latestMetrics = $this->socialMediaService->getPostMetrics($post->platform, $post->platform_post_id);

                // Untuk tujuan simulasi, kita akan membuat data dummy
                $latestMetrics = [
                    'likes_count' => ($post->metrics['likes_count'] ?? 0) + rand(100, 500),
                    'comments_count' => ($post->metrics['comments_count'] ?? 0) + rand(1, 5),
                    'shares_count' => ($post->metrics['shares_count'] ?? 0) + rand(0, 1),
                    'views_count' => ($post->metrics['views_count'] ?? 0) + rand(1000, 2000),
                    'reach_count' => ($post->metrics['reach_count'] ?? 0) + rand(500, 1000),
                    'impressions_count' => ($post->metrics['impressions_count'] ?? 0) + rand(1000, 2000),
                    'taps_forward_count' => ($post->metrics['taps_forward_count'] ?? 0) + rand(0, 5),
                    'taps_back_count' => ($post->metrics['taps_back_count'] ?? 0) + rand(0, 5),
                    'exits_count' => ($post->metrics['exits_count'] ?? 0) + rand(0, 5),
                    'replies_count' => ($post->metrics['replies_count'] ?? 0) + rand(0, 3),
                ];

                $post->metrics = $latestMetrics; // Update kolom metrics
                $post->save();
                $fetchedCount++;
            }

            Log::info('Live metrics fetched and updated for campaign posts.', ['campaign_id' => $campaign->id, 'updated_posts' => $fetchedCount, 'admin_id' => $request->user()->id]);

            return response()->json([
                'status' => 'success',
                'message' => "Successfully fetched and updated live metrics for {$fetchedCount} posts in campaign '{$campaign->name}'.",
                'updated_count' => $fetchedCount
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Failed to fetch live metrics for campaign posts.', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString(), 'campaign_id' => $campaign->id, 'admin_id' => $request->user()->id]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch live metrics for campaign posts.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}