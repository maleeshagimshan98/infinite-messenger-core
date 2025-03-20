/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type { Firestore } from 'firebase-admin/firestore';
import type { Message } from '../../Models/message';
import type { User } from '../../Models/user';
import type DatabaseResult from '../utils/DatabaseResult';
import type DatabaseResultSet from '../utils/DatabaseResultSet';
import type { Conversation } from '../../Models/thread';

abstract class Repository {
  protected _db: Firestore;

  constructor(db: Firestore) {
    this._db = db;
  }
}

interface UsersRepositroy extends Repository {
  getUsers(start?: number): Promise<DatabaseResultSet<User[] | undefined>>;
  setUsers(users: User[]): Promise<void>;
  getUser(userId: string): Promise<DatabaseResult<User>>;
  setUser(user: User): Promise<void>;
}

interface ConversationsRepository extends Repository {
  getConversations(conversationsId: string, start?: number): Promise<DatabaseResultSet<Conversation[] | undefined>>;
  setConversation(user: User, conversation: Conversation): void;
  listenToConversations(
    conversationsId: string,
    callback: (data: unknown) => void,
    errorCallback: (error: Error) => void,
  ): void;
}

interface MessagesRepository extends Repository {
  getMessages(conversationId: string, start?: number): Promise<DatabaseResultSet<Message[] | undefined>>;
  setMessage(conversationId: string, messages: Message): Promise<void>;
  listenToMessages(
    conversationId: string,
    callback: (data: unknown) => void,
    errorCallback: (error: Error) => void,
  ): void;
}

export { Repository, UsersRepositroy, ConversationsRepository, MessagesRepository };
