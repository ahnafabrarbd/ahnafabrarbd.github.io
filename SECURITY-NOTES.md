# SECURITY NOTES — Rizvi Fashions website

Plain-language security summary for the owner, plus the facts a developer needs.

## For the owner — two things to do

1. **Delete `.env` and `.env.save`.** These two files may still be sitting in the
   project folder on the build machine. This new website **does not use them** and
   does not need any password to run. They were never read, copied, or included in
   anything that ships. Delete them so no stray credentials linger.
2. **Change your cPanel password** now that the project is delivered, as routine
   good practice.

Where your safety copy lives: the **full-account backup** you download in Step 1
of GO-LIVE.md. Keep it somewhere safe.

## What ships, and what doesn't

- The deployable site (`dist/` and `rizvi-site.zip`) contains **only** the website:
  HTML, CSS, fonts, images, one small JavaScript file, and `contact.php`.
- It contains **no passwords, no API keys, no `.env`, no `.git` history, no source
  maps, no developer tooling**. This was verified before packaging (a file listing
  is in the delivery evidence: 0 secrets, 0 `.md`, 0 `.map` files in `dist/`).
- **No analytics, no trackers, no cookies, no third-party scripts.** The site loads
  nothing from outside your own server. (If you ever want Google Analytics, it's a
  one-line addition — see HANDOFF.md — but it is your call, in writing.)

## The contact form

- `contact.php` keeps every enquiry **on your own server** and emails it to
  `info@rizvifashions.com`. No third-party form service, no account, no data
  leaves your hosting.
- Spam defence: a hidden honeypot field, a timing trap, and a per-visitor rate
  limit — no annoying CAPTCHAs. Header-injection is blocked.
- It works even with JavaScript switched off, and always shows a direct
  `mailto:` fallback so no enquiry is lost.

## Server hardening (already included)

- The delivered `.htaccess` adds compression, long-term caching for fingerprinted
  files, short caching for pages, and security response headers
  (no-sniff, same-origin framing, a referrer policy, a permissions policy, and a
  Content-Security-Policy that allows only the site's own resources). It is written
  to sit safely alongside whatever your host already runs and changes none of it.

## Confirmation

As of delivery, there are **no credentials anywhere in the project source or its
git history**, and nothing in the shipped site phones home to any external
service. The only outbound contact the website can make is the contact form
emailing your own inbox.
