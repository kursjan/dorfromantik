#!/usr/bin/env bash

# 1. Get status of files
MODIFIED=$(git status --porcelain)
CODE_CHANGED=$(echo "$MODIFIED" | grep -E "\.(ts|tsx|js|jsx)$")

# 2. Check for docs
CHAN_MISSING=$(echo "$MODIFIED" | grep -q "CHANGELOG.md" || echo "missing")
GEMI_MISSING=$(echo "$MODIFIED" | grep -q "GEMINI.md" || echo "missing")

# 3. If code changed but any doc is missing, send a proactive nudge
if [ -n "$CODE_CHANGED" ] && [ "$CHAN_MISSING" == "missing" || "$GEMI_MISSING" == "missing" ]]; then
    # We use 'allow' so it doesn't block, but we provide a 'reason' for the AI to read
    echo "{"
    echo "  \"decision\": \"allow\","
    echo "  \"reason\": \"NUDGE: You've updated the code. Don't forget to update architecture.md in a given directory, CHANGELOG.md, and GEMINI.md before you finish. Update the file only if you got a new and relevant information. E.g. implemented a new class, architecture decision, feature or you got a new rule for interaction with user.\""
    echo "}"
else
    echo '{"decision": "allow"}'
fi
