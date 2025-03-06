/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

type NewMessage = {
  id?: string, 
  senderId: string, 
  content?: string, 
  time?: string, 
  timestamp?: number
};

/**
 * represents a message in a conversation
 */
class Message {
  /**
   * message id
   *
   * @type {string}
   */
  private _id: string;

  /**
   * sender id
   *
   * @type {string}
   */
  private _senderId: string;

  /**
   * content of the message
   *
   * @type {string}
   */
  private _content: string;

  /**
   * time of the message
   *
   * @type {string}
   */
  private _time: string;

  /**
   * timestamp of the message
   *
   * @type {number}
   */
  private _timestamp: number;

  /**
   * constructor
   *
   * @param {object}
   */
  constructor({
    id,
    senderId,
    content,
    time,
    timestamp,
  }: NewMessage) {
    this._id = id ?? new Date().getTime().toString();

    if (senderId == null) {
      throw new Error(
        `Error:Message - Cannot set the senderId, It must be a valid id, but received ${typeof senderId}`,
      );
    }
    this._senderId = senderId;
    this._content = content ?? "";
    this._time = time ?? new Date().toUTCString();
    this._timestamp = timestamp ?? new Date().getTime();
  }

  /**
   * =============================
   * getters
   * =============================
   */

  getId(): string {
    return this._id;
  }

  getSenderId(): string {
    return this._senderId;
  }

  getTime(): string {
    return this._time;
  }

  getContent(): string {
    return this._content;
  }

  /** ==================== */

  /**
   * convert this class to a plain object, in order to save in the database
   *
   * @returns {object} a plain object
   */
  toObj(): {
    id: string;
    senderId: string;
    time: string;
    timestamp: number;
    content: string;
  } {
    return {
      id: this._id,
      senderId: this._senderId,
      time: this._time,
      timestamp: this._timestamp,
      content: this._content,
    };
  }

  /**
   * set timestamp of the message
   *
   * @returns {void} void
   */
  setTimestamp(): void {
    this._timestamp = new Date().getTime();
  }

  /**
   * update message data
   *
   * @param {object} data message data
   * @returns {void} void
   */
  update({ time, content }: { time?: string; content?: string }): void {
    this._time = time ?? this._time; //... Create the time within the method
    this.setTimestamp();
    this._content = content ?? this._content;
  }

  /**
   * ============================
   * setters
   * ============================
   */

  /**
   * set message content
   *
   * @param {string} message
   * @returns {void} void
   * @throws {TypeError}
   */
  setContent(message: string): void {
    if (typeof message !== "string") {
      throw new TypeError(
        `Error:Message - Cannot set the message content, it must be a string, but received ${typeof message}.`,
      );
    }
    this._content = message;
  }
}

export {Message, NewMessage};
