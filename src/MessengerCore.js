/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import firebase from "./datastore/firebase";
//import Mongodb from "./datastore/mongodb";
import User from "./Models/user";

/**
 * Messenger core library
 * 
 * controls user's conversations, messages
 */
class MessengerCore {

    /**
     * constructor
     * 
     * @param {Object} 
     */
 constructor ({dbDriver,dbConfig}) {
     this.__datastore;
     this.__initDataStore(dbDriver,dbConfig);
 }

 /**
  * initialise the user
  * 
  * @param {String} userId user's id
  * @returns {User|Boolean} user object or false in failure
  */
 async initUser (userId) {    
    let user = await this.__getUser(userId);
    if (!user) {
        return false;
    }
    this.user = user;
    await this.user.setIsActive(true); 
    return user;    
 }

 /**
  * initialise datastore
  * 
  * @param {String} dbDriver 
  * @param {Object} dbConfig 
  * @returns {void} void
  */
 __initDataStore (dbDriver,dbConfig) {
     if (dbDriver == 'firebase') {
        this.__datastore = new firebase(dbConfig);
     }
     if (dbDriver == 'mongodb') {
         //this.__datastore = new Mongodb(dbConfig);
         //... mongodb
     }
     else {
         //... throw error
     }
 }

 /**
  * create and save new user in the datastore
  * 
  * @param {Object} user 
  */
 async newUser (userObj) {
     let user = new User(userObj,this.__datastore);
     await this.__datastore.setDocument('users',user.getId(),user.toObj());
     this.user = user;
 }

 /**
  * get a user from the datastore
  * 
  * @param {String} userId user's id
  * @returns {User}
  */
 async __getUser (userId) {
     let user = await this.__datastore.doc('users',userId);
     if (user) {
         return new User(user,this.__datastore);
     }
     else {
         //... throw error
     }
 } 

 /**
  * initialise user's conversations
  * 
  * @returns {void} void
  */
 async initThreads () {
     await this.user.getConversations();     
 }

 /**
  * listen to a user's conversation updates
  * 
  * @param {Function} callback callback function that should be called whenever conversations update
  * @returns {void} void
  */
 listenToConversations (callback) {
     this.user.listenToConversations( threads => {
         callback(threads);
     });
 }

 /**
  * create a new conversation
  * 
  * @param {Array} participants array of participating users
  * @param {Object} thread thread data
  * @returns {void} void
  */
 newThread (participants,thread) {
     let users = [];
     thread.participants = [this.user.getId()];
     
     participants.forEach(participant => {
         thread.participants.push(participant.id);
         if (participant.id !== this.user.getId()) {
            users.push(new User(participant,this.__datastore));
         }
     });

     this.__datastore.batch();
     users.forEach(user => {
         user.setConversations(thread);
     });

     let conversation = this.user.setConversations(thread);
     this.__datastore.commit();
 }

}

export default MessengerCore;