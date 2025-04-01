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
});
