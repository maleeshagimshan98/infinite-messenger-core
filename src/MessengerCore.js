/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

const firebaseRepository =  require("./datastore/firebase/firebase_repository");
//import Mongodb from "./datastore/mongodb/mongodb";
const User = require("./Models/user");

/**
 * Messenger core library
 *
 * controls user's conversations, messages
 */
class MessengerCore {
  /**
   * constructor
   *
   * @param {Object}
   */
  constructor({ dbDriver, dbConfig }) {
    this.__datastore;
    this.__initDataStore(dbDriver, dbConfig);
  }

  /**
   * initialise datastore
   *
   * @param {String} dbDriver
   * @param {String} dbConfig - Path to google application credentials
   * @returns {void} void
   */
  __initDataStore(dbDriver, dbConfig) {
    if (dbDriver == "firebase") {
      this.__datastore = new firebaseRepository(dbConfig);
    }
    if (dbDriver == "mongodb") {
      //this.__datastore = new Mongodb(dbConfig);
      //... mongodb
    } else {
      //... throw error
    }
  }

  /**
   * get a user from the datastore
   *
   * @param {String} userId user's id
   * @returns {Promise<User> | boolean}
   */
  async __getUser(userId) {
    let user = await this.__datastore.user.getUser(userId);
    return user ? new User(user, this.__datastore) : false;
  }

  /**
   * initialise the user
   *
   * @param {String} userId user's id
   * @returns {User|Boolean} user object or false in failure
   */
  async initUser(userId) {
    let user = await this.__getUser(userId);
    if (!user) {
      return false;
    }
    this.user = user;
    await this.user.setIsActive(true);
    await this.user.updateUser();
    return user;
  }

  /**
   * set a user object as current user
   *
   * @param {User} user
   * @returns {void} void
   */
  setUser(user) {
    this.user = user;
  }

  /**
   * create and save new user in the datastore
   *
   * @param {Object} user
   * @returns {Promise<User>}
   */
  async newUser(userObj) {
    let user = new User(userObj, this.__datastore);
    await this.__datastore.user.setUser(user);
    return user;
  }

  /**
   * initialise user's conversations
   *
   * @returns {Promise<void>} void
   */
  async initThreads() {
    await this.user.getConversations();
  }

  /**
   * listen to a user's conversation updates
   *
   * @param {Function} callback callback function that should be called whenever conversations update
   * @returns {void} void
   */
  listenToConversations(callback) {
    this.user.listenToConversations((threads) => {
      callback(threads);
    });
  }

  /**
   * create a new conversation
   *
   * @param {Array} participants array of participating users
   * @param {Object} thread thread data
   * @returns {void} void
   */
  async newThread(participants, thread) {
    let users = [];
    thread.participants = [this.user.getId()];

    participants.forEach((participant) => {
      thread.participants.push(participant.id);
      if (participant.id !== this.user.getId()) {
        users.push(new User(participant, this.__datastore));
      }
    });

    this.__datastore.batch(); //... change this, must not know internals
    users.forEach((user) => {
      user.startConversations(thread);
    });

    this.user.startConversations(thread);
    await this.__datastore.user.commit();
  }
}

module.exports =  MessengerCore;
