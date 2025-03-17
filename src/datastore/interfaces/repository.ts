/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import { Message } from '../../Models/message';
import { User } from '../../Models/user';

interface Repository {}

interface UsersRepositroy extends Repository {
  getUsers(start: number | null): Promise<Record<string, any>[]>;
  setUsers(users: Record<string, any>[]): Promise<void>;
  getUser(userId: string): Promise<Record<string, any>>;
  setUser(user: User): Promise<void>;
}

interface ConversationsRepository extends Repository {
  getConversations(
    conversationsId: string,
    start: number | null,
  ): Promise<Record<string, any>[]>;
  setConversation(user: User, conversation: Record<string, any>): void;
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
  ): Promise<Record<string, any>[]>;
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
