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
    - 🚧 [R2](#-storage)
    - ✅ [Turnstile](#-turnstile)
    - ✅ [Workers Analytics Engine](#-worker-analytics-engine)
    - ✅ [Caching](#-caching)
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
    - ⚠️ No static calls `getRequestContext`
    - ⚠️ Check if `process.env` is ok

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
| Domain                      | `cdnext.svara.io`                       |
| CloudFlare Page             | `svara-test-next`                       |
| CloudFlare D1               | `svara-test-next`                       |
| CloudFlare R2               | `svara-test-next`                       |
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
| NEXT_PUBLIC_URL_CDN            | App build R2 bucket public URL               | GitHub Env          | 🔓 |
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
| FEATURE_SECRET                 | App API key for some of the features         | CloudFlare Secret   | ⚠️ |

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

## 🪣 Storage

The project support R2 Read & Write via Worker wit additional support to upload and download files via custom `route.ts`
APIs, that will limit the possible MIME types and the file size to 1MB.

The system supports direct file upload via `PUT` request (like S3 API) without any conversion to form encoding. This is
easier to validate on the backend and should be easier to extend in the future.

> [!CAUTION]
> The system is streaming file DOWNLOAD but is not streaming file UPLOAD. THIS IS A BUG UNDER ACTIVE INVESTIGATION

Stream API does not support stream reading `FormData` and therefore no efficient method to do so has been found.
Manually processing the stream is a complex task that may only be worth the effort if files are very large, to prevent
huge memory allocation. With <10MB files seems smarter to materialize the file and delegate data copy to OS optimized
classes. The process would require manual processing of the data stream with some way to retrieve the instance of the
FixedLengthStream that is a CF builtin class.

The `fileDownload` function supports caching, and can be enabled via `cacheMaxAge` and `cachePublic` which will expose a
standard `cache-control: max-age=N, public` header to be then handled by any front proxy or CDN.

> [!TIP]
> The system stores files with the plain key but provides the possibility to the user to read them with their extension
> name (example `.png`) via the `fuzzyExtension` option. But this does not align with the public CDN url which does
> expose the plain key as url. When using the public CDN the system should either store the files with their extension
> or accept raw keys as the public URL as browsers fully support reading files without extension. Furthermore, the
> function provides the `content-type` header. this may only become a problem if some strange SEO policies are taking
> into account the file extension (but is unlikely).

Temporary uploads can be implemented by uploading all files to a fixed prefix key (like `tmp/`) and then moved to the
final key after the user confirms the operation. To properly achieve so an Object Lifecycle Rule should be added to the
R2 configuration to properly clean the files after they have been abandoned for some time.

### 🚧 Signed URLs

> [!TIP]
> CloudFlare in its
> [official documentation](https://developers.cloudflare.com/r2/api/s3/presigned-urls/#presigned-url-alternative-with-workers)
> admits not to support the fully featured S3 standard `POST` but claims that using a Worker with its Binding for upload
> is fully equivalent to a pre-signed URL. This should imply that using a Worker with the stream interface adds
> close-to-no overhead and can then be used as a replacement for the upload.

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

## 💾 Caching

It is important to note that by default Cloudflare
does [only cache some file extensions](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/#default-cached-file-extensions)
and **does so by actual extension and not MIME type**. This implies that the application despite serving cacheable MIME
types and/or correctly formed `cache-control` headers, unless the URL ends with an explicit extension like `.jpg` the
cache will always be skipped (inspect the `cf-cache-status` header).

To properly setup caching explicit Caching Rules should be set up in Cloudflare. Such rules explains to Cloudflare how
to behave under various caching conditions. For this setup the following rules have been created, to support the desired
application behaviour:

- `test_next_cdn_cache`: This rule cache **all requests** served by `cdnext.svara.io` for 2 hours as this is not done by
  default. As an additional improvement the query keys are ignored (they are not used by R2) preventing cache punching
  attacks and de existence of many copies of the same asset.
- `test_next_files_cache`: This rule marks as **eligible for caching** all the `next.svara.io/files/*` endpoints by
  respecting the provided `cache-control` header or using the default 4 hours caching period if the header is absent.
  Note that **Browser TTL** should be set to `Respect original TTL` to forward through the server issued `cache-control`
  otherwise Cloudflare will override it to
  the [default 2 hours](https://developers.cloudflare.com/cache/how-to/edge-browser-cache-ttl/#browser-cache-ttl)

> [!CAUTION]
> Note that the rules also caches all `>400` responses which in turn will yield 404 results for assets that were visited
> shortly prior to their upload. This can be fixed by removing caching of such codes.

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
