/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */

const firebaseRepositoryBase = require ("./firebase_repository_base");

class firebaseUsersRepository extends firebaseRepositoryBase {

    constructor (db) {
        super(db);
        this.__userCollectionName = "users";
    }

    /**
     * get array of users from firebase collection
     * get results from given point if start is provided
     * 
     * @param {string|null} start starting point
     * @returns {Promise <array|Boolean>}
     */
    async getUsers (start=null) {
        collectionQuery = this.__buildCollectionQuery(this.__userCollectionName,'id','asc',start);
        let users = await collectionQuery.get();
        //... TODO - handle errors
        return users.empty ? false : this.__getDataFromCollection(users);
    }

    /**
     * add multiple users to firebase collection
     * writes data in a batch
     * 
     * @param {Array<User>} users - array of users
     * @returns {Promise<void>} void
     */
    async setUsers (users) {
        //... TODO - handle errors
        let batch = this.batch();
        users.forEach (user => {
            batch.set(this.db.collection(this.__userCollectionName).doc(user.getId()).set(user.toObj()));
        });
        await batch.commit();        
    }

    /**
     * get a single user, returns false if user not exists
     * 
     * @param {String} userId user's id
     * @returns {Promise<object|Boolean>} user
     */
    async getUser (userId) {
        return await this.__doc(this.__userCollectionName,userId);
        //... TODO - handle errors       
    }

    /**
     * set a single user in the firebase collection
     * updates the user if user exists
     * 
     * @param {User} user
     * @returns {Promise<void>} void
     */
    async setUser (user) {
        await this.db.collection(this.__userCollectionName).doc(user.getId()).set(user.toObj(),{merge : true});
        //... TODO - handle errors
    }

    /**
     * update a user's data
     * 
     * @param {User} user
     * @returns {void} void 
     */
    async updateUser (user) {

    }
}

module.exports = firebaseUsersRepository;