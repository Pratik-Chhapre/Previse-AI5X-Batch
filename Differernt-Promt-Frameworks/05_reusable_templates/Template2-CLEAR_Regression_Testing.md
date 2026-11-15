# CLEAR Prompt Template – Regression Testing

## Purpose
A reusable prompt for assessing the likely impact of a change and recommending focused, risk-based regression coverage. It helps QA engineers identify affected modules, dependencies, critical workflows, and regression execution priorities.

## How to use
Supply the change request, approved requirements, release/build details, architecture or process information that is available, known dependencies, and existing test inventory. Ask for a recommendation that distinguishes confirmed impacts from potential impacts.

## C – Context

You are acting as an experienced Manual QA Regression Test Analyst. Assess regression impact for **`<feature_name>`** in **`<application_name>`**.

| Placeholder | What to provide |
|---|---|
| `<application_name>` | Application or product name |
| `<feature_name>` | Changed feature or functionality |
| `<change_request>` | Change request, defect fix, enhancement, or release note |
| `<requirement_url>` | Requirement or change reference |
| `<user_story>` | Related user story |
| `<acceptance_criteria>` | New or changed acceptance criteria |
| `<business_rules>` | Confirmed rules affected by the change |
| `<release_version>` | Target release/build |
| `<changed_components>` | Known changed modules, services, screens, or processes |
| `<related_modules>` | Known connected or dependent modules |
| `<integration_points>` | Interfaces or external systems, if documented |
| `<process_flows>` | Relevant end-to-end workflows |
| `<existing_test_cases>` | Regression test inventory and IDs |
| `<defect_history>` | Related defects or recurring problem areas |
| `<production_incidents>` | Relevant incidents, if available and approved |
| `<test_environment>` | Target environment and configuration |
| `<time_constraints>` | Available regression execution time or capacity |
| `<risk_criteria>` | Project risk definitions, if available |
| `<expected_output_format>` | Required output format |

## L – Limits

1. Do not claim a module is impacted unless the supplied change details or dependency evidence supports it. Label uncertain areas **Potential impact – confirm**.
2. Do not invent architecture, integrations, data flows, or technical dependencies.
3. Do not assume that unchanged modules are safe; explain the evidence and uncertainty behind impact decisions.
4. Do not treat all regression cases as equally important. Prioritise based on risk, business criticality, change proximity, and available evidence.
5. Do not invent test-case IDs. Use supplied IDs or clearly mark proposed cases as new.
6. Do not claim coverage is complete if the existing test inventory or dependency information is missing.
7. Do not recommend production data or unsafe execution steps.
8. Do not silently exclude critical workflows because of time constraints. Identify the residual risk.
9. Separate mandatory coverage, recommended coverage, and optional coverage.
10. Identify assumptions, unknowns, and required stakeholder confirmation.

## E – Examples

These examples are generic and do not establish the impact of an actual change.

### Example 1 – Direct impact

**Input**

> Change: Update the validation rule on a profile form. The requirement confirms a new maximum field length.

**Expected analysis**

- Directly impacted area: profile form validation.
- Regression scenarios: values below, at, and above the documented maximum.
- Potential related areas: save, edit, and display flows, if they use the same field.
- Confirm shared-field behaviour before treating related areas as confirmed impacts.

### Example 2 – Dependency impact

**Input**

> Change: A status displayed on the account page is now sourced from an updated upstream process.

**Expected analysis**

- Direct impact: status display on the account page.
- Potential dependency: upstream status calculation or transfer.
- Regression checks: status mapping, refresh, unavailable-source handling, and relevant downstream display—only where those behaviours are documented.
- Clarify the source of truth and affected status values.

### Example 3 – Limited execution time

**Input**

> Available regression window: 2 hours. Existing suite contains critical and lower-risk scenarios.

**Expected analysis**

- Recommend critical business flows and tests closest to the change first.
- Identify tests deferred due to the time limit.
- State residual risk and recommend follow-up coverage.
- Do not claim that a time-limited run provides full regression coverage.

## A – Action

### Copy-paste-ready prompt

