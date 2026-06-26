# infinite-messenger-core — Claude Code Guide

## Project Overview

`@maleeshagimshan98/infinite-messenger-core` is a TypeScript library that provides a layered, real-time
messaging core for Node.js servers. It abstracts user, conversation, and message persistence behind a
clean repository interface, with concrete backends for **Firebase (Firestore)** and **MongoDB**.
Consumers initialize a `MessengerCore` session and then drive chat flows through service classes.

## Commands

```bash
npm test               # Run Jest suite (ts-jest, maxWorkers: 1)
npm run build          # Full pipeline: format → lint → compile → dist/
npm run compile        # TypeScript compile only (tsconfig.build.json → dist/)
npm run lint           # ESLint 9 flat config over src/
npm run lint:fix       # ESLint with auto-fix
npm run format         # Prettier over all files
```

Compiled output goes to `dist/`; the package main is `dist/index.js`.

## Architecture

```
src/index.ts                    ← public API surface
src/MessengerCore.ts            ← library container; initializes datastore + services
src/Models/                     ← domain models: User, Conversation (thread), Message
src/Service/                    ← business logic: UserService, ConversationService, MessageService
src/datastore/interfaces/       ← repository contracts (backend-agnostic)
src/datastore/firebase/         ← Firestore implementation
src/datastore/mongodb/          ← MongoDB implementation
src/datastore/utils/            ← DatabaseResult / DatabaseResultSet wrappers
```

**Layer rules:**
- Services call repository interfaces — never call Firestore/MongoDB APIs directly from a service.
- Domain models own state, validation, and serialization (`toObj()` for persistence).
- New backends implement the interfaces in `src/datastore/interfaces/`.

## Mandatory Initialization Workflow

```ts
const core = new MessengerCore({ dbDriver: 'firebase', dbConfig: './serviceAccount.json' });
await core.initialize(userId);   // throws 'MessengerCore:Error: User not found' if absent
// only now are conversation/message services usable
```

## Key Conventions

### TypeScript
- Strict mode: `noImplicitAny`, `strictNullChecks`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`.
- Target ESNext, output CommonJS.
- `tsconfig.build.json` excludes tests during `compile`.

### Style
- Prettier: 120-char print width, single quotes, trailing commas, LF line endings.
- ESLint enforces `@typescript-eslint/explicit-function-return-type: error` — every function needs a return type.
- `@typescript-eslint/no-explicit-any: warn` — avoid `any`; use `unknown` or proper types.

### Testing
- Tests live in `test/`, named `*.test.ts` (or `*.test.js` for setup helpers).
- Jest is configured with `maxWorkers: 1` — tests run serially.
- Firebase tests mock the Admin SDK; no live Firebase project required.
- [test/firebase.transaction.test.ts](test/firebase.transaction.test.ts) covers batch/transaction mutual-exclusion guards — update it when touching transaction logic.

### Repository Pattern
- All repository return values use `DatabaseResult<T>` (single) or `DatabaseResultSet<T>` (collection).
- Batch writes and Firestore transactions are mutually exclusive; the guard lives in [src/datastore/firebase/firebase_repository_base.ts](src/datastore/firebase/firebase_repository_base.ts).

## Public API (src/index.ts exports)

`MessengerCore`, `User`, `NewUser`, `Conversation`, `NewConversation`, `Message`, `NewMessage`,
`UserService`, `ConversationService`, `MessageService`

## Firestore Collection Layout

```
users/                        ← user documents keyed by user id
{conversationsId}/            ← per-user conversation collection (conv_<userId>)
  {conversationId}            ← conversation documents
{conversationId}/             ← per-conversation message collection
  {messageId}                 ← message documents
```

## Adding a New Backend

1. Create `src/datastore/<backend>/` with a datastore class and repository classes.
2. Implement all three repository interfaces from `src/datastore/interfaces/repository/`.
3. Implement `Datastore` from `src/datastore/interfaces/datastore.ts`.
4. Register the new `dbDriver` string in `MessengerCore.__initDataStore`.
5. Add integration tests under `test/`.
