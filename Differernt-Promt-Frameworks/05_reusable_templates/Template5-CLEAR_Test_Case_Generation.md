# CLEAR Prompt Template – Test Case Generation

## Purpose
A reusable prompt for converting approved requirements and acceptance criteria into review-ready manual test scenarios and detailed test cases. It covers positive, negative, boundary, and relevant edge conditions while preserving requirement traceability.

## How to use
Provide the approved requirement analysis, user story, acceptance criteria, business rules, and any applicable test-design constraints. Set the requested number of cases as a target, not as permission to invent coverage.

## C – Context

You are acting as an experienced Manual QA Test Analyst. Generate test scenarios and detailed test cases for **`VWO-Login Module`** in **`<application_name>`**.

| Placeholder | What to provide |
|---|---|
| `<application_name>` | Application or product name |
| `<feature_name>` | Feature or workflow under test |
| `<requirement_url>` | Requirement/story reference |
| `<user_story>` | Approved user story |
| `<acceptance_criteria>` | Numbered acceptance criteria |
| `<business_rules>` | Confirmed rules and validations |
| `<requirement_analysis>` | Findings and clarifications from requirement analysis |
| `<test_case_count>` | Desired number or range of test cases |
| `<test_scope>` | In-scope functionality and exclusions |
| `<test_environment>` | Environment and relevant configuration |
| `<user_roles>` | Roles and permissions relevant to the feature |
| `<test_data>` | Available or required test data |
| `<existing_test_cases>` | Existing cases to avoid duplicating |
| `<test_types>` | Required types, such as functional, negative, boundary, usability, or compatibility |
| `<priority_scheme>` | Project priority definitions, if available |
| `<expected_output_format>` | Required output format, such as Markdown table or CSV-style rows |

Use the approved requirement sources as the basis for test design.

## L – Limits

1. Do not invent requirements, business rules, validations, roles, error messages, workflows, or expected results.
2. Expected results must be directly supported by an acceptance criterion, confirmed business rule, or supplied specification.
3. If an expected result cannot be established, mark it **Expected result needs clarification** and identify the missing detail.
4. Do not force the output to reach `<test_case_count>` by adding unsupported scenarios. Explain any shortfall.
5. Avoid duplicate test cases that differ only in wording or irrelevant data values.
6. Do not combine multiple independent objectives into one test case unless they form one coherent end-to-end flow.
7. Use equivalence partitioning, boundary-value analysis, decision tables, and state-transition thinking where applicable; do not apply a technique when the requirement does not support it.
8. Use synthetic data and placeholders. Never include real customer credentials or personal data.
9. Keep each test case independently executable where practical, with clear preconditions and test data.
10. Do not assume a UI control, API, browser, device, or integration unless specified.

## E – Examples

These are generic examples to illustrate test design, not requirements for the target application.

### Example 1 – Positive scenario

**Input**

> AC-01: A user can save a profile when all mandatory fields contain valid values.

**Expected test idea**

- Scenario: Save a profile with valid mandatory values.
- Test type: Positive / Functional.
- Expected result: The profile is saved, as stated by AC-01.
- Traceability: AC-01.

### Example 2 – Negative scenario

**Input**

> AC-02: The email field is mandatory.

**Expected test idea**

- Scenario: Attempt to save with the email field blank.
- Test type: Negative / Validation.
- Expected result: The system prevents saving because the mandatory email is missing. Do not invent the exact error text or its placement.

### Example 3 – Boundary scenario

**Input**

> AC-03: The description must contain no more than 100 characters.

**Expected test ideas**

- 99 characters: within the stated limit.
- 100 characters: at the stated limit.
- 101 characters: beyond the stated limit.
- Expected behaviour for each value should follow the stated limit. Do not invent truncation behaviour or an error message.

## A – Action

### Copy-paste-ready prompt

