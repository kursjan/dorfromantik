---
name: quick-review
description: Perform a rigorous adversarial code review of all changes against main and write findings to REVIEW_FEEDBACK.md. Use when the user asks for a quick review, review pass, or pre-merge architecture review.
---

# Quick Review (Cursor)

Use this skill to run a strict, file-by-file review of changes relative to `main`.

## Goal

Review changed code as a senior architect and produce actionable findings in `REVIEW_FEEDBACK.md`.

## Inputs

- Review persona and standards: `.gemini/reviewer.md`
- Target diff: `main...HEAD`

## Workflow

1. **Load Standards**
   - Read `.gemini/reviewer.md`.
   - Derive a focused checklist from those standards.

2. **Discover Scope**
   - List changed files: `git diff --name-only main...HEAD`.
   - For each changed file, inspect patch: `git diff main...HEAD -- <file>`.

3. **Review File-by-File**
   - Review one file at a time.
   - Read the full file (and related files when needed for context).
   - Evaluate each checklist item and classify:
     - `OK`
     - `ISSUE: <clear reason + impact>`
   - Ignore unrelated legacy issues not touched by this diff unless they create direct risk for the current change.

4. **Write Feedback**
   - Update/create `REVIEW_FEEDBACK.md` with findings grouped by file.
   - Include only files with findings.
   - Keep feedback concrete and fix-oriented.

5. **Approval Gate**
   - Stop after producing feedback.
   - Ask the user to audit/filter `REVIEW_FEEDBACK.md`.
   - End with: `STATUS: WAITING_FOR_REVIEW_APPROVAL`

6. **Post-Approval Handoff**
   - After explicit user approval, recommend using `task-conductor` to implement fixes.
   - If an active Conductor `plan.md` has a review task, mark that task `[x]`.

## Output Format (for REVIEW_FEEDBACK.md)

Use this structure:

```markdown
# Review Feedback

## Summary
- <overall risk assessment>
- <top themes>

## Findings

### <path/to/file>
- [severity: high|medium|low] <finding title>
  - Why: <why this is a problem>
  - Evidence: <function/symbol/behavior>
  - Suggested fix: <specific remediation>
```

## Constraints

- Do not implement fixes while this skill is active; review only.
- Be adversarial but fair: prioritize correctness, regressions, architecture drift, and test gaps.
- Keep scope on the `main...HEAD` change set and immediate dependencies.
