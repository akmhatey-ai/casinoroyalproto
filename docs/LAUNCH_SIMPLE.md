# How Close Are We to Launch? (Simple Guide)

## The Big Number: **About 75% Done**

**What that means:**  
All the **building** (code, design, database structure, pages) is finished.  
What’s left is **telling the app where to find things** (your database, your login keys) and **putting it on the internet** (Vercel).  
So you’re not building the car anymore — you’re putting in the key and turning it on.

---

## What’s Already Done (You Don’t Need to Do This)

| Done | In Simple Words |
|------|------------------|
| ✅ Website design | All the pages (home, search, submit, dashboard, login) look and work. |
| ✅ Database design | We know what to store: users, prompts, skills, payments, etc. |
| ✅ Sign-in setup | The app is ready to use “Sign in with Google” and “Sign in with GitHub” — we just need the keys. |
| ✅ Supabase project | You already created a Supabase project and we added its URL and keys to the project. |
| ✅ Code that talks to the database | Create prompts, search, download skills, tip, vote — all coded. |

---

## What YOU Still Need to Do (Step by Step)

Think of these as **6 small tasks**. Do them in order.

---

### Step 1: Put Your Database Password in the App (So It Can Open the Door)

**What it is:**  
Your Supabase database has a **password**. The app needs that password in a file so it can connect. Right now the app has a placeholder: `[YOUR-PASSWORD]`.

**What to do:**

