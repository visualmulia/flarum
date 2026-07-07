<?php

namespace Visualmulia\BaliNomadsPremium\Api\Controller;

use Flarum\Discussion\Discussion;
use Flarum\Post\Post;
use Flarum\Http\RequestUtil;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Laminas\Diactoros\Response\JsonResponse;
use Flarum\Settings\SettingsRepositoryInterface;

class CookSocialsController implements RequestHandlerInterface
{
    protected $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        // 1. Check if user is administrator
        $actor = RequestUtil::getActor($request);
        if (!$actor->isAdmin()) {
            return new JsonResponse(['error' => 'Permission denied.'], 403);
        }

        // 2. Parse request body
        $body = $request->getParsedBody();
        $discussionId = $body['discussionId'] ?? null;

        if (!$discussionId) {
            return new JsonResponse(['error' => 'Missing discussionId.'], 400);
        }

        // 3. Load discussion and first post
        $discussion = Discussion::find($discussionId);
        if (!$discussion) {
            return new JsonResponse(['error' => 'Discussion not found.'], 404);
        }

        $firstPost = Post::where('discussion_id', $discussionId)
            ->where('number', 1)
            ->first();

        if (!$firstPost) {
            return new JsonResponse(['error' => 'First post not found.'], 404);
        }

        $title = $discussion->title;
        $content = $firstPost->content; // Markdown text

        // 4. Retrieve Gemini API key from environment variable or local .env file
        $geminiKey = getenv('GEMINI_API_KEY');
        if (empty($geminiKey)) {
            $envPath = '/var/www/flarum/scripts/.env';
            if (file_exists($envPath)) {
                $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($lines as $line) {
                    if (strpos($line, 'GEMINI_API_KEY=') === 0) {
                        $geminiKey = trim(substr($line, 15));
                        break;
                    }
                }
            }
        }

        if (empty($geminiKey)) {
            return new JsonResponse(['error' => 'Gemini API key not configured on server.'], 500);
        }

        // 5. Generate content using Gemini API
        $prompt = "Tolong racik konten media sosial berdasarkan artikel forum berikut.\n\n" .
            "Judul: " . $title . "\n" .
            "Konten: " . $content . "\n\n" .
            "Buatkan 3 variasi format media sosial yang berbeda secara presisi:\n" .
            "1. X (Twitter): Buat dalam bentuk Twitter Thread yang memikat. Maksimal 5 tweet, pisahkan setiap tweet dengan penanda [TWEET_BREAK]. Setiap tweet harus di bawah 280 karakter.\n" .
            "2. Threads (Meta): Tulis dalam format bercerita (storytelling) yang santai, interaktif, dan sangat casual untuk audiens Threads.\n" .
            "3. Facebook: Tulis postingan terstruktur dengan poin-poin penting, pembuka yang menarik, dan penutup ajakan diskusi untuk dibagikan ke grup teknologi.\n\n" .
            "JANGAN sebutkan asal-usul media sosial lain atau link rujukan internal.\n\n" .
            "Format output harus menggunakan format terstruktur seperti di bawah ini. Pastikan Anda menulis penanda [TWITTER], [THREADS], dan [FACEBOOK] dengan tepat untuk memisahkan hasil racikan:\n\n" .
            "[TWITTER]\n" .
            "Tweet 1...\n" .
            "[TWEET_BREAK]\n" .
            "Tweet 2...\n\n" .
            "[THREADS]\n" .
            "Postingan Threads...\n\n" .
            "[FACEBOOK]\n" .
            "Postingan Facebook...\n";

        // Let's call Gemini API
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $geminiKey;
        $payload = [
            'contents' => [
                ['parts' => [['text' => $prompt]]]
            ],
            'generationConfig' => [
                'maxOutputTokens' => 8192,
                'temperature' => 0.7
            ]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            return new JsonResponse(['error' => 'Failed to generate content from AI. Code: ' . $httpCode], 500);
        }

        $resData = json_decode($response, true);
        $text = $resData['candidates'][0]['content']['parts'][0]['text'] ?? '';

        // Parse using text delimiters (100% robust against json escaping issues)
        $twitter = '';
        $threads = '';
        $facebook = '';

        if (strpos($text, '[TWITTER]') !== false && strpos($text, '[THREADS]') !== false && strpos($text, '[FACEBOOK]') !== false) {
            $parts = explode('[THREADS]', $text);
            
            $twitterPart = explode('[TWITTER]', $parts[0]);
            $twitter = trim($twitterPart[1] ?? $twitterPart[0]);
            
            $threadsPart = explode('[FACEBOOK]', $parts[1]);
            $threads = trim($threadsPart[0]);
            $facebook = trim($threadsPart[1] ?? '');
        } else {
            // Fallback plain text if markers are not matched perfectly
            $twitter = $text;
            $threads = 'Gagal memisahkan otomatis. Lihat X/Twitter.';
            $facebook = 'Gagal memisahkan otomatis. Lihat X/Twitter.';
        }

        return new JsonResponse([
            'data' => [
                'twitter' => $twitter,
                'threads' => $threads,
                'facebook' => $facebook
            ]
        ]);
    }
}
