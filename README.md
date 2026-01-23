<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CashFlow – Smart Expense Tracker

A Vite + React (TypeScript) personal expense tracker with budgets, reports, and an optional AI advisor.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. (Optional) Enable AI by creating a `.env.local` file and setting:
   `VITE_GEMINI_API_KEY=YOUR_KEY`
3. Run the app:
   `npm run dev`

## Deploy on GitHub Pages

This repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

1. Push your code to a GitHub repo (default branch: `main`).
2. In GitHub: **Settings → Pages**
   - Source: **GitHub Actions**
3. Push to `main` again to trigger a build and deploy.

## Security note about API keys

If you set `VITE_GEMINI_API_KEY`, it is bundled into the frontend and will be visible in the browser.
If you want a safer setup, put the Gemini call behind a backend/serverless function and call that from the UI.
