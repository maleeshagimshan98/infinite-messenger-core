/**
 * Copyright - 2025 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import type { Firestore } from 'firebase-admin/firestore';
import DatabaseResultSet from '../utils/DatabaseResultSet';
import type { UsersRepositroy } from '../interfaces/repository';
import FirebaseRepositoryBase from './firebase_repository_base';
import type { NewUser } from '../../Models/user';
import { User } from '../../Models/user';
import DatabaseResult from '../utils/DatabaseResult';

class FirebaseUsersRepository extends FirebaseRepositoryBase implements UsersRepositroy {
  /**
   * user collection name
   *
   * @type {string}
   */
  private __userCollectionName: string;

  constructor(db: Firestore) {
    super(db);
    this.__userCollectionName = 'users';
  }

  /**
   * get array of users from firebase collection
   * get results from given point if start is provided
   *
   * @param {string | undefined} start starting point
   * @returns {Promise<DatabaseResultSet<User[]>>} users
   */
  async getUsers(start?: string): Promise<DatabaseResultSet<User[]>> {
    const collectionQuery = this.__buildCollectionQuery(this.__userCollectionName, 'id', 'asc', start);
    const usersSnapshot = await collectionQuery.get();
    if (usersSnapshot.empty) {
      return new DatabaseResultSet();
    }
    return new DatabaseResultSet<User[]>(
      this.__createModelFromCollection(
        (data) => new User(data as NewUser),
        this.__getDataFromCollection(usersSnapshot),
      ),
    );
  }

  /**
   * add multiple users to firebase collection
   * writes data in a batch
   *
   * @param {User[]} users - array of users
   * @returns {Promise<void>} void
   */
  async setUsers(users: User[]): Promise<void> {
    const batch = this.batch();
    users.forEach((user) => {
      batch.set(this._db.collection(this.__userCollectionName).doc(user.getId()), user.toObj());
    });
    await batch.commit();
  }

  /**
   * get a single user, returns false if user not exists
   *
   * @param {string} userId user's id
   * @returns {Promise<User>} user
   * @throws {Error}
   */
  async getUser(userId: string): Promise<DatabaseResult<User>> {
    const dbResult = await this.__doc(this.__userCollectionName, userId);
    if (!dbResult.exists) {
      return new DatabaseResult<User>();
    }
    return new DatabaseResult(new User(dbResult.data() as NewUser));
  }

  /**
   * set a single user in the firebase collection
   * updates the user if user exists
   *
   * @param {User} user
   * @returns {Promise<void>} void
   */
  async setUser(user: User): Promise<void> {
    await this._db.collection(this.__userCollectionName).doc(user.getId()).set(user.toObj(), { merge: true });
  }

  /**
   * update a user's data
   *
   * @param {User} user
   * @returns {Promise<void>} void
   */
  async updateUser(): Promise<void> {
    //... TODO
  }
}

export default FirebaseUsersRepository;
