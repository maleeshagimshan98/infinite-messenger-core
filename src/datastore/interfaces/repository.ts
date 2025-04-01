/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type { Message } from '../../Models/message';
import type { User } from '../../Models/user';
import type DatabaseResult from '../utils/DatabaseResult';
import type DatabaseResultSet from '../utils/DatabaseResultSet';
import type { Conversation } from '../../Models/thread';

interface UsersRepositroy {
  getUsers(start?: string): Promise<DatabaseResultSet<User[]>>;
  setUsers(users: User[]): Promise<void>;
  getUser(userId: string): Promise<DatabaseResult<User>>;
  setUser(user: User): Promise<void>;
  updateUser(user: User): Promise<void>;
  deleteUser(user: User): Promise<void>;
}

interface ConversationsRepository {
  getConversations(conversationsId: string, start?: string): Promise<DatabaseResultSet<Conversation[]>>;
  addConversation(conversationsId: string, conversation: Conversation): Promise<void>;
  listenToConversations(
    conversationsId: string,
    callback: (data: DatabaseResultSet<Conversation[]>) => void,
    errorCallback: (error: Error) => void,
  ): void;
  deleteConversation: (userConversationId: string, conversationId: string) => Promise<void>;
  detach(conversationId: string): void;
}

interface MessagesRepository {
  getMessages(conversationId: string, start?: string): Promise<DatabaseResultSet<Message[]>>;
  setMessage(conversationId: string, messages: Message): Promise<void>;
  listenToMessages(
    conversationId: string,
    callback: (data: DatabaseResultSet<Message[]>) => void,
    errorCallback: (error: Error) => void,
  ): void;
  deleteMessage(conversationId: string, messageId: string): Promise<void>;
  detach(listner: string): void;
}

export { UsersRepositroy, ConversationsRepository, MessagesRepository };
