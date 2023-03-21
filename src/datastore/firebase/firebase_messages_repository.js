/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

const firebaseRepositoryBase = require ("./firebase_repository_base");

class firebaseMessagesRepository extends firebaseRepositoryBase {

    constructor (db) {
        super(db);
    }

    /**
     * get messages from firebase
     * get results from given point if start is provided
     * 
     * @param {String} conversationId - conversation id
     * @param {String|Null} start - starting point
     * @returns {Array | Boolean}
     */
    async getMessages (conversationId,start=null) {
        collectionQuery = this.__buildCollectionQuery(conversationId,'timestamp','desc',start);
        let conversations = await collectionQuery.get();
        return conversations.empty ? false : this.__getDataFromCollection(conversations);
    }

    /**
     * add a message to messages collection
     * updates the message if message exists
     * 
     * @param {String} conversationId - conversation id
     * @param {Message} message message object
     * @returns {void} void
     */
    async setMessage (conversationId,message) {
        await this.db.collection(conversationId).doc(message.getId()).set(message.toObj(),{merge : true});
    }

    /**
      * listen to new messages (latest 25)
      * 
      * @param {String} conversationId conversation's id
      * @param {Function} callback callback function that should be invoked whenever the document change
      */
    listenToMessages (conversationId,callback) {
        let collectionQuery = this.db.collection(conversationsId).orderBy("timestamp","desc").limit(this.limit);
        this.__listeners[conversationId] = collectionQuery.onSnapshot(
            snapshot => {
               callback(snapshot.empty ? false : snapshot.docs);
           },
           error => {
               //false; //... check
           }
       );
    }
    
}

module.exports = firebaseMessagesRepository;