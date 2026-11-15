#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [[ -f "$ENV_FILE" ]]; then
  while IFS='=' read -r raw_key raw_value || [[ -n "${raw_key:-}" ]]; do
    key="${raw_key//[[:space:]]/}"
    value="${raw_value#${raw_value%%[![:space:]]*}}"
    value="${value%${value##*[![:space:]]}}"
    value="${value%$'\r'}"

    if [[ -n "$key" && "$key" != \#* ]]; then
      export "$key=$value"
    fi
  done < "$ENV_FILE"
fi

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <JIRA_ISSUE_KEY>" >&2
  echo "Example: $0 O1P1-3" >&2
  exit 1
fi

ISSUE_KEY="$1"
JIRA_BASE_URL="${JIRA_BASE_URL:-}"
JIRA_EMAIL="${JIRA_EMAIL:-}"
JIRA_TOKEN="${JIRA_TOKEN:-}"

if [[ -z "$JIRA_BASE_URL" || -z "$JIRA_EMAIL" || -z "$JIRA_TOKEN" ]]; then
  echo "Missing JIRA_BASE_URL, JIRA_EMAIL, or JIRA_TOKEN in $ENV_FILE" >&2
  exit 1
fi

JIRA_BASE_URL="${JIRA_BASE_URL%/}"
API_URL="${JIRA_BASE_URL}/rest/api/3/issue/${ISSUE_KEY}"

curl --silent --show-error --location \
  --request GET \
  --url "$API_URL" \
  --user "$JIRA_EMAIL:$JIRA_TOKEN" \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json'
