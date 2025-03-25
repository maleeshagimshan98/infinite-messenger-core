/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type { Firestore } from 'firebase-admin/firestore';
import type { MessagesRepository } from '../interfaces/repository';
import FirebaseRepositoryBase from './firebase_repository_base';
import type { NewMessage } from '../../Models/message';
import { Message } from '../../Models/message';
import DatabaseResultSet from '../utils/DatabaseResultSet';

class FirebaseMessagesRepository extends FirebaseRepositoryBase implements MessagesRepository {
  constructor(db: Firestore) {
    super(db);
  }

  /**
   * get messages from firebase
   * get results from given point if start is provided
   *
   * @param {string} conversationId - conversation id
   * @param {number | undefined} start - starting point
   * @returns {Promise <DatabaseResultSet<Message[]>>} messages
   */
  async getMessages(conversationId: string, start?: number): Promise<DatabaseResultSet<Message[]>> {
    const collectionQuery = this.__buildCollectionQuery(conversationId, 'timestamp', 'desc', start);
    const conversationsSnapshot = await collectionQuery.get();
    if (conversationsSnapshot.empty) {
      return new DatabaseResultSet<Message[]>();
    }
    return new DatabaseResultSet<Message[]>(
      this.__createModelFromCollection(
        (data: unknown) => new Message(data as NewMessage),
        this.__getDataFromCollection(conversationsSnapshot),
      ),
    );
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
    await this._db.collection(conversationId).doc(message.getId()).set(message.toObj(), { merge: true });
  }

  /**
   * listen to new messages (latest 25)
   *
   * @param {string} conversationId conversation's id
   * @param {(data: unknown) => void} callback callback function that should be invoked whenever the document change
   * @param {(error: Error) => void} errorCallback callback function that should be invoked whenever an error occurs
   * @returns {void} void
   */
  listenToMessages(
    conversationId: string,
    callback: (data: DatabaseResultSet<Message[]>) => void,
    errorCallback: (error: Error) => void,
  ): void {
    const collectionQuery = this._db.collection(conversationId).orderBy('timestamp', 'desc').limit(this._limit);
    this.__listeners[conversationId] = collectionQuery.onSnapshot(
      (snapshot) => {
        const messages = new DatabaseResultSet<Message[]>(
          this.__createModelFromCollection(
            (data: unknown) => new Message(data as NewMessage),
            this.__getDataFromCollection(snapshot),
          ),
        );
        callback(messages);
      },
      (error) => {
        errorCallback(error);
      },
    );
  }

  async deleteMessage(messageId: string): Promise<void> {
    //... delete messages
  }
}

export default FirebaseMessagesRepository;
