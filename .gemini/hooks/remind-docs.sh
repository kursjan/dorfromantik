#!/usr/bin/env bash

# 1. Read the input from Gemini CLI
INPUT=$(cat)

# 2. Extract the AI's response text
RESPONSE=$(echo "$INPUT" | grep -oP '"prompt_response":\s*"\K[^"]+')
EXPLANATION_GIVEN=$(echo "$RESPONSE" | tr '[:upper:]' '[:lower:]' | grep -E "no update needed|docs are current|no changes required")

# 3. Get git status
MODIFIED=$(git status --porcelain)
CODE_CHANGED=$(echo "$MODIFIED" | grep -E "\.(ts|tsx|js|jsx)$")

# Catch any of the docs anywhere in the tree, case-insensitive for ARCHITECTURE.md
DOCS_CHANGED=$(echo "$MODIFIED" | grep -Ei "(CHANGELOG\.md|GEMINI\.md|ARCHITECTURE\.md)$")

REASON="NUDGE: Code changed without doc updates. Re-verify the 'Done' Definition, 'Task Gate' Protocol, and Architecture Sync in GEMINI.md, ARCHITECTURE.md, and CHANGELOG.md before finishing. If no update is needed, state 'no update needed' to proceed."

# 4. Decision Logic
if [ -n "$CODE_CHANGED" ] && [ -z "$DOCS_CHANGED" ] && [ -z "$EXPLANATION_GIVEN" ]; then
    echo "{"
    echo "  \"decision\": \"block\","
    echo "  \"reason\": \"$REASON\""
    echo "}"
else
    echo "{\"decision\": \"allow\"}"
fi
