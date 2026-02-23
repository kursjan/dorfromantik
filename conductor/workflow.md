# Project Workflow

## Guiding Principles

1. **The Plan is the Source of Truth:** All work must be tracked in `plan.md`
2. **The Tech Stack is Deliberate:** Changes to the tech stack must be documented in `tech-stack.md` *before* implementation
3. **High Code Coverage:** Aim for >80% code coverage for all modules
4. **User Experience First:** Every decision should prioritize user experience
5. **Non-Interactive & CI-Aware:** Prefer non-interactive commands. Use `CI=true` for watch-mode tools (tests, linters) to ensure single execution.

## Plan
Each plan consists of phases and tasks. 
There could be only one phase and one task for a simple plan.
Plan executes by following the Taks and Phase workflow.

### **Conductor & Plan Management:**
  - **Focused Updates:** When updating a track's `plan.md` or `spec.md`, modify only the sections directly related to the current task.
  - **Checkbox Protocol:** Always wait for the user's explicit confirmation before marking a task as complete in the track's `plan.md`.
  - **Analysis tasks:** Output of analysis is a suggested update in the track's plan or specification, so that the user can verify the tasks and ask the AI to execute them later.
  - **Check updates:** Both user and AI can modify Conductor files. The AI always reads the file content and preserves any changes made by the user.

### **Issues:** 
Use GitHub Issues to track every plan. No work should be done without an associated issue number.


## Task Workflow

For the authoritative task execution workflow, including Git Notes and Phase Checkpoints, refer to `GEMINI.md`. The AI Agent strictly follows the protocols defined there.

### Quality Gates

Before marking any task complete, verify:

- [ ] All tests pass
- [ ] Code coverage meets requirements (>80%)
- [ ] Code follows project's code style guidelines (as defined in `code_styleguides/`)
- [ ] All public functions/methods are documented (e.g., docstrings, JSDoc, GoDoc)
- [ ] Type safety is enforced (e.g., type hints, TypeScript types, Go types)
- [ ] No linting or static analysis errors (using the project's configured tools)
- [ ] Works correctly on mobile (if applicable)
- [ ] Documentation updated if needed
- [ ] No security vulnerabilities introduced


## Phase Workflow
You work on a phase until by doing all the tasks, following the Task Workflow.

Before marking any phase complete
- [ ] All tasks are done
- [ ] Ask for an explicit user approval.
- [ ] **Manual Verification Plan:** Propose a detailed manual test plan for user review.
- [ ]2.  **Checkpoint Commit:** Commit with message `conductor(checkpoint): Checkpoint end of Phase X`.
- [ ] 3.  **Git Note:** Attach a detailed verification report (auto tests + manual plan + user confirm) to the checkpoint commit using `git notes`.
- []4.  **Update Plan:** Mark phase as complete in the Conductor `plan.md` with `[checkpoint: <sha>]`.


## Track Workflow
Before marking a conductor track complete
- [ ] All phases are done
- [ ] All unit and e2e tests pass
- [ ] All changes are commited in Git.
- [ ] `ARCHITECTURE.md` is updated to reflects new models, patterns, and decisions.
- [ ] Ask for an explicit user approval.
      - present user with status of the project

After marking a conductor track as done
- [ ] Pull Request: A Pull Request is created on GitHub and assigned to the user for code review. 
      - You MUST NOT merge the PR yourself. The user is responsible for the final review and merge on GitHub.
      - **The "Wait" State:** After a task is "Done" and the PR has been created, you MUST STOP and present a link to the PR. Do not proceed to the next task without explicit user permission.

## User Approval & Iteration
When asking for approval (to finish task, phase or track), if the user requests changes, you have applied them, verified them, and requested approval again. This loop continues until the user explicitly accepts the implementation (`lgtm`, `sgtm`, etc.).


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
