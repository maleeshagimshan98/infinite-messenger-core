/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type { Datastore } from '../datastore/interfaces/datastore';
import type { Conversation } from '../Models/thread';
import type { Message } from '../Models/message';
import type DatabaseResultSet from '../datastore/utils/DatabaseResultSet';

class MessageService {
  /**
   * Last message id in the conversation
   *
   * @type {string}
   */
  private __lastMessageId?: string;

  /**
   * User's conversations id
   *
   * @type {string}
   */
  private _conversationsId: string;

  /**
   * Datastore
   *
   * @type {Datastore}
   */
  private __datastore: Datastore;

  constructor(conversationsId: string, datastore: Datastore) {
    this._conversationsId = conversationsId;
    this.__datastore = datastore;
  }

  /**
   * get messages from the conversation
   *
   * @param {Conversation} conversation conversation instance
   * @returns {Promise<DatabaseResultSet<Message[]>>}
   */
  async getMessages(conversation: Conversation): Promise<DatabaseResultSet<Message[]>> {
    const messagesCollection: DatabaseResultSet<Message[]> = await this.__datastore.messages.getMessages(
      conversation.getId(),
    );
    const messages = messagesCollection.data();
    if (messagesCollection && messagesCollection.hasData() && messages) {
      conversation.setMessages(messages);
    }
    return messagesCollection;
  }

  /**
   * send messages
   * SAVES messages in the database,updates the conversation's last updated time
   *
   * @param {Conversation} conversation
   * @param {Message} message
   * @returns {Promise<void>} void
   */
  async sendMessage(conversation: Conversation, message: Message): Promise<void> {
    //... handle errors - set status of the message instance to pending/failed
    await this.__datastore.messages.setMessage(conversation.getId(), message).catch((error: Error) => {
      //... handle errors
      console.log(error);
    });
    conversation.setMessage(message);
  }

  /**
   * listen for new messages in firestore
   * if callback provided, it will be invoked everytime new messages comes/ messages updates
   *
   * @param {Conversation} conversation conversation instance
   * @param {(data: DatabaseResultSet<Message[]>) => void} callback callback function that should be invoked in everytime the messages update
   * @param {String|Number} limit messages limit
   * @returns {void} void
   * @throws {Error}
   */
  listen(conversation: Conversation, callback: (data: DatabaseResultSet<Message[]>) => void): void {
    if (typeof callback !== 'function') {
      throw new Error(
        `Error:Thread - cannot listen to thread updates. Callback must be a function, but received ${typeof callback}`,
      );
    }

    this.__datastore.messages.listenToMessages(
      conversation.getId(),
      (messages) => {
        const messagesCollection = messages.data();
        messagesCollection?.forEach((message: Message) => {
          conversation.setMessage(message);
        });
        callback(messages);
      },
      (error: Error) => {
        //... handle errors
        console.log(error);
      },
    );
  }

  /**
   * delete message
   *
   * @param {Conversation} conversation
   * @param {string} messageId
   * @returns {Promise<void>} void
   * @throws {Error}
   */
  async deleteMessage(conversation: Conversation, messageId: string): Promise<void> {
    const messages = conversation.getMessages();
    if (!Object.hasOwn(messages, messageId)) {
      throw new Error(`Error:Conversation - cannot delete message. Message not found`);
    }
    //... handle errors - set status of the message
    await this.__datastore.messages.deleteMessage(conversation.getId(), messageId).catch((error: Error) => {
      //... handle errors
      console.log(error);
    });
    conversation.deleteMessage(messageId);
    //... TODO - update last message
    // update conversation;
  }

  /**
   * stop listening to new messages in this conversation
   *
   * @param {Conversation} conversation conversation instance
   * @returns {void} void
   */
  detachListener(conversation: Conversation): void {
    conversation.setListening(false);
    this.__datastore.messages.detach(conversation.getId());
  }
}

export { MessageService };
