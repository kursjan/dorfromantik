---
name: quick-review
description: Perform a rigorous, file-by-file adversarial review of all changes against `main`, acting as a Senior Architect, before writing feedback to REVIEW_FEEDBACK.md. Use when finalizing a track or when requested to do a quick review.
---

# Quick Review Skill

## Goal
Perform a rigorous, file-by-file adversarial review of all changes against `main`, acting as the Senior Architect defined in `.gemini/reviewer.md`.

## Workflow
1. **Load Rules:** Read `.gemini/reviewer.md` and adopt its persona.
2. **Identify Target:** Run `git diff --name-only main...HEAD` to find changed files.
3. **File-by-File Audit:** For each file:
   - Read the FULL file contents using `read_file`.
   - Analyze it against the Critical Review Pillars from `.gemini/reviewer.md`.
4. **Compile Feedback:** Write all findings to a new file named `REVIEW_FEEDBACK.md`. Use the strict markdown format required by `reviewer.md`. If no issues are found in a file, do not list it. After writing the file, use the `replace` tool to mark the corresponding review task as completed `[x]` in the active `plan.md` file.
5. **Approval Gate (MANDATORY):** Stop execution. Tell the user: "Review complete. Please audit and filter `REVIEW_FEEDBACK.md`. Reply 'APPROVED' when you are ready for me to fix these issues."
   - You MUST end the message with: `STATUS: WAITING_FOR_REVIEW_APPROVAL`.
6. **Handoff:** Once the user approves, instruct them that the next step is to use the **task-conductor** skill to implement the fixes listed in the document.