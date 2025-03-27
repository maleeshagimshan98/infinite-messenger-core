import { User, NewUser } from '../src/Models/user';

describe('User Class', () => {
  let user: User;

  beforeEach(() => {
    const mockData: NewUser = {
      id: 'user-1',
      name: 'John Doe',
      profileImg: 'https://example.com/profile.jpg',
      lastSeen: '2025-01-01T00:00:00.000Z',
      permissions: ['read', 'write'],
      conversationsId: 'conv-user-1',
    };
    user = new User(mockData);
  });

  describe('getters', () => {
    test('getId should return the correct id', () => {
      expect(user.getId()).toBe('user-1');
    });

    test('getName should return the correct name', () => {
      expect(user.getName()).toBe('John Doe');
    });

    test('getProfileImg should return the correct profile image URL', () => {
      expect(user.getProfileImg()).toBe('https://example.com/profile.jpg');
    });

    test('getIsActive should return true by default', () => {
      expect(user.getIsActive()).toBe(true);
    });

    test('getLastSeen should return the correct last seen time', () => {
      expect(user.getLastSeen()).toBe('2025-01-01T00:00:00.000Z');
    });

    test('getConversationsId should return the correct conversations ID', () => {
      expect(user.getConversationsId()).toBe('conv-user-1');
    });

    test('getLastConversationId should return null by default', () => {
      expect(user.getLastConversationId()).toBeNull();
    });

    test('conversations should return an empty object by default', () => {
      expect(user.conversations()).toEqual({});
    });

    test('getPermissions should return the correct permissions', () => {
      expect(user.getPermissions()).toEqual(['read', 'write']);
    });
  });

  describe('toObj', () => {
    test('toObj should return a plain object representation of the user', () => {
      const expectedObject = {
        id: 'user-1',
        name: 'John Doe',
        profileImg: 'https://example.com/profile.jpg',
        lastSeen: '2025-01-01T00:00:00.000Z',
        isActive: true,
        permissions: ['read', 'write'],
        conversationsId: 'conv-user-1',
        lastConversationId: null,
      };
      expect(user.toObj()).toEqual(expectedObject);
    });
  });

  describe('setters', () => {
    test('setProfileImg should update the profile image URL', () => {
      user.setProfileImg('https://example.com/new-profile.jpg');
      expect(user.getProfileImg()).toBe('https://example.com/new-profile.jpg');
    });

    test('setIsActive should update the active status', async () => {
      await user.setIsActive(false);
      expect(user.getIsActive()).toBe(false);
    });

    test('setIsActive should throw an error for invalid input', async () => {
      await expect(
        user.setIsActive('invalid' as unknown as boolean),
      ).rejects.toThrow(
        'Error:User - cannot set the isActive status. It must be a boolean but received invalid',
      );
    });

    test('setLastSeen should update the last seen time', async () => {
      const newTime = '2025-01-02T00:00:00.000Z';
      await user.setLastSeen(newTime);
      expect(user.getLastSeen()).toBe(newTime);
    });

    test('setPermissions should add a new permission', () => {
      user.setPermissions('admin');
      expect(user.getPermissions()).toContain('admin');
    });
  });
});
