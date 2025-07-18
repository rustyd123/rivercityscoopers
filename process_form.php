<?php
// Only accept POST submissions
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method Not Allowed');
}

// 1) Collect & sanitize inputs
$name    = strip_tags(trim($_POST['name']    ?? ''));
$phone   = strip_tags(trim($_POST['phone']   ?? ''));
$email   = filter_var(trim($_POST['email']  ?? ''), FILTER_VALIDATE_EMAIL);
$zip     = strip_tags(trim($_POST['zip']     ?? ''));
$details = strip_tags(trim($_POST['details'] ?? ''));

// 2) Basic validation
$errors = [];
if (!$name)  $errors[] = 'Name is required.';
if (!$email) $errors[] = 'A valid email is required.';
if ($errors) {
    http_response_code(400);
    echo implode('<br>', $errors);
    exit;
}

// 3) Immediately redirect the user
header('Location: thank-you.html');
ignore_user_abort(true);   // keep PHP running if client disconnects
ob_start();                // start buffering
echo ' ';                  // send a byte
$size = ob_get_length();
header("Content-Length: $size");
header('Connection: close');
ob_end_flush();            // flush buffers
flush();                   // send to the client

// ——————————————————————————————————//
// 4) Now do the “slow” work after redirect
// ——————————————————————————————————//

// Prepare the email
$to      = 'dogwasteremovalnow@gmail.com';
$subject = "New lead from {$name}";
$body    = <<<EOT
You’ve received a new contact submission:

Name:    {$name}
Phone:   {$phone}
Email:   {$email}
Zip:     {$zip}
Details: {$details}

EOT;
$headers = "From: no-reply@" . $_SERVER['SERVER_NAME'] . "\r\n"
         . "Reply-To: {$email}\r\n"
         . "X-Mailer: PHP/" . phpversion();

// Send it off (in background)
mail($to, $subject, $body, $headers);

exit;

