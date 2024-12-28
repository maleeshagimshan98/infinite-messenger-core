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
   * Started date of the conversation
   * 
   * @type {string}
   */
  _startedDate

  /**
   * Last updated time of the conversation
   * 
   * @type {string}
   */
  _lastUpdatedTime

  /**
   * Timestamp of the conversation
   * 
   * @type {number}
   */
  _timestamp

  /**
   * Messages of the conversation
   * 
   * @type {array<Message>}
   */
  _messages

  /**
   * constructor
   *
   * @param {object} data
   * @param {} datastore - datastore instance (firebase/mongodb)
   */
  constructor({ id, participants, startedDate, lastUpdatedTime, timestamp, messages }, datastore) {
    if (typeof datastore !== 1) {
      throw new Error(`Error:Thread - the datastore must be an instance of `)
    }
    this.__datastore = datastore
    this.__isListening = false
    this.__lastMessageId = null
    this._id = id
    this._participants = participants ?? []
    this._startedDate = startedDate ?? new Date().toUTCString()
    this._lastUpdatedTime = lastUpdatedTime ?? new Date().toUTCString()
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

  getLastUpdatedTime() {
    return this._lastUpdatedTime
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
      startedDate: this._startedDate,
      lastUpdatedTime: this._lastUpdatedTime,
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
   * @throws {Error}
  */
  __setLastMessageId(lastMessageId) {
    if ((typeof lastMessageId !== 'string') && (typeof lastMessageId !== 'number')) {
      throw new Error(`Error:Thread - Cannot set the lastMessageId. It must be a string or a number, but received ${typeof lastMessageId}`)
    }
    this.__lastMessageId = lastMessageId
  }

  /**
   * set participants in the conversation
   *
   * @param {string} id participant id
   * @returns {void} void
   * @throws {Error}
   */
  setParticipants(id) {
    if ((typeof id !== 'string') && (typeof id !== 'number')) {
      throw new Error(`Error:Thread - Cannot set the participant id. It must be a string or a number, but received ${typeof id}`)
    }
    this._participants.push(id)
  }

  /**
   * set last updated time in the conversation
   *
   * @param {string} lastUpdatedTime
   * @returns {void} void
   */
  _setLastUpdatedTime(lastUpdatedTime) {
    if ((typeof lastUpdatedTime !== 'string')) {
      throw new Error(`Error:Thread - Cannot set the last updated time. It must be a string or a number, but received ${typeof lastMessageId}`)
    }
    this._lastUpdatedTime = lastUpdatedTime
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
  _update({ participants, lastUpdated }) {
    this._participants = participants ?? this._participants //... check
    this._setLastUpdatedTime(lastUpdated ?? this._lastUpdatedTime)
    this._setTimestamp()
  }

  /** ======================================= */

  /**
   * add new messages to  the conversation
   * if the message is already in ````this.messages````, updates the data.
   * updates the last message id in ````this.__lastMessage````
   *
   * DOES NOT save messages in the database.
   *
   * @param {Message | object} message
   * @returns {Message} message
   * @throws {Error}
   */
  __setMessages(message) {
    if ((typeof message !== Message) && Object.keys(message).length <= 0) {
      throw new Error(``)
    }

    if (Object.hasOwn(this._messages, message.getId())) {
      _message = this._messages[message.getId()]
      _message.update(message)
      return _message
    } else {
      let _message = new Message(message)
      this._messages[_message.getId()] = _message
      this.__setLastMessageId(_message.getId())
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
   * @throws {Error}
   */
  listen(callback) {

    if (typeof callback !== 'function') {
      throw new Error(`Error:Thread - cannot listen to thread updates. Callback must be a function, but received ${typeof callback}`)
    }

    this.__isListening = true
    this.__datastore.listenToCollection(this._id, (messages) => {
      //... refactor - has a tight coupling with firebase
      messages.forEach((message) => {
        this.__setMessages(message.data())
        this._update()
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
    this._update()
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
    if ((typeof messageId == null) || !Object.hasOwn(this._messages, messageId)) {
      throw new Error(`Error:Thread -  cannot delete message.`)
    }
    this._messages[messageId] = null
    //... handle errors - set status of the message
    await this.__datastore.deleteMessage(messageId)
    this._update()
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
