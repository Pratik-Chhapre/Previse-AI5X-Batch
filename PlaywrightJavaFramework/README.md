# Wingify Playwright Java Login Framework

## Requirements

- Java 25 or newer
- Maven 3.9 or newer
- Google Chrome installed

## Run the headed TestNG suite

From this directory, run:

```powershell
mvn clean test
```

Chrome runs in headed mode by default. Configuration can be overridden with
system properties or environment variables. `PLAYWRIGHT_HEADLESS=true` enables
headless mode; `PLAYWRIGHT_BROWSER_CHANNEL` selects the installed Chromium
browser channel.

The login UI, Remember Me, and empty-field checks do not require credentials.
Credential-dependent tests are skipped unless the following environment
variables are set:

- Valid login: `WINGIFY_USERNAME`, `WINGIFY_PASSWORD`,
  `WINGIFY_SUCCESS_XPATH` (a verified XPath for a post-login success indicator)
- Invalid login: `WINGIFY_INVALID_USERNAME`, `WINGIFY_INVALID_PASSWORD`

Use only authorized test accounts. Credentials are read from the environment
and are not stored in this project.

## Allure report

Generate the report after running tests:

```powershell
mvn allure:report
```

Open `target/site/allure-maven-plugin/index.html`.
