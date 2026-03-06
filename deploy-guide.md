
# OmniStock Cloud Deployment Guide

Follow these steps to take your Inventory Management system live.

## 1. Push to GitHub
1. Create a new repository on [GitHub](https://github.com).
2. Initialize git in your project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

## 2. Deploy to Vercel (Recommended)
1. Go to [Vercel](https://vercel.com) and log in with GitHub.
2. Click **"Add New"** > **"Project"**.
3. Import your `OmniStock` repository.
4. **IMPORTANT: Environment Variables**
   - Expand the "Environment Variables" section.
   - Add `API_KEY` as the Name.
   - Paste your Gemini API Key from Google AI Studio as the Value.
5. Click **"Deploy"**.

## 3. Deployment to Netlify
1. Go to [Netlify](https://netlify.com).
2. Select **"Import from Git"**.
3. Connect to your repository.
4. In the "Site settings" > "Environment variables", add `API_KEY`.
5. Trigger a deploy.

## 4. Android Studio Setup
- Open Android Studio.
- Create a "New Project" with an **Empty Views Activity**.
- Replace the generated `MainActivity.kt`, `AndroidManifest.xml`, and `activity_main.xml` with the code provided in this project.
- Ensure you update the `build.gradle` to include the WebView and ConstraintLayout dependencies.
