/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import { initializeApp, applicationDefault, cert, FirebaseError } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue, Firestore, WriteBatch, Query, OrderByDirection, DocumentSnapshot, QuerySnapshot, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import DatabaseResult from "../utils/DatabaseResult";

class FirebaseRepositoryBase {

  /**
   * Document limit
   *
   * @type {string}
   */
  protected _limit;

  /**
   * Batch write object
   *
   * @type {WriteBatch | null}
   */
  private __batch: WriteBatch| null;

  /**
   * Inidicates if a batch write is in progress
   *
   * @type {boolean}
   */
  protected __isBatchWriting: boolean;

  /**
   * Listeners for the conversations/messages
   *
   * @type {Record<string, any>}
   */
  protected __listeners: Record<string, any>;

  /**
   * firestore database object
   *
   * @type {Firestore}
   */
  protected _db: Firestore;

  constructor(db: Firestore) {
    this._limit = 25;
    this.__batch = null;
    this.__isBatchWriting = false;
    this.__listeners = {
      conversations: [],
      messages: [],
    };
    this._db = db;
  }

  /**
   * set document limit
   *
   * @param {number} limit
   * @returns {void} void
   * @throws {Error} if limit is not provided
   */
  setLimit(limit: number): void {
    if (!limit) {
      throw new Error(`Error:firebaseRepositoryBase - limit is required.`);
    }
    this._limit = limit;
  }

  /**
   * start a batch write
   *
   * @returns {WriteBatch} WriteBatch object
   */
  batch(): WriteBatch {
    this.__batch = this._db.batch();
    this.__isBatchWriting = true;
    return this.__batch;
  }

  /**
   * commit a batch write
   *
   * @returns {Promise<void>} void
   * @throws {Error} if batch write is failed
   */
  async commit(): Promise<void> {
    if (this.__isBatchWriting && this.__batch) {
      await this.__batch.commit().catch((error) => {
        //... TODO - rollback?
        throw new Error(`Error:firebaseRepositoryBase - ${error.message}`);
      });
      this.__isBatchWriting = false;
      this.__batch = null;
    }
  }

  /**
   * stop listening to a particular conversations/messages
   *
   * @param {string} listenerName name of the listener
   * @returns {void} void
   * @throws {Error} if listenerName is not provided
   */
  detach(listenerName: string): void {
    if (!listenerName) {
      throw new Error(
        `Error:firebaseRepositoryBase - listener name is required.`,
      );
    }
    if (!this.__listeners[listenerName]) {
      throw new Error(
        `Error:firebaseRepositoryBase - listener does not exists.`,
      );
    }
    this.__listeners[listenerName]();
  }

  /**
   * stop listening to all conversations/messages
   *
   * @return {void} void
   */
  detachAll(): void {
    for (let i in this.__listeners) {
      this.__listeners[i]();
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
   * @param {number} start offset to start the query
   * @returns {Query} collection Query
   * @throws {Error}
   */
  __buildCollectionQuery(
    collectionName: string,
    sort = "timestamp",
    order: OrderByDirection = "desc",
    start: number | null = null,
  ): Query {
    if (!collectionName) {
      throw new Error(
        `Error:firebaseRepositoryBase - collection name is required.`,
      );
    }
    let collectionQuery;
    try {
      if (start) {
        collectionQuery = this._db
          .collection(collectionName)
          .orderBy(sort, order)
          .offset(start??0)
          .limit(this._limit);
      } else {
        collectionQuery = this._db
          .collection(collectionName)
          .orderBy(sort, order)
          .limit(this._limit);
      }
      return collectionQuery;
    } catch (error) {
      throw new Error(`Error:firebaseRepositoryBase - ${(error as Error).message}`); //... TODO - check if this is correct
    }
  }

  /**
   * extract data from a collection
   * returns false if collection is empty
   *
   * @param {QuerySnapshot} querySnapshot
   * @returns {array}
   * @throws {Error} if collection is not provided
   */
  __getDataFromCollection(querySnapshot: QuerySnapshot): Record<string, any>[] {
    if (!querySnapshot) {
      throw new Error(`Error:firebaseRepositoryBase - querysnapshot is required.`);
    }
    let docsArr: Record<string, any>[] = [];
    querySnapshot.docs.forEach((document: QueryDocumentSnapshot) => {
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
   * @returns {Promise<DatabaseResult>}
   * @throws {Error} if collectionName or docId is not provided
   */
  async __doc(collectionName: string, docId: string): Promise<DatabaseResult> {
    if (!collectionName) {
      throw new Error(
        `Error:firebaseRepositoryBase - collection name is required.`,
      );
    }
    if (!docId) {
      throw new Error(
        `Error:firebaseRepositoryBase - document id is required.`,
      );
    }
    let document: DocumentSnapshot = await this._db.collection(collectionName).doc(docId).get();
    return new DatabaseResult(document.exists ? document.data() : {});
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
  async __setDoc(collectionName: string, docId: string, data: Record<string, any>): Promise<void> {
    if (!collectionName) {
      throw new Error(
        `Error:firebaseRepositoryBase - collection name is required.`,
      );
    }
    if (!docId) {
      throw new Error(
        `Error:firebaseRepositoryBase - document id is required.`,
      );
    }
    if (!data) {
      throw new Error(`Error:firebaseRepositoryBase - data is required.`);
    }
    this._db.collection(collectionName).doc(docId).set(data);
  }
}

export default FirebaseRepositoryBase;
