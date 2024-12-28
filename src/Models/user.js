/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

const Thread =  require("./thread");

/**
 * This class represents a user in the messaging system
 */
class User {
    /**
     * constructor
     * 
     * @param {object} user 
     * @param {Datastore} datastore - datastore object
     */
    constructor ({id,name,profileImg,lastSeen,permissions,conversationsId},datastore)
    {
        this.__datastore = datastore;
        this.id = id;
        this.name = name;
        this.isActive = true;
        this.lastSeen = lastSeen??'';
        this.profileImg = profileImg??''; 
        this.permissions = permissions??[];       
        this.conversationsId = conversationsId??'conv_'+this.id;
        /** conversation id of last received conversation */
        this.__lastConversation = null;
        this.__conversations = {};

        /** async calls */
        this.setLastSeen(lastSeen??Date.now());
    }

    /**
     * =============================
     * getters
     * =============================
     */

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getProfileImg() {
        return this.profileImg;
    }

    getIsActive() {
        return this.isActive;
    }

    getLastSeen() {
        return this.lastSeen;
    }

    getConversationsId () {
        return this.conversationsId;
    }

    conversations () {
        return this.__conversations;
    }

    getPermissions () {
        return this.permissions;
    }    

    /** ============================== */
    
    /**
     * convert this class to a plain object, in order to save in the database
     * 
     * @returns {object} a plain object
     */
    toObj() {
        return {
            id : this.id,
            name : this.name,
            profileImg : this.profileImg,
            lastSeen : this.lastSeen,
            isActive : this.isActive,
            permissions : this.permissions,
            conversationsId : this.conversationsId,
        };
    }

    /**
     * ============================
     * setters
     * ============================
     */

    /**
     * set user's id
     * 
     * @param {string} id user's id
     * @returns {void} void
     */
    setId (id) {
        this.id = id;
    }

    /**
     * set profile image of user
     * 
     * @param {string} url - url of user's profile image
     * @returns {void} void
     */
    setProfileImg(url) {
        this.profileImg = url;
    }
    
    /**
     * set active status of user
     * also makes changes in remote database
     * 
     * @param {boolean} status - active status of user's
     * @returns {Promise<void>} void
     */
    async setIsActive (status) {
        //... TODO - check - update the database too
        this.isActive = status;
    }

    /**
     * set last seen time of user
     * 
     * @param {string} time - last seen time
     * @returns {void} void
     */
    async setLastSeen(time) {
        this.lastSeen = time;
        // =========================
        //... update datastore too
        // ========================
    }

    /**
     * set user's permissions
     * 
     * @param {String} permission - permission
     * @returns {void} void
     */
     setPermissions (permission) {
        this.permissions.push(permission);
    }    

    /**
     * set last conversation id
     * 
     * @param {string} conversationId 
     * @returns {void}
     */
    __setLastConversation (conversationId) {
        this.__lastConversation = conversationId;
        // =========================
        //... update datastore too
        // =========================
    }

    /**
     * add conversations to conversations array
     * if conversation already exists, update data
     * 
     * @param {object} conversations conversations
     * @returns {Thread} thread - inserted thread object
     */
     __setConversations (conversation) {
        if (this.__conversations[conversation.id]) {
            this.__conversations[conversation.id].update(conversation);
        }
        else{
            this.__conversations[conversation.id] = new Thread(conversation,this.__datastore.messages);
            this.__setLastConversation(conversation.id); 
        }
        return this.__conversations[conversation.id];                
    }    

    /**
     * get user's conversations from database
     * 
     * @returns {Promise<object>} user's conversations
     */
    async getConversations () {
        let conversations = await this.__datastore.conversations.getConversations(this.conversationsId,this.__lastConversation);
        
        //... if no conversation is found, conversations is false.
        if (conversations) {
            conversations.forEach(conversation => {
                this.__setConversations(conversation);
            });        
        }
        return this.__conversations;       
    }

    /**
     * listen to user's new conversation updates
     * 
     * @param {Function} callback pass a callback to do something whenever user's conversations update. Updated conversations are provided as first argument
     * @returns {Promise<void>} Promise
     */
    async listenToConversations (callback) {
        //... default threads limit 25 used
        this.__datastore.conversations.listenToConversations(this.conversationsId,threads => {            
            threads.forEach( thread => {
                this.__setConversations(thread.data());
            });
            callback(threads);
        });        
    }

    /**
     * stop listening to a conversation
     * 
     * @returns {void} void
     */
    detachListener () {
        this.__datastore.conversations.detach(this.conversationsId);
    }
    
    /**
     * start a new conversation
     * saves the new conversation in the database
     * 
     * @param {Object} thread thread data
     * @returns {Promise<Thread>} created conversation object 
     */
    async startConversation (thread) {
        let conversation = this.__setConversations(thread);   
        await this.__datastore.conversations.setConversation(conversation);
        return conversation;
    }

    /**
     * update the user's data in datastore
     * 
     * @returns {Promise<void>} Promise
     */
     async updateUser () {        
        await this.__datastore.user.updateUser(this); //... check
    }
};

module.exports =  User;