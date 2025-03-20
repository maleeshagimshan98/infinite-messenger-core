/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type { Firestore } from 'firebase-admin/firestore';
import type { Message } from '../../Models/message';
import type { User } from '../../Models/user';
import type DatabaseResult from '../utils/DatabaseResult';
import type DatabaseResultSet from '../utils/DatabaseResultSet';

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
  getConversations(
    conversationsId: string,
    start: number | null,
  ): Promise<DatabaseResultSet>;
  setConversation(user: User, conversation: Record<string, unknown>): void;
  listenToConversations(
    conversationsId: string,
    callback: Function,
    errorCallback: Function,
  ): void;
}

interface MessagesRepository extends Repository {
  getMessages(
    conversationId: string,
    start: number | null,
  ): Promise<DatabaseResultSet>;
  setMessage(conversationId: string, messages: Message): Promise<void>;
  listenToMessages(
    conversationId: string,
    callback: Function,
    errorCallback: Function,
  ): void;
}

export {
  Repository,
  UsersRepositroy,
  ConversationsRepository,
  MessagesRepository,
};
