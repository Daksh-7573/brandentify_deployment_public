# AI Fallback Test Report (2026-03-17)
## Scope
This report covers test execution after the Ollama-primary/OpenAI-fallback refactor and deterministic fallback handling updates.

## Environment Notes
- Workspace: `D:\01 Projects\Brandentifier`
- OS: Windows
- Date: 2026-03-17
- Note: During fallback scenario execution, `OPENAI_API_KEY` was not visible to the Node process used by that command, so deterministic fallback was used.

## Tests Run

### 1) TypeScript compile check
Command:
- `npm run check`

Result:
- FAILED

Key failure source:
- `server/routes-broken.ts` has many existing syntax errors (for example around lines 3656-3695).
- These are outside the new fallback patches and block a clean `tsc` pass.

Representative compiler errors:
- `TS1005 ';' expected`
- `TS1109 Expression expected`
- `TS1434 Unexpected keyword or identifier`

Conclusion:
- Project-wide compile check is currently red due to pre-existing `server/routes-broken.ts` issues.

---

### 2) AI fallback scenario matrix
Command:
- Custom Node + tsx scenario script executed in terminal (6 scenarios)

Scenarios executed:
1. `connection-refused-with-openai-fallback`
2. `timeout-with-openai-fallback`
3. `http-error-with-openai-fallback`
4. `empty-response-with-openai-fallback`
5. `model-not-loaded-with-openai-fallback`
6. `double-failure-deterministic-fallback`

Summary:
- Total: 6
- Passed: 6
- Failed: 0

Observed provider in this run:
- `deterministic` for all scenarios (because OpenAI key was not available in that process)

Representative normalized output shape:
- `provider: "deterministic"`
- `model: "deterministic-fallback"`
- `fallbackUsed: true`
- non-empty `text` returned

Conclusion:
- The fallback chain degrades safely and consistently to deterministic output under provider failures.
- No scenario returned empty output or unhandled exception.

## Overall Assessment
- Fallback behavior tests: PASS
- Project compile health: FAIL (blocked by pre-existing `server/routes-broken.ts` syntax issues)

## Addendum (explicit OpenAI branch check)
Command outcome:
- `OPENAI_API_KEY=missing` in the active PowerShell session.

Impact:
- A live OpenAI fallback branch execution could not be validated in this environment snapshot.
- Previously executed scenario matrix remains valid for failure handling and deterministic degradation behavior.

Follow-up attempt:
- A second live-branch rerun was attempted after user confirmation.
- Result remained `OPENAI_API_KEY=missing`, so no additional OpenAI-provider evidence could be produced from this shell.

## Recommended Next Actions
1. Fix or exclude `server/routes-broken.ts` from `tsc` scope so compile check can pass.
2. Re-run fallback matrix in a shell with confirmed `OPENAI_API_KEY` to re-verify OpenAI fallback branch (not only deterministic branch).
3. Keep this report as baseline evidence for current fallback reliability.
