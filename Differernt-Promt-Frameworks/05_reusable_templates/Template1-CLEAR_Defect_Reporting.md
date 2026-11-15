# CLEAR Prompt Template – Defect Reporting

## Purpose
A reusable prompt for converting observed test failures into concise, reproducible, actionable defect reports. It helps QA engineers document evidence, actual and expected results, environment details, severity, and priority without adding unsupported conclusions.

## How to use
Provide the failed test case, exact observed behaviour, expected behaviour from the requirement, reproduction steps, environment/build information, and safe supporting evidence. Do not ask the AI to infer missing observations.

## C – Context

You are acting as an experienced Manual QA Analyst preparing a defect report for **`Wingify.com`**, related to **`Login Module`**.

| Placeholder | What to provide |
|---|---|
| `<Wingify.com` | Application or product name |
| `Login Module` | Feature or module where the issue occurred |
| `<requirement_url>` | Requirement or acceptance-criteria reference |
| `<test_case_id>` | Failed test case identifier |
| `<test_scenario>` | Scenario being executed |
| `<preconditions>` | Required starting state and setup |
| `<steps_to_reproduce>` | Exact actions performed |
| `<test_data>` | Synthetic or masked data used |
| `<expected_result>` | Expected behaviour supported by requirement |
| `<actual_result>` | What actually happened |
| `<environment>` | QA/UAT/staging or other environment |
| `<build_version>` | Build, release, or version identifier |
| `<browser_device>` | Browser, OS, device, or client details if relevant |
| `<frequency>` | Always, intermittent, or observed once |
| `<evidence>` | Screenshot, recording, logs, or other safe evidence |
| `<impact_scope>` | Users, functions, or workflows known to be affected |
| `<severity_definitions>` | Project severity definitions |
| `<priority_definitions>` | Project priority definitions |

## L – Limits

1. Do not invent steps, actual results, expected results, error messages, logs, or evidence.
2. Expected results must come from the supplied requirement, acceptance criterion, or confirmed business rule.
3. Do not describe an unverified cause as the root cause. Use “possible cause” only when evidence supports it.
4. Do not exaggerate impact or claim a production issue unless the supplied evidence confirms it.
5. Do not assign severity or priority as if formally approved when definitions or triage ownership are missing. Provide a suggested value with rationale where appropriate.
6. Keep reproduction steps chronological, specific, and limited to actions needed to reproduce the issue.
7. Do not include passwords, tokens, personal data, customer identifiers, or confidential information in the report.
8. Preserve the distinction between actual result and expected result.
9. If the issue is intermittent, include the observed frequency and conditions; do not claim consistent reproduction.
10. If key information is missing, mark it as **Not provided** and list what is needed.

## E – Examples

These examples are generic and do not define the behaviour of the target application.

### Example 1 – Clear mismatch

**Input**

- Action: Submit a form with all documented mandatory fields populated.
- Expected: The form is saved successfully, according to the supplied AC.
- Actual: The page displays a generic error and no saved confirmation is shown.

**Expected defect summary**

> Form submission displays an error instead of completing the documented save flow.

### Example 2 – Incomplete reproduction information

**Input**

> The page is slow.

**Expected QA handling**

- Do not invent a precise response time or cause.
- Ask for page/operation, environment, approximate duration, baseline, frequency, and evidence.
- Record the current report as incomplete until measurable observations are supplied.

### Example 3 – Intermittent issue

**Input**

> The save action failed 2 times in 10 attempts in the test environment.

**Expected QA handling**

- Frequency: 2 failures in 10 attempts.
- Include the exact conditions and evidence for failed attempts if available.
- Do not label it “always reproducible.”

## A – Action

### Copy-paste-ready prompt

```text
You are an experienced Manual QA Analyst. Convert the supplied observed failure into a professional, actionable defect report.

C – CONTEXT
Application: <application_name>
Feature/module: <feature_name>
Requirement/AC reference: <requirement_url>
Failed test case ID: <test_case_id>
Test scenario: <test_scenario>
Preconditions: <preconditions>
Steps performed: <steps_to_reproduce>
Test data (masked/synthetic): <test_data>
Expected result: <expected_result>
Actual result: <actual_result>
Environment: <environment>
Build/release version: <build_version>
Browser/device/OS: <browser_device>
Frequency: <frequency>
Impact scope: <impact_scope>
Supporting evidence: <evidence>
Severity definitions: <severity_definitions>
Priority definitions: <priority_definitions>

L – LIMITS
- Do not invent observations, reproduction steps, expected results, evidence, or root cause.
- Use the supplied requirement as the source for expected behaviour.
- Clearly separate facts from hypotheses.
- Do not overstate frequency, impact, or scope.
- Use masked/synthetic data and remove secrets or personal information.
- If information is missing, write “Not provided” and list the required details.
- Severity and priority must follow supplied definitions; otherwise label recommendations as suggested.

E – EXAMPLES
Use these writing principles:
- Title: concise statement of the observed failure and affected function.
- Reproduction: numbered, chronological, repeatable actions.
- Expected vs actual: state the documented expectation separately from the observed result.
- Intermittent behaviour: report measured frequency rather than claiming consistent reproduction.
Do not copy illustrative example behaviour into this defect.

A – ACTION
1. Check whether the supplied information is sufficient to describe and reproduce the issue.
2. Create a concise defect title that identifies the affected function and observed problem.
3. Write a short description covering the user-visible impact without guessing at the cause.
4. List preconditions and setup.
5. Convert the supplied reproduction actions into numbered, chronological steps. Do not add unobserved actions.
6. State the expected result and cite its requirement/AC source.
7. State the actual result exactly and objectively.
8. Include environment, build, browser/device, test data reference, and frequency where supplied.
9. Assess severity based on functional impact and the supplied severity definitions.
10. Assess priority based on urgency/business impact and the supplied priority definitions.
11. If definitions are absent, provide a suggested severity/priority with rationale and mark it “For triage confirmation”.
12. Reference screenshots, recordings, logs, or other evidence. Do not claim evidence exists if it was not supplied.
13. List missing information and questions needed to reproduce or triage the issue.

DELIVERABLE

Defect Report
| Field | Details |
|---|---|
| Defect Title | |
| Description | |
| Preconditions | |
| Steps to Reproduce | |
| Expected Result | |
| Actual Result | |
| Requirement/AC Reference | |
| Test Case ID | |
| Environment and Build | |
| Browser / Device / OS | |
| Test Data Reference | |
| Frequency / Reproducibility | |
| Severity | |
| Priority | |
| Supporting Evidence | |
| Impact Scope | |
| Suspected Cause (only if evidence supports it) | |

Additional sections:
- Missing Information / Clarification Needed
- Severity and Priority Rationale
- Notes for Developer / Triage Team

Expected output format: <expected_output_format>
Defect tracker conventions: <defect_tracker_conventions>
```

## R – Review

### Quality checklist

- [ ] Title is concise and describes the observed issue.
- [ ] Description is factual and avoids unsupported root-cause claims.
- [ ] Preconditions and steps are complete and chronological.
- [ ] Expected result is supported by a requirement or confirmed rule.
- [ ] Actual result accurately reflects what was observed.
- [ ] Environment, build, and relevant client details are included.
- [ ] Frequency and reproducibility are represented accurately.
- [ ] Severity and priority follow project definitions or are labelled as suggestions.
- [ ] Evidence is referenced and does not expose sensitive information.
- [ ] Missing information is clearly identified.

**Reusable completion rule:** A defect report must describe what was observed, what should have happened, and how to reproduce it—not speculate about why it happened.
