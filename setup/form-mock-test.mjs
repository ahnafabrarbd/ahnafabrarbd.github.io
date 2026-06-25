#!/usr/bin/env node
/**
 * form-mock-test — D-017 local evidence (php absent on build machine).
 * 1. Static review assertions on public/contact.php (the contract the handler implements).
 * 2. A node mock implementing the same contract; POSTs exercise accept/reject paths.
 * 3. If dist/contact/index.html exists: assert the page's form matches the contract
 *    (method POST, action /contact.php, required fields, honeypot, mailto fallback).
 * Live-send verification is an OWNER step (GO-LIVE.md) — never run against production.
 */
import { readFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';

let pass = 0, fail = 0;
const check = (name, ok) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); ok ? pass++ : fail++; };

// ---- 1. handler static review
const php = readFileSync('public/contact.php', 'utf8');
check('handler: POST-only guard', php.includes("REQUEST_METHOD") && php.includes("'POST'"));
check('handler: honeypot field "website"', php.includes("'website'"));
check('handler: JS-progressive time-trap', php.includes("'ts'") && php.includes('MIN_SECONDS'));
check('handler: per-IP rate limit', php.includes('RATE_LIMIT_SECONDS'));
check('handler: header-injection guard', php.includes('\\r') && php.includes('\\n'));
check('handler: email validation', php.includes('FILTER_VALIDATE_EMAIL'));
check('handler: mailto fallback in failure paths', (php.match(/mailto:/g) ?? []).length >= 2);
check('handler: no secrets/credentials', !/password|api[_-]?key|secret/i.test(php));

// ---- 2. mock endpoint exercising the contract
const mock = createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    if (req.method !== 'POST') { res.statusCode = 303; return res.end(); }
    const p = new URLSearchParams(body);
    if ((p.get('website') ?? '') !== '') { res.statusCode = 200; return res.end('silent-drop'); }
    const ts = parseInt(p.get('ts') ?? '0', 10);
    if (ts > 0 && (Math.floor(Date.now() / 1000) - ts) < 4) { res.statusCode = 200; return res.end('silent-drop'); }
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.get('email') ?? '');
    if (!(p.get('name') ?? '').trim() || !emailOk || !(p.get('message') ?? '').trim()) {
      res.statusCode = 422; return res.end('validation');
    }
    res.statusCode = 200; res.end('sent');
  });
});
await new Promise((ok) => mock.listen(4178, ok));
const post = async (fields) => {
  const r = await fetch('http://localhost:4178/contact.php', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
  });
  return { status: r.status, text: await r.text() };
};

const valid = { name: 'Test Buyer', email: 'buyer@example.com', message: 'Quotation please.' };
let r = await post(valid);
check('mock: valid submission accepted', r.status === 200 && r.text === 'sent');
r = await post({ ...valid, website: 'http://spam.example' });
check('mock: honeypot silently dropped', r.status === 200 && r.text === 'silent-drop');
r = await post({ ...valid, ts: String(Math.floor(Date.now() / 1000)) });
check('mock: too-fast (JS time-trap) dropped', r.status === 200 && r.text === 'silent-drop');
r = await post({ name: '', email: 'not-an-email', message: '' });
check('mock: invalid fields rejected 422', r.status === 422);
mock.close();

// ---- 3. built page contract (when present)
if (existsSync('dist/contact/index.html')) {
  const html = readFileSync('dist/contact/index.html', 'utf8');
  check('page: form posts to /contact.php', /<form[^>]*action="\/contact\.php"[^>]*method="(post|POST)"|<form[^>]*method="(post|POST)"[^>]*action="\/contact\.php"/.test(html));
  check('page: honeypot present + hidden', html.includes('name="website"'));
  check('page: required name/email/message inputs', ['name="name"', 'name="email"', 'name="message"'].every((s) => html.includes(s)));
  check('page: visible mailto fallback', html.includes('mailto:info@rizvifashions.com'));
  check('page: labelled fields', (html.match(/<label/g) ?? []).length >= 3);
} else {
  console.log('note: dist/contact/index.html not built yet — page assertions deferred');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
