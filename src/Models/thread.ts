/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type { Message } from './message';

interface NewConversation {
  id: string;
  time?: string;
  participants: string[];
  startedDate?: string;
  lastUpdatedTime?: string;
  lastMessageId?: string;
  timestamp?: number;
  messages?: Record<string, Message>;
}

/**
 * This class represents a thread - conversation of a user.
 * Handles the message retrieval, sending
 */
class Conversation {
  /**
   * Thread id
   *
   * @type {string}
   */
  private _id: string;

  /**
   * Participant ids in the conversation
   *
   * @type {string[]}
   */
  private _participants: string[];

  /**
   * Started date of the conversation
   *
   * @type {string}
   */
  private _startedDate: string;

  /**
   * Last updated time of the conversation
   *
   * @type {string}
   */
  private _lastUpdatedTime: string;

  /**
   * Timestamp of the conversation
   *
   * @type {number}
   */
  private _timestamp: number;

  /**
   * Last message id in the conversation
   *
   * @type {string}
   */
  private __lastMessageId?: string;

  /**
   * Messages of the conversation
   *
   * @type {Record<string, Message>}
   */
  private _messages: Record<string, Message>;

  private _isListening: boolean = false;

  /**
   * constructor
   *
   * @param {NewConversation} data
   */
  constructor({ id, participants, startedDate, lastUpdatedTime, lastMessageId, timestamp, messages }: NewConversation) {
    if (lastMessageId) {
      this.__setLastMessageId(lastMessageId);
    }
    this._id = id;
    this._participants = participants ?? [];
    this._startedDate = startedDate ?? new Date().toUTCString();
    this._lastUpdatedTime = lastUpdatedTime ?? new Date().toUTCString();
    this._timestamp = timestamp ?? this._setTimestamp();
    this._messages = messages ?? {};
  }

  /**
   * =============================
   * getters
   * =============================
   */

  getId(): string {
    return this._id;
  }

  getParticipants(): string[] {
    return this._participants;
  }

  getStartedDate(): string {
    return this._startedDate;
  }

  getLastUpdatedTime(): string {
    return this._lastUpdatedTime;
  }

  getLastMessageId(): string | undefined {
    return this.__lastMessageId;
  }

  getLastMessage(): Message | null {
    return this.__lastMessageId ? (this._messages[this.__lastMessageId] ?? null) : null;
  }

  getMessages(): Record<string, Message> {
    return this._messages;
  }

  isListening(): boolean {
    return this._isListening;
  }

  /** ======================= */

  /**
   * convert this class to a plain object, in order to save in the database
   *
   * @returns {object} a plain object
   */
  toObj(): Record<string, unknown> {
    return {
      id: this._id,
      participants: this._participants,
      startedDate: this._startedDate,
      lastUpdatedTime: this._lastUpdatedTime,
      lastMessageId: this.__lastMessageId ?? '',
      timestamp: this._timestamp,
      // messages: this._messages,
    };
  }

  /**
   * ============================
   * setters
   * ============================
   */

  /**
   * Set the last message id
   *
   * @param {string|number} lastMessageId
   * @returns {void}
   * @throws {Error}
   */
  private __setLastMessageId(lastMessageId: string): void {
    if (typeof lastMessageId !== 'string' && typeof lastMessageId !== 'number') {
      throw new Error(
        `Error:Thread - Cannot set the lastMessageId. It must be a string or a number, but received ${typeof lastMessageId}`,
      );
    }
    this.__lastMessageId = lastMessageId;
  }

  /**
   * set participants in the conversation
   *
   * @param {string} id participant id
   * @returns {void} void
   * @throws {Error}
   */
  setParticipants(id: string): void {
    if (typeof id !== 'string') {
      throw new Error(`Error:Thread - Cannot set the participant id. It must be a string, but received ${typeof id}`);
    }
    this._participants.push(id);
  }

  /**
   * set last updated time in the conversation
   *
   * @param {string} lastUpdatedTime
   * @returns {void} void
   */
  private _setLastUpdatedTime(lastUpdatedTime: string): void {
    if (typeof lastUpdatedTime !== 'string') {
      throw new Error(
        `Error:Thread - Cannot set the last updated time. It must be a string or a number, but received ${typeof lastUpdatedTime}`,
      );
    }
    this._lastUpdatedTime = lastUpdatedTime;
    //... TODO - update last updated in the database too
  }

  /**
   * set the timestamp
   *
   * @returns {number}
   */
  private _setTimestamp(): number {
    this._timestamp = new Date().getTime();
    return this._timestamp;
  }

  /**
   * set messages in the conversation
   *
   * @param {Message[]} messages array of messages
   * @returns {void}
   */
  setMessage(messages: Message): void {
    this._messages[messages.getId()] = messages;
    this.__setLastMessageId(messages.getId());
    this._setLastUpdatedTime(new Date().toUTCString());
  }

  /**
   * set messages in the conversation
   *
   * @param {Message[]} messages array of messages
   * @returns {void}
   */
  setMessages(messages: Message[]): void {
    messages.forEach((message: Message) => {
      this._messages[message.getId()] = message;
    });
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      this.__setLastMessageId(lastMessage.getId());
    }
    this._setLastUpdatedTime(new Date().toUTCString());
  }

  /**
   * delete a message from the conversation
   *
   * @param {string} messageId
   * @returns {void}
   */
  deleteMessage(messageId: string): void {
    delete this._messages[messageId];
    this._setLastUpdatedTime(new Date().toUTCString());
  }

  /**
   * update conversation data - update conversation itself
   * **DOES NOT UPDATE DATABASE**
   *
   * @param {object} data conversation data
   * @returns {void} void
   */
  update(participants: string[]): void {
    this._participants = participants ?? this._participants; //... check
    this._setLastUpdatedTime(new Date().toUTCString());
  }

  sync(): void {
    //... TODO - update the database
  }

  /**
   * set the listening status of the conversation
   *
   * @param {boolean} isListening
   * @returns {void}
   */
  setListening(isListening: boolean): void {
    this._isListening = isListening;
  }
}

export { Conversation, NewConversation };
