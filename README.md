# Muuttobotti

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

## Engineering focus

- Next.js and TypeScript
- responsive React UI
- localized content and metadata
- booking and pricing interfaces
- structured FAQ and SEO data
- reusable UI modules
- Cloudflare/Vinext-compatible deployment work

The codebase also includes optional paths for D1, Drizzle, object storage, and authenticated workspace features. These are kept separate from the public customer flow so the site can remain useful without exposing credentials or requiring an account.

## Product decisions

- **Explain before asking.** Customers see the service context before they fill in a form.
- **Make price and availability concrete.** A calculator is more useful than a vague “contact us” button.
- **Treat language as part of the product.** Translation is not an afterthought when customers are making a stressful purchase.
- **Keep the public path simple.** Advanced integrations can grow behind the interface without making the first visit harder.

## Run locally

```bash
npm run dev
```

For a production-style check:

```bash
npm test
```

See the package scripts for the supported build, validation, database, and deployment commands.

## Status

This is an active product and portfolio case study. The public interface is the important part; infrastructure features are being added deliberately as their business value becomes clear.

## Author

Designed and developed by **Stanislav Kosytskyy** in Finland.

The short version: I build software by starting with the customer's confusion and working backwards to a useful system.
