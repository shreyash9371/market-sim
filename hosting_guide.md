# Deployment Guide

To host your **MktSim** Trade Journal for free and make it accessible from anywhere, follow these steps:

## 1. Push Your Code to GitHub
1. Create a new repository on [GitHub](https://github.com/new).
2. Open your terminal in the `market-sim` folder and run:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin YOUR_REPOSITORY_URL
   git branch -M main
   git push -u origin main
   ```

## 2. Deploy to Vercel (Recommended)
1. Go to [Vercel](https://vercel.com) and sign in with GitHub.
2. Click **"Add New"** → **"Project"**.
3. Import your `market-sim` repository.
4. In the **"Environment Variables"** section, add the following (copy them from your `.env` file):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GROQ_API_KEY`
5. Click **"Deploy"**.

## 3. Deployment to Netlify (Alternative)
1. Go to [Netlify](https://netlify.com) and log in with GitHub.
2. Click **"Add new site"** → **"Import an existing project"**.
3. Select your repository.
4. Go to **"Site settings"** → **"Environment variables"**.
5. Add your keys here as well.

---

### ⚠️ Important: Supabase Redirect URLs
Since you are using **Supabase Auth** (login/signup), you need to tell Supabase where your live website is:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Authentication** → **URL Configuration**.
3. Add your Vercel URL (e.g., `https://your-site.vercel.app`) to the **Redirect URLs** list.
4. Ensure the **Site URL** is also set correctly.

### 🔐 Security Note
**Never** commit your `.env` file to GitHub. Your project should already have a `.gitignore` file that includes `.env`. By adding the variables directly into Vercel/Netlify's settings, your keys stay safe while your app stays functional.
