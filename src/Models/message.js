/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

/**
 * represents a message in a conversation
 */
 class Message {
    /**
     * constructor
     * 
     * @param {object} 
     */
    constructor ({id,senderId,content,time})
    {
        this.id = id ?? new Date().getTime().toString();
        this.senderId = senderId;
        this.content = content ?? '';
        this.time = time ?? new Date().toUTCString();
    }

    /**
     * =============================
     * getters
     * =============================
     */

    getId() {
        return this.id;
    }

    getSenderId() {
        return this.senderId;
    }

    getTime() {
        return this.time;
    }

    getContent() {
        return this.content;
    }
    
    /** ==================== */
    
    /**
     * convert this class to a plain object, in order to save in the database
     * 
     * @returns {Object} a plain object
     */
    toObj() {
        return {
            id : this.id,
            senderId : this.senderId,
            time : this.time,
            content : this.content,
        };
    }

    /**
     * update message data
     * 
     * @param {Object} data message data
     * @returns {void} void 
     */
     update ({time,content}) {
        this.time = time ?? this.participants;
        this.content = content ?? this.lastUpdated;
    }

    /**
     * ============================
     * setters
     * ============================
     */

    /**
     * set message content
     * 
     * @param {String} message
     */
    setContent(message) {
        this.content = message;
    }
    

}

export default Message;