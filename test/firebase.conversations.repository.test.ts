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

  beforeAll(async () => {
    const app = initializeApp({
      credential: cert('./key/key.json'),
    });
    const db = getFirestore(app);
    firebaseConversationsRepository = new FirebaseConversationsRepository(db);
    await firebaseConversationsRepository.addConversation(testConversationsId, new Conversation(testConversationData));
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

  describe('Transaction Support - Conversations', () => {
    const transactionTestConvId = `txn_conv_${Date.now()}`;
    const transactionTestConversationData: NewConversation = {
      id: transactionTestConvId,
      participants: ['txn_user_1', 'txn_user_2'],
      timestamp: Date.now(),
    };

    test('should support transaction parameter in addConversation', async () => {
      const db = getFirestore();
      const conversation = new Conversation(transactionTestConversationData);

      const result = await db.runTransaction(async (transaction) => {
        await firebaseConversationsRepository.addConversation(transactionTestConvId, conversation, {
          transaction,
        });
        return conversation.getId();
      });

      expect(result).toBe(transactionTestConvId);

      const retrieved = await firebaseConversationsRepository.getConversations(transactionTestConvId);
      expect(retrieved.hasData()).toBe(true);
    });

    test('should support transaction parameter in getConversations', async () => {
      const db = getFirestore();
      const conversation = new Conversation(transactionTestConversationData);
      await firebaseConversationsRepository.addConversation(transactionTestConvId, conversation);
      await firebaseConversationsRepository.commit();

      const result = await db.runTransaction(async (transaction) => {
        const result = await firebaseConversationsRepository.getConversations(
          transactionTestConvId,
          undefined,
          undefined,
          undefined,
          {
            transaction,
          },
        );
        return result.data()?.length;
      });

      expect(result).toBeGreaterThan(0);
    });

    test('should support transaction parameter in deleteConversation', async () => {
      const db = getFirestore();
      const testId = `txn_delete_conv_${Date.now()}`;
      const conversation = new Conversation({ ...transactionTestConversationData, id: testId });
      await firebaseConversationsRepository.addConversation(testId, conversation);
      await firebaseConversationsRepository.commit();

      await db.runTransaction(async (transaction) => {
        await firebaseConversationsRepository.deleteConversation(testId, conversation.getId(), {
          transaction,
        });
      });

      const retrieved = await firebaseConversationsRepository.getConversations(testId);
      expect(retrieved.data()).toBe(undefined);
    });
  });
});
