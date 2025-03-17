/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

const {
  initializeApp,
  applicationDefault,
  cert,
} = require('firebase-admin/app');
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require('firebase-admin/firestore');

/**
 * Firebase database adapter for the infinite-messenger-core
 * This class wraps the firestore instance and necessary methods
 */
class Firebase {
  /**
   * constructor
   */
  constructor(pathToConfig) {
    initializeApp({
      credential: cert(require(pathToConfig)),
    });
    this.db = getFirestore();
    this.__listeners = { docs: [], collections: [] };
    this.__cursors = { users: true };
    this.__batch;
    this.__isBatchWriting = false;
  }

  /**
   * set cursor values for pagination, store cursors by collection names
   *
   * @param {String} cursorName name of cursor
   * @param {String} value cursor value
   * @returns {void}
   */
  setCursor(cursorName, value) {
    this.__cursors[cursorName] = value;
  }

  /**
   * build the collection query
   *
   * @param {String} collectionName
   * @param {String} sort
   * @param {String} order
   * @param {String|Number} docLimit
   * @returns {Query}
   */
  __buildCollectionQuery(collectionName, sort, order = 'desc', docLimit = 25) {
    let collectionRef = this.db.collection(collectionName);
    if (!this.__cursors[collectionName]) {
      collectionRef.orderBy(sort, order).limit(docLimit);
    } else {
      collectionRef
        .orderBy(sort, order)
        .startAt(this.__cursors[collectionName])
        .limit(docLimit);
    }
    return collectionRef;
  }

  /**
   * get a collection from firestore
   * returns false if no collection found
   *
   * @param {String} collectionName name of the collection
   * @param {String} sort sort by property
   * @param {String} order order by (ASC or DESC)
   * @param {String|Number} docLimit document limit
   * @returns {Array|Boolean}
   */
  async collection(collectionName, sort, order = 'desc', docLimit = 25) {
    let docsArr = [];
    let collectionRef = this.__buildCollectionQuery(
      collectionName,
      sort,
      order,
      docLimit,
    );
    let docs = await collectionRef.get();
    if (docs.empty) {
      return false;
    }

    docs.forEach((document) => {
      docsArr.push(document.data());
    });

    let cursorVal = docsArr[docsArr.length - 1][sort];
    this.setCursor(collectionName, cursorVal);
    return docsArr;
  }

  /**
   * listen to changes in the colection
   *
   * @param {String} collectionName collection name
   * @param {String|Number} docLimit document limit
   * @param {Function} callback callback function, that should be invoked  whenever the collection change
   * @returns {void} void
   */
  listenToCollection(
    collectionName,
    sort,
    order = 'desc',
    docLimit = 25,
    callback,
  ) {
    let collectionQuery = this.__buildCollectionQuery(
      collectionName,
      sort,
      order,
      docLimit,
    );
    this.__listeners.collections[collectionName] = collectionQuery.onSnapshot(
      (querySnapshot) => {
        if (callback) {
          callback(querySnapshot);
        }
      },
    );
  }

  /**
   * get a document from firestore collection
   *
   * @param {String} collectionName name of the collection
   * @param {String} docId document id
   * @param {String|Number} docLimit document limit
   * @returns {Object|Boolean}
   */
  async doc(collectionName, docId) {
    let document = await this.db.collection(collectionName).doc(docId).get();
    return document.exists() ? document.data() : false;
  }

  /**
   * listen to changes in a document
   *
   * @param {String} collectionName collection name
   * @param {String} docId document id
   * @param {Function} callback callback function that should be invoked whenever the document change
   */
  listenToDoc(collectionName, docId, callback) {
    this.__listeners.docs[docId] = onSnapshot(
      doc(this.db, collectionName, docId),
      (docSnapshot) => {
        callback(docSnapshot.data());
      },
      (error) => {
        //false; //... check
      },
    );
  }

  /**
   * get a collection/document listener
   *
   * @param {String} listenerType listener type (collection/document)
   * @param {String} listenerName name of the listener
   * @returns
   */
  getListener(listenerType, listenerName) {
    return this.__listeners[listenerType][listenerName];
  }

  /**
   * stop listening to a particular collection/document
   *
   * @param {String} listenerType listener type (collection/document)
   * @param {String} listenerName name of the listener
   * @returns {void} void
   */
  detach(listenerType, listenerName) {
    this.__listeners[listenerType][listenerName]();
  }

  /**
   * stop listening to all collections/documents
   *
   * @return {void} void
   */
  detachAll() {
    ['docs', 'collections'].forEach((type) => {
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
  async setDocument(collectionName, documentId, data) {
    if (this.__isBatchWriting) {
      await this.__batch.set(doc(this.db, collectionName, documentId), data, {
        merge: true,
      }); //... check
      return;
    } else {
      await setDoc(doc(this.db, collectionName, documentId), data, {
        merge: true,
      });
    }
  }

  /**
   *
   * @param {String} collectionName collection name
   * @param {String} documentId document id
   * @param {object} data
   * @returns {void} void
   */
  async updateDocument(collectionName, documentId, data) {
    if (this.__isBatchWriting) {
      await this.__batch.update(doc(this.db, collectionName, documentId), data);
      return;
    } else {
      await updateDoc(doc(this.db, collectionName, documentId), data);
    }
  }

  /**
   * start a batch write
   *
   * @returns {void} void
   */
  batch() {
    this.__batch = this.db.batch();
    this.__isBatchWriting = true;
  }

  /**
   * commit a batch write
   *
   * @returns {void} void
   */
  async commit() {
    this.__isBatchWriting = false;
    await this.__batch.commit();
  }

  /**
   * delete a document
   *
   * @param {String} collectionName collection name
   * @param {String} documentId document id
   */
  async deleteDocument(collectionName, documentId) {}

  /**
   * delete a collection
   *
   * @param {String} collectionName collection name
   * @param {String} documentId document id
   */
  async deleteCollection() {}
}

export default Firebase;
