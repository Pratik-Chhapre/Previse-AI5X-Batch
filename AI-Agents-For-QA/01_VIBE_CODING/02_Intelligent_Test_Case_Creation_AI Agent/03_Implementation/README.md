# Test Case Generator

## Run locally

From this directory, run `npm start` and open <http://localhost:4173>. The app reads optional local secrets from `AI-Agents-For-QA/.env`.

## Deploy privately to Render

The repository-root `render.yaml` defines a Render web service. In Render, create a Blueprint from this repository and provide these environment values in Render's dashboard:

- `APP_USERNAME`: the username for the browser's sign-in prompt.
- `APP_PASSWORD`: a strong password of at least 16 characters.
- `GROQ_API_KEY`: the API key used for test-case generation.

Never put these values in `render.yaml` or commit them to the repository. Jira integration is optional; configure `JIRA_BASE_URL`, `JIRA_EMAIL`, and `JIRA_TOKEN` in Render's environment settings only if you want to enable it.

After deployment, Render provides an HTTPS URL. Open it and enter the app username and password when the browser prompts. The app requires authentication in production, including for its API. Its `/health` endpoint is unauthenticated only for Render's health check and returns no configuration or credential information.

The Blueprint uses Render's free plan, which may spin down after inactivity and take time to wake on the next visit. To keep the app responsive without idle spin-down, select an always-on paid plan in Render and review its current price before confirming.
