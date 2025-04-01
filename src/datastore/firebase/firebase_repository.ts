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
}

export default FirebaseDatastore;
