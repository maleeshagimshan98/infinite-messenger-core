/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

/**
 * represents a message in a conversation
 */
class Message {

    /**
     * message id
     * 
     * @type {string}
     */
    _id

    /**
     * sender id
     * 
     * @type {string}
     */
    _senderId

    /**
     * content of the message
     * 
     * @type {string}
     */
    _content

    /**
     * time of the message
     * 
     * @type {string}
     */
    _time

    /**
     * timestamp of the message
     * 
     * @type {number}
     */
    _timestamp

  /**
   * constructor
   *
   * @param {object}
   */
  constructor({ id, senderId, content, time, timestamp }) {
    this._id = id ?? new Date().getTime().toString()

    if (senderId == null) {
        throw new Error(`Error:Message - Cannot set the senderId, It must be a valid id, but received ${typeof senderId}`)
    }
    this._senderId = senderId
    this._content = content ?? ""
    this._time = time ?? new Date().toUTCString()
    this._timestamp = timestamp ?? new Date().getTime()
  }

  /**
   * =============================
   * getters
   * =============================
   */

  getId() {
    return this._id
  }

  getSenderId() {
    return this._senderId
  }

  getTime() {
    return this._time
  }

  getContent() {
    return this._content
  }

  /** ==================== */

  /**
   * convert this class to a plain object, in order to save in the database
   *
   * @returns {object} a plain object
   */
  toObj() {
    return {
      id: this._id,
      senderId: this._senderId,
      time: this._time,
      timestamp: this._timestamp,
      content: this._content,
    }
  }

  /**
   * set tmiestamp of the message
   *
   * @returns {void} void
   */
  setTimestamp() {
    this._timestamp = new Date().getTime()
  }

  /**
   * update message data
   *
   * @param {object} data message data
   * @returns {void} void
   */
  update({ time, timestamp, content }) {
    this._time = time ?? this._time //... Create the time within the method
    this._timestamp = timestamp ?? this.setTimestamp() //... Check - just call setTImestamp()
    this._content = content ?? this._content
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
  setContent(message) {
    if (typeof message !== 'string') {
        throw new TypeError(`Error:Message - Cannot set the message content, it must be a string, but received ${typeof message}.`)
    }
    this._content = message
  }
}

module.exports = Message
