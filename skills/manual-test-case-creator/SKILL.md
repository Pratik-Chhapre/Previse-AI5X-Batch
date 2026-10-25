---
description: Create clear, traceable manual test cases from software
  requirements, user stories, acceptance criteria, and requirement
  documents.
name: test_case_creater_skill
---

# Generic Manual Test Case Creator

## Purpose

Transform supplied software requirements into practical, reviewable
manual test cases for web, mobile, enterprise, and end-to-end business
workflows.

## When to use

Use this skill when the user supplies requirements, a user story,
acceptance criteria, a change request, a process description, or a
requirement document.

## Procedure

### 1. Understand the requirement

-   Read all supplied requirement content before drafting.
-   Identify the feature, actors, triggers, inputs, business rules,
    expected outcomes, roles, dependencies, and acceptance criteria.
-   Separate explicit requirements from assumptions and suggestions.

### 2. Identify applicable test conditions

Consider relevant scenarios: - Positive / happy path - Negative and
invalid input - Boundary values and limits - Required-field and format
validation - Business-rule validation - Alternate and exception flows -
Roles and permissions - Repeated actions, retries, and duplicate
submissions - State transitions, data persistence, and consistency -
Integration outcomes - Usability, accessibility, compatibility, or
performance when within scope

Only include categories relevant to the feature. Do not add unrelated
cases just to increase the count.

### 3. Check coverage

-   Map test cases to requirement IDs or acceptance criteria when
    provided.
-   Cover each stated acceptance criterion.
-   Identify omissions, overlaps, and duplicates.
-   Flag conflicting or ambiguous requirements instead of silently
    choosing an interpretation.

### 4. Write executable test cases

-   Assign unique sequential IDs, such as TC_001, TC_002.
-   Give each case a concise, behavior-focused title.
-   Include preconditions and test data where needed.
-   Write numbered, actionable manual steps.
-   State specific, observable expected results.
-   Assign priority based on business risk and impact.
-   Avoid vague steps such as "test the feature" and results such as "it
    works correctly."

### 5. Review before responding

Confirm that cases are relevant, executable, non-duplicative, and
traceable where possible. Check positive, negative, and boundary
scenarios as applicable. Do not invent unsupported behavior.

## Default output format

Use a Markdown table for a small or moderate set of cases. For long
steps, use a separate structured section per test case.

  -----------------------------------------------------------------------
  Field                               Guidance
  ----------------------------------- -----------------------------------
  Test Case ID                        Unique ID, e.g. TC_001

  Requirement ID                      Supplied ID; otherwise N/A

  Test Scenario / Title               Short description of the behavior
                                      being tested

  Test Type                           Positive, Negative, Boundary,
                                      Validation, Security, Integration,
                                      or another relevant type

  Preconditions                       Required system state, role, setup,
                                      or dependency

  Test Data                           Supplied values or clearly labelled
                                      placeholders

  Test Steps                          Numbered actions a tester can
                                      perform

  Expected Result                     Specific observable outcome

  Priority                            High, Medium, or Low, based on risk
  -----------------------------------------------------------------------

Follow the user's requested output format if they specify one. Do not
add unnecessary columns.

## Priority guidance

-   **High:** Critical business flow, security/access control, major
    financial or data impact, or a failure blocking important activity.
-   **Medium:** Important functionality with a workaround or moderate
    business impact.
-   **Low:** Minor behavior, cosmetic issue, or low-impact edge case.

Priority is not the same as defect severity or execution order. If
impact is unclear, mark priority provisional.

## Accuracy rules

-   Treat supplied requirements as the source of truth.
-   Never invent fields, limits, workflows, roles, fees, messages,
    statuses, or business rules.
-   Do not present assumptions as confirmed requirements.
-   If expected behavior is unspecified, write "Confirm expected
    behavior with the product owner" rather than fabricating a result.
-   Use placeholders for missing test data and identify them clearly.
-   Do not claim test cases have been executed; execution requires
    actual test evidence.
-   Do not claim complete coverage unless it has been checked against
    the supplied requirements and limitations are stated.
-   Prefer synthetic or masked data over real customer or production
    data.
-   Keep testing within the authorized application and environment
    scope.

## Incomplete or ambiguous requirements

Add an **Assumptions and Clarifications** section when needed. For each
item, state: - Requirement area - Missing or unclear detail - Why it
affects testing - Question for the business analyst, product owner, or
relevant stakeholder

If an assumption is needed to produce a useful draft, label it and make
the related case conditional on confirmation.

## Requirement documents

-   Use only content that can be read from the supplied document.
-   Disclose if pages, tables, images, or sections are unreadable or
    unavailable.
-   Never infer the contents of unreadable sections.
-   If the user requests a particular number of cases, aim for it where
    requirements support it; do not fabricate cases just to meet the
    count.
-   If the user requests Excel, CSV, or another format, use an available
    file-generation capability if supported.

## Response structure

Unless the user requests otherwise, return: 1. **Scope understood** ---
brief summary of the feature. 2. **Manual test cases** --- structured
test cases. 3. **Assumptions and clarifications** --- only when needed.
4. **Coverage notes** --- covered scenario types and known gaps.

## Final checklist

-   [ ] Unique ID for every case.
-   [ ] Clear scenario and purpose.
-   [ ] Preconditions and test data included when needed.
-   [ ] Steps are numbered and actionable.
-   [ ] Expected results are specific and observable.
-   [ ] Relevant positive, negative, and boundary cases considered.
-   [ ] Traceability included when possible.
-   [ ] Priority is risk-based.
-   [ ] Assumptions and open questions are separated.
-   [ ] No unsupported business behavior is invented.

