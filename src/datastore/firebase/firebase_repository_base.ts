/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
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

/**
 * Transaction options containing an optional Firestore transaction instance.
 *
 * @type {TransactionOptions}
 */
type TransactionOptions = {
  transaction?: FirebaseFirestore.Transaction;
};

class FirebaseRepositoryBase {
  /**
   * Firestore instance
   *
   * @type {Firestore}
   */
  protected _db: Firestore;

  /**
   * Listeners for the conversations/messages
   *
   * @type {Record<string, Function>}
   */
  protected __listeners: Record<string, () => void>;

  /**
   * Document limit
   *
   * @type {string}
   */
  protected _limit: number;

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

  /**
   * Indicates if a transaction is active
   *
   * @type {boolean}
   */
  private __transactionActive: boolean;

  constructor(db: Firestore) {
    this._db = db;
    this.__listeners = {};
    this._limit = 25;
    this.__batch = null;
    this.__isBatchWriting = false;
    this.__transactionActive = false;
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
    if (limit < 0) {
      throw new Error(`Error:firebaseRepositoryBase - limit must be a positive number.`);
    }

    this._limit = limit;
  }

  /**
   * start a batch write
   *
   * @returns {WriteBatch} WriteBatch object
   * @throws {Error} if a transaction is currently active
   */
  batch(): WriteBatch {
    if (this.__transactionActive) {
      throw new Error(
        `Error:firebaseRepositoryBase - Cannot start batch write while a transaction is active. Complete or rollback the active transaction first.`,
      );
    }
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
   * Check if a batch write is currently active
   *
   * @returns {boolean} true if batch write is active, false otherwise
   */
  isBatchWriteActive(): boolean {
    return this.__isBatchWriting;
  }

  /**
   * Check if a transaction is currently active
   *
   * @returns {boolean} true if transaction is active, false otherwise
   */
  isTransactionActive(): boolean {
    return this.__transactionActive;
  }

  /**
   * Set transaction active status. Called by the datastore when a transaction begins.
   *
   * @param {boolean} active - whether the transaction is active
   * @throws {Error} if trying to activate transaction while batch write is active
   */
  setTransactionActive(active: boolean): void {
    if (active && this.__isBatchWriting) {
      throw new Error(
        `Error:firebaseRepositoryBase - Cannot start transaction while a batch write is active. Commit or rollback the active batch first.`,
      );
    }
    this.__transactionActive = active;
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
   * @param {string} orderBy field of the document to order the results by. Default is "timestamp"
   * @param {OrderByDirection} orderByDirection sort order (ascending, descending)
   * @param {string} start offset to start the query
   * @returns {Query} collection Query - caller handles transaction.get() if needed
   * @throws {Error}
   */
  protected __buildCollectionQuery(
    collectionName: string,
    orderBy = 'timestamp',
    orderByDirection: OrderByDirection = 'desc',
    start?: string,
    _transactionOptions?: TransactionOptions,
  ): Query {
    if (!collectionName) {
      throw new Error(`Error:firebaseRepositoryBase - collection name is required.`);
    }
    let collectionQuery: Query;
    try {
      if (start) {
        collectionQuery = this._db
          .collection(collectionName)
          .orderBy(orderBy, orderByDirection)
          .startAfter(start)
          .limit(this._limit);
      } else {
        collectionQuery = this._db.collection(collectionName).orderBy(orderBy, orderByDirection).limit(this._limit);
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
   * @param {TransactionOptions} transactionOptions optional transaction object
   * @returns {Promise<DocumentSnapshot>} document
   * @throws {Error} if collectionName or docId is not provided
   */
  protected async __doc(
    collectionName: string,
    docId: string,
    transactionOptions?: TransactionOptions,
  ): Promise<DocumentSnapshot> {
    if (!collectionName) {
      throw new Error(`Error:firebaseRepositoryBase - collection name is required.`);
    }
    if (!docId) {
      throw new Error(`Error:firebaseRepositoryBase - document id is required.`);
    }
    const docRef = this._db.collection(collectionName).doc(docId);
    if (transactionOptions?.transaction) {
      return await transactionOptions.transaction.get(docRef);
    }
    return await docRef.get();
  }

  /**
   * write a document
   *
   * @param {string} collectionName
   * @param {string} docId
   * @param {object} data
   * @param {TransactionOptions} transactionOptions optional transaction object
   * @returns {Promise<void>} void
   * @throws {Error} if collectionName, docId or data is not provided
   */
  protected async __setDoc(
    collectionName: string,
    docId: string,
    data: Record<string, unknown>,
    transactionOptions?: TransactionOptions,
  ): Promise<void> {
    if (!collectionName) {
      throw new Error(`Error:firebaseRepositoryBase - collection name is required.`);
    }
    if (!docId) {
      throw new Error(`Error:firebaseRepositoryBase - document id is required.`);
    }
    if (!data) {
      throw new Error(`Error:firebaseRepositoryBase - data is required.`);
    }
    const docRef = this._db.collection(collectionName).doc(docId);
    if (transactionOptions?.transaction) {
      transactionOptions.transaction.set(docRef, data);
    } else {
      await docRef.set(data);
    }
  }

  /**
   * update a document
   *
   * @param {string} collectionName
   * @param {string} docId
   * @param {object} data
   * @param {TransactionOptions} transactionOptions optional transaction object
   * @returns {Promise<void>} void
   * @throws {Error} if collectionName, docId or data is not provided
   */
  protected async __updateDoc(
    collectionName: string,
    docId: string,
    data: Record<string, unknown>,
    transactionOptions?: TransactionOptions,
  ): Promise<void> {
    if (!collectionName) {
      throw new Error(`Error:firebaseRepositoryBase - collection name is required.`);
    }
    if (!docId) {
      throw new Error(`Error:firebaseRepositoryBase - document id is required.`);
    }
    if (!data) {
      throw new Error(`Error:firebaseRepositoryBase - data is required.`);
    }
    const docRef = this._db.collection(collectionName).doc(docId);
    if (transactionOptions?.transaction) {
      transactionOptions.transaction.update(docRef, data);
    } else {
      await docRef.update(data);
    }
  }

  /**
   * delete a document
   *
   * @param {string} collectionName
   * @param {string} docId
   * @param {TransactionOptions} transactionOptions optional transaction object
   * @returns {Promise<void>} void
   * @throws {Error} if collectionName or docId is not provided
   */
  protected async __deleteDoc(
    collectionName: string,
    docId: string,
    transactionOptions?: TransactionOptions,
  ): Promise<void> {
    if (!collectionName) {
      throw new Error(`Error:firebaseRepositoryBase - collection name is required.`);
    }
    if (!docId) {
      throw new Error(`Error:firebaseRepositoryBase - document id is required.`);
    }
    const docRef = this._db.collection(collectionName).doc(docId);
    if (transactionOptions?.transaction) {
      transactionOptions.transaction.delete(docRef);
    } else {
      await docRef.delete();
    }
  }
}

export default FirebaseRepositoryBase;
export type { TransactionOptions };
