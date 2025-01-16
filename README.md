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
- Drizzle
- ✅ tRPC
- Cloudflare
    - D1
    - R2
    - Turnstile
    - Workers Analytics Engine
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
