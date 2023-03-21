/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */
const firebaseRepositoryBase = require ("./firebase_repository_base");

class firebaseConversationsRepository extends firebaseRepositoryBase {

    /**
     * 
     * @param {*} db 
     */
    constructor (db) {
        super(db)
    }

    /**
     * get array of conversations from firebase
     * get results from given point if start is provided
     * 
     * @param {String} conversationsId conversation id
     * @param {String|Null} start starting document id 
     * @returns {Array|Boolean}
     */
    async getConversations (conversationsId,start = null) {
        let collectionQuery = this.db.collection(conversationsId).orderBy(conversationsId,"desc").startAt(start).limit(this.limit);
        let conversations = await collectionQuery.get();
        return conversations.empty ? false : this.__getDataFromCollection(conversations);
    }

    /**
     * add a new conversation to user's conversations
     * updates the conversation if document exists
     * 
     * **method expects a batch operation initiated before invoking this method**
     * 
     * @param {User} user user object
     * @param {Thread} conversation conversation object
     * @returns {void} void
     */
    setConversation (user,conversation) {
       if (!this.__isBatchWriting) {
            //... throw error
       }
       this.__batch.set(this.db.collection(user.getConversationsId()).doc(conversation.getId()).set(conversation.toObj(),{merge : true}));
    }

    /**
      * listen to changes (new addition, deletion) in the user's conversations (latest 25)
      * 
      * @param {String} conversationsId user's conversations id
      * @param {Function} callback callback function, that should be invoked  whenever the collection change
      * @returns {void} void
      */
     listenToConversations (conversationsId, callback) {
        let collectionQuery = this.db.collection(conversationsId).orderBy("timestamp","desc").limit(this.limit);
        this.__listeners[conversationsId] = collectionQuery.onSnapshot(
            snapshot => {
                callback(snapshot.empty ? false : snapshot.docs);
            },
            error => {
                //false; //... check
            }
        );
    }
}

module.exports = firebaseConversationsRepository;