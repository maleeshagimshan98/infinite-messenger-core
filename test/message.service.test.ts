import { MessageService } from '../src/Service/MessageService';
import FirebaseDatastore from '../src/datastore/firebase/firebase_repository';
import { Conversation } from '../src/Models/thread';
import { Message } from '../src/Models/message';
import DatabaseResultSet from '../src/datastore/utils/DatabaseResultSet';

describe('MessageService', () => {
  const datastore: FirebaseDatastore = new FirebaseDatastore('./key/key.json');
  let messageService: MessageService;
  let conversation: Conversation;
  let message: Message;

  beforeEach(() => {
    // Create a mock conversation
    conversation = new Conversation({
      id: 'conv-1',
      participants: ['user-1', 'user-2'],
    });

    // Create a mock message
    message = new Message({
      id: 'msg-1',
      senderId: 'user-1',
      content: 'Hello, world!',
      timestamp: new Date().getTime(),
    });

    // Initialize the MessageService
    messageService = new MessageService(conversation.getId(), datastore);
  });

  describe('getMessages', () => {
    test('should retrieve messages successfully', async () => {
      // Add a message to the datastore
      await datastore.messages.setMessage(conversation.getId(), message);

      // Retrieve messages
      const messagesCollection = await messageService.getMessages(conversation);

      // Assertions
      expect(messagesCollection).toBeInstanceOf(DatabaseResultSet);
      expect(messagesCollection.hasData()).toBe(true);
      expect(conversation.getMessages()).toHaveProperty(message.getId());
    });
  });

  describe('sendMessage', () => {
    test('should send a message successfully', async () => {
      // Send a message
      await messageService.sendMessage(conversation, message);

      // Assertions
      const messages = conversation.getMessages();
      expect(messages).toHaveProperty(message.getId());
      expect(messages[message.getId()]).toStrictEqual(message);
    });

    test('should handle errors during message sending', async () => {
      // Simulate an error by passing invalid data
      const invalidMessage = null as unknown as Message;

      await expect(messageService.sendMessage(conversation, invalidMessage)).rejects.toThrow();
    });
  });

  describe('listen', () => {
    test('should execute callback on new message updates', async () => {
      const callback = jest.fn();

      // Start listening
      messageService.listen(conversation, callback);

      // Simulate a new message update
      await datastore.messages.setMessage(conversation.getId(), message);

      // Wait for the callback to be invoked
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Assertions
      expect(callback).toHaveBeenCalled();
    });

    test('should throw an error if callback is not a function', () => {
      // Attempt to listen with an invalid callback
      expect(() => {
        messageService.listen(conversation, null as unknown as (data: DatabaseResultSet<Message[]>) => void);
      }).toThrow('Error:Thread - cannot listen to thread updates. Callback must be a function, but received object');
    });
  });

  describe('deleteMessage', () => {
    test('should delete a message successfully', async () => {
      // Add a message to the conversation
      conversation.setMessage(message);

      // Delete the message
      await messageService.deleteMessage(conversation, message.getId());

      // Assertions
      const messages = conversation.getMessages();
      expect(messages).not.toHaveProperty(message.getId());
    });

    test('should throw an error if message does not exist', async () => {
      // Attempt to delete a non-existent message
      await expect(messageService.deleteMessage(conversation, 'non-existent-msg-id')).rejects.toThrow(
        'Error:Conversation - cannot delete message. Message not found',
      );
    });

    test('should handle empty messages gracefully', async () => {
        // Retrieve messages when none exist
        const messagesCollection = await messageService.getMessages(conversation);
  
        // Assertions
        expect(messagesCollection.hasData()).toBe(false);
        expect(conversation.getMessages()).toEqual({});
      });
  });

  describe('detachListener', () => {
    test('should stop listening to new messages', () => {
      // Start listening
      conversation.setListening(true);

      // Detach the listener
      messageService.detachListener(conversation);

      // Assertions
      expect(conversation.isListening()).toBe(false);
    });
  });
});