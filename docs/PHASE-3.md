# NovaAI Phase 3 — Database + Chat History

Phase 3 adds PostgreSQL persistence through Prisma ORM and keeps the Phase 1/2 NovaAI foundation and real streaming AI chat.

## What this phase adds

- PostgreSQL database via Prisma ORM 7
- Anonymous HTTP-only `novaai_session` identity until real authentication is added
- User, Chat, and Message models
- Chat history sidebar
- Create/select chats
- Persistent user/assistant messages
- Streaming OpenAI responses saved to the database
- Initial Prisma migration

## Environment

Use `.env.example` as the template. Never commit `.env` or a real `OPENAI_API_KEY`.

Required server variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (defaults to `gpt-5.6-luna`)
- `DATABASE_URL`

## Commands

From the repository root:

`pnpm install`

`pnpm db:generate`

`pnpm db:migrate`

For deployment, set `DATABASE_URL`, `OPENAI_API_KEY`, and `OPENAI_MODEL` in the deployment platform's server-side environment settings.
