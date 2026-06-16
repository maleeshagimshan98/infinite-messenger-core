/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type { ConversationsRepository, MessagesRepository, UsersRepositroy } from './repository';

interface Datastore {
  /**
   * User repository.
   *
   * @type {UserRepository}
   */
  __user: UsersRepositroy;

  /**
   * Conversation repository.
   *
   * @type {ConversationRepository}
   */
  __conversations: ConversationsRepository;

  /**
   * Messages repository.
   *
   * @type {MessagesRepository}
   */
  __messages: MessagesRepository;

  /**
   * Get user repository
   *
   * @returns {UsersRepositroy} User repository
   */
  get user(): UsersRepositroy;

  /**
   * Get conversation repository
   *
   * @returns {ConversationsRepository} Conversation repository
   */
  get conversations(): ConversationsRepository;

  /**
   * Get messages repository
   *
   * @returns {MessagesRepository} Messages repository
   */
  get messages(): MessagesRepository;

  /**
   * Run a transaction with the provided callback function.
   *
   * @param {(transactionOptions: unknown) => Promise<T>} callback The callback function to execute within the transaction.
   * @returns {Promise<T>} A promise that resolves with the result of the transaction.
   */
  transaction<T>(callback: (transactionOptions: unknown) => Promise<T>): Promise<T>;
}

export { Datastore };
