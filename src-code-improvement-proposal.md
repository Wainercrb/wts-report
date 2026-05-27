# wts-report `src/` Code Improvement Proposal

## Executive Summary

The `src/` tree is functional but still carries avoidable maintenance cost: user-facing strings are scattered, error handling is repeated, `message-handler.ts` mixes validation/routing/workflow/error reporting, and logging currently risks exposing raw user input. The best next step is a staged refactor that first centralizes shared primitives, then splits orchestration from policy, and only then tackles deeper pipeline changes.

## Strategic Goals

- Make user-facing messages and error text single-source-of-truth.
- Remove repeated error formatting and normalize how failures are reported.
- Reduce `message-handler.ts` to orchestration only.
- Improve type safety at message boundaries and service interfaces.
- Prevent accidental PII leakage in logs and debug output.
- Replace magic literals with named constants and grouped configuration.

## Scope by Tier

### Tier 1: Quick Wins

- Extract UI strings and error text into `src/constants/messages.ts`.
- Extract shared error normalization into `src/utils/error.ts`.
- Add reusable type guards for webview payload validation in `src/types/guards.ts` or `src/utils/type-guards.ts`.
- Replace repeated literals such as empty-state text, command names, and logging phrases with named constants.

### Tier 2: Structural

- Split `message-handler.ts` into a thin router plus focused handlers for automatic flow, manual flow, model info, and model selection.
- Consolidate `config.ts` and `consts.ts` into a clearer `src/constants/` layout.
- Normalize error handling so services either return typed results or throw typed errors, but do not mix styles within the same boundary.
- Introduce a small logging policy that strips or redacts raw user payloads before debug output.

### Tier 3: Deep

- Introduce a shared result/error model for command execution and LLM calls.
- Move prompt assembly and message shaping into dedicated workflow helpers instead of embedding them in handlers.
- Add stronger boundary types for webview payloads, model metadata, and message responses.
- Consider a dedicated orchestration layer if `message-handler.ts` continues to grow after the split.

## Proposed New File Structure

```text
src/
  constants/
    commands.ts
    config.ts
    messages.ts
    ui.ts
  handlers/
    message-handler.ts
    message-routes.ts
    automatic-timesheet-handler.ts
    manual-timesheet-handler.ts
    model-handler.ts
  services/
    llm-service.ts
    logger.ts
    webview.ts
  types/
    index.ts
    guards.ts
    errors.ts
  utils/
    error.ts
    formatting.ts
    git.ts
    command.ts
```

The key idea is to separate shared constants from workflow logic, and workflow logic from transport concerns. `message-handler.ts` should eventually become the entry point that routes work, not the place where work is implemented.

## Effort Estimates

| Tier | Estimated Effort | Outcome |
|------|------------------|---------|
| Tier 1 | 2-4 hours | Shared strings, error formatting, and type guards centralized |
| Tier 2 | 4-8 hours | Cleaner handler boundaries, better config organization, consistent errors |
| Tier 3 | 6-12 hours | Deeper type safety, result model, and lower future complexity |

## PR Delivery Recommendation

Use chained PRs instead of one large refactor. Recommended order:

1. PR 1: move messages, error formatting, and guards into shared modules.
2. PR 2: reorganize constants/config and reduce `message-handler.ts` to routing.
3. PR 3: add the deeper error/result model and logging policy.

This keeps each review slice focused, lowers regression risk, and makes it easier to stop after Tier 1 if the team wants the highest-value changes first.