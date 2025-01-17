# 🔥 Cloudflare with Next.js

## Features

- ✅ Linting
- ✅ TypeScript
- ✅ Tailwind
- ✅ SCSS
- ✅ Embedded Google Fonts
- ✅ Lucide Icons
- ✅ ShadCn
- ✅ Modern scrollbars
- ✅ Markdown
    - ✅ Rendering
    - Processing frontmatter
- Content management
    - List of all articles
- Images
    - Optimization
    - Static optimization
- ✅ [Drizzle](#-database)
- ✅ tRPC
- ✅ Cloudflare
    - ✅ [D1](#-database)
    - R2
    - ✅ [Turnstile](#-turnstile)
    - ✅ [Workers Analytics Engine](#-worker-analytics-engine)
    - ✅ [Geocodes](#-geocodes)
    - 🍭 Cache
    - 🍭 Fingerprint
    - 🍭 Cron
    - 🍭 Queue
- ✅ [Emails](#-emails)
    - ✅ Email Rendering
    - ✅ AWS SES
- Crypto
- ✅ [Deployment](#-deploy)

## ⚠️ Migrate to Workers

> [!WARNING]
> This solution uses CloudFlare Pages via `@cloudflare/next-on-pages`. As pointed out on the Discord channel CloudFlare
> is deprecating pages in favour of a (still in beta) Workers
> based  [solution](https://developers.cloudflare.com/workers/frameworks/framework-guides/nextjs/). This solution
> leverages a completely different
> package [`@opennextjs/cloudflare](https://www.npmjs.com/package/@opennextjs/cloudflare) to bundle the app and deploy
> it to workers. This approach despite being still in beta should support more features including Cron and Queue
> Consumers.

## 🔼 Next 14

> [!CAUTION]
> The project has been downgraded to Next 14 with React 18 as some of the features for email rendering will not work
> under Next 15 as they have been removed and currently the team is working on a recover strategy that is not planned to
> be implemented any time soon.

Specifically under Next 15 is not possible to use `renderToReadableStream` under any route, rendering impossible the
creation of functionalities like rendering emails from React components. This may also be an issue during automated OG
image creation. The related issues are:

- [Next.js 15 renderToReadableStream](https://github.com/vercel/next.js/issues/71865)
- [Missing function H error](https://github.com/vercel/next.js/issues/71004)
- [React Email Issue](https://github.com/resend/react-email/issues/1630)
- [Astro patching with react-dom/server -> react-tom/server.edge](https://github.com/facebook/react/issues/31827)

> [!CAUTION]
> There is currently also no [stable support](https://ui.shadcn.com/docs/react-19#recharts) by ShadCN for React 19

## 📦 Assets

This project has many moving parts and require careful configuration and attention not to expose secrets. Here is a
complete part of all parts involved into a complete deployment.

### Resources

| Item                        | Current                                 |
|-----------------------------|-----------------------------------------|
| GitHub Action               | `https://github.com/svaraborut/next-cf` |
| Domain                      | `next.svara.io`                         |
| CloudFlare Page             | `svara-test-next`                       |
| CloudFlare D1               | `svara-test-next`                       |
| CloudFlare Turnstile        | `svara-test-next`                       |
| CloudFlare Worker Analytics | `svara_test_next`                       |
| AWS Simple Email Service    | `test@axelered.com`                     |

### Variables

| Name                           | Purpose                                      | Type                |    |
|--------------------------------|----------------------------------------------|---------------------|----|
| CLOUDFLARE_ACCOUNT_ID          | CloudFlare Account Id                        | GitHub Secret       |    |
| CLOUDFLARE_API_TOKEN           | CloudFlare API Key to publish Pages          | GitHub Secret       | ⚠️ |
| NEXT_PUBLIC_ENV                | Enable development environment               | Dev                 |    |
| NEXT_PUBLIC_WATERMARK          | App build watermark                          | GitHub Env          | 🔓 |
| NEXT_PUBLIC_URL                | App build public URL                         | GitHub Env          | 🔓 |
| DB                             | CloudFlare D1 Binding                        | CloudFlare Binding  |    |
| NEXT_PUBLIC_TURNSTILE_SITE_KEY | CloudFlare Turnstile Site Key                | GitHub Secret       | 🔓 |
| TURNSTILE_SECRET_KEY           | CloudFlare Turnstile Secret Key              | CloudFlare Secret   | ⚠️ |
| AWS_REGION                     | AWS SES Region                               | CloudFlare Variable |    |
| AWS_ACCESS_KEY_ID              | AWS SET Key ID                               | CloudFlare Variable |    |
| AWS_SECRET_ACCESS_KEY          | AWS SES Access Key                           | CloudFlare Secret   | ⚠️ |
| AYD                            | CloudFlare Worker Analytics Binding          | CloudFlare Binding  |    |
| AED_ACCOUNT_ID                 | CloudFlare Account Id                        | CloudFlare Variable |    |
| AED_API_TOKEN                  | CloudFlare API Key for Worker Analytics Read | CloudFlare Secret   | ⚠️ |
| AED_DATASET                    | CloudFlare Worker Analytics dataset name     | CloudFlare Variable |    |

## 🚀 Deploy

> [!IMPORTANT]
> Deployment is completely managed by the [GitHub Action](.github/workflows/publish.yml). This document illustrates how
> to create the project on CloudFlare and how to test in an environment that resembles production (using wrangler).

Create a CloudFlare pages project

```shell
wrangler pages project create svara-test-next --production-branch main --compatibility-date 2025-01-15 --compatibility-flag nodejs_compat
```

For testing purposes build for Cloudflare pages (use Ubuntu)

```shell
npm run pages:build
```

Then run the application in a production environment (use your OS to prevent Sqlite C++ read errors)

```shell
npm run pages:preview
```

## 📁 Database

Application is backed by a CloudFlare D1 database with a Drizzle orm connection that enables the system to run a full
Sqlite database on edge. Connection and schema configuration is done in [lib/db](src/lib/db).

Create a migration

```shell
drizzle-kit generate --name=...
```

Apply migrations to the local dev database

```shell
wrangler d1 migrations apply database --local
```

> [!TIP]
> Theoretically is possible to use the `wrangler` action to automatically migrate D1 but this may be quite dangerous to
> use in production therefore it has been omitted and migrations should be done manually from the developer terminal
> prior to pushing the next version. A smarter approach would be to add a stage prior to the deployment that would check
> the database is aligned with the current application being deployed and fail otherwise, but there seems to be no
> command for that 😔

When your wrangler file contains the correct `database_name` and `database_id` you can use this command to migrate the
stage/production environment.

```shell
wrangler d1 migrations apply svara-test-next --remote
```

## 🔒 Turnstile

To protect unauthenticated endpoints/actions from DDOS and abuse
use [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/). To enable the system just create a Turnstile
widget via the interface and provide:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` secret to the GitHub action (embedded at build time)
- `TURNSTILE_SECRET_KEY` secret to Cloudflare Pages Functions

## ✉️ Emails

Emails are sent via a separate AWS SES client which should be authenticated providing the following environment
variables to the CloudFlare pages function:

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Emails are rendered from React templates using `@react-email/components` which imposes us to use [Next 14](#next-14).
All email templates are created as React components and automatically rendered to HTML (and plain TXT) on edge via the
send email function.

```typescript
await sendMail(TemplateOtp, input.to, { /* ... data ... */})
```

## 📈 Worker Analytics Engine

This system supports Worker Analytics for system analysis and to display data to the user. Cloudflare provides write and
read wia two separate [systems](https://developers.cloudflare.com/analytics/analytics-engine/get-started/), the first is
a binding that should be configured via the dashboard (and wrangler) and the second is a public API that requires an API
token.

For writing create a `AYD` binding to an Analytics Dataset and then use the `aed?.writeDataPoint()` function. THIS
BINDING IS NOT AVAILABLE VIA THE LOCAL DEVELOPMENT ENVIRONMENT AND THE `aed` OBJECT MAY BE `undefined`. With this
functionality both system and application metrics can be logged.

In case of application metrics the metrics should also
be [read by the Worker](https://developers.cloudflare.com/analytics/analytics-engine/worker-querying/) which is achieved
directly via `fetch` using the public API. The following environment variables to the CloudFlare pages function:

- `AED_ACCOUNT_ID` CloudFlare account it
- `AED_API_TOKEN` a generic Token with `Account Analytics` `Read` permissions (yes CloudFlare has no granularity on this
  one)
- `AED_DATASET` not required, but used by this project to not hardcode the dataset

Data can be then read via their
unofficial [SQL language](https://developers.cloudflare.com/analytics/analytics-engine/sql-reference/). Here are some
query examples.

Collect all data from a dataset:

```sql
SELECT * FROM svara_test_next
```

Collect all data of the last day divided by `action` and aggregate it for each hour. The result is a sparse dataset that
may have holes and should still be reorganized by action (see `waeTranspose`).

> [!TIP]
> Note that for consistency and ease of processing the `timestamp` is registered to a hour multiple since the `UNIX`
> which may not register correctly with users in other timezones. If this is a problem additional timezone analytics
> registration can be added where a timezone offset is added to the query and to `waeTranspose`.

```sql
SELECT
    intDiv(toUInt32(timestamp), 3600) * 3600 AS t,
    blob1 AS a,
    SUM(double1) as c
FROM svara_test_next
WHERE toUInt32(timestamp) > toUInt32(NOW()) - 5184000
GROUP BY t, a
```

> [!TIP]
> Note that CloudFlare Worker Analytics is an analytics processing engine, and therefore has an intrinsic ingestion
> latency that is not publicly disclosed but have been observed to be around 1 minute. So don't panic if the data is not
> available straight away.

The analytics result is then converted from sparse matrix to a dense time-series matrix using `waeTranspose` and
rendered to the user via ShadCN Charts. This process supports up to 90 days in the past as this is
the [retention limit](https://developers.cloudflare.com/analytics/analytics-engine/limits/) imposed by CloudFlare.

## 🌍 Geocodes

CloudFlare provides
the [cf](https://developers.cloudflare.com/workers/runtime-apis/request/#incomingrequestcfproperties)
property inside Workers which include various useful properties.

> [!TIP]
> All CloudFlare parameters are available via the `getRequestContext()` function as described
> [here](https://github.com/cloudflare/next-on-pages/tree/main/packages/next-on-pages#cloudflare-platform-integration)

This feature has been integrated in [Next.js on Pages](https://github.com/cloudflare/next-on-pages/pull/101) in
this [commit](https://github.com/cloudflare/next-on-pages/commit/5bd8e08660f4cfa9eba4421e6d0364b762aac81c) rendering
some properties available in the `request.geo` property of Next. The final mapping is
available [here](https://github.com/cloudflare/next-on-pages/blob/2cd4c3c704a00e6b693229f1f14102abc6318d11/packages/next-on-pages/templates/_worker.js/utils/request.ts#L22)
The lookup is:

| CloudFlare `cf`    | Next `geo`      | CloudFlare Description                                        |
|--------------------|-----------------|---------------------------------------------------------------|
| ❌ `asn`            |                 |                                                               |
| ❌ `asOrganization` |                 |                                                               |
| ❌ `colo`           |                 |                                                               |
| ✅ `country`        | `geo.country`   | The two-letter country code in the request, for example, "US" |
| ❌ `isEUCountry`    |                 |                                                               |
| ✅ `city`           | `geo.city`      | City of the incoming request, for example, "Austin"           |
| ❌ `continent`      |                 |                                                               |
| ✅ `latitude`       | `geo.latitude`  | Latitude of the incoming request, for example, "30.27130"     |
| ✅ `longitude`      | `geo.longitude` | Longitude of the incoming request, for example, "-97.74260"   |
| ❌ `postalCode`     |                 |                                                               |
| ❌ `metroCode`      |                 |                                                               |
| ❌ `region`         |                 |                                                               |
| ✅ `regionCode`     | `geo.region`    | The ISO 3166-2 ↗ code for the first-level region              |
| ❌ `timezone`       |                 |                                                               |

The `geo`, `cf` and `ip` parameters have been rendered available to all tRPC requests via the default context.
