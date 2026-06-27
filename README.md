# Messenger Core v2.0

<p align="center">
  <em>A powerful, real-time messaging library for Node.js applications</em>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Introduction

**Messenger Core** is a production-ready, real-time messaging library built with Firebase for Node.js servers. It provides a complete abstraction layer for building chat applications with minimal boilerplate code.

### Why Messenger Core?

Building a messaging system from scratch is complex:

- 📊 Database schema design for users, conversations, and messages
- ⚡ Real-time synchronization across multiple clients
- 🔄 Pagination and efficient data retrieval
- 🏗️ Scalable architecture that supports growth

**Messenger Core solves these challenges** by providing:

- ✅ **Clean, layered architecture** with separation of concerns
- ✅ **Real-time updates** out of the box via Firebase listeners
- ✅ **Type-safe API** with full TypeScript support
- ✅ **Database abstraction** - swap implementations without code changes
- ✅ **Production-tested** with comprehensive test coverage

### What You Can Build

- 💬 One-on-one chat applications
- 👥 Group messaging platforms
- 📱 Mobile backend APIs
- 🎮 In-game chat systems
- 💼 Customer support portals

---

## Installation

```bash
npm install @maleeshagimshan98/infinite-messenger-core
```

### Prerequisites

- **Node.js** 14.x or higher
- **Firebase Project** with Firestore enabled
- **Service Account Key** (JSON file) from Firebase Console

---

## Quick Start

### 1. Set Up Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Generate a service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely

### 2. Initialize the Library

```typescript
import { MessengerCore } from '@maleeshagimshan98/infinite-messenger-core';
import { User, Conversation, Message } from '@maleeshagimshan98/infinite-messenger-core';

// Initialize with Firebase configuration
const messenger = new MessengerCore({
  dbDriver: 'firebase',
  dbConfig: './path/to/firebase-key.json',
});
```

### 3. Initialize User Session (Required)

> ⚠️ **Important**: You MUST call `initialize()` before performing any operations with the library. If the user doesn't exist, an error will be thrown - you must handle this appropriately.

```typescript
try {
  // Initialize user session - REQUIRED before any other operations
  await messenger.initialize('user123');

  // If successful, you can now use the library
  const currentUser = messenger.getUser();
  console.log('Active user:', currentUser.getName());
} catch (error) {
  if (error.message.includes('User not found')) {
    console.log('User does not exist. Creating new user...');

    // Create a new user
    const newUser = await messenger.newUser({
      id: 'user123',
      name: 'John Doe',
      profileImg: 'https://example.com/avatar.jpg',
      lastSeen: new Date().toISOString(),
      permissions: ['read', 'write'],
      conversationsId: 'conv_user123', // Auto-generated if not provided
    });

    console.log('User created:', newUser.getName());

    // Now initialize with the newly created user
    await messenger.initialize('user123');
  } else {
    console.error('Initialization failed:', error);
    throw error;
  }
}
```

### 4. Alternative: Create User First (If You Know User Doesn't Exist)

```typescript
// If you're setting up a new user for the first time
const newUser = await messenger.newUser({
  id: 'user456',
  name: 'Jane Smith',
  profileImg: 'https://example.com/avatar.jpg',
  lastSeen: new Date().toISOString(),
  permissions: ['read', 'write'],
  conversationsId: 'conv_user456',
});

// Then initialize the session
await messenger.initialize('user456');
```

### 5. Send Your First Message

```typescript
// Load conversations (after successful initialization)
await messenger.initConversations();

// Start a new conversation
const conversation = new Conversation({
  id: 'conv_' + Date.now(),
  participants: ['user123', 'user456'],
});

await messenger.conversationService().startConversation(messenger.getUser(), conversation);

// Send a message
const message = new Message({
  senderId: 'user123',
  content: 'Hello, World! 👋',
});

await messenger.messageService().sendMessage(conversation, message);

console.log('Message sent successfully!');
```

---

## Important: Initialization Workflow

**Every session MUST follow this pattern:**

