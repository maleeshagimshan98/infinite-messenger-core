import { ConversationService } from '../src/Service/ConversationService';
import FirebaseDatastore from '../src/datastore/firebase/firebase_repository';
import { Conversation, NewConversation } from '../src/Models/thread';
import { User } from '../src/Models/user';
import FirebaseConversationsRepository from '../src/datastore/firebase/firebase_conversations_repository';
// import DatabaseResultSet from '../src/datastore/utils/DatabaseResultSet';

describe('ConversationService', () => {
  const datastore: FirebaseDatastore = new FirebaseDatastore('./key/key.json');;
  let conversationService: ConversationService;
  let user: User;
  let conversation: Conversation;
  let conversationsRepository: FirebaseConversationsRepository;

  beforeEach(() => {
    conversationsRepository = datastore.conversations;

    // Create a mock user
    user = new User({
      id: 'user-1',
      name: 'John Doe',
      profileImg: 'https://example.com/profile.jpg',
      lastSeen: '2025-01-01T00:00:00.000Z',
      permissions: ['read', 'write'],
      conversationsId: 'conv-user-1',
    });

    const conversationData: NewConversation = {
      id: 'conv-1',
      participants: ['user-1', 'user-2'],
    };

    // Create a mock conversation
    conversation = new Conversation(conversationData);

    // Initialize ConversationService
    conversationService = new ConversationService(user.getConversationsId(), datastore);
  });

  describe('getConversations', () => {
    test('should retrieve conversations successfully', async () => {
      // Add a conversation to the datastore
      await conversationsRepository.addConversation(user.getConversationsId(), conversation);
      await conversationsRepository.commit();

      // Retrieve conversations
      const conversations = await conversationService.getConversations();

      console.log(conversations[conversation.getId()]);
      
      // Assertions      
      expect(conversations).toHaveProperty(conversation.getId());
      expect(conversations[conversation.getId()]).toStrictEqual(conversation);

      await conversationsRepository.deleteConversation(user.getConversationsId(),conversation.getId());
    });

    test('should handle empty conversations gracefully', async () => {
      // Retrieve conversations when none exist
      const conversations = await conversationService.getConversations();

      // Assertions
      expect(conversations).toEqual({});
    });
  });

  describe('startConversation', () => {
    test('should start a new conversation successfully', async () => {
      // Start a new conversation
      const result = await conversationService.startConversation(user, conversation);

      // Assertions
      expect(result).toBe(conversation);
      const conversations = await conversationService.getConversations();
      expect(conversations).toHaveProperty(conversation.getId());
    });

    test('should handle errors during conversation addition', async () => {
      // Simulate an error by passing invalid data
      const invalidConversation = null as unknown as Conversation;

      await expect(conversationService.startConversation(user, invalidConversation)).rejects.toThrow();
    });
  });

  describe('listenToConversations', () => {
    test('should execute callback on new conversation updates', async () => {
      const callback = jest.fn();

      // Start listening
      await conversationService.listenToConversations(callback);

      // Simulate a new conversation update
      await datastore.conversations.addConversation(user.getConversationsId(), conversation);
      await datastore.conversations.commit(); // Ensure the datastore commits the change

      // Wait for the callback to be invoked
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Assertions
      expect(callback).toHaveBeenCalled();
    });

    test('should handle errors during listening', async () => {
      // Simulate an error in the datastore
      jest.spyOn(datastore.conversations, 'listenToConversations').mockImplementation(() => {
        throw new Error('Listening error');
      });

      const callback = jest.fn();

      await expect(conversationService.listenToConversations(callback)).rejects.toThrow('Listening error');
    });
  });

  describe('deleteConversation', () => {
    test('should delete a conversation successfully', async () => {
      // Add a conversation to the datastore
      await datastore.conversations.addConversation(user.getConversationsId(), conversation);

      // Delete the conversation
      conversationService.deleteConversation(conversation);

      // Assertions
      const conversations = await conversationService.getConversations();
      expect(conversations).not.toHaveProperty(conversation.getId());
    });
  });

  describe('detachListener', () => {
    test('should stop listening to conversations', () => {
      // Mock the detach method
      const detachSpy = jest.spyOn(datastore.conversations, 'detach');

      // Detach the listener
      conversationService.detachListener();

      // Assertions
      // Verify that the datastore's detach method was called
      expect(detachSpy).toHaveBeenCalledWith(user.getConversationsId());
    });
  });
});
