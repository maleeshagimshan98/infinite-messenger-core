/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type { Firestore, QuerySnapshot } from 'firebase-admin/firestore';
import type { ConversationsRepository } from '../interfaces/repository';
import firebaseRepositoryBase from './firebase_repository_base';
import { Conversation } from '../../Models/thread';
import type { NewConversation } from '../../Models/thread';
import DatabaseResultSet from '../utils/DatabaseResultSet';

class FirebaseConversationsRepository extends firebaseRepositoryBase implements ConversationsRepository {
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
   * @param {string|undefined} start starting document id
   * @returns {Promise <DatabaseResultSet<Conversation[]>>} conversations
   */
  async getConversations(conversationsId: string, start?: string): Promise<DatabaseResultSet<Conversation[]>> {
    const collectionQuery = this._db
      .collection(conversationsId)
      .orderBy(conversationsId, 'desc')
      .startAt(start)
      .limit(this._limit);
    const conversationsSnapshot = await collectionQuery.get();
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
   * **method expects a batch operation initiated before invoking this method**
   *
   * @param {string} conversationsId user object
   * @param {Conversation} conversation conversation object
   * @returns {Promise<void>} void
   */
  async addConversation(conversationsId: string, conversation: Conversation): Promise<void> {
    this.batch().set(this._db.collection(conversationsId).doc(conversation.getId()), conversation.toObj(), {
      merge: true,
    });
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
   * @return {Promise<void>}
   */
  async deleteConversation(userConversationId: string, conversationId: string): Promise<void> {
    await this._db.collection(userConversationId).doc(conversationId).delete();
  }
}

export default FirebaseConversationsRepository;