1. Open **Supabase**: go to [supabase.com](https://supabase.com) and open your project.
2. Click **Settings** (left side) → **Database**.
3. Find the **Database password** (you set it when you created the project). If you forgot it, you can **Reset database password** on that page.
4. On your computer, open the file named **`.env`** in your project folder (same folder as `package.json`).
5. Find the line that says:
   ```text
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.syujottrhrjpjhsatjas.supabase.co:5432/postgres"
   ```
6. Replace **`[YOUR-PASSWORD]`** with your real database password (no brackets, no spaces).  
   Example: if your password is `mySecret123`, the line becomes:
   ```text
   DATABASE_URL="postgresql://postgres:mySecret123@db.syujottrhrjpjhsatjas.supabase.co:5432/postgres"
   ```
7. Save the file.

**Why:** Without this, the app can’t read or save anything in your database. This is like giving the app the key to the database.

---

### Step 2: Create the Tables in Your Database (One-Time Setup)

**What it is:**  
The database is empty. We need to run a **migration** once. That means: “Create all the tables (users, prompts, skills, etc.) in this database.”

**What to do:**

1. Make sure you did **Step 1** (your `.env` has the real password in `DATABASE_URL`).
2. Open a **terminal** (or PowerShell) in your project folder.
3. Run this command exactly:
   ```bash
   npx prisma migrate deploy
   ```
4. Wait until it says something like “Applied 1 migration” or “All migrations have been applied.”  
   If you see an error like “Can’t reach database,” go back to Step 1 and check the password and that you’re on the internet.

**Why:** This creates the actual tables (users, prompts, skills, etc.) in Supabase. You only need to do it once per database.

---

### Step 3: Make a Secret Key for Logins (So Nobody Can Fake Your Site)

**What it is:**  
When people “Sign in with Google” or “Sign in with GitHub,” the app needs a **secret** to keep those sessions safe. You create one random string and put it in `.env` and later in Vercel.

**What to do:**

1. Open a terminal in your project folder.
2. Run:
   - **Windows (PowerShell):**  
     `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])`
   - **Mac/Linux:**  
     `openssl rand -base64 32`
3. Copy the long string that appears (no spaces).
4. Open your **`.env`** file.
5. Find the line:
   ```text
   AUTH_SECRET="generate-with-openssl-rand-base64-32"
   ```
6. Replace `generate-with-openssl-rand-base64-32` with the string you copied.  
   Example: `AUTH_SECRET="a1b2c3d4e5f6..."`
7. Save the file.

**Why:** This secret is used to sign cookies so only your app can trust “this user is logged in.” Keep it secret; don’t put it in GitHub.

---

### Step 4: Get “Sign in with Google” and “Sign in with GitHub” Keys (So People Can Log In)

**What it is:**  
To show “Sign in with Google” and “Sign in with GitHub” buttons, Google and GitHub give you **keys** (like a username and password for your app). You put those keys in `.env` and later in Vercel.

**Google:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create or pick a **project** (top bar).
3. Open **APIs & Services** → **Credentials**.
4. Click **Create credentials** → **OAuth client ID**.
5. If asked, set up the **OAuth consent screen** (choose “External,” fill app name and your email, save).
6. Application type: **Web application**.
7. Under **Authorized redirect URIs** click **Add URI** and add:
   - For local: `http://localhost:3000/api/auth/callback/google`
   - For production (do this after you have a Vercel URL): `https://YOUR-VERCEL-URL.vercel.app/api/auth/callback/google`
8. Click **Create**. Copy the **Client ID** and **Client secret**.
9. In your **`.env`** file, set:
   ```text
   GOOGLE_CLIENT_ID="paste-client-id-here"
   GOOGLE_CLIENT_SECRET="paste-client-secret-here"
   ```
10. Save.

**GitHub:**

1. Go to [GitHub → Developer settings → OAuth Apps](https://github.com/settings/developers).
2. Click **New OAuth App**.
3. **Application name:** e.g. “PromptHub.”  
   **Homepage URL:** `http://localhost:3000` (later add your Vercel URL).  
   **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github` (later add the Vercel one).
4. Click **Register application**.
5. Copy **Client ID**. Click **Generate a new client secret** and copy the **secret**.
6. In your **`.env`** file, set:
   ```text
   GITHUB_ID="paste-client-id-here"
   GITHUB_SECRET="paste-client-secret-here"
   ```
7. Save.

**Why:** Without these, the “Sign in with Google” and “Sign in with GitHub” buttons won’t work. You can do only Google, only GitHub, or both.

---

### Step 5: Put Your App on the Internet (Vercel)

**What it is:**  
Right now the app runs on your computer. **Vercel** is a place that runs it on the internet so anyone can open it in a browser.

**What to do:**

1. Make sure your code is on **GitHub** (you already pushed it).
2. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
3. Click **Add New** → **Project**.
4. **Import** your GitHub repo (e.g. `akmhatey-ai/casinoroyalproto`).
5. Before clicking **Deploy**, open **Environment Variables** and add **every variable** from your `.env` file:
   - `DATABASE_URL` (with your **real** Supabase password, not `[YOUR-PASSWORD]`)
   - `AUTH_SECRET` (the long random string from Step 3)
   - `NEXTAUTH_URL` = your Vercel URL, e.g. `https://casinoroyalproto.vercel.app` (Vercel will show it after first deploy)
   - `AUTH_URL` = same as `NEXTAUTH_URL`
   - `NEXT_PUBLIC_APP_URL` = same as `NEXTAUTH_URL`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (if you use Google)
   - `GITHUB_ID`, `GITHUB_SECRET` (if you use GitHub)
   - Optional: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from `.env.example`)
6. Click **Deploy**. Wait until the build finishes.
7. After the first deploy, copy your **live URL** (e.g. `https://your-project.vercel.app`).
8. Go back to **Vercel** → your project → **Settings** → **Environment Variables** and set:
   - `NEXTAUTH_URL` = `https://your-project.vercel.app`
   - `AUTH_URL` = `https://your-project.vercel.app`
   - `NEXT_PUBLIC_APP_URL` = `https://your-project.vercel.app`
9. In **Google Cloud Console** and **GitHub OAuth App**, add the **production** callback URLs:
   - Google: `https://your-project.vercel.app/api/auth/callback/google`
   - GitHub: `https://your-project.vercel.app/api/auth/callback/github`
10. Redeploy the project once (Vercel → Deployments → three dots on latest → Redeploy) so it picks up the new URLs.

**Why:** This is how your app becomes a real website. Vercel runs it and gives you a link to share.

---

### Step 6: Check That Everything Works

**What to do:**

1. Open your Vercel URL in a browser (e.g. `https://your-project.vercel.app`).
2. You should see the **home page** (Discover prompts & skills…).
3. Click **Sign in** (or the user icon) and try **Sign in with Google** or **Sign in with GitHub**. You should get logged in and see the dashboard.
4. Try **Submit** and add a prompt or skill. It will be “pending” until approved.
5. To **approve** a prompt or skill: go to **Supabase** → **Table Editor** → open the **prompts** or **skills** table → find the row → change **status** from `pending` to `approved` → save. Then it will show on the site.

**Why:** This confirms database, auth, and deploy are all working. After this, you’re **launched**.

---

## Quick Checklist (Copy and Tick Off)

- [ ] **Step 1:** Put real Supabase database password in `.env` → `DATABASE_URL`
- [ ] **Step 2:** Run `npx prisma migrate deploy` once
- [ ] **Step 3:** Generate and set `AUTH_SECRET` in `.env`
- [ ] **Step 4:** Get Google and/or GitHub OAuth keys and put them in `.env`
- [ ] **Step 5:** Deploy on Vercel and add all env vars; add production callback URLs; redeploy once
- [ ] **Step 6:** Open live URL, sign in, submit something, approve it in Supabase, see it on the site

---

## How Far From Launch? (Again)

- **After Steps 1–2:** Database is connected and tables exist. (~85% — app can run locally with DB.)
- **After Steps 3–4:** Logins work. (~90% — full local experience.)
- **After Step 5:** Site is on the internet. (~98% — launched.)
- **After Step 6:** You’ve tested and approved content. (**100% — launched and verified.**)

If you get stuck on a step, say which step and what you see (e.g. the exact error message), and we can fix it one step at a time.
