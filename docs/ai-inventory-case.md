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

28 local contract/handler tests passed. The complete web production build passed, including the new API route. A funded provider run completed on 10 September 2026 using `gpt-4.1-mini-2025-04-14`: all 32 responses passed schema and exact-evidence validation, and 31/32 matched the labelled category+quantity map. The frozen baseline matched 11/32 on the same examples.

The baseline diagnostic category+quantity map matches 11/32 labelled examples. Heavy-review decisions match 27/32 (zero missed heavy cases; five false positives). These are deliberately challenging development examples, not a representative estimate of business performance. Baseline UI did not expose an inventory: the diagnostic trace exposes its one-match-per-category assumption. Do not describe 11/32 as general AI accuracy or evidence the new model is better.

## First live attempt — 10 September 2026

- [Evaluation run](https://github.com/Gek2or/muuttobotti-finland/actions/runs/34462830872): 32 attempts, 32 HTTP 429 failures, zero validated outputs. Contract tests and baseline passed; the live step correctly failed and retained its report.
- [One-request diagnostic](https://github.com/Gek2or/muuttobotti-finland/actions/runs/34463052476): HTTP 429 again. Its allowlist returned `other_provider_error`, so it did not establish whether the cause was depleted quota, billing, or request limits.
- Raw results are preserved in `evals/inventory/results/live.json` and `live.md` in PR #59. Source commit: `1bb93324664c096ade84a5fcc9d84f65ca4921ef`. Dataset SHA-256: `e86fbf079002e3547a5774feba7466f83e9c3523959b3805c9a8a0a28e0480ea`.
- The report's `sourceDirty:true` follows regeneration of tracked baseline reports before the live step; no extraction-code changes were made during the run.
- Zero all-attempt exact matches represents a failed service run, **not 0% semantic model accuracy**. Zero recorded tokens means usage was absent from failed responses, not a verified billing amount.
- One-time branch triggers were removed. Live execution is again manual opt-in only; no recurring API runs are enabled.
- Next prerequisite: inspect API project billing/credits and rate/spend limits, resolve the HTTP 429 cause, then rerun. No improved extraction quality or business savings can yet be claimed.

## Successful funded run — 10 September 2026

- [Evaluation run](https://github.com/Gek2or/muuttobotti-finland/actions/runs/34470558837): preflight succeeded, followed by 32/32 validated responses and zero provider failures.
- Model exact category+quantity maps: **31/32 (96.9%)**; baseline: **11/32 (34.4%)** on the same synthetic challenge set.
- Model category precision: **100%**; category recall: **97.6%**. Quantities correct: **41/42**. Heavy-review decisions correct: **32/32**, with zero missed heavy cases.
- Total recorded model usage: **13,359 input tokens + 1,824 output tokens = 15,183 tokens**. Request latency: median **1.52 s**, average **1.59 s**, p95 **2.44 s**, range **0.91–3.22 s**. The separate preflight used 497 tokens and is not included in those totals.
- The sole metric disagreement was Ukrainian `uk-07`: `2-3 шафи, точну кількість уточню.` The model returned wardrobe, unknown quantity, `uncertain`, with exact evidence and a clarification. The current scorer excludes uncertain items from its quantity map, while the label expects `wardrobe:null`; this is partly an evaluation-contract mismatch rather than a clear extraction failure.
- These are 32 synthetic development examples whose labels still need owner review. They support a reproducible engineering comparison, not a 96.9% claim about real customer traffic or measured business savings.
- Results are preserved in `evals/inventory/results/live.json` and `live.md` in PR #59. Dataset SHA-256: `e86fbf079002e3547a5774feba7466f83e9c3523959b3805c9a8a0a28e0480ea`.

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

The provider format and refusal handling follow [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs). The successful funded run used the pinned model snapshot above. See [OpenAI error codes](https://developers.openai.com/api/docs/guides/error-codes) for the earlier HTTP 429 diagnosis.

## Delivery and provenance

Implementation: [Draft PR #59](https://github.com/Gek2or/muuttobotti-finland/pull/59), branch `feat/ai-inventory-evaluation-20260910`, based on main `87d69f147f5d65de0bff43d8987dc9014e12e410`. The owner's screenshot linked this main change history to Cloudflare Worker version `37cf23ec`; that Worker version is not itself a Git SHA. No merge or deployment was performed.

The previous 22-test report concerned a different historical Sites source and is superseded by this implementation. The current milestone has 28 passing contract tests on the correct main baseline. A successful real-model comparison is now recorded, but this document must not be presented as evidence of deployed customer quality or measured time savings.

## Short application description

“Muuttobotti provides a real moving-business context for an AI-assisted engineering project. I used AI-assisted development to add structured inventory extraction with quoted evidence, explicit unknowns and human review, alongside a frozen rule-based baseline. The implementation has 28 passing contract tests and a reproducible 32-case multilingual evaluation set. In a pinned-model run, all 32 responses validated and 31 matched the labelled category+quantity map, compared with 11 for the frozen baseline. The dataset is synthetic; customer quality and business impact still require production measurement.”

Use this wording only after reviewing the implementation yourself. Clearly distinguish your operational requirements and decisions from AI-assisted coding work.
