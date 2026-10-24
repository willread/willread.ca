This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## ANSI project pages

UTF-8 `.ans` files under `content/` receive the same routes, directory entries,
TYPE animation and navigation as Markdown pages. The renderer supports true-color
SGR foreground/background sequences and resets, renders content as React text,
and links HTTP(S) URLs. It does not enable raw HTML in Markdown.

The Caern page is `/projects/caern`. The separate experimental artwork is kept
in `previews/caern-test.ans`, outside the published content directory.

The existing IBM_VGA_8x16 font has 1600-unit advances on a 1600-unit em, so it
actually renders square cells. The ANSI component compresses it horizontally to
8px by 16px cells and sizes a matching layout box. Each half-block art sample
therefore occupies a square 8px by 8px area. Surrounding DOS UI retains VT323.

Framed project pages use their original 80-column screen at full width. Below
640px of available space, the header and art scale proportionally while the
headline, two paragraphs and Steam URL reflow at 20px in the site's VT323 font.
Mobile copy is extracted from the ANSI frame rather than maintained separately.
This layout was checked in actual 320px and 390px viewports.
