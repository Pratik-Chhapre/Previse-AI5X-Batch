# CLEAR Prompt Template – Requirement Analysis

## Purpose
A reusable prompt for analysing user stories, requirements, and acceptance criteria before test design begins. It helps QA engineers understand the intended behaviour, identify gaps and dependencies, and prepare focused clarification questions.

## How to use
Replace the placeholders in the copy-ready prompt with project information. Remove optional placeholders that do not apply, and attach or paste the relevant source material. Keep the source of every requirement identifiable.

## C – Context

You are acting as an experienced Manual QA Analyst. Your task is to analyse the supplied requirements for **`<feature_name>`** in **`<application_name>`**.

Consider the following context:

| Placeholder | What to provide |
|---|---|
| `<application_name>` | Name of the application or product |
| `<application_url>` | Application URL, if relevant and safe to share |
| `<project_name>` | Project or programme name |
| `<feature_name>` | Feature, module, or business process being analysed |
| `<requirement_url>` | Link or identifier for the source requirement |
| `<user_story>` | Full user story, including role, need, and benefit |
| `<acceptance_criteria>` | All acceptance criteria, preferably numbered |
| `<business_rules>` | Confirmed business rules and policy constraints |
| `<process_flow>` | Workflow, process description, or state transitions |
| `<related_documents>` | Relevant specifications, designs, API notes, or existing documentation |
| `<dependencies>` | Known upstream/downstream systems, teams, or integrations |
| `<release_version>` | Target release or version |
| `<test_environment>` | Target test environment, if relevant |
| `<known_constraints>` | Confirmed limitations, exclusions, or compliance requirements |

Use the supplied material as the source of truth. Distinguish explicit requirements from information inferred from context.

## L – Limits

Follow these boundaries:

1. Do not invent requirements, acceptance criteria, business rules, validations, workflows, permissions, or expected system behaviour.
2. Do not interpret an ambiguous statement as a confirmed rule. Mark it **Needs clarification**.
3. Do not treat an example value as a universal rule unless the source explicitly says so.
4. Do not silently resolve contradictions between the user story, acceptance criteria, designs, or other documents. Record the conflict and identify the sources.
5. Do not assume that missing information means a feature is not required.
6. Do not create implementation-level technical details unless they are present in the supplied material.
7. Do not expose or reproduce real personal, customer, or confidential data. Use masked or synthetic examples.
8. Keep traceability: every finding should refer to a story, acceptance-criteria item, document section, or be labelled **Unmapped**.
9. If a source is unavailable, incomplete, or unreadable, state that limitation.
10. Separate confirmed facts, reasonable interpretations, assumptions requiring confirmation, and open questions.

## E – Examples

The examples below are illustrative only. They do not establish rules for the actual project.

### Example 1 – Clear requirement

**Input**

> AC-01: A user with an active account can update their registered phone number after completing the required verification.

**Expected analysis**

| Item | Analysis |
|---|---|
| Requirement | An active-account user can update the registered phone number |
| Actor | User with an active account |
| Trigger | User initiates a phone-number update |
| Confirmed condition | Required verification must be completed |
| Open questions | What verification method is required? Are there format or uniqueness rules? |

### Example 2 – Ambiguous requirement

**Input**

> The system should send a notification after the request is processed.

**Expected analysis**

- Ambiguity: “processed” is not defined.
- Missing information: notification channel, recipient, timing, content, and behaviour if delivery fails.
- Clarification question: “Which processing status triggers the notification, and through which channel should it be sent?”

### Example 3 – Potential dependency

**Input**

> The user can view the latest payment status from the account page.

**Expected analysis**

- Potential dependency: a payment service or other source of payment-status data.
- Clarification: confirm the source of truth, refresh frequency, and behaviour when the source is unavailable.
- Do not assert that a particular integration exists unless the supplied documents confirm it.

## A – Action

### Copy-paste-ready prompt

