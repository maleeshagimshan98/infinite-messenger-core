/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type { Firestore, QueryDocumentSnapshot, QuerySnapshot } from 'firebase-admin/firestore';
import type { ConversationsRepository } from '../interfaces/repository';
import firebaseRepositoryBase from './firebase_repository_base';
import type { User } from '../../Models/user';
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
   * @param {number|undefined} start starting document id
   * @returns {Promise <DatabaseResultSet<Conversation[] | undefined>>} conversations
   */
  async getConversations(
    conversationsId: string,
    start?: number,
  ): Promise<DatabaseResultSet<Conversation[] | undefined>> {
    const collectionQuery = this._db
      .collection(conversationsId)
      .orderBy(conversationsId, 'desc')
      .startAt(start)
      .limit(this._limit);
    const conversationsSnapshot = await collectionQuery.get();
    if (conversationsSnapshot.empty) {
      return new DatabaseResultSet();
    }
    return new DatabaseResultSet<Conversation[]>(
      this.__createModelFromCollection(
        (data: unknown) => new Conversation(data as NewConversation, this._db),
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
   * @param {User} user user object
   * @param {Conversation} conversation conversation object
   * @returns {void} void
   */
  setConversation(user: User, conversation: Conversation): void {
    this.batch().set(this._db.collection(user.getConversationsId()).doc(conversation.getId()), conversation.toObj(), {
      merge: true,
    });
  }

  /**
   * listen to changes (new addition, deletion) in the user's conversations (latest 25)
   *
   * @param {string} conversationsId user's conversations id
   * @param {(data: QueryDocumentSnapshot[] | false) => void} callback callback function, that should be invoked  whenever the collection change
   * @param {(error: Error) => void} errorCallback callback function, that should be invoked whenever an error occurs
   * @returns {void} void
   */
  listenToConversations(
    conversationsId: string,
    callback: (data: QueryDocumentSnapshot[] | false) => void,
    errorCallback: (error: Error) => void,
  ): void {
    const collectionQuery = this._db.collection(conversationsId).orderBy('timestamp', 'desc').limit(this._limit);
    this.__listeners[conversationsId] = collectionQuery.onSnapshot(
      (snapshot: QuerySnapshot) => {
        callback(snapshot.empty ? false : snapshot.docs);
      },
      (error: Error) => {
        errorCallback(error);
      },
    );
  }
}

export default FirebaseConversationsRepository;
