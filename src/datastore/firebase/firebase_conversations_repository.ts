/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
*/

import { Firestore, QuerySnapshot } from "firebase-admin/firestore";
import { ConversationsRepository } from "../interfaces/repository";
import firebaseRepositoryBase from "./firebase_repository_base";
import {User} from "../../Models/user";
import { Conversation, Thread } from "../../Models/thread";

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
   * @param {number|null} start starting document id
   * @returns {Promise <array>}
   */
  async getConversations(conversationsId: string, start: number|null = null): Promise <Record<string, any>[]> {
    let collectionQuery = this._db
      .collection(conversationsId)
      .orderBy(conversationsId, "desc")
      .startAt(start)
      .limit(this._limit);
    let conversations = await collectionQuery.get();
    return this.__getDataFromCollection(conversations);
  }

  /**
   * add a new conversation to user's conversations
   * updates the conversation if document exists
   *
   * **method expects a batch operation initiated before invoking this method**
   *
   * @param {User} user user object
   * @param {Thread} conversation conversation object
   * @returns {void} void
   */
  setConversation(user: User, conversation: Thread): void {
    this.batch().set(
      this._db
        .collection(user.getConversationsId())
        .doc(conversation.getId()),
        conversation.toObj(), { merge: true });
  }

  /**
   * listen to changes (new addition, deletion) in the user's conversations (latest 25)
   *
   * @param {string} conversationsId user's conversations id
   * @param {Function} callback callback function, that should be invoked  whenever the collection change
   * @returns {void} void
   */
  listenToConversations(conversationsId: string, callback: (data: Record<string, any>| false) => void, errorCallback: (error: Error) => void): void {
    let collectionQuery = this._db
      .collection(conversationsId)
      .orderBy("timestamp", "desc")
      .limit(this._limit);
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
