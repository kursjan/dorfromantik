# **Mistral Vibe Skills Configuration for Dorfromantik**

This directory contains Mistral Vibe skills configuration that integrates with the existing Conductor workflow defined in `GEMINI.md`.

## **Skills Structure**

### **Global Skills** (`~/.vibe/skills/`)
- `planning-architect/` - Designs and initializes Conductor tracks
- `project-orchestrator/` - Handles phase/track completion and checkpoints
- `task-conductor/` - Executes individual coding tasks with quality gates

### **Local Skills** (`.vibe/skills/`)
Empty directory for project-specific skill overrides. Can be used to customize or extend global skills.

## **Configuration**

Skills are configured in `~/.vibe/config.toml`:
- **Skill paths**: `[".vibe/skills", "~/.vibe/skills"]`
- **Enabled skills**: `["planning-architect", "project-orchestrator", "task-conductor"]`

## **Workflow Integration**

These skills implement the Conductor workflow from `GEMINI.md`:

### **1. Planning Phase**
- **Skill**: `planning-architect`
- **Trigger**: User requests non-trivial feature/refactor
- **Output**: Conductor track with `plan.md`, optional `spec.md`
- **Handoff**: Ready for `task-conductor` implementation

### **2. Implementation Phase**  
- **Skill**: `task-conductor`
- **Trigger**: "implement next Conductor task" or explicit task assignment
- **Process**:
  1. Execute single task from `plan.md`
  2. Run quality gates (typecheck, tests, lint)
  3. Commit changes
  4. **Approval gate**: `STATUS: WAITING_FOR_APPROVAL`

### **3. Completion Phase**
- **Skill**: `project-orchestrator`
- **Trigger**: Phase/track completion or explicit request
- **Process**:
  1. Documentation sync
  2. Checkpoint commit
  3. PR strategy
  4. **Completion marker**: `STATUS: PHASE_COMPLETED_WAITING_FOR_REVIEW`

## **Constraints & Safety**

Each skill enforces strict constraints:
- **planning-architect**: Read-only, no code changes
- **task-conductor**: Single task scope, quality gates mandatory
- **project-orchestrator**: No new features, focus on state sync

All skills require explicit user approval before proceeding to next steps.

## **Cursor Skills Adaptation**

These skills are based on `.cursor/skills/` but adapted for Mistral Vibe:
- Converted to Mistral Vibe skill format with YAML frontmatter
- Maintained original workflow and methodology
- Added appropriate tool permissions for each skill
- Integrated with existing Conductor and Git workflows