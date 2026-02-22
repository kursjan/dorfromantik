#!/usr/bin/env bash

# 1. Read the input from Gemini CLI
INPUT=$(cat)

# 2. Extract the AI's response text and check for keywords
# We use 'tr' to make it case-insensitive
RESPONSE=$(echo "$INPUT" | grep -oP '"prompt_response":\s*"\K[^"]+')
EXPLANATION_GIVEN=$(echo "$RESPONSE" | tr '[:upper:]' '[:lower:]' | grep -E "no update needed|docs are current|no changes required")

# 3. Get git status
MODIFIED=$(git status --porcelain)
CODE_CHANGED=$(echo "$MODIFIED" | grep -E "\.(ts|tsx|js|jsx)$")
DOCS_CHANGED=$(echo "$MODIFIED" | grep -E "(CHANGELOG\.md|GEMINI\.md|architecture\.md)$")

# 4. Decision Logic
if [ -n "$CODE_CHANGED" ] && [ -z "$DOCS_CHANGED" ] && [ -z "$EXPLANATION_GIVEN" ]; then
    # BLOCK if code changed, no docs changed, and no explanation was typed
    echo "{"
    echo "  \"decision\": \"block\","
    echo "  \"reason\": \"You updated code but skipped documentation. Update architecture.md, CHANGELOG.md, or GEMINI.md. If no update is needed, you MUST state 'no update needed' to proceed.\""
    echo "}"
else
    # ALLOW if docs were updated OR if the AI gave the 'magic' explanation
    echo "{\"decision\": \"allow\"}"
fi