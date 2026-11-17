# Test Strategy Builder

## Run locally

Use Node.js 22 or newer. From this directory, run `npm.cmd start` in PowerShell and open <http://localhost:4174>.

The server reads `AI-Agents-For-QA/.env` without returning or displaying its values. Groq is used only when generating a strategy or testing its connection. Jira is used only when testing its connection or after explicitly confirming reviewed follow-up tasks.

Run the local tests with `npm.cmd test`.

The application URL is context for the strategy prompt; the app does not visit or test that URL.

## Deploy to Vercel

Create a separate Vercel project for this app and set its Root Directory to `AI-Agents-For-QA/01_VIBE_CODING/03_Intelligent_Test_Strategy_Builder_AI Agent/03_implementation`. Keep the Framework Preset as Other; Vercel uses the included `vercel.json`.

Add these environment variables in the Vercel dashboard for the deployment environments you use:

- `APP_USERNAME`
- `APP_PASSWORD` (at least 16 characters)
- `GROQ_API_KEY`
- `JIRA_BASE_URL`, `JIRA_EMAIL`, and `JIRA_TOKEN` (optional)

The Vercel proxy requires Basic authentication for every route. Never commit `.env` or paste credentials into source files. The repository-level `.env` is not deployed; configure each Vercel project's variables separately.
