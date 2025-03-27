import { Conversation, NewConversation } from '../src/Models/thread';
import { Message } from '../src/Models/message';

describe('Conversation Class', () => {
  let conversation: Conversation;

  beforeEach(() => {
    const mockData: NewConversation = {
      id: 'thread-1',
      participants: ['user-1', 'user-2'],
      timestamp: 1743068897000,
      startedDate: '2025-01-01T00:00:00.000Z',
      lastUpdatedTime: '2025-01-01T00:00:00.000Z',
      messages: {},
    };
    conversation = new Conversation(mockData);
  });

  test('getId should return the correct id', () => {
    expect(conversation.getId()).toBe('thread-1');
  });

  test('getParticipants should return the correct participants', () => {
    expect(conversation.getParticipants()).toEqual(['user-1', 'user-2']);
  });

  test('getStartedDate should return the correct started date', () => {
    expect(conversation.getStartedDate()).toBe('2025-01-01T00:00:00.000Z');
  });

  test('getLastUpdatedTime should return the correct last updated time', () => {
    expect(conversation.getLastUpdatedTime()).toBe('2025-01-01T00:00:00.000Z');
  });

  test('getLastMessageId should return undefined if no last message is set', () => {
    expect(conversation.getLastMessageId()).toBeUndefined();
  });

  test('getLastMessage should return null if no last message is set', () => {
    expect(conversation.getLastMessage()).toBeNull();
  });

  test('getMessages should return an empty object initially', () => {
    expect(conversation.getMessages()).toEqual({});
  });

  test('isListening should return false initially', () => {
    expect(conversation.isListening()).toBe(false);
  });

  test('setParticipants should add a new participant', () => {
    conversation.setParticipants('user-3');
    expect(conversation.getParticipants()).toContain('user-3');
  });

  test('setParticipants should throw an error for invalid input', () => {
    expect(() => conversation.setParticipants(123 as unknown as string)).toThrow(
      'Error:Thread - Cannot set the participant id. It must be a string, but received number'
    );
  });

  test('setMessage should correctly add a message and update lastMessageId', () => {
    const mockMessage = new Message({ id: 'msg-1', senderId: 'user-1', content: 'Hello World', timestamp: Date.now() });
    conversation.setMessage(mockMessage);

    expect(conversation.getLastMessageId()).toBe('msg-1');
    expect(conversation.getMessages()['msg-1']).toBe(mockMessage);
  });

  test('setMessages should correctly add multiple messages and update lastMessageId', () => {
    const mockMessages = [
      new Message({ id: 'msg-1', senderId: 'user-1', content: 'Hello World', timestamp: Date.now() }),
      new Message({ id: 'msg-2', senderId: 'user-2', content: 'Hello World - 2', timestamp: Date.now() }),
    ];
    conversation.setMessages(mockMessages);

    expect(conversation.getLastMessageId()).toBe('msg-2');
    expect(Object.keys(conversation.getMessages())).toEqual(['msg-1', 'msg-2']);
  });

  test('deleteMessage should remove a message and update _lastUpdatedTime', () => {
    const initialLastUpdatedTime = conversation.getLastUpdatedTime();
    const mockMessage = new Message({ id: 'msg-1', senderId: 'user-1', content: 'Hello World', timestamp: Date.now() });
    conversation.setMessage(mockMessage);

    conversation.deleteMessage('msg-1');

    expect(conversation.getMessages()['msg-1']).toBeUndefined();
    expect(conversation.getLastUpdatedTime()).not.toBe(initialLastUpdatedTime);
  });

  test('deleteMessage should not throw an error for non-existent messageId', () => {
    expect(() => conversation.deleteMessage('non-existent-id')).not.toThrow();
  });

  test('update should update participants and lastUpdatedTime', () => {
    const initialLastUpdatedTime = conversation.getLastUpdatedTime();
    conversation.update(['user-1', 'user-3']);

    expect(conversation.getParticipants()).toEqual(['user-1', 'user-3']);
    expect(conversation.getLastUpdatedTime()).not.toBe(initialLastUpdatedTime);
  });

  test('sync should not throw an error (placeholder test)', () => {
    expect(() => conversation.sync()).not.toThrow();
  });

  test('setListening should update the listening status', () => {
    conversation.setListening(true);
    expect(conversation.isListening()).toBe(true);

    conversation.setListening(false);
    expect(conversation.isListening()).toBe(false);
  });

  test('toObj should return a plain object representation of the conversation', () => {
    const expectedObject = {
      id: 'thread-1',
      participants: ['user-1', 'user-2'],
      startedDate: '2025-01-01T00:00:00.000Z',
      lastUpdatedTime: '2025-01-01T00:00:00.000Z',
      lastMessageId: undefined,
      timestamp: 1743068897000,
    };

    expect(conversation.toObj()).toEqual(expectedObject);
  });
});