/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

 import { MongoClient } from "mongodb";


 /**
  * MongoDB database adapter for the infinite-messenger-core
  * This class wraps the MongoDB instance and necessary methods
  */
 class Mongodb {

    /**
     * constructor
     */
     constructor (mongodbConfig) {
        
        this.__listeners = {
            docs : [],
            collections : [],
        };
        this.__batch;
        this.__isBatchWriting = false;
     }

     /**
      * get a collection from mongodb
      * 
      * @param {String} collectionName name of the collection
      * @param {String|Number} docLimit document limit
      * @returns {Array|Boolean}
      */
     async collection (collectionName,docLimit=25) {
         let docsArr = [];
         //... get a collection from mongodb database
         return docsArr;
     }

     /**
      * get a document from mongodb collection
      * 
      * @param {String} collectionName name of the collection
      * @param {String} docId document id
      * @param {String|Number} docLimit document limit
      * @returns {Object|Boolean} 
      */
     async doc (collectionName,docId) {
         //... get a document from mongodb collection        
     }     

     /**
      * listen to changes in the colection
      * 
      * @param {String} collectionName collection name
      * @param {String|Number} docLimit document limit
      * @param {Function} callback callback function, that should be invoked  whenever the collection change
      * @returns {void} void
      */
     listenToCollection (collectionName,docLimit= 25, callback) {
         //... add a listener in this.__listeners.collection
         //... listen to changes in a collection         
     }

     /**
      * listen to changes in a document
      * 
      * @param {String} collectionName collection name
      * @param {String} docId document id
      * @param {Function} callback callback function that should be invoked whenever the document change
      */
     listenToDoc (collectionName,docId,callback) {
         //... add a listener in this.__listeners.doc
         //... listen to changes in a doc         
     }     

     /**
      * get a collection/document listener
      * 
      * @param {String} listenerType listener type (collection/document)
      * @param {String} listenerName name of the listener
      * @returns 
      */
     getListener (listenerType,listenerName) {
         return this.__listeners[listenerType][listenerName];
     }

     /**
      * stop listening to a particular collection/document
      * 
      * @param {String} listenerType listener type (collection/document)
      * @param {String} listenerName name of the listener
      * @returns {void} void
      */
     detach (listenerType,listenerName) {
         //... remove listener
     } 
     
     /**
      * stop listening to all collections/documents
      * 
      * @return {void} void
      */
     detachAll () {
        ['docs','collections'].forEach( type => {
            for (let i in this.__listeners[type]) {
                //... remove all listeners
            }
        });         
     }

     /**
      * save a document in mongodb
      * 
      * @param {String} collectionName collection name
      * @param {String} documentId document id
      * @param {Object} data 
      * @returns {void} void
      */
     async setDocument (collectionName,documentId,data) {
         if (this.__isBatchWriting) {
             //... if batchWriting true,  write document in a transaction/batch operation
             return;
         }
         else {
            //... write document
         }        
     }
     
     /**
      * 
      * @param {String} collectionName collection name
      * @param {String} documentId document id
      * @param {object} data 
      * @returns {void} void
      */
     async updateDocument (collectionName,documentId,data) {
         if (this.__isBatchWriting) {
             //...
         }
         else {
            //... update document
         }
     }

     /**
      * start a batch write
      * 
      * @returns {void} void
      */
     batch () {
         //... start a transaction/batch write
         this.__isBatchWriting = true;
     }

     /**
      * commit a batch write
      * 
      * @returns {void} void
      */
     async commit () {
         this.__isBatchWriting = false;
         //... commit transaction/batch write
     }

     /**
      * delete a document
      * 
      * @param {String} collectionName collection name
      * @param {String} documentId document id
      */
     async deleteDocument (collectionName,documentId) {
         //... delete a document         
     }

     /**
      * delete a collection
      * 
      * @param {String} collectionName collection name
      * @param {String} documentId document id
      */
     async deleteCollection () {
         //... delete a collection
     }

     

 };

 export default Mongodb;