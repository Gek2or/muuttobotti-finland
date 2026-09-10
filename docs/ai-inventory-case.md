# Muuttobotti — AI inventory extraction case study

Built on main `87d69f147f5d65de0bff43d8987dc9014e12e410`, matched to the owner's Cloudflare deployment history. No customer calculator changes, automatic quotation, booking writes or deployment are included.

## Deliverables

- `lib/inventory/extract.mjs`: OpenAI Responses adapter, strict output schema, exact evidence matching, runtime validation, typed failure reasons, latency/token metadata.
- `POST /api/admin/inventory`: existing admin authorization, off by default, bounded input, same-origin browser requests, no response caching.
- `evals/inventory/baseline.mjs`: frozen current algorithm plus explicitly labelled diagnostic trace. Parity is tested against the original screen on all 32 examples.
- `evals/inventory/cases.json`: 32 synthetic labelled challenge examples in FI/EN/RU/UK. AI-authored labels need owner review. There is no untouched holdout set.
- `scripts/eval-inventory.mjs`: baseline and optional real-model evaluation on identical inputs; provider failures remain in the all-attempt exact-match denominator.
- `.github/workflows/inventory-evaluation.yml`: keyless PR checks and opt-in live evaluation.

## Observed results

28 local contract/handler tests passed. The complete web production build passed, including the new API route. A real provider run was attempted on 10 September 2026 using `gpt-4.1-mini-2025-04-14`: all 32 requests returned HTTP 429, with no validated model output. GitHub secret and model variable are configured. Model quality is still unmeasured.

The baseline diagnostic category+quantity map matches 11/32 labelled examples. Heavy-review decisions match 27/32 (zero missed heavy cases; five false positives). These are deliberately challenging development examples, not a representative estimate of business performance. Baseline UI did not expose an inventory: the diagnostic trace exposes its one-match-per-category assumption. Do not describe 11/32 as general AI accuracy or evidence the new model is better.

## First live attempt — 10 September 2026

