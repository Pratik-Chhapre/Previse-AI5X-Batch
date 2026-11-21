# Test Case Generator

## Run locally

From this directory, run `npm start` and open <http://localhost:4173>. The app reads optional local secrets from `AI-Agents-For-QA/.env`.

In Settings, users can also paste or select a `.env` file containing `GROQ_API_KEY` and/or all three Jira values (`JIRA_BASE_URL`, `JIRA_EMAIL`, and `JIRA_TOKEN`). Those values are kept only in the current browser tab's memory and sent with app API requests; they are not saved to browser storage or the server. Reloading or closing the tab clears them.

## Deploy privately to Render

The repository-root `render.yaml` defines a Render web service. In Render, create a Blueprint from this repository and provide these environment values in Render's dashboard:

- `APP_USERNAME`: the username for the browser's sign-in prompt.
- `APP_PASSWORD`: a strong password of at least 16 characters.
- `GROQ_API_KEY`: the API key used for test-case generation.

Never put these values in `render.yaml` or commit them to the repository. Jira integration is optional; configure `JIRA_BASE_URL`, `JIRA_EMAIL`, and `JIRA_TOKEN` in Render's environment settings only if you want to enable it.

After deployment, Render provides an HTTPS URL. Open it and enter the app username and password when the browser prompts. The app requires authentication in production, including for its API. Its `/health` endpoint is unauthenticated only for Render's health check and returns no configuration or credential information.

The Blueprint uses Render's free plan, which may spin down after inactivity and take time to wake on the next visit. To keep the app responsive without idle spin-down, select an always-on paid plan in Render and review its current price before confirming.

## Deploy to Vercel

Create a separate Vercel project for this app and set its Root Directory to `AI-Agents-For-QA/01_VIBE_CODING/02_Intelligent_Test_Case_Creation_AI_Agent/03_Implementation`. Keep the Framework Preset as Other; Vercel uses the included `vercel.json`.

Add these environment variables in the Vercel dashboard for the deployment environments you use:

- `APP_USERNAME`
- `APP_PASSWORD` (at least 16 characters)
- `GROQ_API_KEY`
- `JIRA_BASE_URL`, `JIRA_EMAIL`, and `JIRA_TOKEN` (optional)

The Vercel proxy requires Basic authentication for every route. Never commit `.env` or paste credentials into source files. The repository-level `.env` is not deployed; configure each Vercel project's variables separately.

Do not hardcode Groq or Jira credentials. Alternatively, each authorized user can load their own `.env` values in the app's Settings for the current tab only. The deployment owner must still configure `APP_USERNAME` and `APP_PASSWORD` in Vercel; do not put those access credentials in the uploaded `.env` file.
