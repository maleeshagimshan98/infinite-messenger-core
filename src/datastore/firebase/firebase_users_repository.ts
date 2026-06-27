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
import type { TransactionOptions } from './firebase_repository_base';

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
   * @param {TransactionOptions} transactionOptions optional transaction object
   * @returns {Promise<DatabaseResultSet<User[]>>} users
   */
  async getUsers(start?: string, transactionOptions?: TransactionOptions): Promise<DatabaseResultSet<User[]>> {
    const collectionQuery = this.__buildCollectionQuery(this.__userCollectionName, 'id', 'asc', start);
    let usersSnapshot;
    if (transactionOptions?.transaction) {
      usersSnapshot = await transactionOptions.transaction.get(collectionQuery);
    } else {
      usersSnapshot = await collectionQuery.get();
    }
    if (usersSnapshot.empty) {
      return new DatabaseResultSet<User[]>();
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
   * writes data in a batch (if no transaction)
   *
   * @param {User[]} users - array of users
   * @param {TransactionOptions} transactionOptions optional transaction object
   * @returns {Promise<void>} void
   */
  async setUsers(users: User[], transactionOptions?: TransactionOptions): Promise<void> {
    if (transactionOptions?.transaction) {
      // If transaction is active, use transaction writes
      users.forEach((user) => {
        transactionOptions.transaction!.set(
          this._db.collection(this.__userCollectionName).doc(user.getId()),
          user.toObj(),
        );
      });
    } else {
      // Otherwise use batch writes
      const batch = this.batch();
      users.forEach((user) => {
        batch.set(this._db.collection(this.__userCollectionName).doc(user.getId()), user.toObj());
      });
      await batch.commit();
    }
  }

  /**
   * get a single user, returns false if user not exists
   *
   * @param {string} userId user's id
   * @param {TransactionOptions} transactionOptions optional transaction object
   * @returns {Promise<User>} user
   * @throws {Error}
   */
  async getUser(userId: string, transactionOptions?: TransactionOptions): Promise<DatabaseResult<User>> {
    const dbResult = await this.__doc(this.__userCollectionName, userId, transactionOptions);
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
   * @param {TransactionOptions} transactionOptions optional transaction object
   * @returns {Promise<void>} void
   */
  async setUser(user: User, transactionOptions?: TransactionOptions): Promise<void> {
    const docRef = this._db.collection(this.__userCollectionName).doc(user.getId());
    if (transactionOptions?.transaction) {
      transactionOptions.transaction.set(docRef, user.toObj(), { merge: true });
    } else {
      await docRef.set(user.toObj(), { merge: true });
    }
  }

  /**
   * update a user's data
   *
   * @param {User} user
   * @param {TransactionOptions} transactionOptions optional transaction object
   * @returns {Promise<void>} void
   */
  async updateUser(user: User, transactionOptions?: TransactionOptions): Promise<void> {
    await this.__updateDoc(this.__userCollectionName, user.getId(), user.toObj(), transactionOptions);
  }

  /**
   * delete a user
   *
   * @param {User} user
   * @param {TransactionOptions} transactionOptions optional transaction object
   * @returns {Promise<void>}
   */
  async deleteUser(user: User, transactionOptions?: TransactionOptions): Promise<void> {
    await this.__deleteDoc(this.__userCollectionName, user.getId(), transactionOptions);
  }
}

export default FirebaseUsersRepository;
