<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 1. IP Rate Limiting (Server-side)
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['HTTP_X_REAL_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
if (strpos($ip, ',') !== false) {
    $ip = trim(explode(',', $ip)[0]);
}

$limitFile = '/var/www/flarum/storage/widatama_rate_limits.json';
// Fallback for local testing if path is not writable or does not exist
if (!is_writable(dirname($limitFile))) {
    $limitFile = sys_get_temp_dir() . '/widatama_rate_limits.json';
}

$limitData = [];
if (file_exists($limitFile)) {
    $limitData = json_decode(file_get_contents($limitFile), true) ?: [];
}

$today = date('Y-m-d');
if (!isset($limitData[$ip])) {
    $limitData[$ip] = ['date' => $today, 'count' => 0];
}

if ($limitData[$ip]['date'] !== $today) {
    $limitData[$ip] = ['date' => $today, 'count' => 0];
}

if ($limitData[$ip]['count'] >= 5) {
    http_response_code(429);
    echo json_encode(['error' => 'Batas harian tercapai. Maksimal 5 pembuatan konten AI per hari untuk mencegah penyalahgunaan. Silakan coba lagi besok!']);
    exit;
}

// 2. Load API Key
$apiKey = getenv('GEMINI_API_KEY') ?: '';
if (empty($apiKey)) {
    $configFile = __DIR__ . '/config.php';
    if (file_exists($configFile)) {
        $config = include $configFile;
        $apiKey = $config['gemini_api_key'] ?? '';
    }
}

if (empty($apiKey)) {
    http_response_code(500);
    echo json_encode(['error' => 'API Key belum dikonfigurasi di server. Silakan isi API Key Anda di file landing/api/config.php atau sebagai environment variable GEMINI_API_KEY.']);
    exit;
}

// 3. Process Input
$data = json_decode(file_get_contents('php://input'), true);
$tool = $data['tool'] ?? '';
$inputs = $data['inputs'] ?? [];

$prompt = '';
if ($tool === 'wa_copy') {
    $prodName = $inputs['product_name'] ?? '';
    $audience = $inputs['target_audience'] ?? '';
    if (empty($prodName) || empty($audience)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nama produk dan target audiens wajib diisi.']);
        exit;
    }
    $prompt = "Buatkan 3 variasi naskah promosi WhatsApp yang rapi, renggang (memiliki spasi baris yang nyaman dibaca), menggunakan emoji yang menarik, dan siap kirim dalam Bahasa Indonesia.\n\nProduk: \"$prodName\"\nTarget Audiens: \"$audience\"\n\nTulis 1 variasi soft-sell, 1 variasi hard-sell, dan 1 variasi edukatif/cerita. Pisahkan setiap variasi dengan garis pembatas (---) yang jelas.";
} else if ($tool === 'short_script') {
    $topic = $inputs['topic'] ?? '';
    if (empty($topic)) {
        http_response_code(400);
        echo json_encode(['error' => 'Topik naskah wajib diisi.']);
        exit;
    }
    $prompt = "Buatkan naskah video pendek (TikTok/Reels/Shorts) berdurasi 30-60 detik seputar topik: \"$topic\" dalam Bahasa Indonesia. Fokuskan perhatian penuh pada 3 detik pertama dengan Hook pembuka yang sangat memikat (killer hook). Berikan panduan visual, audio, dan teks naskah untuk dibaca secara jelas terstruktur. Pisahkan struktur dengan rapi menggunakan markdown.";
} else if ($tool === 'headline_rater') {
    $headline = $inputs['headline'] ?? '';
    if (empty($headline)) {
        http_response_code(400);
        echo json_encode(['error' => 'Headline wajib diisi.']);
        exit;
    }
    $prompt = "Nilailah headline berikut dari skala 1-100 berdasarkan potensi CTR (Click-Through Rate) dan daya tariknya:\n\nHeadline: \"$headline\"\n\nBerikan output terstruktur dalam Bahasa Indonesia:\n1. Skor (Skala 1-100)\n2. Umpan balik singkat (maksimal 3 poin ringkas mengapa skor tersebut diberikan)\n3. Berikan 3 alternatif headline serupa namun memiliki daya tarik jauh lebih tinggi dengan potensi CTR tinggi.";
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Alat tidak valid.']);
    exit;
}

// 4. Call Google Gemini API
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $apiKey;
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'contents' => [
        ['parts' => [['text' => $prompt]]]
    ]
]));
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(['error' => 'Gagal memanggil API kecerdasan buatan. Silakan periksa apakah API Key Anda valid atau coba beberapa saat lagi.']);
    exit;
}

$resData = json_decode($response, true);
$outputText = $resData['candidates'][0]['content']['parts'][0]['text'] ?? 'Tidak ada hasil yang dihasilkan.';

// 5. Increment rate limit count and save
$limitData[$ip]['count']++;
file_put_contents($limitFile, json_encode($limitData));

echo json_encode([
    'result' => $outputText,
    'remaining' => 5 - $limitData[$ip]['count']
]);
