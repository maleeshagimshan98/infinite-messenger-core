import { Message, NewMessage } from '../src/Models/message';

// filepath: d:\Infinite\Experiments\messenger-v2.0\messenger-core-v2.0\src\Models\message.test.ts

describe('Message Class', () => {
  const validMessage: NewMessage = {
    id: '123',
    senderId: 'user1',
    content: 'Hello, World!',
    time: '2025-01-01T00:00:00Z',
    timestamp: 1672531200000,
  };

  describe('Constructor', () => {
    it('should initialize all fields correctly with valid inputs', () => {
      const message = new Message(validMessage);
      expect(message.getId()).toBe('123');
      expect(message.getSenderId()).toBe('user1');
      expect(message.getContent()).toBe('Hello, World!');
      expect(message.getTime()).toBe('2025-01-01T00:00:00Z');
    });

    it('should set default values for optional fields', () => {
      const message = new Message({ senderId: 'user1' });
      expect(message.getId()).toBeDefined();
      expect(message.getContent()).toBe('');
      expect(message.getTime()).toBeDefined();
      expect(message.toObj().timestamp).toBeDefined();
    });

    it('should throw an error if senderId is missing', () => {
      expect(() => new Message({} as NewMessage)).toThrow(
        'Error:Message - Cannot set the senderId, It must be a valid id, but received undefined',
      );
    });
  });

  describe('Getters', () => {
    const message = new Message(validMessage);

    it('should return the correct id', () => {
      expect(message.getId()).toBe('123');
    });

    it('should return the correct senderId', () => {
      expect(message.getSenderId()).toBe('user1');
    });

    it('should return the correct time', () => {
      expect(message.getTime()).toBe('2025-01-01T00:00:00Z');
    });

    it('should return the correct content', () => {
      expect(message.getContent()).toBe('Hello, World!');
    });
  });

  describe('toObj Method', () => {
    it('should return the correct plain object representation', () => {
      const message = new Message(validMessage);
      expect(message.toObj()).toEqual(validMessage);
    });
  });

  describe('setTimestamp Method', () => {
    it('should update the timestamp to the current time', () => {
      const message = new Message(validMessage);
      const oldTimestamp = message.toObj().timestamp;
      message.setTimestamp();
      expect(message.toObj().timestamp).not.toBe(oldTimestamp);
    });
  });

  describe('update Method', () => {
    it('should update the time and content fields correctly', () => {
      const message = new Message(validMessage);
      message.update({
        time: '2025-01-02T00:00:00Z',
        content: 'Updated content',
      });
      expect(message.getTime()).toBe('2025-01-02T00:00:00Z');
      expect(message.getContent()).toBe('Updated content');
    });

    it('should call setTimestamp during the update', () => {
      const message = new Message(validMessage);
      const oldTimestamp = message.toObj().timestamp;
      message.update({});
      expect(message.toObj().timestamp).not.toBe(oldTimestamp);
    });
  });

  describe('setContent Method', () => {
    it('should update the content field correctly', () => {
      const message = new Message(validMessage);
      message.setContent('New content');
      expect(message.getContent()).toBe('New content');
    });

    it('should throw an error if the input is not a string', () => {
      const message = new Message(validMessage);
      expect(() => message.setContent(123 as unknown as string)).toThrow(
        'Error:Message - Cannot set the message content, it must be a string, but received number.',
      );
    });
  });
});
