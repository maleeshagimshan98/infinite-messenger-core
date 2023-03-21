/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

 const Message = require("./message");

 /**
  * This class represents a thread - conversation of a user.
  * Handles the message retrieval, sending
  */
 class Thread {
    /**
     * constructor
     * 
     * @param {object} data
     * @param {} datastore - datastore instance (firebase/mongodb)
     */
    constructor ({id,participants,started,lastUpdated,timestamp,messages},datastore)
    {
        this.__datastore = datastore;
        this.__isListening = false;
        this.__lastMessage = null;
        this.id = id;
        this.participants = participants ?? [];
        this.started = started ?? new Date().toUTCString();
        this.lastUpdated = lastUpdated ?? new Date().toUTCString();
        this.timestamp = timestamp ?? this.setTimestamp();
        this.messages = messages ?? {};
    }

    /**
     * =============================
     * getters
     * =============================
     */

    getId() {
        return this.id;
    }

    getParticipants() {
        return this.participants;
    }

    getStarted() {
        return this.started;
    }

    getLastUpdated() {
        return this.lastUpdated;
    }

    getLastMessage () {
        return this.__lastMessage;
    }

    getMessages() {
        return this.messages;
    }
    
    /** ======================= */
    
    /**
     * convert this class to a plain object, in order to save in the database
     * 
     * @returns {Object} a plain object
     */
    toObj() {
        return {
            id : this.id,
            participants : this.participants,
            started : this.started,
            lastUpdated : this.lastUpdated,
            timestamp : this.timestamp,
            //messages : this.messages,
        };
    }

    /**
     * ============================
     * setters
     * ============================
     */

    __setLastMessage (lastMessageId) {
        this.__lastMessage = lastMessageId;
    }    

    /**
     * set participants in the conversation
     * 
     * @param {String} name
     * @returns {void} void
     */
    setParticipants(name) {
        this.participants.push(name);
    }    

     /**
     * set last updated time in the conversation
     * 
     * @param {String} lastUpdated
     * @returns {void} void
     */
    setLastUpdated(lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    setTimestamp () {
        this.timestamp = new Date().getTime();
    }

    /**
     * update conversation data - update conversation itself
     * **DOES NOT UPDATE DATABASE**
     * 
     * @param {Object} data conversation data
     * @returns {void} void 
     */
     update ({participants,lastUpdated}) {
        this.participants = participants ?? this.participants;
        this.lastUpdated = lastUpdated ?? this.lastUpdated;
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
    __setMessages (message) {
        this.setTimestamp();
        this.setLastUpdated(new Date().toUTCString()); //... CHECK - update lastUpdated in the firestore too        
        if (message.id && this.messages[message.id]) {
            this.messages[message.id].update(message); 
            return this.messages[message.id];           
        }
        else {
            let _message = new Message(message);
            this.messages[_message.id] = _message;
            this.__setLastMessage(_message.id);
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
     */
     listen (callback = null) {
        this.__isListening = true;
        this.__datastore.listenToCollection(this.id,messages => {
            messages.forEach( message => {
                this.__setMessages(message.data());
            });
        });

        if (callback) {
            callback(this.messages);
        }
    }

    /**
     * send messages
     * SAVES messages in the database,updates the conversation's last updated time
     * 
     * @param {Object} message
     * @returns {void} void
     */
    async sendMessage (message) {
        let messageObj = this.__setMessages(message);
        await this.__datastore.setMessage(this.id,messageObj);
    }    

    /**
     * delete message
     */
    async deleteMessage (messageId) {
        this.messages[messageId] = null;
        await this.__datastore.deleteMessage(messageId);
    }

    /**
     * stop listening to new messages in this conversation
     * 
     * @returns {void} void
     */
    detachListener () {
        this.__isListening = false;
        this.__datastore.detach(this.id);
    }
}

module.exports = Thread;