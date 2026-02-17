/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type { Conversation } from '../../../Models/thread';
import type DatabaseResultSet from '../../utils/DatabaseResultSet';

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

export { ConversationsRepository };
