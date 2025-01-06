/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

class firebaseRepositoryBase {

    constructor (db) {
        this.limit = 25;
        this.__batch;
        this.__isBatchWriting = false;
        this.__listeners = {
            conversations : [],
            messages : [],
        };
        this.db = db;
    }

    /**
     * set document limit
     * 
     * @param {string|number} limit
     * @returns {void} void 
     */
    setLimit (limit) {
        this.limit = limit;
    }

    /**
      * start a batch write
      * 
      * @returns {WriteBatch} WriteBatch object
      */
     batch () {
        this.__batch = this.db.batch();
        this.__isBatchWriting = true;
        return this.__batch;
    }

    /**
     * commit a batch write
     * 
     * @returns {Promise<void>} void
     */
    async commit () {
        this.__isBatchWriting = false;
        await this.__batch.commit();
    }

    /**
      * stop listening to a particular conversations/messages
      * 
      * @param {string} listenerName name of the listener
      * @returns {void} void
      */
     detach (listenerName) {
        this.__listeners[listenerName]();
    }

    /**
      * stop listening to all conversations/messages
      * 
      * @return {void} void
      */
     detachAll () {        
        for (let i in this.__listeners) {
            this.__listeners[i]();
        }    
     }

    /**
     * build the collection query.
     * if the collection is previousely accessed, get the results after the cursor set by previous query.
     * All results are limited to the set amount in ```` this.limit ````
     * 
     * @param {string} collectionName name of collection
     * @param {string} sort field of the document to sort
     * @param {string} order sort order (ascending, descending)
     * @returns {CollectionReference} collection Query
     */
    __buildCollectionQuery (collectionName,sort='timestamp',order='desc',start = null) {
        let collectionQuery;
        if (start) {
            //... change
            collectionQuery = this.db.collection(collectionName).orderBy(sort,order).limit(this.limit);
        }
        else {
            collectionQuery = this.db.collection(collectionName).orderBy(sort,order).limit(this.limit); 
        }
        return collectionQuery;                
    }

    /**
     * extract data from a collection
     * returns false if collection is empty
     * 
     * @param {QuerySnapshot} collection 
     * @returns {Boolean}
     */
    __getDataFromCollection (collection) {
        let docsArr = [];       
        collection.forEach( document => {
            docsArr.push(document.data());
        });        
        return docsArr;       
    }

    /**
      * get a document from firestore collection
      * returns false if document does not exists
      * 
      * @param {string} collectionName name of the collection
      * @param {string} docId document id
      * @returns {Promise<object|Boolean>} 
      */
    async __doc (collectionName,docId) {         
        let document = await this.db.collection(collectionName).doc(docId).get();
        return document.exists ? document.data() : false ;
    }
    
    /**
     * write a document
     * 
     * @param {string} collectionName 
     * @param {string} docId 
     * @param {object} data
     * @returns {Promise<void>} void
     */
    async __setDoc (collectionName,docId,data) {
        this.db.collection(collectionName).doc(docId).set(data);
    }
}

module.exports = firebaseRepositoryBase;