```text
You are an experienced Manual QA Regression Test Analyst. Analyse the supplied change and recommend a risk-based regression scope with clear traceability and execution guidance.

C – CONTEXT
Application: <application_name>
Feature/module: <feature_name>
Change request / release note: <change_request>
Requirement reference: <requirement_url>
User story: <user_story>
Acceptance criteria: <acceptance_criteria>
Confirmed business rules: <business_rules>
Release/build version: <release_version>
Known changed components: <changed_components>
Related modules: <related_modules>
Integration points: <integration_points>
Relevant process flows: <process_flows>
Existing regression test cases: <existing_test_cases>
Related defect history: <defect_history>
Relevant incidents: <production_incidents>
Test environment: <test_environment>
Execution time/capacity: <time_constraints>
Risk criteria: <risk_criteria>

L – LIMITS
- Base impact analysis on supplied change details and documented dependencies.
- Label uncertain relationships as potential impacts requiring confirmation.
- Do not invent modules, integrations, test IDs, or system behaviour.
- Do not claim full coverage when source information or test inventory is incomplete.
- Separate mandatory, recommended, and optional regression coverage.
- Make time constraints and residual risks explicit.
- Use safe test data and approved environments only.

E – EXAMPLES
Apply these reasoning patterns where relevant:
- Direct change: prioritise the changed feature and its documented behaviour.
- Dependency: consider upstream/downstream flows only when evidence supports the relationship.
- Limited time: prioritise high-risk and critical-path tests, and document deferred coverage.
Do not treat these generic examples as facts about the target application.

A – ACTION
1. Summarise the change, its purpose, and the affected release.
2. Identify changed components from the supplied change information.
3. Map direct impacts to the affected modules and user workflows.
4. Analyse upstream, downstream, shared-data, integration, and cross-module dependencies where documented.
5. Identify potential impacts separately from confirmed impacts.
6. Review related defect history and incidents for relevant regression focus.
7. Identify business-critical and end-to-end workflows that may be affected.
8. Select existing regression test cases by ID where available. Propose new scenario IDs only when necessary and label them as proposed.
9. Define regression scenarios covering the changed behaviour and relevant unaffected/adjacent behaviour.
10. Assign risk and priority with a short rationale using the supplied criteria. If no criteria are supplied, use a clearly labelled suggested High/Medium/Low assessment.
11. Map scenarios to impacted modules, requirements, and test cases.
12. Recommend execution order and identify prerequisites.
13. Compare recommended coverage with time/capacity constraints. Identify deferred tests and residual risk.
14. State information gaps and questions needed to confirm the regression scope.

DELIVERABLES

1. Change / Feature Analysis
| Item | Details |
|---|---|
| Change summary | |
| Business purpose | |
| Release/build | |
| Changed components | |
| Scope and limitations | |

2. Impacted Modules
| Module / workflow | Direct / Potential impact | Evidence / reason | Regression focus | Confirmation needed |
|---|---|---|---|---|

3. Dependency Analysis
| Dependency | Upstream / Downstream / Shared | Confirmed / Potential | Possible impact | Evidence / question |
|---|---|---|---|---|

4. Regression Test Scenarios
| Scenario ID | Regression scenario | Impacted module | Test Case ID | Requirement/change reference | Risk | Priority | Coverage type |
|---|---|---|---|---|---|---|---|

5. Test Coverage Summary
| Change item / requirement | Existing coverage | Additional coverage needed | Coverage status | Gap / risk |
|---|---|---|---|---|

6. Execution Recommendation
| Execution order | Test Case ID / Scenario ID | Priority | Reason | Prerequisite |
|---|---|---|---|---|

7. Regression Execution Recommendation
Include:
- Recommended minimum regression scope
- Extended regression scope, if time permits
- Critical end-to-end workflows
- Tests deferred due to constraints
- Residual risk and sign-off considerations

8. Clarifications, Assumptions, and Limitations
List missing dependency information, uncertain impacts, unavailable test cases, and questions for the product/engineering team.

Expected output format: <expected_output_format>
Additional regression guidance: <regression_notes>
```

## R – Review

### Quality checklist

- [ ] Change summary accurately reflects the supplied change.
- [ ] Direct and potential impacts are clearly distinguished.
- [ ] Dependencies are evidence-based and not invented.
- [ ] Critical business and end-to-end workflows are considered.
- [ ] Existing test-case IDs are preserved accurately.
- [ ] Proposed new scenarios are clearly identified.
- [ ] Risk and priority ratings include rationale.
- [ ] Coverage gaps and missing test inventory are visible.
- [ ] Execution order and prerequisites are practical.
- [ ] Time constraints, deferred tests, and residual risks are documented.
- [ ] The recommendation does not claim complete coverage without evidence.

**Reusable completion rule:** Regression scope should be risk-based and evidence-led. When impact is uncertain, flag it for confirmation rather than presenting it as fact.
