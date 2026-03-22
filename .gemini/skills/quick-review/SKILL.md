---
name: quick-review
description: Perform a rigorous, file-by-file adversarial review of all changes against `main`, acting as a Senior Architect, before writing feedback to REVIEW_FEEDBACK.md. Use when finalizing a track or when requested to do a quick review.
---

# Quick Review Skill

## Goal
Perform a rigorous, file-by-file adversarial review of all changes against `main`, acting as the Senior Architect defined in `.gemini/reviewer.md`.

## Workflow
1. **Load Rules:** Read `.gemini/reviewer.md` and adopt its persona.
2. **Determine checklist:** Based on `reviewer.md`, determine a checklist of issues.
   - Determine if an issue is for the modified lines, whole file, or other files.
   - For example, don't "review" already existing comments.
   - For example, review if the new method is consistent with other methods.
   - For example, review if the new file structure is consistent with other files in the same directory and the ARCHITECTURE.md file.
3. **Identify Target:** 
   - Run `git diff --name-only main...HEAD` to find changed files.
   - Run `git diff main...HEAD -- <file>` to understand the exact changes.
4. **Create per-file checklist:** For each file, create a checklist from step 2 for `REVIEW_FEEDBACK.md`.
5. **Per-Item Review (One File Per Turn):** For each item in the checklist, perform the review.
   - **CRITICAL - DO NOT RUSH:** You must analyze ONLY ONE file per response turn to ensure deep, rigorous thinking.
   - Read the FULL file contents using `read_file` or all related files.
   - **Thinking Phase:** For each checklist item, you MUST open a `<thinking>` block. Inside this block, rigorously debate with yourself about whether the code violates the rule. Consider edge cases, architectural impact, and the context of the exact changes.
   - After the `<thinking>` block, log your final verdict: `OK`, or `ISSUE: <reason>`.
   - Once a file is fully reviewed, end your turn. Begin your next turn by stating the next file you will review. Do not batch multiple files in a single output.
6. **Compile Feedback:** After all files and all issues are done, write the summary section of `REVIEW_FEEDBACK.md`. Use the strict markdown format required by `reviewer.md`. If no issues are found in a file, do not list it. 
7. **Approval Gate (MANDATORY):** Stop execution. Tell the user: "Review complete. Please audit and filter `REVIEW_FEEDBACK.md`." 
   - You MUST end the message with: `STATUS: WAITING_FOR_REVIEW_APPROVAL`.
   - Wait for approval.
   - If there is an active Conductor plan, after explicit approval, use the `replace` tool to mark the corresponding review task as completed `[x]` in the active `plan.md` file.
8. **Handoff:** Once the user approves, instruct them that the next step is to use the **task-conductor** skill to implement the fixes listed in the document.