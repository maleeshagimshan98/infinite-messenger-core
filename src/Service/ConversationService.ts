/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type { Datastore } from '../datastore/interfaces/datastore';
import type DatabaseResultSet from '../datastore/utils/DatabaseResultSet';
import type { Conversation } from '../Models/thread';
import type { User } from '../Models/user';

class ConversationService {
  /**
   * User's conversations id
   *
   * @type {string}
   */
  private _conversationsId: string;

  /**
   * List of conversations
   *
   * @type {Record<string, Conversation>
   */
  private __conversations: Record<string, Conversation> = {};

  /**
   * Last conversation id
   *
   * @type {string | undefined}
   */
  private __lastConversationId?: string;

  /**
   * Indicates if this is listening for new conversations
   *
   * @type {boolean}
   */
  private _isListening: boolean = false;

  /**
   * Last conversation id
   *
   * @type {string}
   */
  private __datastore: Datastore;

  constructor(conversationsId: string, datastore: Datastore) {
    this._conversationsId = conversationsId;
    this.__datastore = datastore;
  }

  /**
   * set last conversation id
   *
   * @param {string} conversationId
   * @returns {void}
   */
  private __setLastConversation(conversationId: string): void {
    if (typeof conversationId !== 'string') {
      throw new Error(
        `Error:User - cannot set the last conversation id. It must be a string but received ${typeof conversationId}`,
      );
    }
    this.__lastConversationId = conversationId;
    // =========================
    //... update datastore too
    // =========================
  }

  /**
   * Updates the conversation
   *
   * @param {Conversation} conversation
   * @return {void} void
   */
  private _updateConversation(conversation: Conversation): void {
    this.__conversations[conversation.getId()] = conversation;
  }

  /**
   * add conversations to conversations array
   * if conversation already exists, update data
   *
   * @param {Conversation} conversation conversations
   * @returns {Conversation} Conversation - inserted Conversation object
   */
  private __setConversations(conversation: Conversation): Conversation {
    this.__conversations[conversation.getId()] = conversation;
    this.__setLastConversation(conversation.getId());
    return conversation;
  }

  /**
   * start a new conversation
   * saves the new conversation in the database
   *
   * @param {Conversation} conversation Conversation data
   * @returns {Promise<Conversation>} created conversation object
   */
  async startConversation(user: User, conversation: Conversation): Promise<Conversation> {
    //... add the conversation to the other participants also
    await this.__datastore.conversations
      .addConversation(user.getConversationsId(), conversation)
      .catch((error: Error) => {
        //... handle error
        console.error(error);
      });
    await conversation.getParticipants().forEach((participant) => {
      this.__datastore.conversations.addConversation(participant, conversation).catch((error: Error) => {
        //... handle error
        console.error(error);
      });
    });
    //... TODO - commit the batch
    return this.__setConversations(conversation);
  }

  /**
   * get user's conversations from database
   *
   * @returns {Promise<Record<string, Conversation>>} user's conversations
   */
  async getConversations(): Promise<Record<string, Conversation>> {
    const conversations = await this.__datastore.conversations
      .getConversations(this._conversationsId, this.__lastConversationId)
      .catch((err: Error) => {
        //... handle error
        console.log(err);
      });

    //... if no conversation is found, conversations is false.
    if (conversations && conversations.hasData()) {
      const data = conversations.data();
      data?.forEach((conversation: Conversation) => {
        this.__setConversations(conversation);
      });
    }
    return this.__conversations;
  }

  /**
   * listen to user's new conversation updates
   *
   * @param {(data: DatabaseResultSet<Conversation[]>) => void} callback pass a callback to do something whenever user's conversations update. Updated conversations are provided as first argument
   * @returns {Promise<void>} Promise
   */
  async listenToConversations(callback: (data: DatabaseResultSet<Conversation[]>) => void): Promise<void> {
    this._isListening = true;
    this.__datastore.conversations.listenToConversations(
      this._conversationsId,
      (threads) => {
        const data = threads.data();
        data?.forEach((conversation: Conversation) => {
          this.__setConversations(conversation);
        });
        callback(threads);
      },
      (error) => {
        //... handle error
        console.log(error);
      },
    );
  }

  /**
   * delete a convesation
   *
   * @param {Conversation} conversation conversation to be deleted
   */
  deleteConversation(conversation: Conversation): void {
    this.__datastore.conversations.deleteConversation(this._conversationsId, conversation.getId());
  }

  /**
   * stop listening to a conversation
   *
   * @param {Conversation} conversation conversation id
   * @returns {void} void
   */
  detachListener(): void {
    this.__datastore.conversations.detach(this._conversationsId);
  }
}

export { ConversationService };
