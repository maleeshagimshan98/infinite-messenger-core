# Infinite Messenger Core — Codebase Context

## Purpose

This document is the single source of truth for the `infinite-messenger-core` TypeScript library.
It describes the architecture, module structure, domain models, service layer, datastore abstractions, Firebase implementation, repository interfaces, and key usage flows.

## High-Level Architecture

The repository is organized as a layered messaging core with clear separation of concerns:

- `src/index.ts` — public package exports and API surface.
- `src/MessengerCore.ts` — main library container, initializes datastore and application services.
- `src/Models/` — domain model classes for `User`, `Conversation`, and `Message`.
- `src/Service/` — business/service layer for application operations.
- `src/datastore/interfaces/` — datastore interfaces and repository contracts.
- `src/datastore/firebase/` — Firestore-specific datastore implementation and repository classes.
- `src/datastore/utils/` — lightweight result wrappers used by repository calls.

The pattern is:

- Domain models encapsulate state and serialization logic.
- Services orchestrate business workflows and use repository contracts.
- Datastore abstraction enables swapping persistence backends.
- Firebase repositories implement the concrete persistence behavior.

## Public API

Exported by `src/index.ts`:

- `MessengerCore`
- `User`, `NewUser`
- `Conversation`, `NewConversation`
- `Message`, `NewMessage`
- `UserService`
- `ConversationService`
- `MessageService`

This library is intended to be used by importing `MessengerCore`, initializing a session with a user, and then calling service methods.

## Core Library Container

### `src/MessengerCore.ts`

Responsibilities:

- Initialize the datastore via `__initDataStore(dbDriver, dbConfig)`.
- Manage the active `User` session.
- Instantiate service classes after successful initialization:
  - `UserService`
  - `ConversationService`
  - `MessageService`
- Enforce the mandatory workflow: `initialize(userId)` must be called before using conversations or messages.

Important behavior:

- `initialize(userId)` loads the user from the datastore.
- If the user is not found, it throws `MessengerCore:Error: User not found`.
- After initialization, it marks the user as active and updates the user record.

## Domain Models

### `src/Models/user.ts`

Model: `User` and type `NewUser`

Key responsibilities:

- Store user metadata: `id`, `name`, `profileImg`, `lastSeen`, `permissions`, `conversationsId`.
- Track active status and last conversation id.
- Convert user state to plain objects via `toObj()` for persistence.
- Validate setter input types.
- Provide getters for all persisted fields.

Usage notes:

- `conversationsId` is automatically derived as `conv_<userId>` when not provided.

### `src/Models/thread.ts`

Model: `Conversation` and type `NewConversation`

Key responsibilities:

- Represent a chat thread with `id`, `participants`, `startedDate`, `lastUpdatedTime`, `timestamp`, and optional `lastMessageId`.
- Maintain a local message cache in `_messages`.
- Provide serialization via `toObj()`.
- Manage message insertion and last-message tracking.
- Expose stream/listening state via `isListening()`.

Behavior:

- `setMessage(message)` adds a message to the conversation, updates `lastMessageId`, and refreshes `lastUpdatedTime`.

### `src/Models/message.ts`

Model: `Message` and type `NewMessage`

Key responsibilities:

- Represent a message with `id`, `senderId`, `content`, `time`, and `timestamp`.
- Validate sender id presence.
- Support content updates and timestamp assignment.
- Provide serialization via `toObj()`.

## Service Layer

### `src/Service/UserService.ts`

Responsibilities:

- Retrieve a user: `getUser(userId)`.
- Create a new user: `newUser(user)`.
- Update a user: `updateUser(user)`.
- Delete a user: `deleteUser(user)`.

Behavior:

- Delegates operations to `Datastore.user` repository methods.
- Returns and accepts domain model instances.

### `src/Service/ConversationService.ts`

Responsibilities:

- Load conversations for a user: `getConversations(...)`.
- Start new conversations: `startConversation(user, conversation)`.
- Listen for realtime conversation updates: `listenToConversations(callback)`.
- Delete conversations: `deleteConversation(conversation)`.
- Manage listener lifecycle: `detachListener()`.

Behavior:

- Stores loaded conversations in an internal map.
- Writes new conversations for all participants by calling the datastore repository for each participant.
- Supports ordering and pagination through the repository contract.

### `src/Service/MessageService.ts`

Responsibilities:

- Retrieve conversation messages: `getMessages(conversation, start)`.
- Send messages: `sendMessage(conversation, message)`.
- Listen for message updates: `listen(conversation, callback)`.
- Delete messages: `deleteMessage(conversation, messageId)`.
- Detach listeners: `detachListener(conversation)`.

Behavior:

- Adds messages to the conversation and persists them.
- Uses `DatabaseResultSet` to update model caches when data is returned.

## Datastore Abstraction

### `src/datastore/interfaces/datastore.ts`

`Datastore` interface exposes:

- `user`: `UsersRepositroy`
- `conversations`: `ConversationsRepository`
- `messages`: `MessagesRepository`
- `transaction(callback)` for transaction execution.

It also exposes internal repository members via `__user`, `__conversations`, `__messages`.

### `src/datastore/interfaces/repository/*`

Repository contracts follow the repository pattern.
They define persistence operations independent of the backend.

#### `UsersRepositroy`

- `getUsers(start?)`
- `setUsers(users)`
- `getUser(userId)`
- `setUser(user)`
- `updateUser(user)`
- `deleteUser(user)`

#### `ConversationsRepository`

- `getConversations(conversationsId, orderBy, orderByDirection, start?)`
- `addConversation(conversationsId, conversation)`
- `listenToConversations(conversationsId, callback, errorCallback)`
- `deleteConversation(userConversationId, conversationId)`
- `detach(conversationId)`