1. **Create `MessengerCore` instance** with database configuration
2. **Call `initialize(userId)`** - This is MANDATORY before any operations
   - ✅ If user exists: Session starts successfully
   - ❌ If user doesn't exist: Error is thrown - handle by creating the user first
3. **Perform operations** - Only after successful initialization

```typescript
// Recommended pattern
const messenger = new MessengerCore({ dbDriver: 'firebase', dbConfig: './key.json' });

try {
  await messenger.initialize('user123');
  // ✅ User exists - proceed with operations
  await messenger.initConversations();
  // ... rest of your code
} catch (error) {
  if (error.message.includes('User not found')) {
    // ❌ User doesn't exist - create first, then initialize
    await messenger.newUser({ id: 'user123', name: 'New User' /* ... */ });
    await messenger.initialize('user123');
  }
}
```

---

## Features

### 🔐 User Management

Create, retrieve, update, and manage users with ease.

#### Create a User

```typescript
const user = await messenger.newUser({
  id: 'user789',
  name: 'Jane Smith',
  profileImg: 'https://example.com/jane.jpg',
  lastSeen: new Date().toISOString(),
  permissions: ['read', 'write', 'admin'],
  conversationsId: 'conv_user789',
});
```

#### Get User Information

```typescript
const userService = messenger.userService();
const user = await userService.getUser('user789');

console.log('User name:', user.getName());
console.log('Last seen:', user.getLastSeen());
console.log('Is active:', user.getIsActive());
```

#### Update User Profile

```typescript
const user = messenger.getUser();
user.setName('Jane Doe');
user.setProfileImg('https://example.com/new-avatar.jpg');

await messenger.updateUser(user);
```

---

### 💬 Conversation Management

Manage conversations between users with real-time synchronization.

#### Start a New Conversation

```typescript
const conversationService = messenger.conversationService();

const conversation = new Conversation({
  id: 'conv_' + Date.now(),
  participants: ['user123', 'user456', 'user789'], // Supports multiple participants
});

await conversationService.startConversation(messenger.getUser(), conversation);
```

#### Retrieve User's Conversations

```typescript
// Get all conversations
await messenger.initConversations();
const conversations = conversationService.getConversations();

// Iterate through conversations
Object.values(conversations).forEach((conv) => {
  console.log('Conversation ID:', conv.getId());
  console.log('Participants:', conv.getParticipants());
  console.log('Last updated:', conv.getLastUpdatedTime());
});
```

#### Listen for New Conversations (Real-time)

```typescript
await conversationService.listenToConversations((conversationsData) => {
  if (conversationsData.hasData()) {
    const newConversations = conversationsData.data();

    newConversations.forEach((conv) => {
      console.log('New conversation:', conv.getId());
      console.log('With:', conv.getParticipants());
    });
  }
});
```

#### Delete a Conversation

```typescript
conversationService.deleteConversation(conversation);
```

#### Stop Listening

```typescript
// Clean up listeners to prevent memory leaks
conversationService.detachListener();
```

---

### 📨 Message Management

Send, retrieve, and listen to messages with real-time updates.

#### Send a Message

```typescript
const messageService = messenger.messageService();

const message = new Message({
  senderId: 'user123',
  content: 'Hey! How are you doing?',
  timestamp: Date.now(),
});

await messageService.sendMessage(conversation, message);
```

#### Retrieve Messages

Fetch the first batch of messages for a conversation. Optionally, pass a **start** cursor (the **timestamp** of the last loaded message) to retrieve the next page of older results.

| Parameter      | Type           | Required | Description                                                                          |
| -------------- | -------------- | -------- | ------------------------------------------------------------------------------------ |
| `conversation` | `Conversation` | ✅ Yes   | The conversation to fetch messages from.                                             |
| `start`        | `string`       | ❌ No    | The **timestamp** of the last loaded message. Omit to load from the latest messages. |

