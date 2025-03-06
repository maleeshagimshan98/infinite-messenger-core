/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

const firebaseMessagesRepository = require("../datastore/firebase/firebase_messages_repository");
import {Message, NewMessage} from "./message";

interface Conversation {
  id: string,
  time?: string,
  participants: string[],
  startedDate: string,
  lastUpdatedTime: string,
  lastMessageId?: string,
  timestamp: number,
  messages: Record<string, Message>
}

/**
 * This class represents a thread - conversation of a user.
 * Handles the message retrieval, sending
 */
class Thread {
  /**
   * Repository for the thread's messages
   *
   * @type {firebaseMessagesRepository}
   */
  private __messagesRepository: typeof firebaseMessagesRepository;

  /**
   * Indicates if this thread is listening for new messages
   *
   * @type {boolean}
   */
  private __isListening: boolean;

  /**
   * Last message id in the conversation
   *
   * @type {string}
   */
  private __lastMessageId?: string;

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
   * Messages of the conversation
   *
   * @type {Record<string, Message>}
   */
  private _messages: Record<string, Message>;

  /**
   * constructor
   *
   * @param {object} data
   * @param {} messagesRepository - datastore instance (firebaseMessagesRepository/ mongodbMessagesRepository)
   */
  constructor(
    { id, participants, startedDate, lastUpdatedTime, lastMessageId, timestamp, messages } : Conversation,
    messagesRepository: typeof firebaseMessagesRepository,
  ) {
    //... TODO - check datastore type is either firebaseMessagesRepository or mongodbMessagesRepository
    if (!(messagesRepository instanceof firebaseMessagesRepository)) {
      throw new Error(`Error:Thread - the datastore must be an instance of `);
    }
    this.__messagesRepository = messagesRepository;
    this.__isListening = false;
    if (lastMessageId) {
      this.__setLastMessageId(lastMessageId)
    };
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
    return (this.__lastMessageId) ? this._messages[this.__lastMessageId]?? null : null;
  }

  getMessages(): Record<string, Message> {
    return this._messages;
  }

  /** ======================= */

  /**
   * convert this class to a plain object, in order to save in the database
   *
   * @returns {object} a plain object
   */
  toObj(): Record<string, any> {
    return {
      id: this._id,
      participants: this._participants,
      startedDate: this._startedDate,
      lastUpdatedTime: this._lastUpdatedTime,
      lastMessageId: this.__lastMessageId,
      timestamp: this._timestamp,
      //messages : this.messages,
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
  __setLastMessageId(lastMessageId: string): void {
    if (
      typeof lastMessageId !== "string" &&
      typeof lastMessageId !== "number"
    ) {
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
    if (typeof id !== "string" && typeof id !== "number") {
      throw new Error(
        `Error:Thread - Cannot set the participant id. It must be a string or a number, but received ${typeof id}`,
      );
    }
    this._participants.push(id);
  }

  /**
   * set last updated time in the conversation
   *
   * @param {string} lastUpdatedTime
   * @returns {void} void
   */
  _setLastUpdatedTime(lastUpdatedTime: string): void {
    if (typeof lastUpdatedTime !== "string") {
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
  _setTimestamp(): number {
    this._timestamp = new Date().getTime();
    return this._timestamp;
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
    this._setTimestamp();
  }

  sync(): void {
    //... TODO - update the database
  }

  /** ======================================= */

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
  __setMessages(message: NewMessage): Message;
  __setMessages(message: Message | NewMessage): Message {
    if (!(message instanceof Message) && Object.keys(message).length <= 0) {
      throw new Error(``);
    }

    if (message instanceof Message) {
      this._messages[message.getId()] = message;
      return message;
    } else {
      let _message = new Message(message);
      this._messages[_message.getId()] = _message;
      this.__setLastMessageId(_message.getId());
      return _message;
    }
  }

  /**
   * listen for new messages in firestore
   * if callback provided, it will be invoked everytime new messages comes/ messages updates
   *
   * @param {Function} callback callback function that should be invoked in everytime the messages update
   * @param {String|Number} limit messages limit
   * @returns {void} void
   * @throws {Error}
   */
  listen(callback: Function): void {
    if (typeof callback !== "function") {
      throw new Error(
        `Error:Thread - cannot listen to thread updates. Callback must be a function, but received ${typeof callback}`,
      );
    }

    this.__isListening = true;
    this.__messagesRepository.listenToCollection(
      this._id,
      (messages: Message[]) => {
        messages.forEach((message: Message) => {
          this.__setMessages(message);
          if (callback) {
            callback(message, this._messages);
          }
        });
      },
      (error: Error) => {
        //... handle errors
      },
    );
    // this.update();
  }

  /**
   * send messages
   * SAVES messages in the database,updates the conversation's last updated time
   *
   * @param {Message} message
   * @returns {Promise<void>} void
   */
  async sendMessage(message: Message): Promise<void> {
    let messageObj = this.__setMessages(message);
    //... handle errors - set status of the message instance to pending/failed
    await this.__messagesRepository
      .setMessage(this._id, messageObj)
      .catch((error: Error) => {
        //... handle errors
      });
    // this.update();
  }

  /**
   * delete message
   *
   * @param {string} messageId
   * @returns {Promise<void>} void
   * @throws {Error}
   */
  async deleteMessage(messageId: string): Promise<void> {
    if (!Object.hasOwn(this._messages, messageId)) {
      throw new Error(`Error:Thread -  cannot delete message.`);
    }
    //... handle errors - set status of the message
    await this.__messagesRepository.deleteMessage(messageId).catch((error: Error) => {
      //... handle errors
    });
    delete this._messages[messageId]
    // this.update();
    //... TODO - update last message
  }

  /**
   * stop listening to new messages in this conversation
   *
   * @returns {void} void
   */
  detachListener(): void {
    this.__isListening = false;
    this.__messagesRepository.detach(this._id);
  }
}

export {Thread, Conversation};