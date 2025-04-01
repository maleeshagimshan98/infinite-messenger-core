import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import FirebaseConversationsRepository from '../src/datastore/firebase/firebase_conversations_repository';
import { Conversation, NewConversation } from '../src/Models/thread';

describe('FirebaseConversationsRepository Integration Tests', () => {
  let firebaseConversationsRepository: FirebaseConversationsRepository;
  const testConversationsId = 'test_conversations_1';
  const testConversationId = 'test_conversation_1';
  const testConversationData: NewConversation = {
    id: testConversationId,
    participants: ['user_1', 'user_2'],
    timestamp: Date.now(),
  };

  beforeAll(() => {
    const app = initializeApp({
      credential: cert('./key/key.json'),
    });
    const db = getFirestore(app);
    firebaseConversationsRepository = new FirebaseConversationsRepository(db);
  });

  afterAll(async () => {
    const db = getFirestore();
    await db.collection(testConversationsId).doc(testConversationId).delete(); // Clean up test data
    await db.terminate();
  });

  test('should add a conversation to Firestore', async () => {
    const conversation = new Conversation(testConversationData);
    await firebaseConversationsRepository.addConversation(testConversationsId, conversation);
    await firebaseConversationsRepository.commit();

    const db = getFirestore();
    const doc = await db.collection(testConversationsId).doc(testConversationId).get();
    expect(doc.exists).toBe(true);
    expect(doc.data()).toMatchObject(conversation.toObj());
  });

  test('should retrieve conversations from Firestore', async () => {
    const result = await firebaseConversationsRepository.getConversations(testConversationsId);
    expect(result.data()).toBeInstanceOf(Array);
    expect(result.data()?.length).toBeGreaterThan(0);
    expect(result.data()?.some((conv) => conv.getId() === testConversationId)).toBe(true);
  });

  test('should listen to new conversations in Firestore', (done) => {
    const newConversationId = 'test_conversation_1';

    firebaseConversationsRepository.listenToConversations(
      testConversationsId,
      (data) => {
        const conversations = data.data();
        expect(conversations?.some((conv) => conv.getId() === newConversationId)).toBe(true);
        firebaseConversationsRepository.detach(testConversationsId);
        done();
      },
      (error) => {
        done.fail(error);
      },
    );
  });

  test('should delete a conversation from Firestore', async () => {
    await firebaseConversationsRepository.deleteConversation(testConversationsId, testConversationId);
    const db = getFirestore();
    const doc = await db.collection(testConversationsId).doc(testConversationId).get();
    expect(doc.exists).toBe(false);
  });
});
