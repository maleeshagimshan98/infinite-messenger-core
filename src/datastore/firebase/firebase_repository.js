/**
 * Copyright - 2021 - Maleesha Gimshan (github.com/maleeshagimshan98)
 */
 const admin = require('firebase-admin');
// const {getFirestore} = require("firebase/firestore");
 const firebaseUserRepository = require("./firebase_users_repository");
 const firebaseConversationRepository = require("./firebase_conversations_repository");
 const firebaseMessagesRepository = require("./firebase_messages_repository");

class firebaseRepository {

    constructor (firebaseConfig) {
        const app = admin.initializeApp({credential : admin.credential.cert(firebaseConfig)});
        this.__db = app.firestore();
        this.user = new firebaseUserRepository(this.__db);
        this.conversations = new firebaseConversationRepository(this.__db);
        this.messages = new firebaseMessagesRepository(this.__db);
    }
}

module.exports = firebaseRepository;