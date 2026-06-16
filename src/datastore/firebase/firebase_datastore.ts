/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import { initializeApp, cert } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import type { Datastore } from '../interfaces/datastore';
import FirebaseUsersRepository from './firebase_users_repository';
import FirebaseConversationsRepository from './firebase_conversations_repository';
import FirebaseMessagesRepository from './firebase_messages_repository';

class FirebaseDatastore implements Datastore {
  /**
   * Firestore database instance.
   *
   * @type {Firestore}
   */
  private __db: Firestore;

  /**
   * User repository.
   *
   * @type {FirebaseUserRepository}
   */
  public __user: FirebaseUsersRepository;

  /**
   * Conversation repository.
   *
   * @type {FirebaseConversationRepository}
   */
  public __conversations: FirebaseConversationsRepository;

  /**
   * Messages repository.
   *
   * @type {FirebaseMessagesRepository}
   */
  public __messages: FirebaseMessagesRepository;

  constructor(firebaseConfig: string) {
    const app = initializeApp({
      credential: cert(firebaseConfig),
    });
    this.__db = getFirestore(app);
    this.__user = new FirebaseUsersRepository(this.__db);
    this.__conversations = new FirebaseConversationsRepository(this.__db);
    this.__messages = new FirebaseMessagesRepository(this.__db);
  }

  get user(): FirebaseUsersRepository {
    return this.__user;
  }

  get conversations(): FirebaseConversationsRepository {
    return this.__conversations;
  }

  get messages(): FirebaseMessagesRepository {
    return this.__messages;
  }

  /**
   * Run a transaction with the provided callback function.
   * Validates that no batch writes are active before starting the transaction.
   *
   * @param {(transactionOptions: unknown) => Promise<T>} callback The callback function to execute within the transaction.
   * @returns {Promise<T>} A promise that resolves with the result of the transaction.
   * @throws {Error} if any repository has an active batch write
   */
  async transaction<T>(callback: (transactionOptions: unknown) => Promise<T>): Promise<T> {
    // Check if any batch writes are active in any repository
    if (this.__user.isBatchWriteActive()) {
      throw new Error(
        `Error:firebaseDatastore - Cannot start transaction. Active batch write detected in users repository. Commit or rollback the batch first.`,
      );
    }
    if (this.__conversations.isBatchWriteActive()) {
      throw new Error(
        `Error:firebaseDatastore - Cannot start transaction. Active batch write detected in conversations repository. Commit or rollback the batch first.`,
      );
    }
    if (this.__messages.isBatchWriteActive()) {
      throw new Error(
        `Error:firebaseDatastore - Cannot start transaction. Active batch write detected in messages repository. Commit or rollback the batch first.`,
      );
    }

    // Set transaction active on all repositories
    this.__user.setTransactionActive(true);
    this.__conversations.setTransactionActive(true);
    this.__messages.setTransactionActive(true);

    try {
      const result = await this.__db.runTransaction((transaction: FirebaseFirestore.Transaction) =>
        callback({ transaction }),
      );
      return result;
    } finally {
      // Reset transaction active on all repositories
      this.__user.setTransactionActive(false);
      this.__conversations.setTransactionActive(false);
      this.__messages.setTransactionActive(false);
    }
  }
}

export default FirebaseDatastore;