#### `MessagesRepository`

- `getMessages(conversationId, start?)`
- `setMessage(conversationId, message)`
- `listenToMessages(conversationId, callback, errorCallback)`
- `deleteMessage(conversationId, messageId)`
- `detach(listener)`

### `src/datastore/utils/DatabaseResult.ts` and `DatabaseResultSet.ts`

These wrappers implement a simple result contract:

- `hasData()` returns whether the query returned results.
- `data()` returns the wrapped payload.

They are used to express optional or empty repository responses cleanly.

## Firebase Implementation

### `src/datastore/firebase/firebase_datastore.ts`

`FirebaseDatastore` is the concrete implementation of `Datastore` for Firestore.

Key behavior:

- Initializes Firebase admin SDK with a service account JSON config.
- Provides repository instances:
  - `FirebaseUsersRepository`
  - `FirebaseConversationsRepository`
  - `FirebaseMessagesRepository`
- Exposes repository getters.
- Implements `transaction(callback)` with guard logic to prevent transactions while batch writes are active.
- Manages transaction active state across all repositories.

This class is the backend wiring used by `MessengerCore`.

### `src/datastore/firebase/firebase_repository_base.ts`

Shared repository utility base class.

Responsibilities:

- Hold Firestore instance and shared listener registry.
- Support batch writes and transaction coordination.
- Provide query building for ordered, paginated collection reads.
- Provide document operations: `__doc`, `__setDoc`, `__updateDoc`, `__deleteDoc`.
- Provide helper methods to map Firestore data into models.
- Manage listener detach and detachAll semantics.

Important rules:

- A batch cannot start while a transaction is active.
- A transaction cannot start while a batch is active.

### Firebase repository classes

#### `FirebaseUsersRepository`

- Stores users in the `users` collection.
- Supports user list pagination, single-user fetch, create/update/delete.
- Uses `User.toObj()` for serialization.
- Supports optional transaction object for Firestore transactions.

#### `FirebaseConversationsRepository`

- Uses a per-user collection keyed by `conversationsId`.
- Supports `getConversations`, `addConversation`, `listenToConversations`, and delete.
- Uses Firestore collection queries ordered by `timestamp`.
- Stores conversations as documents under the user-specific collection.

#### `FirebaseMessagesRepository`

- Uses a per-conversation collection keyed by conversation ID.
- Supports `getMessages`, `setMessage`, `listenToMessages`, and delete.
- Uses ordered Firestore queries on `timestamp` to paginate messages.

## Design Patterns

The codebase applies these patterns:

- Repository pattern: persistence is abstracted behind `UsersRepositroy`, `ConversationsRepository`, and `MessagesRepository`.
- Dependency inversion: `MessengerCore` depends on datastore interfaces and receives a concrete `FirebaseDatastore`.
- Service layer: business logic and application flow are handled in `UserService`, `ConversationService`, and `MessageService`.
- Domain model encapsulation: `User`, `Conversation`, and `Message` contain state, validation, and serialization.
- Adapter-like Firebase datastore: `FirebaseDatastore` and `Firebase*Repository` adapt Firestore into the repo contracts.

## Data Model and Collection Layout

Firestore structure implied by the code:

- `users` collection
  - user documents keyed by user id
- user-specific conversation collections
  - collection name = `user.conversationsId`
  - conversation documents keyed by conversation id
- conversation message collections
  - collection name = conversation id
  - message documents keyed by message id

## Usage Workflow

1. Create `MessengerCore` with configuration:
   - `dbDriver: 'firebase'`
   - `dbConfig: path to service account JSON`
2. Call `await messenger.initialize(userId)`.
3. Use `messenger.getUser()` to access the active user.
4. Use `messenger.conversationService()` and `messenger.messageService()` for chat operations.
5. Call `await messenger.initConversations()` to load the current user's conversation list.

Failure modes:

- `initialize(userId)` throws if the user does not exist.
- The library currently requires explicit session initialization before services are usable.

## Key Files Summary

- `src/index.ts` — exports public package API.
- `src/MessengerCore.ts` — core initialization and service wiring.
- `src/Models/user.ts` — user domain model.
- `src/Models/thread.ts` — conversation/thread domain model.
- `src/Models/message.ts` — message domain model.
- `src/Service/UserService.ts` — user service business logic.
- `src/Service/ConversationService.ts` — conversation service business logic.
- `src/Service/MessageService.ts` — message service business logic.
- `src/datastore/interfaces/datastore.ts` — datastore abstraction.
- `src/datastore/interfaces/repository/*` — persistence contracts.
- `src/datastore/firebase/firebase_datastore.ts` — Firestore datastore implementation.
- `src/datastore/firebase/firebase_repository_base.ts` — shared Firestore repository utilities.
- `src/datastore/firebase/firebase_users_repository.ts` — user repository implementation.
- `src/datastore/firebase/firebase_conversations_repository.ts` — conversation repository implementation.
- `src/datastore/firebase/firebase_messages_repository.ts` — message repository implementation.
- `src/datastore/utils/DatabaseResult.ts` — single-result wrapper.
- `src/datastore/utils/DatabaseResultSet.ts` — collection-result wrapper.

## Notes for Agents

- Use `AGENTS.MD` as the canonical architecture reference.
- Prefer `MessengerCore.initialize(userId)` as the entrypoint behavior.
- Services should be treated as the behavior layer, not repositories.
- The repository layer is the persistence contract, with Firebase as the concrete adapter.
- The data transport uses plain object serialization via domain model `toObj()` methods.

---

This file is intended to be the definitive context reference for any automated analysis or agent working on `infinite-messenger-core`.
