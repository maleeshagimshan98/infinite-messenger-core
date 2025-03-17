/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import {
  getFirestore,
  Timestamp,
  FieldValue,
  Firestore,
} from 'firebase-admin/firestore';
import Datastore from '../interfaces/datastore';
import FirebaseUsersRepository from './firebase_users_repository';
import FirebaseConversationsRepository from './firebase_conversations_repository';
import FirebaseMessagesRepository from './firebase_messages_repository';

class FirebaseRepository implements Datastore {
  /**
   * Firestore database instance.
   *
   * @type {Firestore}
   */
  private __db: Firestore;

  /**
   * User repository.
   *
   * @type {firebaseUserRepository}
   */
  public __user: FirebaseUsersRepository;

  /**
   * Conversation repository.
   *
   * @type {firebaseConversationRepository}
   */
  public __conversations: FirebaseConversationsRepository;

  /**
   * Messages repository.
   *
   * @type {firebaseMessagesRepository}
   */
  public __messages: FirebaseMessagesRepository;

  constructor(firebaseConfig: string) {
    const app = initializeApp({
      credential: cert(firebaseConfig),
    });
    this.__db = getFirestore();
    this.__user = new FirebaseUsersRepository(this.__db);
    this.__conversations = new FirebaseConversationsRepository(this.__db);
    this.__messages = new FirebaseMessagesRepository(this.__db);
  }

  get user() {
    return this.__user;
  }

  get conversations() {
    return this.__conversations;
  }

  get messages() {
    return this.__messages;
  }
}

export default FirebaseRepository;
