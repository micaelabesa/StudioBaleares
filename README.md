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

src/
├── app/
│ ├── layout.tsx ← fuentes, providers globales
│ ├── page.tsx ← HomePage solo (hero, tools grid, pricing)
│ ├── menu/
│ │ ├── [id]/
│ │ │ └── page.tsx ← página pública del menú (la URL del QR apunta aquí)
│ ├── studio/
│ │ ├── qrmenu/
│ │ │ └── page.tsx ← QR Menu Generator
│ │ ├── social/
│ │ │ └── page.tsx ← Social Post Generator
│ │ └── airbnb/
│ │ └── page.tsx ← Welcome PDF Generator
│ └── api/
│ ├── generate/
│ │ └── route.ts ← proxy para la llamada a Claude (¡clave!)
│ └── stripe/
│ └── webhook/
│ └── route.ts ← más adelante
│
├── components/
│ ├── ui/ ← átomos reutilizables
│ │ ├── Ornament.tsx
│ │ ├── ProBadge.tsx
│ │ ├── UpgradeBanner.tsx
│ │ └── UpgradeModal.tsx
│ ├── layout/
│ │ ├── Nav.tsx
│ │ ├── Footer.tsx
│ │ └── ToolLayout.tsx
│ └── tools/
│ ├── qrmenu/
│ │ ├── StepRestaurant.tsx
│ │ ├── StepMenuItems.tsx
│ │ ├── StepStyle.tsx
│ │ └── StepPreview.tsx
│ └── shared/
│ └── MenuPreview.tsx ← reutilizado en QR, PDF, Social
│
├── lib/
│ ├── supabase/
│ │ ├── client.ts ← cliente browser
│ │ └── server.ts ← cliente server (para API routes)
│ ├── types.ts ← tus interfaces (MenuItem, MenuCategory, etc.)
│ └── constants.ts ← LIMITS, PALETTES, T tokens
│
└── hooks/
├── useMenu.ts ← lógica del generador de menú
└── usePlan.ts ← plan del usuario, límites
