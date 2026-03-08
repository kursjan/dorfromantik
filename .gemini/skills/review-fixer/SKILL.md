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
6. **Reporting & Communication (GitHub Replies):**
   - You must reply individually to *each* specific comment thread you addressed. Do not post a single top-level summary comment on the PR.
   - **How to reply:**
     1. During Step 1 (`gh pr view`), identify the `id` of each comment thread.
     2. For each addressed thread, execute:
        ```bash
        gh api graphql -f query='mutation { addPullRequestReviewThreadReply(input: {pullRequestReviewThreadId: "<THREAD_ID>", body: "Done. <Brief explanation>"}) { clientMutationId } }'
        ```
   - **For Questions/Inquiries:** Do not modify code. Formulate a technical explanation and reply directly to the comment thread using the same command above.
   - **Verification:** After replying, verify that all open comments have been addressed by re-running `gh pr view --json comments,reviews` and checking that no actionable feedback remains unanswered.
   - Finally, summarize the actions taken and provide the commit hash to the user in the CLI.

## Constraints
- If a comment is a direct question or a request for clarification, treat it as an Inquiry: reply to the thread on GitHub with the answer and do not modify the codebase.
- Do not merge the PR. Only push the fixes and reply to comments.
- Ensure all quality gates pass before pushing. If a fix breaks a test, attempt to fix the test or stop and ask for help.