```text
You are an experienced Manual QA Analyst. Analyse the requirements supplied below using a structured, evidence-based approach.

C – CONTEXT
Application: <application_name>
Application URL (optional): <application_url>
Project: <project_name>
Feature/module: <feature_name>
Requirement reference/URL: <requirement_url>
Release/version: <release_version>
Test environment (if known): <test_environment>

User story:
<user_story>

Acceptance criteria:
<acceptance_criteria>

Confirmed business rules:
<business_rules>

Process flow / related documents:
<process_flow>
<related_documents>

Known dependencies and constraints:
<dependencies>
<known_constraints>

L – LIMITS
- Use only the supplied information as confirmed project evidence.
- Do not invent requirements, business rules, validations, expected results, or system behaviour.
- Mark unclear, missing, contradictory, or unverifiable information explicitly.
- Separate confirmed facts from interpretations and assumptions.
- Do not resolve conflicts silently.
- Use synthetic or masked examples only.
- Maintain traceability to the supplied story, AC IDs, or source sections.

E – EXAMPLES
Use the examples in this template as guidance for the level of analysis:
- For a clear AC, identify actor, trigger, condition, and expected outcome stated by the source.
- For an ambiguous phrase, explain what is unclear and ask a specific question.
- For a possible integration, label it as a potential dependency until confirmed.
Do not copy illustrative examples as project requirements.

A – ACTION
Perform the following steps:
1. Summarise the feature and business objective in plain language.
2. Break the user story into actor, need, and business benefit.
3. Review each acceptance criterion individually. Identify its intent, trigger, preconditions, stated behaviour, and observable outcome where available.
4. Check whether each criterion is specific, measurable, testable, and consistent with the user story.
5. Identify missing scenarios, undefined terms, unclear validations, boundary conditions, permissions, error handling, and state transitions only where relevant to the supplied requirement.
6. Identify contradictions, duplicated statements, and gaps between the story and acceptance criteria.
7. Identify confirmed and potential dependencies. Label unconfirmed dependencies as potential.
8. Assess risks using High/Medium/Low and explain the reason. Do not invent a risk rating without rationale.
9. Create clarification questions that are concise, specific, and answerable.
10. Build a requirement traceability matrix linking each requirement/AC to its analysis and QA coverage need.

DELIVERABLES AND OUTPUT FORMAT

1. Requirement Summary
| Field | Details |
|---|---|
| Requirement reference | |
| Feature | |
| Business objective | |
| User/actor | |
| Main expected capability | |
| Scope stated by source | |
| Source limitations | |

2. Acceptance Criteria Analysis
| AC ID | Requirement statement / intent | Testability | Missing or unclear details | QA observation |
|---|---|---|---|---|

3. Requirement Traceability Matrix
| Requirement/AC ID | Requirement summary | Related feature/process | Test coverage needed | Status |
|---|---|---|---|---|

4. Ambiguities and Gaps
| ID | Source reference | Ambiguity / gap | Why it matters to testing | Clarification required |
|---|---|---|---|---|

5. Dependencies and Risks
| ID | Dependency or risk | Confirmed / Potential | Impact | Risk level | Rationale |
|---|---|---|---|---|---|

6. Clarification Questions
| Question ID | Question | Related AC | Reason / decision needed |
|---|---|---|---|

7. Assumptions and Limitations
List only assumptions that require confirmation. If none, write “No assumptions made.” State any missing source material.

R – REVIEW
Before finalising, verify:
- Every supplied AC has been reviewed and is traceable.
- No requirement or business rule has been invented.
- Ambiguities, contradictions, and missing details are visible.
- Confirmed and potential dependencies are clearly separated.
- Risks have a reasoned explanation.
- Clarification questions are specific and actionable.
- The summary does not overstate what the source says.
- Output is clear, consistent, and suitable for QA review.

Expected output format: <expected_output_format>
Analysis depth / additional instructions: <analysis_notes>
```

## R – Review

### Quality checklist

- [ ] Requirement summary accurately reflects the supplied user story.
- [ ] Every acceptance criterion is analysed and traceable.
- [ ] Ambiguous terms and missing information are explicitly listed.
- [ ] Contradictions are reported rather than silently resolved.
- [ ] Dependencies are labelled confirmed or potential.
- [ ] Risks include a clear impact and rationale.
- [ ] Clarification questions are concise and answerable.
- [ ] No unsupported business rules or expected behaviour have been added.
- [ ] Confidential or personal information is not reproduced unnecessarily.
- [ ] Final analysis is understandable and ready for stakeholder review.

**Reusable completion rule:** If the source material is insufficient, return a structured analysis of what is known and what is missing. Do not fill gaps by guessing.
