#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOK_SOURCE="$REPO_ROOT/scripts/git-hooks/post-commit"
HOOK_TARGET="$REPO_ROOT/.git/hooks/post-commit"

if [[ ! -d "$REPO_ROOT/.git" ]]; then
  echo "[setup-git-hooks] Error: .git directory not found in $REPO_ROOT"
  exit 1
fi

if [[ ! -f "$HOOK_SOURCE" ]]; then
  echo "[setup-git-hooks] Error: hook template missing at $HOOK_SOURCE"
  exit 1
fi

install -m 0755 "$HOOK_SOURCE" "$HOOK_TARGET"

echo "[setup-git-hooks] Installed post-commit hook to $HOOK_TARGET"
echo "[setup-git-hooks] Usage: include [push] in commit message to auto-push the current branch."
echo "[setup-git-hooks] Optional env vars: AUTO_PUSH_REMOTE (default origin), AUTO_PUSH_BRANCH (default current branch)."
