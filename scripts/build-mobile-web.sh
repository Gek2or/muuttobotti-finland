#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mobile_dir="${repo_root}/mobile"
target_dir="${repo_root}/public/app-preview"

cd "${mobile_dir}"

if [[ ! -d node_modules ]]; then
  npm install --no-audit --no-fund
fi

npm run typecheck
rm -rf dist
npm run export:web

test -f dist/index.html

rm -rf "${target_dir}"
mkdir -p "${target_dir}"
cp -R dist/. "${target_dir}/"

echo "Expo web app copied to public/app-preview"
