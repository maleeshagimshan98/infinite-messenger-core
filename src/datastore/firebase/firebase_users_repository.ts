/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

import { Firestore } from "firebase-admin/firestore"
import DatabaseResult from "../utils/DatabaseResult"
import { UsersRepositroy } from "../interfaces/repository"
import FirebaseRepositoryBase from "./firebase_repository_base"
import {User} from "../../Models/user"

class FirebaseUsersRepository extends FirebaseRepositoryBase implements UsersRepositroy {

  /**
   * user collection name
   * 
   * @type {string}
   */
  __userCollectionName: string

  constructor(db: Firestore) {
    super(db)
    this.__userCollectionName = "users"
  }

  /**
   * get array of users from firebase collection
   * get results from given point if start is provided
   *
   * @param {number|null} start starting point
   * @returns {Promise<Record<string, any>[]>} users
   */
  async getUsers(start: number|null = null): Promise<Record<string, any>[]> {
    let collectionQuery = this.__buildCollectionQuery(this.__userCollectionName, "id", "asc", start)
    let users = await collectionQuery.get()
    return this.__getDataFromCollection(users)
  }

  /**
   * add multiple users to firebase collection
   * writes data in a batch
   *
   * @param {User[]} users - array of users
   * @returns {Promise<void>} void
   */
  async setUsers(users: User[]): Promise<void> {
    let batch = this.batch()
    users.forEach((user) => {
      batch.set(this._db.collection(this.__userCollectionName).doc(user.getId()),user.toObj())
    })
    await batch.commit()
  }

  /**
   * get a single user, returns false if user not exists
   *
   * @param {string} userId user's id
   * @returns {Promise<Record<string, any>>} user
   * @throws {Error}
   */
  async getUser(userId: string): Promise<Record<string, any>> {
    let dbResult = await this.__doc(this.__userCollectionName, userId)
    if (!dbResult.hasData()) {
      throw new Error(`Error:firebaseUserRepository - cannot find a user with the id ${userId}`)
    }
    return dbResult.data()
  }

  /**
   * set a single user in the firebase collection
   * updates the user if user exists
   *
   * @param {User} user
   * @returns {Promise<void>} void
   */
  async setUser(user: User): Promise<void> {
    await this._db
      .collection(this.__userCollectionName)
      .doc(user.getId())
      .set(user.toObj(), { merge: true })
  }

  /**
   * update a user's data
   *
   * @param {User} user
   * @returns {void} void
   */
  async updateUser(user: User) {
    //... TODO
  }
}

export default FirebaseUsersRepository
