<?php
header('Content-Type: application/json');

require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;
use Square\SquareClient;
use Square\Models\Money;
use Square\Models\CreatePaymentRequest;
use Square\Exceptions\ApiException;

function fail($msg, $code = 400){
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $msg]);
    exit;
}

if (file_exists(__DIR__.'/.env')) {
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load(); // fills $_ENV and $_SERVER
}

$envBag = $_ENV + $_SERVER;
$accessToken = $envBag['SQUARE_ACCESS_TOKEN'] ?? getenv('SQUARE_ACCESS_TOKEN') ?? null;
$locationId  = $envBag['SQUARE_LOCATION_ID']  ?? getenv('SQUARE_LOCATION_ID')  ?? null;
$environment = ($envBag['SQUARE_ENVIRONMENT'] ?? 'sandbox') === 'production' ? 'production' : 'sandbox';

if (!$accessToken || !$locationId) { fail('Server misconfigured (missing Square env vars)', 500); }

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) { fail('Invalid JSON'); }

$nonce = $data['token'] ?? $data['nonce'] ?? null;
if (!$nonce) { fail('Missing token'); }

$amountCents = (int)($data['amountCents'] ?? $data['amount'] ?? 0);
if ($amountCents < 100) { fail('Amount too low or missing'); }

$client = new SquareClient([
    'accessToken' => $accessToken,
    'environment' => $environment === 'production'
        ? \Square\Environment::PRODUCTION
        : \Square\Environment::SANDBOX,
]);

$idempotencyKey = bin2hex(random_bytes(16));

$money = new Money();
$money->setAmount($amountCents);
$money->setCurrency('USD');

$req = new CreatePaymentRequest($nonce, $idempotencyKey);
$req->setAmountMoney($money);
$req->setLocationId($locationId);

try {
    $apiResponse = $client->getPaymentsApi()->createPayment($req);
    if ($apiResponse->isSuccess()) {
        $payment = $apiResponse->getResult()->getPayment();
        echo json_encode([
            'success'    => true,
            'payment_id' => $payment->getId(),
            'status'     => $payment->getStatus()
        ]);
    } else {
        $err = $apiResponse->getErrors()[0]->getDetail() ?? 'Payment failed';
        fail($err, 402);
    }
} catch (ApiException $e) {
    fail($e->getMessage(), 500);
}
