/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

const Message = require("./message")

/**
 * This class represents a thread - conversation of a user.
 * Handles the message retrieval, sending
 */
class Thread {

  /**
   * Datastore for the thread
   * 
   * @type {}
   */
  __datastore

  /**
   * Indicates if this tread is listening for new messages
   * 
   * @type {boolean}
   */
  __isListening

  /**
   * Last message id in the conversation
   * 
   * @type {string|number}
   */
  __lastMessageId

  /**
   * Thread id
   * 
   * @type {string}
   */
  _id

  /**
   * Participant ids in the conversation
   * 
   * @type {string[]}
   */
  _participants

  /**
   * 
   */
  _startedDate

  /**
   * 
   */
  _lastUpdated

  /**
   * 
   */
  _timestamp

  /**
   * 
   */
  _messages

  /**
   * constructor
   *
   * @param {object} data
   * @param {} datastore - datastore instance (firebase/mongodb)
   */
  constructor({ id, participants, startedDate, lastUpdated, timestamp, messages }, datastore) {
    this.__datastore = datastore
    this.__isListening = false
    this.__lastMessageId = null
    this._id = id
    this._participants = participants ?? []
    this._startedDate = startedDate ?? new Date().toUTCString()
    this._lastUpdated = lastUpdated ?? new Date().toUTCString()
    this._timestamp = timestamp ?? this._setTimestamp()
    this._messages = messages ?? {}
  }

  /**
   * =============================
   * getters
   * =============================
   */

  getId() {
    return this._id
  }

  getParticipants() {
    return this._participants
  }

  getStartedDate() {
    return this._startedDate
  }

  getLastUpdated() {
    return this._lastUpdated
  }

  getLastMessageId () {
    return this.__lastMessageId
  }

  getLastMessage() {
    return this._messages[this.__lastMessageId]
  }

  getMessages() {
    return this._messages
  }

  /** ======================= */

  /**
   * convert this class to a plain object, in order to save in the database
   *
   * @returns {object} a plain object
   */
  toObj() {
    return {
      id: this._id,
      participants: this._participants,
      started: this._startedDate,
      lastUpdated: this._lastUpdated,
      timestamp: this._timestamp,
      //messages : this.messages,
    }
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
  */
  __setLastMessageId(lastMessageId) {
    this.__lastMessageId = lastMessageId
  }

  /**
   * set participants in the conversation
   *
   * @param {string} id participant id
   * @returns {void} void
   */
  setParticipants(id) {
    this._participants.push(id)
  }

  /**
   * set last updated time in the conversation
   *
   * @param {string} lastUpdated
   * @returns {void} void
   */
  _setLastUpdated(lastUpdated) {
    this._lastUpdated = lastUpdated
    //... TODO - update last updated in the database too
  }

  /**
   * set the timestamp
   * 
   * @returns {void}
   */
  _setTimestamp() {
    this._timestamp = new Date().getTime()
  }

  /**
   * update conversation data - update conversation itself
   * **DOES NOT UPDATE DATABASE**
   *
   * @param {object} data conversation data
   * @returns {void} void
   */
  update({ participants, lastUpdated }) {
    this._participants = participants ?? this._participants //... check
    this._setLastUpdated(lastUpdated ?? this._lastUpdated)
  }

  /** ======================================= */

  /**
   * add new messages to  the conversation
   * if the message is already in ````this.messages````, updates the data.
   * updates the last message id in ````this.__lastMessage````
   *
   * DOES NOT save messages in the database.
   *
   * @param {Object} message
   * @returns {Message} message
   */
  __setMessages(message) {
    this._setTimestamp()
    this._setLastUpdated(new Date().toUTCString()) //... CHECK - update lastUpdated in the firestore too
    if (message.id && this._messages[message.id]) {
      this._messages[message.id].update(message)
      return this._messages[message.id]
    } else {
      let _message = new Message(message)
      this._messages[_message._id] = _message
      this.__setLastMessageId(_message._id)
      return _message
    }
  }

  /**
   * listen for new messages in firestore
   * if callback provided, it will be invoked everytime new messages comes/ messages updates
   *
   * @param {Function} callback callback function that should be invoked in everytime the messages update
   * @param {String|Number} limit messages limit
   * @returns {void} void
   */
  listen(callback) {
    this.__isListening = true
    this.__datastore.listenToCollection(this._id, (messages) => {
      //... refactor - has a tight coupling with firebase
      messages.forEach((message) => {
        this.__setMessages(message.data())
      })
    })

    if (callback) {
      callback(this._messages)
    }
  }

  /**
   * send messages
   * SAVES messages in the database,updates the conversation's last updated time
   *
   * @param {object} message
   * @returns {void} void
   */
  async sendMessage(message) {
    let messageObj = this.__setMessages(message)
    //... handle errors - set status of the message instance to pending/failed
    await this.__datastore.setMessage(this._id, messageObj)
  }

  /**
   * delete message
   * 
   * @param {string|number} messageId
   * @returns {void} void
   */
  async deleteMessage(messageId) {
    this._messages[messageId] = null
    //... handle errors - set status of the message
    await this.__datastore.deleteMessage(messageId)
    this._setLastUpdated(new Date().toUTCString())

    //... TODO - update last message
  }

  /**
   * stop listening to new messages in this conversation
   *
   * @returns {void} void
   */
  detachListener() {
    this.__isListening = false
    this.__datastore.detach(this._id)
  }
}

module.exports = Thread
