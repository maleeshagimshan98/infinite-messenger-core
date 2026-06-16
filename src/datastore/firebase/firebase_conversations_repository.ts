/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type { Firestore, QuerySnapshot } from 'firebase-admin/firestore';
import type { ConversationsRepository } from '../interfaces/repository';
import FirebaseRepositoryBase from './firebase_repository_base';
import { Conversation } from '../../Models/thread';
import type { NewConversation } from '../../Models/thread';
import DatabaseResultSet from '../utils/DatabaseResultSet';
import type { TransactionOptions } from './firebase_repository_base';

class FirebaseConversationsRepository extends FirebaseRepositoryBase implements ConversationsRepository {
  /**
   * constructor
   *
   * @param {Firestore} db
   */
  constructor(db: Firestore) {
    super(db);
  }

  /**
   * get array of conversations from firebase
   * get results from given point if start is provided
   *
   * @param {string} conversationsId conversation id
   * @param {string | undefined} start starting document id
   * @param {string} orderBy field to order by
   * @param {'asc' | 'desc'} orderByDirection sort direction
   * @param {TransactionOptions} transactionOptions optional transaction object
   * @returns {Promise <DatabaseResultSet<Conversation[]>>} conversations
   */
  async getConversations(
    conversationsId: string,
    orderBy: string = 'id',
    orderByDirection: 'asc' | 'desc' = 'asc',
    start?: string,
    transactionOptions?: TransactionOptions,
  ): Promise<DatabaseResultSet<Conversation[]>> {
    const collectionQuery = this.__buildCollectionQuery(
      conversationsId,
      orderBy,
      orderByDirection,
      start,
      transactionOptions,
    );
    let conversationsSnapshot;
    if (transactionOptions?.transaction) {
      conversationsSnapshot = await transactionOptions.transaction.get(collectionQuery);
    } else {
      conversationsSnapshot = await collectionQuery.get();
    }
    if (conversationsSnapshot.empty) {
      return new DatabaseResultSet<Conversation[]>();
    }
    return new DatabaseResultSet<Conversation[]>(
      this.__createModelFromCollection(
        (data: unknown) => new Conversation(data as NewConversation),
        this.__getDataFromCollection(conversationsSnapshot),
      ),
    );
  }

  /**
   * add a new conversation to user's conversations
   * updates the conversation if document exists
   *
   * @param {string} conversationsId user's conversations id
   * @param {Conversation} conversation conversation object
   * @param {TransactionOptions} transactionOptions optional transaction object
   * @returns {Promise<void>} void
   */
  async addConversation(
    conversationsId: string,
    conversation: Conversation,
    transactionOptions?: TransactionOptions,
  ): Promise<void> {
    const docRef = this._db.collection(conversationsId).doc(conversation.getId());
    if (transactionOptions?.transaction) {
      transactionOptions.transaction.set(docRef, conversation.toObj(), { merge: true });
    } else {
      const batch = this.batch();
      batch.set(docRef, conversation.toObj(), { merge: true });
      await batch.commit();
    }
  }

  /**
   * listen to changes (new addition, deletion) in the user's conversations (latest 25)
   *
   * @param {string} conversationId user's conversations id
   * @param {(data: DatabaseResultSet<Conversation[]>) => void} callback callback function, that should be invoked  whenever the collection change
   * @param {(error: Error) => void} errorCallback callback function, that should be invoked whenever an error occurs
   * @returns {void} void
   */
  listenToConversations(
    conversationId: string,
    callback: (data: DatabaseResultSet<Conversation[]>) => void,
    errorCallback: (error: Error) => void,
  ): void {
    //... default threads limit 25 used
    const collectionQuery = this._db.collection(conversationId).orderBy('timestamp', 'desc').limit(this._limit);
    this.__listeners[conversationId] = collectionQuery.onSnapshot(
      (snapshot: QuerySnapshot) => {
        const conversations = new DatabaseResultSet<Conversation[]>(
          this.__createModelFromCollection(
            (data: unknown) => new Conversation(data as NewConversation),
            this.__getDataFromCollection(snapshot),
          ),
        );
        callback(conversations);
      },
      (error: Error) => {
        errorCallback(error);
      },
    );
  }

  /**
   * delete a convesation
   *
   * @param {string} userConversationId user's conversations identifier
   * @param {string} conversationId conversation id of the particular conversation
   * @param {TransactionOptions} transactionOptions optional transaction object
   * @return {Promise<void>}
   */
  async deleteConversation(
    userConversationId: string,
    conversationId: string,
    transactionOptions?: TransactionOptions,
  ): Promise<void> {
    await this.__deleteDoc(userConversationId, conversationId, transactionOptions);
  }
}

export default FirebaseConversationsRepository;
