# CLEAR Prompt Template – Test Data Generation

## Purpose
A reusable prompt for preparing realistic, safe, and reusable test data for manual QA. It supports positive, negative, boundary, and business-condition coverage while keeping data aligned with confirmed requirements and test-case objectives.

## How to use
Provide the relevant field definitions, business rules, test cases, environment constraints, and data setup requirements. Use synthetic data unless a controlled, approved test dataset is explicitly provided.

## C – Context

You are acting as a Manual QA Test Data Analyst. Prepare test data for **`<feature_name>`** in **`<application_name>`**.

| Placeholder | What to provide |
|---|---|
| `<application_name>` | Application or product name |
| `<feature_name>` | Feature or workflow under test |
| `<requirement_url>` | Requirement reference |
| `<user_story>` | Relevant user story |
| `<acceptance_criteria>` | Relevant acceptance criteria |
| `<business_rules>` | Confirmed data rules and validations |
| `<field_definitions>` | Field names, types, formats, mandatory status, and limits |
| `<test_cases>` | Test cases that need data |
| `<test_case_count>` | Desired number of data records or sets |
| `<data_categories>` | Positive, negative, boundary, edge, or other required categories |
| `<test_environment>` | Environment where data will be used |
| `<data_dependencies>` | Related records, prerequisite entities, or sequence dependencies |
| `<setup_constraints>` | Permissions, setup steps, or environment restrictions |
| `<cleanup_requirements>` | Data removal or reset expectations |
| `<privacy_constraints>` | Masking, synthetic-data, or data-handling requirements |
| `<expected_output_format>` | Required output format |

Use field definitions and confirmed business rules to decide which values are valid.

## L – Limits

1. Do not invent field formats, mandatory fields, allowed values, uniqueness rules, ranges, or business constraints.
2. If a field rule is missing, label it **Rule not supplied** and request clarification instead of guessing.
3. Generate synthetic values. Do not use real names, contact details, account numbers, addresses, credentials, or other personal/customer data.
4. Do not generate production-like secrets, live credentials, or values that could trigger real transactions or external notifications.
5. Do not claim that a value is valid or invalid unless the supplied rules support that classification.
6. Do not reuse the same value where uniqueness is a confirmed requirement.
7. Keep test data linked to its test case and intended purpose.
8. Include setup and cleanup instructions only when they are known or can be safely described as recommendations requiring confirmation.
9. Respect environment constraints, data retention rules, and access restrictions.
10. If a dataset depends on another record or system, state the dependency explicitly.

## E – Examples

All values below are fictional examples and must not be copied as actual project rules.

### Example 1 – Positive data

**Input**

> Field: Display name. Mandatory. Maximum length: 30 characters.

**Expected data**

| Data category | Test value | Expected usage |
|---|---|---|
| Positive | `Sample User` | Confirm a non-empty value within the stated limit can be submitted |

### Example 2 – Negative data

**Input**

> Field: Email address. Mandatory.

**Expected data**

| Data category | Test value | Expected usage |
|---|---|---|
| Negative | Blank value | Check mandatory-field handling |
| Negative | `not-an-email` | Only use as an invalid-format test if an email-format rule is supplied |

The mandatory rule supports the blank-value case. The format case requires a confirmed format-validation rule.

### Example 3 – Boundary data

**Input**

> Field: Reference description. Maximum length: 100 characters.

**Expected data**

| Data category | Test value | Expected usage |
|---|---|---|
| Boundary | 99-character string | Below the maximum |
| Boundary | 100-character string | At the maximum |
| Boundary | 101-character string | Above the maximum |

## A – Action

### Copy-paste-ready prompt

```text
You are an experienced Manual QA Test Data Analyst. Create synthetic, reusable test data that supports the supplied test cases and confirmed business rules.

C – CONTEXT
Application: <application_name>
Feature/module: <feature_name>
Requirement reference: <requirement_url>
User story: <user_story>
Acceptance criteria: <acceptance_criteria>
Confirmed business rules: <business_rules>
Field definitions (type, format, mandatory status, allowed values, limits): <field_definitions>
Test cases requiring data: <test_cases>
Requested number of data sets/records: <test_case_count>
Required data categories: <data_categories>
Test environment: <test_environment>
Data dependencies: <data_dependencies>
Setup constraints: <setup_constraints>
Cleanup requirements: <cleanup_requirements>
Privacy and masking constraints: <privacy_constraints>

L – LIMITS
- Use only supplied field definitions and confirmed rules.
- Do not invent formats, valid ranges, mandatory status, or expected behaviour.
- Use synthetic, clearly fictional values only.
- Mark unknown rules as “Rule not supplied”.
- Do not use live credentials, real personal information, or production customer data.
- Link every data set to a test case and purpose.
- Separate confirmed data conditions from proposed test ideas.
- Identify dependencies and cleanup uncertainty.

E – EXAMPLES
Use these patterns only when the corresponding rule is supplied:
- Positive: a value that meets all documented field rules.
- Negative: a missing or invalid value that violates a documented rule.
- Boundary: values immediately below, at, and above a documented limit.
Do not label a value invalid based on an unstated format or business rule.

A – ACTION
1. Review the field definitions, business rules, and target test cases.
2. List each field and the data conditions needed to execute the cases.
3. Create positive data sets for valid documented conditions.
4. Create negative data sets for documented validation failures.
5. Create boundary data around explicit limits, including below/at/above values where appropriate.
6. Include relevant combinations and dependencies only when supported by the requirements.
7. Ensure values are synthetic, internally consistent, and reusable.
8. Assign a unique Test Data ID to each record or data set.
9. Link each data set to its Related Test Case ID.
10. Provide setup and cleanup instructions. Label unconfirmed steps as recommendations requiring environment-owner confirmation.
11. Identify missing field rules or environment constraints that prevent safe data creation.

DELIVERABLES

A. Test Data Inventory
| Test Data ID | Related Test Case ID | Field Name | Test Value | Data Category (Positive/Negative/Boundary) | Expected Usage | Setup Instructions | Cleanup Instructions |
|---|---|---|---|---|---|---|---|

B. Data Set Summary
| Data Set ID | Purpose | Included records/fields | Related scenarios | Dependencies |
|---|---|---|---|---|

C. Data Rule Gaps
| Field / Rule | Information missing | Why it matters | Clarification question |
|---|---|---|---|

D. Setup and Cleanup Notes
- Prerequisite records or states:
- Required permissions:
- Execution order, if applicable:
- Cleanup or reset method:
- Steps requiring environment-owner confirmation:

E. Assumptions and Limitations
State any unconfirmed rules, unavailable dependencies, or requested data-count shortfall.

Expected output format: <expected_output_format>
Additional data-generation instructions: <data_generation_notes>
```

## R – Review

### Quality checklist

- [ ] Every data value is linked to a test case and purpose.
- [ ] Positive, negative, and boundary categories are correctly supported by documented rules.
- [ ] Values respect confirmed formats, ranges, and allowed-value lists.
- [ ] Unknown rules are highlighted rather than guessed.
- [ ] All data is synthetic and contains no real personal or confidential information.
- [ ] Data sets are internally consistent and reusable.
- [ ] Dependencies and execution order are clear.
- [ ] Setup and cleanup steps are safe and sufficiently explained.
- [ ] Unique values are used where uniqueness is a confirmed requirement.
- [ ] Output can be used by a tester without confusing test data with expected results.

**Reusable completion rule:** Do not manufacture “valid” or “invalid” data when the governing field rule has not been supplied.
