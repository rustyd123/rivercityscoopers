<?php
require __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Test the environment variables
echo 'Application ID: ' . getenv('SQUARE_APPLICATION_ID') . "<br>";
echo 'Access Token: ' . getenv('SQUARE_ACCESS_TOKEN') . "<br>";
echo 'Location ID: ' . getenv('SQUARE_LOCATION_ID') . "<br>";

