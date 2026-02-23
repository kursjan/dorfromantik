#!/bin/bash
# 1. Run Reviewer
echo "🔍 Running Adversarial Review..."
/code-review --against main --instructions .gemini/reviewer.md > REVIEW_FEEDBACK.md

# 2. Open for Human Mediation
echo "✍️ Opening feedback for your edits. Save and close to continue..."
code --wait REVIEW_FEEDBACK.md

# 3. Run Implementor
echo "🛠️ Implementing your approved changes..."
/conductor:implement "Apply the changes approved in REVIEW_FEEDBACK.md"

# 4. Cleanup
rm REVIEW_FEEDBACK.md
echo "✅ Workflow complete."
