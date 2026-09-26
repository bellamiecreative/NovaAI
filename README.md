# NovaAI

NovaAI is a mobile-first AI assistant platform for web and mobile.

## Structure

- `apps/web` — Next.js web app and initial API
- `packages/types` — shared TypeScript types
- `docs` — architecture and roadmap

## Rules

- TypeScript-first.
- Mobile-first UI.
- No provider API keys in client code.
- AI requests go through the server.
- Build features in small, testable milestones.

## Milestones

1. Foundation
2. Real AI chat
3. Chat persistence/history
4. Authentication
5. Image generation
6. Voice
7. Mobile app
8. Production deployment

## Run

Requires Node.js and pnpm.

```bash
pnpm install
pnpm dev:web
```

Real secrets belong in deployment environment variables, never in committed files.
