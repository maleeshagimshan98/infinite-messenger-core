/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue, Firestore } from 'firebase-admin/firestore';
import firebaseUserRepository from "./firebase_users_repository";
import firebaseConversationRepository from "./firebase_conversations_repository";
import firebaseMessagesRepository from "./firebase_messages_repository";

class firebaseRepository {

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
  public __user: firebaseUserRepository;

  /**
   * Conversation repository.
   * 
   * @type {firebaseConversationRepository}
   */
  public __conversations: firebaseConversationRepository;

  /**
   * Messages repository.
   * 
   * @type {firebaseMessagesRepository}
   */
  public __messages: firebaseMessagesRepository;

  constructor(firebaseConfig: Record<string, any>) {
    const app = initializeApp({
      credential: cert(firebaseConfig),
    });
    this.__db = getFirestore();
    this.__user = new firebaseUserRepository(this.__db);
    this.__conversations = new firebaseConversationRepository(this.__db);
    this.__messages = new firebaseMessagesRepository(this.__db);
  }
}

export default firebaseRepository;
