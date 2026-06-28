# GO-LIVE — putting the new Rizvi Fashions website online

This is your step-by-step checklist. No technical knowledge needed. Do the steps
in order. **Nothing here deletes anything** — your current website is only *moved
aside*, so you can put it back at any time.

You will need: your **cPanel login** (the control panel for your hosting), and the
file **`rizvi-site.zip`** that came with this delivery.

---

## Before you start (5 minutes) — make a safety copy

1. Log in to **cPanel**.
2. Open **"Backup"** (or "Backup Wizard").
3. Click **"Download a Full Account Backup"** and let it finish. Save that file
   somewhere safe (your computer, a USB drive).
   - This is your safety net. If anything ever looks wrong, your host can restore
     from this in minutes.

---

## Step 1 — Move the old website aside (don't delete it)

4. In cPanel, open **"File Manager"**.
5. Go into the folder called **`public_html`**. This is where your current
   website lives.
6. Inside `public_html`, create a **new folder** called **`_old-wordpress`**.
7. Select **everything currently in `public_html`** *except* the new
   `_old-wordpress` folder you just made — and **move** it all into
   `_old-wordpress`.
   - Tip: if you see a `.htaccess` file, move that too.
   - Nothing is deleted — it's all safely tucked inside `_old-wordpress`.
   - `public_html` should now look empty (it only contains `_old-wordpress`).

---

## Step 2 — Upload the new website

8. Still in File Manager, make sure you are **inside `public_html`** (not inside
   `_old-wordpress`).
9. Click **"Upload"** and choose **`rizvi-site.zip`**. Wait for it to reach 100%.
10. Go back to `public_html`, right-click **`rizvi-site.zip`**, and choose
    **"Extract"**. This unpacks the website files.
11. After extracting, you can delete the `rizvi-site.zip` file itself (the
    extracted files are what matter).
    - If the files extracted into a sub-folder instead of directly into
      `public_html`, move them up so they sit directly in `public_html`
      (you should see files like `index.html`, `contact.php`, and folders like
      `overview`, `our-products`, `_astro`, `fonts` directly inside `public_html`).

---

## Step 3 — Check it works

12. Open your website in a browser: **https://rizvifashions.com**
13. Click through **every page** using the menu: Overview, Capabilities, Products,
    Sustainability, Partners, Contact — and the "Menu" button (top right) which
    opens the full list including Company Profile, Management, Career, Gallery.
14. Check the search-engine sitemap still loads:
    **https://rizvifashions.com/sitemap_index.xml** — you should see a list of
    page links (it doesn't need to look pretty).
15. **Send yourself a test message** through the **Contact** page form. Within a
    minute or two, a message should arrive at **info@rizvifashions.com**.
    - If the form shows an error instead, that's the one thing that depends on
      your server's email setup — see "If the contact form doesn't send" below.

---

## If something looks wrong — putting the old site back (the rollback)

You never lost anything. To return to your old website:

16. In File Manager, go into `public_html`.
17. Delete (or move aside) the new files.
18. Open `_old-wordpress`, select everything inside it, and **move it back** up
    into `public_html`.
19. Your old website is live again, exactly as before.

---

## If the contact form doesn't send

The form file (`contact.php`) keeps enquiries on **your own server** — no outside
service. It works as long as your hosting can send email (most cPanel hosts can).
If the test message in Step 15 didn't arrive:

- Check your hosting's email settings are active (ask your host if unsure).
- The form always shows a fallback: visitors can email **info@rizvifashions.com**
  directly, so no enquiry is ever lost even if the automatic send is off.
- Your developer (Zafir) can switch the form to a free no-server service in a
  few minutes if needed — see HANDOFF.md.

---

## After you're live

- Delete the `.env` and `.env.save` files if they are still anywhere in the
  project (they are not needed by this website) — see SECURITY-NOTES.md.
- Change your cPanel password now that the project is delivered.
- Keep that full-account backup from the start — it's your safety copy.

That's it. The new site is live, fast, and the old one is safely parked in
`_old-wordpress` for as long as you want it there.
