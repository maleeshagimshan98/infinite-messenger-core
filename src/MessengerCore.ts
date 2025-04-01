/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import FirebaseRepository from './datastore/firebase/firebase_repository';
//import Mongodb from "./datastore/mongodb/mongodb";
import type { NewUser } from './Models/user';
import { User } from './Models/user';
import type { Datastore } from './datastore/interfaces/datastore';
import type DatabaseResult from './datastore/utils/DatabaseResult';
import { ConversationService } from './Service/ConversationService';
import { MessageService } from './Service/MessageService';

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
   * @type {Datastore}
   */
  private __datastore: Datastore;

  /**
   * Current user
   *
   * @type {User}
   */
  private __user!: User;

  /**
   * Conversation service
   *
   * @type {ConversationService}
   */
  private _conversationService!: ConversationService;

  /**
   * Message service
   *
   * @type {MessageService}
   */
  private _messageService!: MessageService;

  /**
   * constructor
   *
   * @param {object}
   */
  constructor({ dbDriver, dbConfig }: MessengerOptions) {
    this.__datastore = this.__initDataStore(dbDriver, dbConfig);
  }

  /**
   * get the conversation service
   *
   * @returns {ConversationService}
   */
  public conversationService(): ConversationService {
    return this._conversationService;
  }

  /**
   * get the message service
   *
   * @returns {MessageService}
   */
  public messageService(): MessageService {
    return this._messageService;
  }

  /**
   * initialise datastore
   *
   * @param {string} dbDriver - Database driver ("firebase", "mongodb")
   * @param {string} dbConfig - Path to database configuration
   * @returns {Datastore} datastore instance
   * @throws {Error}
   */
  private __initDataStore(dbDriver: string, dbConfig: string): Datastore {
    try {
      if (dbDriver == 'firebase') {
        return new FirebaseRepository(dbConfig);
      }
      // if (dbDriver == 'mongodb') {
      //   //this.__datastore = new MongodbRepository(dbConfig);
      //   //... mongodb
      // }
      else {
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
   * @returns {Promise<User> | undefined}
   */
  private async __getUser(userId: string): Promise<User | undefined> {
    const user: DatabaseResult<User> = await this.__datastore.user.getUser(userId);
    return user.data();
  }

  /**
   * initialise the user
   *
   * @param {string} userId user's id
   * @returns {Promise<void>} user object or false in failure
   */
  async initialize(userId: string): Promise<void> {
    const user = await this.__getUser(userId);
    if (user === undefined) {
      throw new Error('MessengerCore:Error: User not found');
    }
    this.__user = user;
    await this.__user.setIsActive(true);
    await this.updateUser(user);
    this._conversationService = new ConversationService(this.__user.getConversationsId(), this.__datastore);
    this._messageService = new MessageService(this.__user.getConversationsId(), this.__datastore);
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
   * update the user's data in datastore
   *
   * @returns {Promise<void>} Promise
   */
  async updateUser(user: User): Promise<void> {
    await this.__datastore.user.updateUser(user).catch((error: Error) => {
      //... handle error
      console.log(error);
    }); //... check
  }

  /**
   * create and save new user in the datastore
   *
   * @param {NewUser} user
   * @returns {Promise<User>}
   */
  async newUser(userObj: NewUser): Promise<User> {
    const user = new User(userObj);
    await this.__datastore.user.setUser(user);
    return user;
  }

  /**
   * initialise user's conversations
   *
   * @returns {Promise<void>} void
   */
  async initConversations(): Promise<void> {
    await this._conversationService.getConversations();
  }
}

module.exports = MessengerCore;
