#!/usr/bin/env bash
# Read the JSON input from Gemini CLI
input=$(cat)
# Use jq to get the file path Gemini just edited
file_path=$(echo "$input" | jq -r '.tool_args.path // .tool_args.filepath')

# Run prettier (quietly)
npx prettier --write "$file_path" > /dev/null 2>&1

# Return a success JSON to the CLI
echo '{"decision": "allow"}'
