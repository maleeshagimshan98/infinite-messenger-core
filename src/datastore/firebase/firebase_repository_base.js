/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

const { firestore } = require("firebase-admin")
const DatabaseResult = require("../utils/DatabaseResult")

class firebaseRepositoryBase {

    /**
     * Document limit
     * 
     * @type {string|number}
     */
    _limit

    /**
     * Batch write object
     * 
     * @type {WriteBatch}
     */
  __batch

  /**
   * Inidicates if a batch write is in progress
   * 
   * @type {boolean}
   */
  __isBatchWriting

  /**
   * Listeners for the conversations/messages
   * 
   * @type {object}
   */
  __listeners

  /**
   * firestore database object
   * 
   * @type {firestore}
   */
  _db

  constructor(db) {
    this._limit = 25
    this.__batch
    this.__isBatchWriting = false
    this.__listeners = {
      conversations: [],
      messages: [],
    }
    this._db = db
  }

  /**
   * set document limit
   *
   * @param {string|number} limit
   * @returns {void} void
   * @throws {Error} if limit is not provided
   */
  setLimit(limit) {
    if (!limit) {
        throw new Error(`Error:firebaseRepositoryBase - limit is required.`)
    }
    this._limit = limit
  }

  /**
   * start a batch write
   *
   * @returns {WriteBatch} WriteBatch object
   */
  batch() {
    this.__batch = this._db.batch()
    this.__isBatchWriting = true
    return this.__batch
  }

  /**
   * commit a batch write
   *
   * @returns {Promise<void>} void
   * @throws {Error} if batch write is failed
   */
  async commit() {
    this.__isBatchWriting = false
    await this.__batch.commit().catch((error) => {
        //... TODO - rollback?
        throw new Error(`Error:firebaseRepositoryBase - ${error.message}`)
    })
  }

  /**
   * stop listening to a particular conversations/messages
   *
   * @param {string} listenerName name of the listener
   * @returns {void} void
   * @throws {Error} if listenerName is not provided
   */
  detach(listenerName) {
    if (!this.__listeners[listenerName]) {
        throw new Error(`Error:firebaseRepositoryBase - listener name is required.`)
    }
    if (!this.__listeners[listenerName]) {
        throw new Error(`Error:firebaseRepositoryBase - listener does not exists.`)
    }
    this.__listeners[listenerName]()
  }

  /**
   * stop listening to all conversations/messages
   *
   * @return {void} void
   */
  detachAll() {
    for (let i in this.__listeners) {
      this.__listeners[i]()
    }
  }

  /**
   * build the collection query.
   * if the collection is previousely accessed, get the results after the cursor set by previous query.
   * All results are limited to the set amount in ```` this._limit ````
   *
   * @param {string} collectionName name of collection
   * @param {string} sort field of the document to sort
   * @param {string} order sort order (ascending, descending)
   * @returns {CollectionReference} collection Query
   * @throws {Error}
   */
  __buildCollectionQuery(collectionName, sort = "timestamp", order = "desc", start = null) {
    if (!collectionName) {
        throw new Error(`Error:firebaseRepositoryBase - collection name is required.`)
    }
    let collectionQuery
    try{
        if (start) {
      //... change
      collectionQuery = this._db.collection(collectionName).orderBy(sort, order).limit(this._limit)
    } else {
      collectionQuery = this._db.collection(collectionName).orderBy(sort, order).limit(this._limit)
    }
    return collectionQuery
    }
    catch (error) {
        throw new Error(`Error:firebaseRepositoryBase - ${error.message}`)
    }
  }

  /**
   * extract data from a collection
   * returns false if collection is empty
   *
   * @param {CollectionReference} collection
   * @returns {array}
   * @throws {Error} if collection is not provided
   */
  __getDataFromCollection(collection) {
    if (!collection) {
        throw new Error(`Error:firebaseRepositoryBase - collection is required.`)
    }
    let docsArr = []
    collection.forEach((document) => {
      docsArr.push(document.data())
    })
    return docsArr
  }

  /**
   * get a document from firestore collection
   * returns false if document does not exists
   *
   * @param {string} collectionName name of the collection
   * @param {string} docId document id
   * @returns {Promise<DatabaseResult>}
   * @throws {Error} if collectionName or docId is not provided
   */
  async __doc(collectionName, docId) {
    if (!collectionName) {
        throw new Error(`Error:firebaseRepositoryBase - collection name is required.`)
    }
    if (!docId) {
        throw new Error(`Error:firebaseRepositoryBase - document id is required.`)
    }
    let document = await this._db.collection(collectionName).doc(docId).get()
    return new DatabaseResult(document.exists ? document.data() : {})
  }

  /**
   * write a document
   *
   * @param {string} collectionName
   * @param {string} docId
   * @param {object} data
   * @returns {Promise<void>} void
   * @throws {Error} if collectionName, docId or data is not provided
   */
  async __setDoc(collectionName, docId, data) {
    if (!collectionName) {
        throw new Error(`Error:firebaseRepositoryBase - collection name is required.`)
    }
    if (!docId) {
        throw new Error(`Error:firebaseRepositoryBase - document id is required.`)
    }
    if (!data) {
        throw new Error(`Error:firebaseRepositoryBase - data is required.`)
    }
    this._db.collection(collectionName).doc(docId).set(data)
  }
}

module.exports = firebaseRepositoryBase
