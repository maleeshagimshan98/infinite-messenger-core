import {MessengerCore} from '../src/MessengerCore';
import { User, NewUser } from '../src/Models/user';
import { ConversationService } from '../src/Service/ConversationService';
import { MessageService } from '../src/Service/MessageService';

describe('MessengerCore', () => {
  const messengerCore: MessengerCore = new MessengerCore({ dbDriver: 'firebase', dbConfig: './key/key.json' });
  let user: User;

  beforeEach(() => {
    // Create a mock user
    user = new User({
      id: 'user-1',
      name: 'John Doe',
      profileImg: 'https://example.com/profile.jpg',
      lastSeen: '2025-01-01T00:00:00.000Z',
      permissions: ['read', 'write'],
      conversationsId: 'conv-user-1',
    });
  });

  describe('constructor', () => {
    test('should initialize with Firebase datastore', () => {
      expect(messengerCore).toBeInstanceOf(MessengerCore);
    });

    test('should throw an error for invalid database driver', () => {
      expect(() => {
        new MessengerCore({ dbDriver: 'invalid', dbConfig: './key/key.json' });
      }).toThrow('MessengerCore:Error: Datastore initialisation failed');
    });
  });

  describe('initialize', () => {
    test('should initialize user and services successfully', async () => {
      // Initialize MessengerCore with the user
      await messengerCore.initialize(user.getId());

      // Assertions
      expect(messengerCore.conversationService()).toBeInstanceOf(ConversationService);
      expect(messengerCore.messageService()).toBeInstanceOf(MessageService);
    });

    test('should throw an error if user is not found', async () => {
      await expect(messengerCore.initialize('non-existent-user')).rejects.toThrow(
        'MessengerCore:Error: User not found',
      );
    });
  });

  describe('setUser', () => {
    test('should set the current user', () => {
      messengerCore.setUser(user);

      // Assertions
      expect(messengerCore.getUser()).toBe(user);
    });
  });

  describe('updateUser', () => {
    test('should update user data in the datastore', async () => {
      // Update the user's name
      user.setName('Jane Doe');
      await messengerCore.updateUser(user);

      // Retrieve the updated user
      const updatedUser = messengerCore.getUser();
      expect(updatedUser?.getName()).toBe('Jane Doe');
    });

    test('should handle errors during user update', async () => {
      // Simulate an error by passing an invalid user
      const invalidUser = null as unknown as User;

      await expect(messengerCore.updateUser(invalidUser)).rejects.toThrow();
    });
  });

  describe('newUser', () => {
    test('should create and save a new user in the datastore', async () => {
      const newUser: NewUser = {
        id: 'user-2',
        name: 'Alice',
        profileImg: 'https://example.com/alice.jpg',
        lastSeen: '2025-01-01T00:00:00.000Z',
        permissions: ['read', 'write'],
        conversationsId: 'conv-user-2',
      };

      const createdUser = await messengerCore.newUser(newUser);

      // Assertions
      expect(createdUser).toBeInstanceOf(User);
      expect(createdUser.getId()).toBe(newUser.id);

      // Verify the user exists in the datastore
      const retrievedUser = await messengerCore.userService().getUser(newUser.id);
      expect(retrievedUser?.getId()).toBe(newUser.id);
    });
  });  

  describe('conversationService', () => {
    test('should return the conversation service instance', async () => {
      // Initialize MessengerCore with the user
      await messengerCore.initialize(user.getId());

      // Assertions
      expect(messengerCore.conversationService()).toBeInstanceOf(ConversationService);
    });
  });

  describe('messageService', () => {
    test('should return the message service instance', async () => {
      // Initialize MessengerCore with the user
      await messengerCore.initialize(user.getId());

      // Assertions
      expect(messengerCore.messageService()).toBeInstanceOf(MessageService);
    });
  });

  describe('initConversations', () => {
    test('should initialize user conversations', async () => {
      // Initialize MessengerCore with the user
      await messengerCore.initialize(user.getId());

      // Initialize conversations
      await messengerCore.initConversations();

      // Assertions
      const conversations = await messengerCore.conversationService().getConversations();
      expect(conversations).toBeDefined();
    });
  });
});