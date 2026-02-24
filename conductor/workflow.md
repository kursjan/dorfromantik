# Project Workflow

## Guiding Principles

1. **The Plan is the Source of Truth:** All work must be tracked in `plan.md`.
2. **The Tech Stack is Deliberate:** Changes to the tech stack must be documented in `tech-stack.md` *before* implementation.
3. **High Code Coverage:** Aim for >80% code coverage for all modules.
4. **User Experience First:** Every decision should prioritize user experience.
5. **Non-Interactive & CI-Aware:** Prefer non-interactive commands. Use `CI=true` for watch-mode tools (tests, linters) to ensure single execution.

## Plan
Each plan consists of phases and tasks. 
There could be only one phase and one task for a simple plan.
The plan executes by following the Task and Phase workflow.

### **Conductor & Plan Management:**
  - **Focused Updates:** When updating a track's `plan.md` or `spec.md`, modify only the sections directly related to the current task.
  - **Checkbox Protocol:** Always wait for the user's explicit confirmation before marking a task as complete in the track's `plan.md`.
  - **Analysis Tasks:** The output of analysis is a suggested update in the track's plan or specification, so that the user can verify the tasks and ask the AI to execute them later.
  - **Check Updates:** Both the user and AI can modify Conductor files. The AI always reads the file content and preserves any changes made by the user.

### **Issues:** 
Use GitHub Issues to track every plan. No work should be done without an associated issue number.


## Task Workflow

For the authoritative task execution workflow, including Git Notes and Phase Checkpoints, refer to `GEMINI.md`. The AI Agent strictly follows the protocols defined there.

### Quality Gates
Quality gates are enforced procedurally by the **task-conductor** skill. Refer to `.gemini/skills/task-conductor/SKILL.md` for the exact verification steps (Tests, Linting, Type Checks, Coverage) required before a task is considered complete.

## Phase Workflow
You work on a phase by completing all its tasks, following the Task Workflow.

**Procedural Mandate:**
Strictly follow the **Phase Completion Protocol** defined in `.gemini/skills/project-orchestrator/SKILL.md`. This includes:
- Verification of all tasks.
- Manual test plan creation and execution.
- Checkpoint commit with `git notes` report.
- Updating `plan.md` with the checkpoint SHA.

## Track Workflow
**Procedural Mandate:**
Strictly follow the **Track Completion Protocol** defined in `.gemini/skills/project-orchestrator/SKILL.md`. This includes:
- Architecture synchronization.
- Final user approval.
- PR creation and handover.

After marking a conductor track as done:
- [ ] Create a Pull Request on GitHub and assign it to the user for code review. 
      - You MUST NOT merge the PR yourself. The user is responsible for the final review and merge on GitHub.
- [ ] After a task is "Done" and the PR has been created, you MUST STOP and present a link to the PR. Do not proceed to the next task without explicit user permission.

## User Approval & Iteration
When asking for approval (to finish a task, phase, or track), if the user requests changes, apply them, verify them, and request approval again. This loop continues until the user explicitly accepts the implementation (`lgtm`, `sgtm`, etc.).


## Development Commands

**AI AGENT INSTRUCTION: This section should be adapted to the project's specific language, framework, and build tools.**

### Setup
```bash
# Example: Commands to set up the development environment (e.g., install dependencies, configure database)
# e.g., for a Node.js project: npm install
# e.g., for a Go project: go mod tidy
```

### Daily Development
```bash
# Example: Commands for common daily tasks (e.g., start dev server, run tests, lint, format)
# e.g., for a Node.js project: npm run dev, npm test, npm run lint
# e.g., for a Go project: go run main.go, go test ./..., go fmt ./...
```

### Before Committing
```bash
# Example: Commands to run all pre-commit checks (e.g., format, lint, type check, run tests)
# e.g., for a Node.js project: npm run check
# e.g., for a Go project: make check (if a Makefile exists)
```

## Testing Requirements

### Unit Testing
- Every module must have corresponding tests.
- Use appropriate test setup/teardown mechanisms (e.g., fixtures, beforeEach/afterEach).
- Mock external dependencies.
- Test both success and failure cases.

### Integration Testing
- Test complete user flows
- Verify database transactions
- Test authentication and authorization
- Check form submissions

### Mobile Testing
- Test on actual iPhone when possible
- Use Safari developer tools
- Test touch interactions
- Verify responsive layouts
- Check performance on 3G/4G

## Code Review Process

### Self-Review Checklist
Before requesting review:

1. **Functionality**
   - Feature works as specified
   - Edge cases handled
   - Error messages are user-friendly

2. **Code Quality**
   - Follows style guide
   - DRY principle applied
   - Clear variable/function names
   - Appropriate comments

3. **Testing**
   - Unit tests comprehensive
   - Integration tests pass
   - Coverage adequate (>80%)

4. **Security**
   - No hardcoded secrets
   - Input validation present
   - SQL injection prevented
   - XSS protection in place

5. **Performance**
   - Database queries optimized
   - Images optimized
   - Caching implemented where needed

## Commit Guidelines

### Message Format
```
<type>(<scope>): <description> (<github reference>)

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests
- `chore`: Maintenance tasks

### Examples
```bash
git commit -m "feat(auth): Add remember me functionality (#42)"
git commit -m "fix(posts): Correct excerpt generation for short posts (fixes #42)"
git commit -m "test(comments): Add tests for emoji reaction limits (#123)"
git commit -m "style(mobile): Improve button touch targets"
```

## Emergency Procedures

## Deployment Workflow

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Coverage >80%
- [ ] No linting errors
- [ ] Mobile testing complete
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backup created

### Deployment Steps
1. Merge feature branch to main
2. Tag release with version
3. Push to deployment service
4. Run database migrations
5. Verify deployment
6. Test critical paths
7. Monitor for errors

### Post-Deployment
1. Monitor analytics
2. Check error logs
3. Gather user feedback
4. Plan next iteration

## Continuous Improvement

- Review workflow weekly
- Update based on pain points
- Document lessons learned
- Optimize for user happiness
- Keep things simple and maintainable
