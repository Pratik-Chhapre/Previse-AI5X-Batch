# VWO Login Playwright Framework

This Java 17, Maven, Playwright, and TestNG project checks the login experience
described in the [product requirements document](../Requirements/Product%20Requirements%20Document_%20VWO%20Login%20Dashboard.docx).

## Run the tests

Requirements: Java 17+, Maven 3.9+, and Google Chrome installed.

```powershell
mvn clean test
```

Chrome runs in headed mode by default. To run headless, set
`PLAYWRIGHT_HEADLESS=true`. Tests use XPath locators and independent browser
contexts; no fixed sleeps are used.

The UI tests do not require credentials. Authentication tests are skipped
unless authorized test data is supplied through environment variables:

- Valid login: `VWO_USERNAME`, `VWO_PASSWORD`, and `VWO_SUCCESS_XPATH`
- Invalid login: `VWO_INVALID_USERNAME`, `VWO_INVALID_PASSWORD`, and
  `VWO_INVALID_ERROR_XPATH`

The XPath values must be verified against the authorized test environment.
Credentials are not stored in the repository or emitted in test messages.

The latest run against the public login page has two failing PRD acceptance
checks: email/password are not marked mandatory, and malformed-email feedback
is not shown on blur. The checks intentionally remain assertions so they report
the observed product gaps instead of silently passing.

## Allure

Generate the report after a test run with:

```powershell
mvn allure:report
```

Open `target/site/allure-maven-plugin/index.html`.

## Requirement coverage

See [REQUIREMENTS_COVERAGE.md](REQUIREMENTS_COVERAGE.md) for the automated
coverage and requirements that need a controlled environment or application
implementation before they can be verified.
