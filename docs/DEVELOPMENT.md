# Development Workflow

Dongmodel changes should keep code, tests, and documentation moving together.

## Definition Of Done

Before a change is considered complete:

- Relevant unit tests are added or updated.
- Relevant documentation is added or updated.
- `pnpm test` passes.
- `pnpm typecheck` passes.
- `pnpm lint` passes.
- `pnpm build` passes.

## Testing

Use unit tests for domain rules, service logic, and shared validation schemas.

Use integration tests separately when behavior depends on MySQL, Prisma migrations, cookies over HTTP, or file storage.

For each new backend module:

- Add service-level unit tests for business rules.
- Add controller tests when request validation, auth behavior, or response shape is important.
- Mock Prisma in unit tests.
- Use a real test database only for integration tests.

For each shared schema:

- Test defaults.
- Test normalization.
- Test rejected invalid input.

For frontend behavior:

- Add component or interaction tests once UI flows become stateful.
- Keep purely static shell pages covered by build/typecheck until they gain behavior.

## Documentation

Update documentation in the smallest appropriate place:

- `CONTEXT.md`: glossary only. Add domain terms and resolved language, not specs or implementation details.
- `docs/MVP.md`: product scope, rules, and MVP behavior.
- `docs/adr/`: hard-to-reverse decisions that are surprising without context and came from a real trade-off.
- `DEPLOY.md`: deployment, environment, migration, storage, and runtime steps.
- `README.md`: quick-start and day-to-day developer commands.
- `docs/DEVELOPMENT.md`: team workflow, testing expectations, and local engineering conventions.

Do not put implementation workflow or test policy in `CONTEXT.md`.

## Current Quality Gate

Run:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

When adding database changes, also run:

```bash
DATABASE_URL=mysql://dongmodel:dongmodel@localhost:3306/dongmodel pnpm --filter @dongmodel/api exec prisma validate
pnpm --filter @dongmodel/api prisma:generate
```