```typescript
// Fetch the first batch of messages
const messagesResult = await messageService.getMessages(conversation);

if (messagesResult.hasData()) {
  const messages = messagesResult.data();

  messages.forEach((msg) => {
    console.log(`${msg.getSenderId()}: ${msg.getContent()}`);
    console.log(`Sent at: ${msg.getTime()}`);
  });

  // To load the next (older) page, pass the timestamp of the last message as the start cursor
  const lastMessage = messages[messages.length - 1];
  const lastTimestamp = lastMessage.toObj().timestamp.toString();
  const nextPage = await messageService.getMessages(conversation, lastTimestamp);
}
```

#### Listen for New Messages (Real-time)

```typescript
messageService.listen(conversation, (messagesData) => {
  if (messagesData.hasData()) {
    const newMessages = messagesData.data();

    newMessages.forEach((msg) => {
      console.log(`📩 New message from ${msg.getSenderId()}`);
      console.log(`Content: ${msg.getContent()}`);
    });
  }
});
```

#### Delete a Message

```typescript
await messageService.deleteMessage(conversation, 'message-id-123');
```

#### Stop Listening to Messages

```typescript
messageService.detachListener(conversation);
```

---

### ⚡ Real-time Updates

The library provides built-in real-time synchronization using Firebase's snapshot listeners.

#### Complete Real-time Example

```typescript
// Start listening to conversations
await conversationService.listenToConversations((conversations) => {
  console.log('Conversations updated!');
});

// Start listening to messages in a specific conversation
messageService.listen(conversation, (messages) => {
  console.log('New messages received!');

  if (messages.hasData()) {
    const messageList = messages.data();
    // Update UI with new messages
    updateChatUI(messageList);
  }
});

// When done, clean up
conversationService.detachListener();
messageService.detachListener(conversation);
```

---

### 📄 Pagination Support

Efficiently load large datasets with built-in cursor-based pagination. The `getMessages` method accepts an optional `start` parameter — a **timestamp** value used as a Firestore `.startAfter()` cursor against the `orderBy('timestamp', 'desc')` query.

> ⚠️ **Important**: The `start` parameter must be the **timestamp** (Unix milliseconds as a string) of the last loaded message, **not** the message ID.

#### Parameters

| Parameter | Type     | Required | Description                                                                                                                                                                                   |
| --------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `start`   | `string` | ❌ No    | The **timestamp** of the last loaded message (e.g. `lastMessage.toObj().timestamp.toString()`). Pass this to retrieve the next page of older messages. Omit to load from the latest messages. |

#### Example: Loading Messages in Pages

```typescript
// Step 1: Load the first (latest) batch of messages — no cursor needed
const firstBatch = await messageService.getMessages(conversation);

if (firstBatch.hasData()) {
  const messages = firstBatch.data();

  messages.forEach((msg) => {
    console.log(`${msg.getSenderId()}: ${msg.getContent()}`);
  });

  // Step 2: Get the timestamp of the oldest message in this batch
  const lastMessage = messages[messages.length - 1];
  const lastTimestamp = lastMessage.toObj().timestamp.toString();

  // Step 3: Load the next (older) batch using the timestamp as cursor
  const nextBatch = await messageService.getMessages(conversation, lastTimestamp);

  if (nextBatch.hasData()) {
    nextBatch.data().forEach((msg) => {
      console.log(`${msg.getSenderId()}: ${msg.getContent()}`);
    });
  }
}
```

> 💡 **Tip**: Repeat step 2–3 with the timestamp from the last message of each batch to implement infinite scroll / load-more functionality.

---

## Documentation

### API Reference

For detailed API documentation, see:

- [UserService Methods](#userservice-api)
- [ConversationService Methods](#conversationservice-api)
- [MessageService Methods](#messageservice-api)
- [Data Models](#data-models)

### UserService API

| Method             | Parameters       | Returns                      | Description             |
| ------------------ | ---------------- | ---------------------------- | ----------------------- |
| `getUser(userId)`  | `userId: string` | `Promise<User \| undefined>` | Fetch a user by ID      |
| `newUser(user)`    | `user: NewUser`  | `Promise<User>`              | Create a new user       |
| `updateUser(user)` | `user: User`     | `Promise<User>`              | Update user information |
| `deleteUser(user)` | `user: User`     | `Promise<void>`              | Delete a user           |

### ConversationService API

| Method                                  | Parameters                                    | Returns                                 | Description                     |
| --------------------------------------- | --------------------------------------------- | --------------------------------------- | ------------------------------- |
| `getConversations()`                    | None                                          | `Promise<Record<string, Conversation>>` | Get all conversations           |
| `startConversation(user, conversation)` | `user: User`<br/>`conversation: Conversation` | `Promise<Conversation>`                 | Start a new conversation        |
| `listenToConversations(callback)`       | `callback: Function`                          | `Promise<void>`                         | Listen for conversation updates |
| `deleteConversation(conversation)`      | `conversation: Conversation`                  | `void`                                  | Delete a conversation           |
| `detachListener()`                      | None                                          | `void`                                  | Stop listening                  |

### MessageService API

| Method                                   | Parameters                                                                                                                                                                                                                                                | Returns                                 | Description                                                              |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------ |
| `getMessages(conversation, start?)`      | `conversation: Conversation` — the target conversation<br/>`start?: string` — **optional** pagination cursor: the **timestamp** (Unix ms, as a string) of the last loaded message. Fetches messages older than this value. Omit to start from the latest. | `Promise<DatabaseResultSet<Message[]>>` | Fetch messages with cursor-based pagination using the `timestamp` field. |
| `sendMessage(conversation, message)`     | `conversation: Conversation`<br/>`message: Message`                                                                                                                                                                                                       | `Promise<void>`                         | Send a message to a conversation                                         |
| `listen(conversation, callback)`         | `conversation: Conversation`<br/>`callback: Function` — invoked with `DatabaseResultSet<Message[]>` on each update                                                                                                                                        | `void`                                  | Listen for new messages in real-time                                     |
| `deleteMessage(conversation, messageId)` | `conversation: Conversation`<br/>`messageId: string` — ID of the message to delete                                                                                                                                                                        | `Promise<void>`                         | Delete a message from a conversation                                     |
| `detachListener(conversation)`           | `conversation: Conversation`                                                                                                                                                                                                                              | `void`                                  | Stop listening for messages                                              |

### Data Models

### Data Models

#### User

Represents a user in the messaging system.

```typescript
type NewUser = {
  id: string; // Unique user identifier
  name: string; // Display name
  profileImg: string; // Profile image URL
  lastSeen: string; // Last activity timestamp
  permissions: string[]; // User permissions/roles
  conversationsId: string; // Unique conversation collection ID (format: conv_{userId})
};
```

**Key Methods:**

- `getId()` - Get user ID
- `getName()` - Get user name
- `getIsActive()` - Check if user is online
- `getConversationsId()` - Get conversation collection ID
- `setIsActive(status)` - Set online/offline status
- `toObj()` - Convert to plain object for storage

#### Conversation

Represents a conversation/thread between participants.

```typescript
interface NewConversation {
  id: string; // Unique conversation identifier
  participants: string[]; // Array of participant user IDs
  startedDate?: string; // When conversation was created
  lastUpdatedTime?: string; // Last activity timestamp
  lastMessageId?: string; // ID of most recent message
  timestamp?: number; // Unix timestamp for sorting
  messages?: Record<string, Message>; // Cached messages
}
```

**Key Methods:**

- `getId()` - Get conversation ID
- `getParticipants()` - Get participant IDs
- `getMessages()` - Get cached messages
- `setMessage(message)` - Add a message
- `deleteMessage(messageId)` - Remove a message
- `toObj()` - Convert to plain object for storage

#### Message

Represents a single message in a conversation.

```typescript
type NewMessage = {
  id?: string; // Unique message identifier (auto-generated if not provided)
  senderId: string; // ID of sender
  content?: string; // Message text
  time?: string; // Human-readable timestamp
  timestamp?: number; // Unix timestamp for ordering
};
```

**Key Methods:**

- `getId()` - Get message ID
- `getSenderId()` - Get sender ID
- `getContent()` - Get message text
- `getTime()` - Get formatted time
- `setContent(message)` - Update content
- `toObj()` - Convert to plain object for storage

---

## Architecture

### Overview

Messenger Core follows a clean, layered architecture with clear separation of concerns:

```
┌─────────────────────────────────┐
│      MessengerCore (Facade)     │  ← Entry point
└────────────┬────────────────────┘
             │
    ┌────────┴────────┐
    │   Services      │  ← Business logic
    │  (User, Conv,   │
    │   Message)      │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │   Datastore     │  ← Database abstraction
    │  (Interface)    │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │  Firebase Impl  │  ← Firebase repositories
    └─────────────────┘
```

### Key Design Patterns

- **Facade Pattern**: `MessengerCore` provides a simplified interface to complex subsystems
- **Repository Pattern**: Data access abstracted through repository interfaces
- **Service Layer**: Business logic separated into dedicated service classes
- **Strategy Pattern**: Database implementations are pluggable via interfaces
- **Observer Pattern**: Real-time listeners notify subscribers of data changes

### Data Structure in Database

```
Firestore Database
│
├── users/                          # User collection
│   └── {userId}/                   # User document
│
├── conv_{userId}/                  # Each user's conversations
│   └── {conversationId}/           # Conversation document
│
└── {conversationId}/               # Messages for each conversation
    └── {messageId}/                # Message document
```

**Key Design Decisions:**

- **Conversation Duplication**: Each conversation is stored in all participants' collections for efficient querying
- **Separate Message Collections**: Messages are stored in collections named by conversationId for scalability
- **User-specific Collection IDs**: Format `conv_{userId}` ensures data isolation

### For In-Depth Understanding

For a comprehensive architectural overview, see [LIBRARY_ARCHITECTURE.md](./Docs/LIBRARY_ARCHITECTURE.md), which includes:

- Detailed component breakdown
- Complete execution paths
- Data flow diagrams
- Implementation details
- Future enhancement roadmap

---

## Examples

### Complete Chat Application

```typescript
import { MessengerCore, User, Conversation, Message } from '@maleeshagimshan98/infinite-messenger-core';

// Initialize
const messenger = new MessengerCore({
  dbDriver: 'firebase',
  dbConfig: './firebase-key.json',
});

// Initialize user session (REQUIRED - must be called first)
try {
  await messenger.initialize('user123');
} catch (error) {
  if (error.message.includes('User not found')) {
    // Create user if doesn't exist
    await messenger.newUser({
      id: 'user123',
      name: 'John Doe',
      profileImg: '',
      lastSeen: new Date().toISOString(),
      permissions: ['read', 'write'],
      conversationsId: 'conv_user123',
    });
    await messenger.initialize('user123');
  } else {
    throw error;
  }
}

// Get services
const conversationService = messenger.conversationService();
const messageService = messenger.messageService();

// Load conversations
await messenger.initConversations();

// Listen for new conversations
await conversationService.listenToConversations((conversations) => {
  console.log('Conversations updated!');
});

// Start a conversation
const conversation = new Conversation({
  id: 'conv_' + Date.now(),
  participants: ['user123', 'user456'],
});

await conversationService.startConversation(messenger.getUser(), conversation);

// Listen for messages
messageService.listen(conversation, (messages) => {
  if (messages.hasData()) {
    messages.data().forEach((msg) => {
      console.log(`${msg.getSenderId()}: ${msg.getContent()}`);
    });
  }
});

// Send a message
const message = new Message({
  senderId: 'user123',
  content: 'Hello!',
});

await messageService.sendMessage(conversation, message);

// Clean up when done
messageService.detachListener(conversation);
conversationService.detachListener();
```

### Proper Initialization & Error Handling

**Always handle the initialization properly:**

```typescript
const messenger = new MessengerCore({
  dbDriver: 'firebase',
  dbConfig: './firebase-key.json',
});

try {
  // Attempt to initialize with existing user
  await messenger.initialize('user123');
  console.log('✅ User session initialized successfully');

  // Proceed with your application logic
  await messenger.initConversations();
  // ... rest of your code
} catch (error) {
  if (error.message.includes('User not found')) {
    console.log('⚠️ User not found. Creating new user...');

    // Create user if not exists
    const newUser = await messenger.newUser({
      id: 'user123',
      name: 'New User',
      profileImg: '',
      lastSeen: new Date().toISOString(),
      permissions: ['read', 'write'],
      conversationsId: 'conv_user123',
    });

    console.log('✅ User created:', newUser.getName());

    // Initialize with newly created user
    await messenger.initialize('user123');
    console.log('✅ User session initialized successfully');
  } else {
    console.error('❌ Initialization failed:', error);
    throw error;
  }
}
```

### Common Initialization Patterns

**Pattern 1: Existing User (Most Common)**

```typescript
// For existing users in your system
const messenger = new MessengerCore({ dbDriver: 'firebase', dbConfig: './key.json' });
await messenger.initialize('existingUserId123');
// ✅ Ready to use
```

**Pattern 2: New User Registration**

```typescript
// When registering a new user
const messenger = new MessengerCore({ dbDriver: 'firebase', dbConfig: './key.json' });

// Create user first
await messenger.newUser({
  id: 'newUserId456',
  name: 'Alice Johnson',
  profileImg: 'https://example.com/alice.jpg',
  lastSeen: new Date().toISOString(),
  permissions: ['read', 'write'],
  conversationsId: 'conv_newUserId456',
});

// Then initialize
await messenger.initialize('newUserId456');
// ✅ Ready to use
```

**Pattern 3: Safe Initialization (Try existing, create if needed)**

```typescript
const messenger = new MessengerCore({ dbDriver: 'firebase', dbConfig: './key.json' });

async function safeInitialize(userId: string, userData: NewUser) {
  try {
    await messenger.initialize(userId);
    console.log('✅ Existing user initialized');
  } catch (error) {
    if (error.message.includes('User not found')) {
      console.log('⚠️ Creating new user...');
      await messenger.newUser(userData);
      await messenger.initialize(userId);
      console.log('✅ New user created and initialized');
    } else {
      throw error;
    }
  }
}

// Use it
await safeInitialize('user789', {
  id: 'user789',
  name: 'Bob Wilson',
  profileImg: '',
  lastSeen: new Date().toISOString(),
  permissions: ['read', 'write'],
  conversationsId: 'conv_user789',
});
// ✅ Ready to use, whether user existed or not
```

---

### TypeScript Support

try {
await messenger.initialize('user123');
} catch (error) {
if (error.message.includes('User not found')) {
// Create user if not exists
const newUser = await messenger.newUser({
id: 'user123',
name: 'New User',
profileImg: '',
lastSeen: new Date().toISOString(),
permissions: ['read', 'write'],
conversationsId: 'conv_user123',
});

    await messenger.initialize('user123');

} else {
console.error('Initialization failed:', error);
}
}

````

### TypeScript Support

Full TypeScript support with type definitions:

```typescript
import type {
  User,
  Conversation,
  Message,
  NewUser,
  NewConversation,
  NewMessage,
} from '@maleeshagimshan98/infinite-messenger-core';

// Type-safe user creation
const userdata: NewUser = {
  id: 'user123',
  name: 'John Doe',
  profileImg: 'https://example.com/avatar.jpg',
  lastSeen: new Date().toISOString(),
  permissions: ['read', 'write'],
  conversationsId: 'conv_user123',
};

const user: User = await messenger.newUser(userData);
````

---

## Testing

The library includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- conversation.service.test.ts
```

**Test Structure:**

- Unit tests for models (User, Conversation, Message)
- Integration tests for services
- Firebase repository tests
- End-to-end workflow tests

---

## License

This project is licensed under the **MIT License** - see below for details.

```
MIT License

Copyright (c) 2025 Maleesha Gimshan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Contributing

Contributions are welcome and greatly appreciated! 🎉

### How to Contribute

1. **Fork the repository**

   ```bash
   git clone https://github.com/maleeshagimshan98/infinite-messenger-core.git
   cd infinite-messenger-core
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**

   - Write clean, documented code
   - Add tests for new features
   - Ensure all tests pass: `npm test`
   - Follow the existing code style: `npm run lint`

4. **Commit your changes**

   ```bash
   git commit -m 'Add some amazing feature'
   ```

5. **Push to your branch**

   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Ensure CI checks pass

### Development Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linter
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Build
npm run build
```

### Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming and inclusive community.

---

## Bug Reports & Feature Requests

### Reporting Bugs

If you find a bug, please [open an issue](https://github.com/maleeshagimshan98/infinite-messenger-core/issues) with:

- **Clear title** describing the issue
- **Detailed description** of the problem
- **Steps to reproduce** the bug
- **Expected behavior** vs actual behavior
- **Environment details**:
  - Node.js version
  - Library version
  - Operating system
  - Database (Firebase/MongoDB)
- **Code sample** or minimal reproduction
- **Error messages** or stack traces

**Example:**

````markdown
## Bug: Messages not appearing in real-time

**Description**: When using `messageService.listen()`, new messages don't appear until page refresh.

**Steps to Reproduce**:

1. Initialize messenger with user123
2. Start listening to conversation: `messageService.listen(conv, callback)`
3. Send message from another client
4. Callback is not invoked

**Expected**: Callback should be invoked with new messages
**Actual**: No callback, messages appear only after refresh

**Environment**:

- Node.js: v16.14.0
- Library: v2.0.0
- OS: Windows 11
- Database: Firebase

**Code**:
\```typescript
messageService.listen(conversation, (messages) => {
console.log('New messages:', messages.data());
});
\```

**Error**: None in console
````

### Feature Requests

Have an idea? [Open an issue](https://github.com/maleeshagimshan98/infinite-messenger-core/issues) with:

- **Feature description** - What should it do?
- **Use case** - Why is it needed?
- **Example API** - How would you use it?
- **Alternatives considered** - Other approaches you've thought about

---

## Support & Community

- 💬 **Discussions**: [GitHub Discussions](https://github.com/maleeshagimshan98/infinite-messenger-core/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/maleeshagimshan98/infinite-messenger-core/issues)
- 📧 **Email**: [maleeshagimshan74@gmail.com](mailto:maleeshagimshan74@gmail.com)
- 🔗 **Website**: [maleeshagimshan.com](https://www.maleeshagimshan.com)

---

## Author

**Maleesha Gimshan**

- GitHub: [@maleeshagimshan98](https://github.com/maleeshagimshan98)
- Email: [maleeshagimshan74@gmail.com](mailto:maleeshagimshan74@gmail.com)
- LinkedIn: [Maleesha Gimshan](https://www.linkedin.com/in/maleeshagimshan)

---

## Acknowledgments

- Firebase team for the amazing real-time database
- All contributors who have helped improve this library
- The Node.js and TypeScript communities

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed history of changes (coming soon).

---

## Roadmap

### Upcoming Features

- 🔄 **MongoDB Support** - Alternative database implementation
- 📎 **File Attachments** - Support for media messages
- ✅ **Message Status** - Delivery and read receipts
- 🔔 **Push Notifications** - Real-time notification support
- 👥 **Group Management** - Add/remove participants
- 🔍 **Message Search** - Full-text search capabilities
- 🔐 **Enhanced Security** - Encryption and permission systems

See [GitHub Issues](https://github.com/maleeshagimshan98/infinite-messenger-core/issues) for detailed roadmap and progress.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/maleeshagimshan98">Maleesha Gimshan</a>
</p>

<p align="center">
  <sub>If you find this library helpful, please consider giving it a ⭐ on GitHub!</sub>
</p>
