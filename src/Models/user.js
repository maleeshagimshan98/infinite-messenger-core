/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

const Thread =  require("./thread");

/**
 * This class represents a user in the messaging system
 */
class User {

    /**
     * user id
     * 
     * @type {string}
     */
    _id

    /**
     * user name
     * 
     * @type {string}
     */
    _name

    /**
     * Indicates whether user is active or not
     * 
     * @type {boolean}
     */
    _isActive

    /**
     * User's last seen time
     * 
     * @type {string}
     */
    _lastSeen

    /**
     * Link to user's profile image
     * 
     * @type {string}
     */
    _profileImg

    /**
     * User's permissions
     * 
     * @type 
     */
    _permissions

    /**
     * Usre's unique id for his conversations
     * 
     * @type {string}
     */
    _conversationsId

    /**
     * Last conveersation id of the user
     * 
     * @type {string}
     */
    __lastConversationId

    /**
     * User's conversations
     * 
     * @type {array<Thread>}
     */
    __conversations

    /**
     * constructor
     * 
     * @param {object} user 
     * @param {Datastore} datastore - datastore object
     */
    constructor ({id,name,profileImg,lastSeen,permissions,conversationsId},datastore)
    {
        this.__datastore = datastore;
        this._id = id;
        this._name = name;
        this._isActive = true;
        this._lastSeen = lastSeen??'';
        this._profileImg = profileImg??''; 
        this._permissions = permissions??[];       
        this._conversationsId = conversationsId??'conv_'+this._id;
        /** conversation id of last received conversation */
        this.__lastConversationId = null;
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
        return this._id;
    }

    getName() {
        return this._name;
    }

    getProfileImg() {
        return this._profileImg;
    }

    getIsActive() {
        return this._isActive;
    }

    getLastSeen() {
        return this._lastSeen;
    }

    getConversationsId () {
        return this._conversationsId;
    }

    conversations () {
        return this.__conversations;
    }

    getPermissions () {
        return this._permissions;
    }    

    /** ============================== */
    
    /**
     * convert this class to a plain object, in order to save in the database
     * 
     * @returns {object} a plain object
     */
    toObj() {
        return {
            id : this._id,
            name : this._name,
            profileImg : this._profileImg,
            lastSeen : this._lastSeen,
            isActive : this._isActive,
            permissions : this._permissions,
            conversationsId : this._conversationsId,
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
        this._id = id;
    }

    /**
     * set profile image of user
     * 
     * @param {string} url - url of user's profile image
     * @returns {void} void
     */
    setProfileImg(url) {
        this._profileImg = url;
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
        this._isActive = status;
    }

    /**
     * set last seen time of user
     * 
     * @param {string} time - last seen time
     * @returns {void} void
     */
    async setLastSeen(time) {
        this._lastSeen = time;
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
        this._permissions.push(permission);
    }    

    /**
     * set last conversation id
     * 
     * @param {string} conversationId 
     * @returns {void}
     */
    __setLastConversation (conversationId) {
        this.__lastConversationId = conversationId;
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
        let conversations = await this.__datastore.conversations.getConversations(this._conversationsId,this.__lastConversationId);
        
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
        this.__datastore.conversations.listenToConversations(this._conversationsId,threads => {            
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
        this.__datastore.conversations.detach(this._conversationsId);
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