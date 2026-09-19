# Muuttobotti

**[Open the live service](https://muuttobotti.fi/)** · [Open the calculator](https://muuttobotti.fi/#calculator) · [View the source code](https://github.com/Gek2or/muuttobotti-finland)

![Muuttobotti live service](https://muuttobotti.fi/muuttobotti-hero.png)

A multilingual moving-service website for customers in Finland, built around the questions that actually affect a booking: what does it cost, what is included, when is help available, and what happens next?

## Why this project exists

Moving customers usually do not want a complicated system. They want a clear answer, a believable price, and confidence that someone understood the job.

This project turns that experience into a digital service surface:

- Finnish, English, Ukrainian, and Russian customer journeys;
- clear service and pricing information;
- booking and availability flows;
- business-oriented content for moving, transport, cleaning, and furniture assembly;
- SEO metadata and FAQ content for discoverability and trust.

The product is shaped by direct operational experience at Autochemix Oy / Muuttobotti. That makes the requirements less theoretical: every unclear label, missing option, or awkward step can become a real customer question.

## Calculator and AI inventory flow

The calculator combines deterministic business rules with a bounded AI API:

1. The customer selects service details such as home size, floors, elevator, distance, load, vehicle, and team size.
2. A deterministic calculator estimates duration, price components, vehicle capacity, and a one- or two-mover recommendation.
3. The customer can describe belongings in Finnish, English, Russian, or Ukrainian.
4. The server sends that description to OpenAI through `POST /api/inventory`.
5. The API returns structured inventory items, quantities, exact source evidence, exclusions, and uncertainties.
6. The customer reviews the result and explicitly confirms it before it changes calculator inputs.

The AI does not generate prices or silently decide availability. The price and capacity logic stays in code; uncertain or special items remain visible for human review.

## Engineering evidence

- OpenAI Responses API with strict JSON schema output
- exact evidence validation: returned quotes must occur in the original input
- explicit uncertainty states instead of invented quantities
- same-origin protection, bounded input, server-side API key, and per-client rate limiting
- 28 passing contract/handler tests
- 32 multilingual synthetic evaluation cases in Finnish, English, Russian, and Ukrainian
- one pinned-model evaluation with 31/32 exact category-and-quantity matches against the labelled set

The evaluation set is synthetic and is documented as an engineering comparison, not as a claim about general customer accuracy or business savings.

## Engineering focus

- Next.js and TypeScript
- responsive React UI
- localized content and metadata
- deterministic pricing and booking interfaces
- server-side AI integration
- structured FAQ and SEO data
- reusable UI modules
- Cloudflare/Vinext-compatible deployment work

The codebase also includes optional paths for D1, Drizzle, object storage, and authenticated workspace features. These are kept separate from the public customer flow so the site can remain useful without exposing credentials or requiring an account.

## Product decisions

- **Explain before asking.** Customers see the service context before they fill in a form.
- **Make price and availability concrete.** A calculator is more useful than a vague “contact us” button.
- **Use AI for bounded work.** The model extracts and structures customer text; deterministic code keeps pricing and capacity decisions reviewable.
- **Treat language as part of the product.** Translation is not an afterthought when customers are making a stressful purchase.
- **Keep uncertainty visible.** A questionable item becomes a clarification request, not a confident guess.

## Run locally

```bash
npm run dev
```

For a production-style check:

```bash
npm test
```

For the inventory contract tests:

```bash
node --test tests/inventory.test.mjs
```

See the package scripts and [the AI inventory case study](docs/ai-inventory-case.md) for the supported build, validation, evaluation, database, and deployment commands.

## Status

This is an active product and portfolio case study. The public interface is the important part; infrastructure features are being added deliberately as their business value becomes clear.

## Author

Designed and developed by **Stanislav Kosytskyy** in Finland.

The short version: I build software by starting with the customer's confusion and working backwards to a useful system.
