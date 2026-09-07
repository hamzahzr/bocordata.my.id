<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'API belum dikonfigurasi. Buat api/config.php di server.']);
    exit;
}

$config = require $configFile;
$token = trim((string)($config['token'] ?? ''));
if ($token === '' || $token === 'ISI_TOKEN_API_DI_SINI') {
    http_response_code(500);
    echo json_encode(['error' => 'Token API belum diisi di api/config.php']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
$query = trim((string)($body['query'] ?? ''));
if ($query === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Query wajib diisi']);
    exit;
}

// API documentation specifies JSON POST to https://leakosintapi.com/
$payload = [
    'token' => $token,
    'request' => $query,
    'limit' => 100,
    'lang' => 'en'
];

$ch = curl_init('https://leakosintapi.com/');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 60,
]);

$response = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Gagal menghubungi API', 'detail' => $curlError]);
    exit;
}

$data = json_decode($response, true);
if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(502);
    echo json_encode(['error' => 'API mengembalikan respons yang bukan JSON']);
    exit;
}

http_response_code($httpCode >= 200 && $httpCode < 300 ? 200 : ($httpCode ?: 502));
echo json_encode(['status' => 'success', 'data' => $data], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
