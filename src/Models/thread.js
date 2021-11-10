/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

 import Message from "./message";

 /**
  * This class represents a thread - conversation of a user.
  * Handles message retrieval, sending
  */
 class Thread {
    /**
     * constructor
     * 
     * @param {object} data
     * @param {} datastore - datastore instance (firebase/mongodb)
     */
    constructor ({id,participants,started,lastUpdated,messages},datastore)
    {
        this.__datastore = datastore;
        this.__isListening = false;
        this.id = id;
        this.participants = participants ?? [];
        this.started = started ?? new Date().toUTCString();
        this.lastUpdated = lastUpdated ?? new Date().toUTCString();
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

    getLstUpdated() {
        return this.lastUpdated;
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
            //messages : this.messages,
        };
    }

    /**
     * ============================
     * setters
     * ============================
     */

    /**
     * update conversation data
     * 
     * @param {Object} data conversation data
     * @returns {void} void 
     */
    update ({participants,lastUpdated}) {
        this.participants = participants ?? this.participants;
        this.lastUpdated = lastUpdated ?? this.lastUpdated;
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

     /**
     * add new messages to  the conversation
     * if the message is already in ````this.messages````, updates the data.
     * 
     * DOES NOT save messages in the database.
     * 
     * @param {Object} message
     * @returns {void} void
     */
    setMessages (message) {
        this.setLastUpdated(new Date().toUTCString()); //... CHECK - update lastUpdated in the firestore too
        if (message.id && this.messages[message.id]) {
            this.messages[message.id].update(message); 
            return this.messages[message.id];           
        }
        else {
            let _message = new Message(message);
            this.messages[_message.id] = _message;
            return _message;
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
        let messageObj = this.setMessages(message);
        await this.__datastore.setDocument(this.id,messageObj.getId(),messageObj.toObj());
    }

    /**
     * delete message
     */
    async deleteMessage () {

    }

    /**
     * listen for new messages in firestore
     * if callback provided, it will be invoked everytime new messages comes/ messages updates
     * 
     * @param {Function} callback callback function that should be invoked in everytime the messages update
     * @param {String|Number} limit messages limit
     * @returns {void} void
     */
    listen (callback = null,limit = 25) {
        this.__isListening = true;
        this.__datastore.listenToCollection(this.id,limit, messages => {
            messages.forEach( message => {
                this.setMessages(message.data());
            });
        });

        if (callback) {
            callback(this.messages);
        }
    }

    /**
     * stop listening to new messages in this conversation
     * 
     * @returns {void} void
     */
    detachListener () {
        this.__isListening = false;
        this.__datastore.detach('collections',this.id);
    }
    


}

export default Thread;