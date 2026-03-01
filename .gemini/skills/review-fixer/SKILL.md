---
name: review-fixer
description: Use this skill to fetch, analyze, and automatically address open PR review comments (from Reviewable or GitHub) for the current branch.
---

## Objective
Automatically address code review feedback left on the current pull request by modifying the codebase, verifying the changes, and pushing the updates.

## Methodology
1. **Fetch Feedback:**
   - Use the GitHub CLI (`gh pr view --json comments,reviews,files`) to retrieve all open, unresolved review comments and suggestions for the current branch.
2. **Analyze & Plan:**
   - Read the relevant files referenced in the comments.
   - Formulate a plan to address each comment (e.g., "Extract function", "Add null check", "Fix typo").
3. **Execution:**
   - Apply the requested code changes to the local files.
4. **Verification (Quality Gate):**
   - Run **Unit Tests**: `npm test`
   - Run **Type Check**: `npm run typecheck`
   - Run **Linting**: `npm run lint` (or `npm run lint:fix`)
   - *Ensure the changes did not break existing functionality.*
5. **Persistence & Tracking:**
   - Stage the modified files: `git add <files>`
   - Create a commit summarizing the fixes: `git commit -m "fix(review): address PR comments"`
   - Push the changes to the remote branch: `git push origin HEAD`
6. **Reporting:**
   - Optionally use `gh api` or `gh pr comment` to reply to the resolved threads indicating they have been fixed.
   - Summarize the actions taken and provide the commit hash to the user.

## Constraints
- Only address comments that require code changes. If a comment is a question or unclear, stop and ask the user for clarification before making assumptions.
- Do not merge the PR. Only push the fixes.
- Ensure all quality gates pass before pushing. If a fix breaks a test, attempt to fix the test or stop and ask for help.
