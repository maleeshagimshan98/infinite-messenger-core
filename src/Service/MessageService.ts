/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type { Datastore } from '../datastore/interfaces/datastore';
import { Conversation } from '../Models/thread';
import type { User } from '../Models/user';
import type { Message } from '../Models/message';
import { MessagesRepository } from '../datastore/interfaces/repository';
import DatabaseResultSet from '../datastore/utils/DatabaseResultSet';

class MessageService {
  /**
   * Indicates if this thread is listening for new messages
   *
   * @type {boolean}
   */
  private __isListening: boolean = false;

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
   * add new messages to  the conversation
   * if the message is already in ````this.messages````, updates the data.
   * updates the last message id in ````this.__lastMessage````
   *
   * DOES NOT save messages in the database.
   *
   * @param {Message | NewMessage} message
   * @returns {Message} message
   * @throws {Error}
   */
  __setMessages(message: Message): Message;
  __setMessages(message: Message): Message;
  __setMessages(message: Message | Message): Message {
    if (!(message instanceof Message) && Object.keys(message).length <= 0) {
      throw new Error(``);
    }

    if (message instanceof Message) {
      this._messages[message.getId()] = message;
      return message;
    } else {
      const _message = new Message(message);
      this._messages[_message.getId()] = _message;
      this.__lastMessageId(_message.getId());
      return _message;
    }
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
   * @param {string} conversationId
   * @param {Message} message
   * @returns {Promise<void>} void
   */
  async sendMessage(conversationId: string, message: Message): Promise<void> {
    const messageObj = this.__setMessages(message);
    //... handle errors - set status of the message instance to pending/failed
    await this.__datastore.messages.setMessage(conversationId, messageObj).catch((error: Error) => {
      //... handle errors
      console.log(error);
    });
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

    this.__isListening = true;
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
    await this.__datastore.messages.deleteMessage(messageId).catch((error: Error) => {
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
