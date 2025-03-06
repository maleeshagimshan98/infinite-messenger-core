/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import { Firestore } from "firebase-admin/firestore";
import { MessagesRepository } from "../interfaces/repository";
import FirebaseRepositoryBase from "./firebase_repository_base";
import { Message } from "../../Models/message";

class FirebaseMessagesRepository extends FirebaseRepositoryBase implements MessagesRepository {

  constructor(db: Firestore) {
    super(db);
  }

  /**
   * get messages from firebase
   * get results from given point if start is provided
   *
   * @param {string} conversationId - conversation id
   * @param {number|null} start - starting point
   * @returns {Promise <array>}
   */
  async getMessages(conversationId: string, start: number | null = null): Promise <Record<string, any>[]> {
    let collectionQuery = this.__buildCollectionQuery(
      conversationId,
      "timestamp",
      "desc",
      start,
    );
    let conversations = await collectionQuery.get();
    return this.__getDataFromCollection(conversations);
  }

  /**
   * add a message to messages collection
   * updates the message if message exists
   *
   * @param {string} conversationId - conversation id
   * @param {Message} message message object
   * @returns {Promise<void>} Promise <void>
   */
  async setMessage(conversationId: string, message: Message): Promise<void> {
    await this._db
      .collection(conversationId)
      .doc(message.getId())
      .set(message.toObj(), { merge: true });
  }

  /**
   * listen to new messages (latest 25)
   *
   * @param {string} conversationsId conversation's id
   * @param {Function} callback callback function that should be invoked whenever the document change
   * @returns {void} void
   */
  listenToMessages(conversationsId: string, callback: Function, errorCallback: Function): void {
    let collectionQuery = this._db
      .collection(conversationsId)
      .orderBy("timestamp", "desc")
      .limit(this._limit);
    this.__listeners[conversationsId] = collectionQuery.onSnapshot(
      (snapshot) => {
        callback(snapshot.empty ? false : snapshot.docs);
      },
      (error) => {
        errorCallback(error);
      },
    );
  }
}

export default FirebaseMessagesRepository;
