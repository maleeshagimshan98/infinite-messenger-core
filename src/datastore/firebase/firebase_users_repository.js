/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

const DatabaseResult = require("../utils/DatabaseResult")
const firebaseRepositoryBase = require("./firebase_repository_base")

class firebaseUsersRepository extends firebaseRepositoryBase {
  constructor(db) {
    super(db)
    this.__userCollectionName = "users"
  }

  /**
   * get array of users from firebase collection
   * get results from given point if start is provided
   *
   * @param {string|null} start starting point
   * @returns {Promise <array>}
   */
  async getUsers(start = null) {
    collectionQuery = this.__buildCollectionQuery(this.__userCollectionName, "id", "asc", start)
    let users = await collectionQuery.get()
    return this.__getDataFromCollection(users)
  }

  /**
   * add multiple users to firebase collection
   * writes data in a batch
   *
   * @param {array<User>} users - array of users
   * @returns {Promise<void>} void
   */
  async setUsers(users) {
    let batch = this.batch()
    users.forEach((user) => {
      batch.set(this._db.collection(this.__userCollectionName).doc(user.getId()).set(user.toObj()))
    })
    await batch.commit()
  }

  /**
   * get a single user, returns false if user not exists
   *
   * @param {string} userId user's id
   * @returns {Promise<DatabaseResult>} user
   * @throws {Error}
   */
  async getUser(userId) {
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
  async setUser(user) {
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
  async updateUser(user) {}
}

module.exports = firebaseUsersRepository