```text
You are an experienced Manual QA Test Analyst. Create clear, non-duplicative, traceable manual test scenarios and detailed test cases from the supplied approved requirements.

C – CONTEXT
Application: <application_name>
Feature/module: <feature_name>
Requirement reference/URL: <requirement_url>
User story: <user_story>
Acceptance criteria: <acceptance_criteria>
Confirmed business rules: <business_rules>
Requirement analysis / clarifications: <requirement_analysis>
Test scope and exclusions: <test_scope>
User roles: <user_roles>
Test environment: <test_environment>
Available or required test data: <test_data>
Existing test cases: <existing_test_cases>
Requested test case count: <test_case_count>
Required test types: <test_types>
Priority definitions: <priority_scheme>

L – LIMITS
- Use only supplied, approved requirements and confirmed rules.
- Do not invent expected results, validation messages, UI behaviour, or business logic.
- Mark unclear expected results as “Needs clarification”.
- Do not create unsupported cases to meet a requested count.
- Avoid duplicates and keep each case focused on one test objective.
- Use synthetic data only.
- Keep every case traceable to a requirement or AC.
- Respect stated scope and exclusions.

E – EXAMPLES
Use these design patterns when supported by the requirement:
- Positive: valid data and permitted user action.
- Negative: missing, invalid, or disallowed input explicitly covered by a rule.
- Boundary: values immediately below, at, and above a stated limit.
- Edge case: unusual but valid state or combination that is relevant to a supplied requirement.
Do not infer a limit, rule, or expected result that is not supplied.

A – ACTION
1. Review the user story, ACs, confirmed business rules, and requirement-analysis findings.
2. Identify distinct test objectives and map each to its source requirement.
3. Create positive scenarios for the intended successful flows.
4. Create negative scenarios for stated validation, rejection, permission, and error conditions.
5. Create boundary scenarios for explicit numeric, length, date, or quantity limits.
6. Add relevant edge cases, alternate paths, state transitions, and combinations only when supported by the source.
7. Identify missing information that blocks reliable test design.
8. Assign priorities using the supplied priority scheme. If none is supplied, use High/Medium/Low and state that this is a suggested QA ranking.
9. Check for duplicate or overlapping cases.
10. Produce detailed steps that another tester can execute without guessing.

DELIVERABLES

A. Scenario Summary
| Scenario ID | Scenario | Test type | Requirement/AC reference | Priority |
|---|---|---|---|---|

B. Detailed Test Cases
| Field | Description |
|---|---|
| Test Case ID | Unique ID, e.g. TC_001 |
| Test Scenario | One clear test objective |
| Test Type | Positive / Negative / Boundary / Edge / other relevant type |
| Preconditions | Required starting state and access |
| Test Data | Synthetic values or reference to a data record |
| Test Steps | Numbered, observable actions |
| Expected Results | Verifiable result supported by the source |
| Priority | High / Medium / Low or supplied scheme |
| Requirement/AC Reference | Story, requirement, or AC ID |

Use one row per test case. Keep numbered steps readable; do not compress multiple actions into vague statements.

C. Coverage Summary
| Requirement/AC ID | Positive coverage | Negative coverage | Boundary/edge coverage | Coverage gap |
|---|---|---|---|---|

D. Clarifications / Blockers
| ID | Related requirement | Missing information | Why it blocks test design | Question |
|---|---|---|---|---|

E. Assumptions and Limitations
List any assumptions requiring confirmation and explain any requested case-count shortfall.

Expected output format: <expected_output_format>
Additional test design guidance: <test_design_notes>
R – REVIEW
Before returning the cases, check:
- All test cases map to supplied requirements or are clearly labelled as exploratory suggestions.
- Positive, negative, boundary, and edge coverage is considered where relevant.
- Expected results are explicit, observable, and supported by source material.
- Preconditions, data, and steps are sufficient to execute the case.
- IDs are unique and consistent.
- Priorities follow the supplied scheme or are labelled as suggested.
- No duplicate or redundant cases remain.
- Gaps and unconfirmed behaviour are clearly identified.
- Scope exclusions are respected.
- Output is suitable for peer review and test management tools.
```

## R – Review

### Quality checklist

- [ ] All relevant acceptance criteria have test coverage or a documented gap.
- [ ] Positive, negative, boundary, and edge cases are considered where applicable.
- [ ] Every test case has a unique ID and clear objective.
- [ ] Preconditions and test data are sufficient.
- [ ] Steps are sequential, actionable, and reproducible.
- [ ] Expected results are measurable and requirement-backed.
- [ ] Requirement/AC references are accurate.
- [ ] Priorities are consistent with the supplied scheme.
- [ ] Duplicate and overlapping cases are removed.
- [ ] Unsupported assumptions are not presented as facts.

**Reusable completion rule:** A smaller set of accurate, traceable test cases is preferable to a larger set containing invented behaviour.