- [Evaluation run](https://github.com/Gek2or/muuttobotti-finland/actions/runs/34462830872): 32 attempts, 32 HTTP 429 failures, zero validated outputs. Contract tests and baseline passed; the live step correctly failed and retained its report.
- [One-request diagnostic](https://github.com/Gek2or/muuttobotti-finland/actions/runs/34463052476): HTTP 429 again. Its allowlist returned `other_provider_error`, so it did not establish whether the cause was depleted quota, billing, or request limits.
- Raw results are preserved in `evals/inventory/results/live.json` and `live.md` in PR #59. Source commit: `1bb93324664c096ade84a5fcc9d84f65ca4921ef`. Dataset SHA-256: `e86fbf079002e3547a5774feba7466f83e9c3523959b3805c9a8a0a28e0480ea`.
- The report's `sourceDirty:true` follows regeneration of tracked baseline reports before the live step; no extraction-code changes were made during the run.
- Zero all-attempt exact matches represents a failed service run, **not 0% semantic model accuracy**. Zero recorded tokens means usage was absent from failed responses, not a verified billing amount.
- One-time branch triggers were removed. Live execution is again manual opt-in only; no recurring API runs are enabled.
- Next prerequisite: inspect API project billing/credits and rate/spend limits, resolve the HTTP 429 cause, then rerun. No improved extraction quality or business savings can yet be claimed.

## Run locally

Node 24, no npm dependencies needed for evaluation:

```sh
node --test tests/inventory.test.mjs
node scripts/eval-inventory.mjs
node scripts/eval-inventory.mjs --live
```

The last command requires `OPENAI_API_KEY` and `OPENAI_INVENTORY_MODEL` in the process environment and makes exactly 32 sequential requests, with no automatic retries. Model is explicitly configured; no unverified default is silently selected. Missing configuration exits with code 2 and preserves existing reports. Failed provider cases make the run exit nonzero while retaining the comparison. JSON/Markdown reports are written under `evals/inventory/results/`.

For GitHub Actions, configure repository secret `OPENAI_API_KEY` and repository variable `OPENAI_INVENTORY_MODEL` with a structured-output-capable model available to the account. Manually dispatch the workflow with `live=true`. New workflows may need to exist on the default branch before dispatch is offered by GitHub; until reviewed/merged, use the local runner. Never paste keys into source, the document or chat. A funded API project and endpoint network access are required.

## Internal server pilot

After a reviewed deployment, set server secret `OPENAI_API_KEY`, server variable `OPENAI_INVENTORY_MODEL`, and `AI_INVENTORY_ENABLED=true` in the external Cloudflare project. They are server-only; never use an Expo/public environment prefix. These are configuration instructions, not actions performed in this work.

Send JSON `{"text":"2 sofas and 10 boxes. No piano."}` to `POST /api/admin/inventory` with the existing admin Bearer authorization. Only a description is accepted; extra identity fields are rejected. Requests without admin authorization cannot invoke the model. Feature is disabled by default. No customer UI integration is claimed.

Success returns `engine: openai`, items with category/label/quantity/status/evidence, uncertainties, review reasons, requested/returned model, usage and latency. Failure returns `engine: unavailable` and a reason; it never fabricates an inventory or passes off the baseline as an LLM answer.

## Meaning and boundaries

- `included`: explicitly to move; `excluded`: explicitly not to move; `uncertain`: undecided/conflicting.
- A quantity of null remains unknown. Explicit singular is 1. Ranges and unresolved plurals require clarification.
- Evidence must occur verbatim in input. This detects fabricated quotations, not all semantic hallucinations. A model can still misinterpret negation/counts; the evaluation measures that.
- Every response requires human confirmation. Piano/safe, unknown quantities, uncertain items and uncatalogued objects add review reasons.
- There are no model-generated prices or availability decisions. Existing pricing remains unchanged and is not certified by these tests.
- Free text may contain personal information. The pilot dataset is synthetic; real-customer use requires an appropriate data-handling review. `store:false` is not a claim of zero provider retention.
- Existing admin auth is reused, not audited or replaced. Public customer rollout needs appropriate per-user abuse/spend controls. The current endpoint is an internal pilot, not a public anonymous API.
- Timeout is 15 seconds; output is capped at 4000 tokens. Large inventories can fail safely as incomplete. No retries or automatic model substitution.

## Interview demonstration

Show baseline handling of `2 sofas and 6 chairs`, `No piano. Move 10 boxes`, and `1 dishwasher and 1 armchair`. Run the 28 tests. Explain the frozen baseline/parity check, strict schema and source-evidence validation. After real evaluation is possible, show the same cases in the live report including failures, tokens, latency, dataset hash and actual model ID. Review the labelled data with the owner and add an independent holdout set before claiming broad quality or improvement. Measure review-time savings separately; none are claimed now.

## Documentation

The provider format and refusal handling follow [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs). Model behavior remains unmeasured because the live attempt was blocked by HTTP 429. See also [OpenAI error codes](https://developers.openai.com/api/docs/guides/error-codes).

## Delivery and provenance

Implementation: [Draft PR #59](https://github.com/Gek2or/muuttobotti-finland/pull/59), branch `feat/ai-inventory-evaluation-20260910`, based on main `87d69f147f5d65de0bff43d8987dc9014e12e410`. The owner's screenshot linked this main change history to Cloudflare Worker version `37cf23ec`; that Worker version is not itself a Git SHA. No merge or deployment was performed.

The previous 22-test report concerned a different historical Sites source and is superseded by this implementation. The current milestone has 28 passing contract tests on the correct main baseline. A successful real-model comparison remains blocked by HTTP 429, and this document must not be presented as evidence of deployed model quality or measured time savings.

## Short application description

“Muuttobotti provides a real moving-business context for an AI-assisted engineering project. I used AI-assisted development to add structured inventory extraction with quoted evidence, explicit unknowns and human review, alongside a frozen rule-based baseline. The implementation has 28 passing contract tests and a reproducible 32-case multilingual evaluation set. The first live run exposed an API availability blocker (HTTP 429); model quality and business impact remain to be measured.”

Use this wording only after reviewing the implementation yourself. Clearly distinguish your operational requirements and decisions from AI-assisted coding work.
