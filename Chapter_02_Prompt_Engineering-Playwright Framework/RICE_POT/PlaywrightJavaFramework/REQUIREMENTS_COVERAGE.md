# VWO Login PRD Coverage

The PRD is the acceptance reference. The framework tests the live login UI at
`https://app.vwo.com/#/login` using headed Chrome and XPath-only locators. The
live page currently identifies itself as “Login - Wingify”; assertions follow
the observed page rather than assuming unverified VWO-specific UI.

## Automated coverage

| PRD area | Automated check | Scope / result |
|---|---|---|
| Email and password login UI | Visible email, password, sign-in controls and associated labels | UI presence only |
| HTTPS | Current login URL uses HTTPS | Browser-visible transport scheme |
| Email format | Malformed value is rejected by the email input's browser validity state | Does not submit the form |
| Field validation on blur | Malformed email should display feedback after focus leaves the field | Acceptance test; current live page does not display the observed inline feedback |
| Mandatory fields | Email and password inputs must be marked required | Acceptance test; current live DOM reports both `required` properties as false |
| Remember Me | Checkbox can be toggled | No persistence/session-duration claim |
| Password management | Password visibility can be toggled | No password recovery message or email delivery asserted |
| Password recovery | Opens the recovery form and returns to login | Does not submit a reset request |
| Registration | Free-trial link is present and points to the free-trial flow | Destination is not followed |
| SSO / social / passkey | Google, SSO, and passkey controls are present | Provider authentication is not performed |
| Accessibility | Email/password labels are associated and clickable; keyboard Tab moves from email to password | Not a complete WCAG audit |
| Auto-focus | Email field is focused when the login page opens | Live headed-browser assertion |
| Responsive UI | Core controls fit a 390x844 viewport | Single mobile-sized viewport |
| Valid authentication | Uses configured credentials and a verified success XPath | Skipped without authorized test credentials and success indicator |
| Invalid authentication | Uses configured invalid test data and a verified error XPath | Skipped without authorized test data and error indicator |

## Requirements needing more than this public login-page test

The PRD also describes requirements that cannot be established from the
unauthenticated production UI. These are not reported as passing:

- MFA and end-to-end enterprise SSO; login session lifetime and dashboard
  session restoration.
- Password storage/hashing, session-token security, GDPR/CCPA handling, audit
  requirements, and brute-force/rate-limit protections.
- Loading-state behavior during a controlled authentication request; exact
  authentication error copy; password strength rules on account creation or
  reset.
- High-contrast and dark/light themes, the PRD's announced UI banner, and
  full WCAG conformance. The observed login page does not expose a theme
  control or the described announcement.
- Two-second performance targets, CDN behavior, 99.9% availability,
  concurrent-login capacity, analytics integration, and business KPIs.

Verify those items in an authorized staging environment with product-specific
acceptance criteria, test accounts, and service-level test tooling. Do not
run rate-limit or load tests against production.
