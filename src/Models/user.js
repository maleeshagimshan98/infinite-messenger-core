/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import Thread from "./thread";

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
     * @returns {Object} a plain object
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
     * @param {String} id user's id
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
     * @param {string} status - active status of user's
     * @returns {void} void
     */
    async setIsActive (status) {
        this.isActive = status;
        await this.__datastore.updateDocument('users',this.id,this.toObj());
    }

    /**
     * set last seen time of user
     * 
     * @param {string} time - last seen time
     * @returns {void} void
     */
    async setLastSeen(time) {
        this.lastSeen = time;
        await this.__datastore.updateDocument('users',this.id,this.toObj());
    }

    /**
     * add conversations to conversations array
     * if conversation already exists, update data
     * 
     * @param {mixed} conversations conversations
     * @returns {Thread} thread - inserted thread object
     */
    __setConversations (conversation) {
        if (this.__conversations[conversation.id]) {
            this.__conversations[conversation.id].update(conversation);
        }
        else{
            this.__conversations[conversation.id] = new Thread(conversation,this.__datastore); 
        }
        return this.__conversations[conversation.id];                
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
     * get user's conversations from database
     * 
     * @returns {Object} user's conversations
     */
    async getConversations () {
        let conversations = await this.__datastore.collection(this.conversationsId); //... default limit = 25
        
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
     * @returns {void} void
     */
    async listenToConversations (callback) {
        //... default threads limit 25 used
        this.__datastore.listenToCollection(this.conversationsId,25, threads => {            
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
        this.__datastore.detach('collection',this.conversationsId);
    }
    
    /**
     * start a new coversation
     * saves the new conversation in the database
     * 
     * @param {Object} thread thread data
     * @returns {Thread} created conversation object 
     */
    async setConversations (thread) {
        let conversation = this.__setConversations(thread);        
        await this.__datastore.setDocument(this.conversationsId,conversation.id,conversation.toObj());
        return conversation;
    }


};

export default User;