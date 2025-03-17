/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import FirebaseRepository from './datastore/firebase/firebase_repository';
//import Mongodb from "./datastore/mongodb/mongodb";
import { User, NewUser } from './Models/user';
import Datastore from './datastore/interfaces/datastore';

type MessengerOptions = {
  dbDriver: string;
  dbConfig: string;
};

/**
 * Messenger core library
 *
 * controls user's conversations, messages
 */
class MessengerCore {
  /**
   * Datastore for the messenger
   *
   * @type {}
   */
  private __datastore!: Datastore;

  /**
   * Current user
   *
   * @type {User}
   */
  private __user!: User;
  /**
   * constructor
   *
   * @param {object}
   */
  constructor({ dbDriver, dbConfig }: MessengerOptions) {
    this.__initDataStore(dbDriver, dbConfig);
  }

  /**
   * initialise datastore
   *
   * @param {string} dbDriver - Database driver ("firebase", "mongodb")
   * @param {string} dbConfig - Path to database configuration
   * @returns {void} void
   */
  private __initDataStore(dbDriver: string, dbConfig: string): void {
    try {
      if (dbDriver == 'firebase') {
        this.__datastore = new FirebaseRepository(dbConfig);
      }
      if (dbDriver == 'mongodb') {
        //this.__datastore = new MongodbRepository(dbConfig);
        //... mongodb
      } else {
        throw new Error('MessengerCore:Error: Invalid database driver');
      }
    } catch (error) {
      console.log(`MessengerCore:Error: ${error}`);
      throw new Error('MessengerCore:Error: Datastore initialisation failed');
    }
  }

  /**
   * get a user from the datastore
   *
   * @param {string} userId user's id
   * @returns {Promise<User> | boolean}
   */
  private async __getUser(userId: string): Promise<User> {
    let user: Record<string, any> = await this.__datastore.user.getUser(userId);
    return new User(user as NewUser, this.__datastore);
  }

  /**
   * initialise the user
   *
   * @param {string} userId user's id
   * @returns {Promise<User>} user object or false in failure
   */
  async initUser(userId: string): Promise<User> {
    let user = await this.__getUser(userId);
    this.__user = user;
    await this.__user.setIsActive(true);
    await this.__user.updateUser();
    return user;
  }

  /**
   * set a user object as current user
   *
   * @param {User} user
   * @returns {void} void
   */
  setUser(user: User): void {
    this.__user = user;
  }

  /**
   * create and save new user in the datastore
   *
   * @param {NewUser} user
   * @returns {Promise<User>}
   */
  async newUser(userObj: NewUser): Promise<User> {
    let user = new User(userObj, this.__datastore);
    await this.__datastore.user.setUser(user);
    return user;
  }

  /**
   * initialise user's conversations
   *
   * @returns {Promise<void>} void
   */
  async initThreads(): Promise<void> {
    await this.__user.getConversations();
  }

  /**
   * listen to a user's conversation updates
   *
   * @param {Function} callback callback function that should be called whenever conversations update
   * @returns {void} void
   */
  listenToConversations(callback: Function): void {
    this.__user.listenToConversations((threads: QueryDocumentSnapshot) => {
      callback(threads.data);
    });
  }

  /**
   * create a new conversation
   *
   * @param {array} participants array of participating users
   * @param {object} thread thread data
   * @returns {Promise<void>} void
   */
  async newThread(participants: string[], thread) {
    let users = [];
    thread.participants = [this.__user.getId()];

    participants.forEach((participant) => {
      thread.participants.push(participant.id);
      if (participant.id !== this.__user.getId()) {
        users.push(new User(participant, this.__datastore));
      }
    });

    this.__datastore.batch(); //... change this, must not know internals
    users.forEach((user) => {
      user.startConversations(thread);
    });

    this.__user.startConversations(thread);
    await this.__datastore.user.commit();
  }
}

module.exports = MessengerCore;
