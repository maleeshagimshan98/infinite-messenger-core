/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type { Datastore } from '../datastore/interfaces/datastore';
import type { User } from '../Models/user';
import type DatabaseResult from '../datastore/utils/DatabaseResult';

class UserService {
  /**
   * Datastore
   *
   * @type {Datastore}
   */
  private __datastore: Datastore;

  constructor(datastore: Datastore) {
    this.__datastore = datastore;
  }

  /**
   * get a user from the datastore
   *
   * @param {string} userId user's id
   * @returns {Promise<User> | undefined}
   */
  public async getUser(userId: string): Promise<User | undefined> {
    const user: DatabaseResult<User> = await this.__datastore.user.getUser(userId);
    return user.data();
  }

  /**
   * create and save new user in the datastore
   *
   * @param {NewUser} user
   * @returns {Promise<User>}
   */
  async newUser(user: User): Promise<User> {
    await this.__datastore.user.setUser(user);
    return user;
  }

  /**
   * update the user's data in datastore
   *
   * @returns {Promise<User>} Promise
   */
  async updateUser(user: User): Promise<User> {
    await this.__datastore.user.updateUser(user);
    return user;
  }

  /**
   * delete a user from the database
   *
   * @param {User} user
   * @returns {Promise<User>}
   */
  async deleteUser(user: User): Promise<void> {
    await this.__datastore.__user.deleteUser(user);
  }
}

export { UserService };
