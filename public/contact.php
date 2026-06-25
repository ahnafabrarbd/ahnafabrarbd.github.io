<?php
/**
 * contact.php — self-hosted form handler (V7 §9, decision D-017).
 * Deployed beside the static files; PHP 8.0+ (host runs 8.0.30, RECON).
 * Spam defence: honeypot field + JS-progressive time-trap + per-IP rate limit.
 * No database, no accounts, no third parties; mail stays on the owner's server.
 * Live verification is an OWNER step in GO-LIVE.md — never tested against
 * production from the build machine (V7 §5.1).
 */

declare(strict_types=1);

const RECIPIENT = 'info@rizvifashions.com';
const MIN_SECONDS = 4;          // JS-enhanced time-trap floor
const RATE_LIMIT_SECONDS = 60;  // one message per IP per minute

function respond(int $code, string $title, string $body): never
{
    http_response_code($code);
    header('Content-Type: text/html; charset=utf-8');
    // palette = DESIGN.md tokens (inline: this page ships standalone)
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<meta name="robots" content="noindex">'
        . '<title>' . htmlspecialchars($title) . ' — Rizvi Fashions Limited</title>'
        . '<style>body{background:#0A0A0A;color:#D6D6D6;font-family:system-ui,sans-serif;'
        . 'display:grid;place-items:center;min-height:100vh;margin:0;padding:1.25rem}'
        . 'main{max-width:62ch;border:1px solid #1E1E1E;padding:3rem}'
        . 'h1{color:#FFFFFF;font-size:1.75rem;text-transform:uppercase;letter-spacing:.025em}'
        . 'a{color:#FFFFFF}</style></head><body><main><h1>'
        . htmlspecialchars($title) . '</h1><p>' . $body
        . '</p><p><a href="/contact/">&larr; Back to the contact page</a></p></main></body></html>';
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: /contact/', true, 303);
    exit;
}

// --- honeypot: real visitors never see or fill "website"
if (trim((string)($_POST['website'] ?? '')) !== '') {
    respond(200, 'Message received', 'Thank you.'); // silent drop — never tip off bots
}

// --- JS-progressive time-trap: field present only when JS set it
$ts = (int)($_POST['ts'] ?? 0);
if ($ts > 0) {
    $elapsed = time() - $ts;
    if ($elapsed < MIN_SECONDS || $elapsed > 86400) {
        respond(200, 'Message received', 'Thank you.');
    }
}

// --- per-IP rate limit (file-based, no DB)
$ipHash = hash('sha256', (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
$stamp = sys_get_temp_dir() . '/rf-contact-' . $ipHash;
if (is_file($stamp) && (time() - (int)filemtime($stamp)) < RATE_LIMIT_SECONDS) {
    respond(429, 'One moment', 'Please wait a minute before sending another message, or email us directly at <a href="mailto:' . RECIPIENT . '">' . RECIPIENT . '</a>.');
}

// --- validation
$name    = trim((string)($_POST['name'] ?? ''));
$email   = trim((string)($_POST['email'] ?? ''));
$subject = trim((string)($_POST['subject'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

$errors = [];
if ($name === '' || mb_strlen($name) > 200) $errors[] = 'your name';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'a valid email address';
if ($message === '' || mb_strlen($message) > 10000) $errors[] = 'a message';

if ($errors) {
    respond(422, 'Almost there', 'Please go back and provide ' . htmlspecialchars(implode(', ', $errors))
        . '. Or email us directly at <a href="mailto:' . RECIPIENT . '">' . RECIPIENT . '</a>.');
}

// --- header-injection guard: no CR/LF survives into headers
$clean = static fn(string $v): string => str_replace(["\r", "\n", '%0a', '%0d'], '', $v);
$name = $clean($name);
$email = $clean($email);
$subjectLine = 'Website enquiry' . ($subject !== '' ? ' — ' . mb_substr($clean($subject), 0, 150) : '');

$bodyText = "Name: {$name}\nEmail: {$email}\n\n{$message}\n\n--\nSent from the rizvifashions.com contact form";
$headers = [
    'From' => 'website@' . ($_SERVER['SERVER_NAME'] ?? 'rizvifashions.com'),
    'Reply-To' => "{$name} <{$email}>",
    'X-Mailer' => 'rf-contact/1.0',
    'Content-Type' => 'text/plain; charset=utf-8',
];

$sent = @mail(RECIPIENT, $subjectLine, $bodyText, $headers);
@touch($stamp);

if ($sent) {
    respond(200, 'Message received', 'Thank you — we will get back to you shortly.');
}
respond(500, 'Something went wrong', 'Your message could not be sent automatically. Please email us directly at <a href="mailto:' . RECIPIENT . '">' . RECIPIENT . '</a> — we answer every enquiry.');
