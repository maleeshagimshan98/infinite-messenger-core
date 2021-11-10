/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

 import {initializeApp} from 'firebase/app';
 import {getFirestore, collection, doc, getDoc, getDocs, query, where, orderBy, limit, setDoc, updateDoc, onSnapshot,runTransaction, writeBatch, deleteDoc, deleteField } from "firebase/firestore";


 /**
  * Firebase database adapter for the infinite-messenger-core
  * This class wraps the firestore instance and necessary methods
  */
 class Firebase {

    /**
     * constructor
     */
     constructor (firebaseConfig) {
        const app = initializeApp(firebaseConfig);
        this.db = getFirestore(app);
        this.__listeners = {
            docs : [],
            collections : [],
        };
        this.__batch;
        this.__isBatchWriting = false;
     }

     /**
      * get a collection from firestore
      * returns false if no collection found
      * 
      * @param {String} collectionName name of the collection
      * @param {String|Number} docLimit document limit
      * @returns {Array|Boolean}
      */
     async collection (collectionName,docLimit=25) {
         let docsArr = [];          
         let collectionQuery = query(collection(this.db,collectionName),orderBy("id","desc"),limit(docLimit));
         let docs = await getDocs(collectionQuery);

         if (docs.docs.length == 0) {
             return false;
         }         
         docs.forEach( document => {
             docsArr.push(document.data());
         });
         return docsArr;
     }

     /**
      * get a document from firestore collection
      * 
      * @param {String} collectionName name of the collection
      * @param {String} docId document id
      * @param {String|Number} docLimit document limit
      * @returns {Object|Boolean} 
      */
     async doc (collectionName,docId) {         
         let document = await getDoc(doc(this.db,collectionName,docId));
         return document.exists() ? document.data() : false;
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
         let collectionQuery = query(collection(this.db,collectionName),orderBy("id","desc"),limit(docLimit));
         this.__listeners.collections[collectionName] = onSnapshot(
             collectionQuery,
             snapshot => {
                 callback(snapshot);
             },
             error => {
                 //false; //... check
             }
         );
     }

     /**
      * listen to changes in a document
      * 
      * @param {String} collectionName collection name
      * @param {String} docId document id
      * @param {Function} callback callback function that should be invoked whenever the document change
      */
     listenToDoc (collectionName,docId,callback) {
         this.__listeners.docs[docId] = onSnapshot(
             doc(this.db,collectionName,docId),
             docSnapshot => {
                callback(docSnapshot.data());
            },
            error => {
                //false; //... check
            }
        );
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
         this.__listeners[listenerType][listenerName]();
     } 
     
     /**
      * stop listening to all collections/documents
      * 
      * @return {void} void
      */
     detachAll () {
        ['docs','collections'].forEach( type => {
            for (let i in this.__listeners[type]) {
                this.__listeners[type][i]();
            }
        });         
     }

     /**
      * save a document in firestore
      * 
      * @param {String} collectionName collection name
      * @param {String} documentId document id
      * @param {Object} data 
      * @returns {void} void
      */
     async setDocument (collectionName,documentId,data) {
         if (this.__isBatchWriting) {
             await this.__batch.set(doc(this.db,collectionName,documentId),data, {merge : true}); //... check
             return;
         }
         else {
            await setDoc(doc(this.db,collectionName,documentId),data, {merge : true})
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
             await this.__batch.update(doc(this.db,collectionName,documentId),data);
             return;
         }
         else {
             await updateDoc(doc(this.db,collectionName,documentId),data);
         }
     }

     /**
      * start a batch write
      * 
      * @returns {void} void
      */
     batch () {
         this.__batch = writeBatch(this.db);
         this.__isBatchWriting = true;
     }

     /**
      * commit a batch write
      * 
      * @returns {void} void
      */
     async commit () {
         this.__isBatchWriting = false;
         await this.__batch.commit();
     }

     /**
      * delete a document
      * 
      * @param {String} collectionName collection name
      * @param {String} documentId document id
      */
     async deleteDocument (collectionName,documentId) {
         await deleteDoc(doc(collectionName,documentId));
     }

     /**
      * delete a collection
      * 
      * @param {String} collectionName collection name
      * @param {String} documentId document id
      */
     async deleteCollection () {
     }

     

 };

 export default Firebase;