/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type {
  Firestore,
  WriteBatch,
  Query,
  OrderByDirection,
  DocumentSnapshot,
  QuerySnapshot,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { Repository } from '../interfaces/repository';

class FirebaseRepositoryBase extends Repository {
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
  private __batch: WriteBatch | null;

  /**
   * Inidicates if a batch write is in progress
   *
   * @type {boolean}
   */
  protected __isBatchWriting: boolean;

  constructor(db: Firestore) {
    super(db);
    this._limit = 25;
    this.__batch = null;
    this.__isBatchWriting = false;
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
      throw new Error(`Error:firebaseRepositoryBase - listener name is required.`);
    }
    if (!this.__listeners[listenerName]) {
      throw new Error(`Error:firebaseRepositoryBase - listener does not exists.`);
    }
    this.__listeners[listenerName]();
  }

  /**
   * stop listening to all conversations/messages
   *
   * @return {void} void
   */
  detachAll(): void {
    for (const i in this.__listeners) {
      if (this.__listeners[i]) {
        this.__listeners[i]();
      }
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
  protected __buildCollectionQuery(
    collectionName: string,
    sort = 'timestamp',
    order: OrderByDirection = 'desc',
    start?: number,
  ): Query {
    if (!collectionName) {
      throw new Error(`Error:firebaseRepositoryBase - collection name is required.`);
    }
    let collectionQuery: Query;
    try {
      if (start) {
        collectionQuery = this._db
          .collection(collectionName)
          .orderBy(sort, order)
          .offset(start ?? 0)
          .limit(this._limit);
      } else {
        collectionQuery = this._db.collection(collectionName).orderBy(sort, order).limit(this._limit);
      }
      return collectionQuery;
    } catch (error) {
      throw new Error(`Error:firebaseRepositoryBase - ${(error as Error).message}`); //... TODO - check if this is correct
    }
  }

  /**
   * Create a model from data
   *
   * @param modelClass
   * @param data
   * @returns
   */
  protected __createModelFromData<T>(
    modelClass: new (data: Record<string, unknown>) => T,
    data: Record<string, unknown>,
  ): T {
    return new modelClass(data);
  }

  /**
   *
   * @param modelClass
   * @param data
   * @returns
   */
  protected __createModelFromCollection<T>(
    closure: (data: Record<string, unknown>) => T,
    data: Record<string, unknown>[],
  ): T[] {
    return data.map((item) => closure(item));
  }

  /**
   * extract data from a collection
   *
   * @param {QuerySnapshot} querySnapshot
   * @returns {Record<string, unknown>[]}
   * @throws {Error} if collection is not provided
   */
  protected __getDataFromCollection(querySnapshot: QuerySnapshot): Record<string, unknown>[] {
    if (!querySnapshot) {
      throw new Error(`Error:firebaseRepositoryBase - querysnapshot is required.`);
    }
    const docsArr: Record<string, unknown>[] = [];
    if (querySnapshot.empty) {
      return docsArr;
    } else {
      querySnapshot.docs.forEach((document: QueryDocumentSnapshot) => {
        docsArr.push(document.data());
      });
      return docsArr;
    }
  }

  /**
   * get a document from firestore collection
   * returns false if document does not exists
   *
   * @param {string} collectionName name of the collection
   * @param {string} docId document id
   * @returns {Promise<DocumentSnapshot>} document
   * @throws {Error} if collectionName or docId is not provided
   */
  protected async __doc(collectionName: string, docId: string): Promise<DocumentSnapshot> {
    if (!collectionName) {
      throw new Error(`Error:firebaseRepositoryBase - collection name is required.`);
    }
    if (!docId) {
      throw new Error(`Error:firebaseRepositoryBase - document id is required.`);
    }
    return await this._db.collection(collectionName).doc(docId).get();
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
  protected async __setDoc(collectionName: string, docId: string, data: Record<string, unknown>): Promise<void> {
    if (!collectionName) {
      throw new Error(`Error:firebaseRepositoryBase - collection name is required.`);
    }
    if (!docId) {
      throw new Error(`Error:firebaseRepositoryBase - document id is required.`);
    }
    if (!data) {
      throw new Error(`Error:firebaseRepositoryBase - data is required.`);
    }
    this._db.collection(collectionName).doc(docId).set(data);
  }
}

export default FirebaseRepositoryBase;
