/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import {
  ConversationsRepository,
  MessagesRepository,
  UsersRepositroy,
} from './repository';

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
}

export default Datastore;
