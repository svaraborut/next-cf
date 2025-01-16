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
- ✅ Drizzle
- ✅ tRPC
- ✅ Cloudflare
    - ✅ D1
    - R2
    - Turnstile
    - 🚧 Workers Analytics Engine
- ✅ Emails
    - ✅ Email Rendering
    - ✅ AWS SES
- Crypto
- ✅ Deployment

## Next 14

> [!WARNING]
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

## Deploy

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

## Database

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

## Emails

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

## Worker Analytics Engine

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

Collect all data of the last day divided by `action` and aggregate it for each hour. The result is a sparse dataset that
may have holes and should still be reorganized by action:

```sql
SELECT
    blob1 AS action,
    toStartOfInterval(timestamp, INTERVAL '1' HOUR) hour,
    SUM(double1) as count,
    SUM(_sample_interval) as samples
FROM svara_test_next
WHERE timestamp > NOW() - INTERVAL '1' DAY
GROUP BY action, hour
```
