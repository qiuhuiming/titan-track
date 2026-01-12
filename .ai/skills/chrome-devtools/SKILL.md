---
name: chrome-devtools
description: This skill should be used when debugging web pages with the chrome-devtools MCP tools, including opening pages, inspecting console/network logs, interacting with DOM elements, and capturing snapshots/screenshots.
---

# Chrome Devtools MCP

## Overview
Use this skill to debug web pages via the `chrome-devtools_*` MCP toolset. Follow a repeatable workflow to open pages, wait for UI state, inspect console/network logs, interact with elements, and capture evidence.

## When To Use
- Diagnose UI or JavaScript issues in a browser session
- Inspect console errors or warnings
- Review failed or slow network requests
- Reproduce user flows by clicking, typing, or navigating
- Capture snapshots or screenshots for evidence

## Test Environment
- **Default Host**: `http://localhost:5173` (matches the Vite dev server configuration).
- **Test Account**: Use environment variables for login credentials:
  - Email: `TITAN_TRACK_EMAIL`
  - Password: `TITAN_TRACK_PASSWORD`

## Workflow
### 1. Create Or Select A Page
- Call `chrome-devtools_new_page` to open a URL, or `chrome-devtools_select_page` if a tab already exists.
- Use `chrome-devtools_navigate_page` for reloads or follow-up navigation.

### 2. Wait For Target State
- Call `chrome-devtools_wait_for` with reliable text that confirms the UI is ready.
- Re-run `wait_for` after navigation, reloads, or major UI transitions.

### 3. Capture The DOM State
- Call `chrome-devtools_take_snapshot` to get the latest accessibility tree and element UIDs.
- Always refresh the snapshot before interacting if the page navigated or changed.

### 4. Interact With The Page
- Use `chrome-devtools_click`, `chrome-devtools_fill`, or `chrome-devtools_press_key` with snapshot UIDs.
- Prefer `chrome-devtools_fill_form` when filling multiple fields together.

### 5. Inspect Console Logs
- Call `chrome-devtools_list_console_messages` and filter by `types` when possible.
- Use `chrome-devtools_get_console_message` for full details on specific entries.
- Set `includePreservedMessages=true` to keep logs across reloads.

### 6. Inspect Network Activity
- Call `chrome-devtools_list_network_requests` to see all requests for the current page.
- Use `chrome-devtools_get_network_request` to inspect headers, payloads, and responses.
- Set `includePreservedRequests=true` to keep requests across reloads.

### 7. Capture Evidence
- Call `chrome-devtools_take_screenshot` for visual proof (`fullPage=true` when needed).
- Use `chrome-devtools_take_snapshot` when a structured DOM record is required.

## Common Pitfalls
- Do not reuse old UIDs after navigation; refresh the snapshot first.
- Avoid acting before `wait_for` succeeds; otherwise element lookups may fail.
- When multiple tabs are open, always `select_page` before actions.
- Large pages can make full-page screenshots heavy; use targeted screenshots if possible.
