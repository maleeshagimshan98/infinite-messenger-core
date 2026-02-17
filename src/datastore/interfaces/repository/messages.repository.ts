/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type { Message } from '../../../Models/message';
import type DatabaseResultSet from '../../utils/DatabaseResultSet';

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

export { MessagesRepository };
