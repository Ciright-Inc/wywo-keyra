This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Keyra customer domain (hosted passwordless login)

**Keyra uses only `keyra.ie` for the customer site.** There is no `auth.keyra.ie`. The API is your **existing simsecure-auth-backend** (e.g. `https://auth.keyra.ie` or your Railway URL).

1. **DNS** — `keyra.ie` → this Keyra Next service only. Auth stays on whatever hostname simsecure-auth-backend already uses.
2. **This service (Keyra) build env** — `NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL` = that **same** backend base URL (not keyra.ie).
3. **On simsecure-auth-backend (Railway)** — `HOSTED_LOGIN_PUBLIC_URL=https://keyra.ie` so `hostedUrl` opens on Keyra.
4. **CORS** — ensure `https://keyra.ie` is allowed on the auth service (e.g. `CORS_ALLOWED_ORIGINS`). Cookies are cross-origin (`keyra.ie` ↔ auth host); use `SameSite` / cookie settings appropriate for your flow.
5. **Static script** — `public/ciright-hosted-auth.js` is served at `https://keyra.ie/ciright-hosted-auth.js` (global `CirightHostedAuth` unchanged for compatibility).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
