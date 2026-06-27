import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import FirebaseMessagesRepository from '../src/datastore/firebase/firebase_messages_repository';
import { Message, NewMessage } from '../src/Models/message';

describe('FirebaseMessagesRepository Integration Tests', () => {
  let firebaseMessagesRepository: FirebaseMessagesRepository;
  const testConversationId = 'test_conversation_1';
  const testMessageId = 'test_message_1';
  const testMessageData: NewMessage = {
    id: testMessageId,
    content: 'Hello, this is a test message!',
    senderId: 'user_1',
    timestamp: Date.now(),
  };

  beforeAll(() => {
    const app = initializeApp({
      credential: cert('./key/key.json'),
    });
    const db = getFirestore(app);
    firebaseMessagesRepository = new FirebaseMessagesRepository(db);
  });

  // afterAll(async () => {
  //   const db = getFirestore();
  //   await db.collection(testConversationId).doc(testMessageId).delete(); // Clean up test data
  //   await db.terminate();
  // });

  test('should add a message to Firestore', async () => {
    const message = new Message(testMessageData);
    await firebaseMessagesRepository.setMessage(testConversationId, message);

    const db = getFirestore();
    const doc = await db.collection(testConversationId).doc(testMessageId).get();
    expect(doc.exists).toBe(true);
    expect(doc.data()).toMatchObject(message.toObj());
  });

  test('should retrieve messages from Firestore', async () => {
    const result = await firebaseMessagesRepository.getMessages(testConversationId);
    expect(result.data()).toBeInstanceOf(Array);
    expect(result.data()?.length).toBeGreaterThan(0);
    expect(result.data()?.some((msg) => msg.getId() === testMessageId)).toBe(true);
  });

  test('should listen to new messages in Firestore', (done) => {
    const newMessageId = 'test_message_2';
    const newMessageData: NewMessage = {
      id: newMessageId,
      content: 'This is a new test message!',
      senderId: 'user_2',
      timestamp: Date.now(),
    };
    const newMessage = new Message(newMessageData);

    firebaseMessagesRepository.listenToMessages(
      testConversationId,
      (data) => {
        const messages = data.data();
        expect(messages?.some((msg) => msg.getId() === newMessageId)).toBe(true);
        done();
      },
      (error) => {
        done.fail(error);
      },
    );

    firebaseMessagesRepository.setMessage(testConversationId, newMessage);
  });

  test('should delete a message from Firestore', async () => {
    await firebaseMessagesRepository.deleteMessage(testConversationId, testMessageId);

    const db = getFirestore();
    const doc = await db.collection(testConversationId).doc(testMessageId).get();
    expect(doc.exists).toBe(false);
  });

  describe('Transaction Support - Messages', () => {
    const transactionTestConvId = `txn_msg_conv_${Date.now()}`;
    const transactionTestMessageId = `txn_msg_${Date.now()}`;
    const transactionTestMessageData: NewMessage = {
      id: transactionTestMessageId,
      senderId: 'txn_msg_user_1',
      content: 'Transaction test message',
      timestamp: Date.now(),
    };

    test('should support transaction parameter in setMessage', async () => {
      const db = getFirestore();
      const message = new Message(transactionTestMessageData);

      const result = await db.runTransaction(async (transaction) => {
        await firebaseMessagesRepository.setMessage(transactionTestConvId, message, { transaction });
        return message.getId();
      });

      expect(result).toBe(transactionTestMessageId);

      const retrieved = await firebaseMessagesRepository.getMessages(transactionTestConvId);
      expect(retrieved.hasData()).toBe(true);
    });

    test('should support transaction parameter in getMessages', async () => {
      const db = getFirestore();
      const message = new Message(transactionTestMessageData);
      await firebaseMessagesRepository.setMessage(transactionTestConvId, message);
      await firebaseMessagesRepository.commit();

      const result = await db.runTransaction(async (transaction) => {
        const result = await firebaseMessagesRepository.getMessages(
          transactionTestConvId,
          undefined,
          {
            transaction,
          },
        );
        return result.data()?.length;
      });

      expect(result).toBeGreaterThan(0);
    });

    test('should support transaction parameter in deleteMessage', async () => {
      const db = getFirestore();
      const testMsgId = `txn_delete_msg_${Date.now()}`;
      const message = new Message({ ...transactionTestMessageData, id: testMsgId });
      await firebaseMessagesRepository.setMessage(transactionTestConvId, message);
      await firebaseMessagesRepository.commit();

      await db.runTransaction(async (transaction) => {
        await firebaseMessagesRepository.deleteMessage(transactionTestConvId, testMsgId, {
          transaction,
        });
      });

      const retrieved = await firebaseMessagesRepository.getMessages(transactionTestConvId);
      expect(retrieved.data()?.some((msg) => msg.getId() === testMsgId)).toBe(false);
    });
  });
});
