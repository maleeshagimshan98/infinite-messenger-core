import { UserService } from '../src/Service/UserService';
import FirebaseDatastore from '../src/datastore/firebase/firebase_repository';
import { User } from '../src/Models/user';

describe('UserService', () => {
  const datastore: FirebaseDatastore = new FirebaseDatastore('./key/key.json');
  const userService: UserService = new UserService(datastore);
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

  describe('getUser', () => {
    test('should retrieve a user successfully', async () => {
      // Add the user to the datastore
      await datastore.user.setUser(user);

      // Retrieve the user
      const retrievedUser = await userService.getUser(user.getId());

      // Assertions
      expect(retrievedUser).toBeInstanceOf(User);
      expect(retrievedUser?.getId()).toBe(user.getId());
      expect(retrievedUser?.getName()).toBe(user.getName());
    });

    test('should return undefined if the user does not exist', async () => {
      // Attempt to retrieve a non-existent user
      const retrievedUser = await userService.getUser('non-existent-user');

      // Assertions
      expect(retrievedUser).toBeUndefined();
    });
  });

  describe('newUser', () => {
    test('should create and save a new user in the datastore', async () => {
      // Create a new user
      const createdUser = await userService.newUser(user);

      // Assertions
      expect(createdUser).toBeInstanceOf(User);
      expect(createdUser.getId()).toBe(user.getId());

      // Verify the user exists in the datastore
      const retrievedUser = await datastore.user.getUser(user.getId());
      expect(retrievedUser.data()?.getId()).toBe(user.getId());
    });

    test('should handle errors during user creation', async () => {
      // Simulate an error by passing an invalid user
      const invalidUser = null as unknown as User;

      await expect(userService.newUser(invalidUser)).rejects.toThrow();
    });
  });

  describe('updateUser', () => {
    test('should update user data in the datastore', async () => {
      // Add the user to the datastore
      await datastore.user.setUser(user);

      // Update the user's name
      user.setName('Jane Doe');
      const updatedUser = await userService.updateUser(user);

      // Assertions
      expect(updatedUser).toBeInstanceOf(User);
      expect(updatedUser.getName()).toBe('Jane Doe');

      // Verify the updated user exists in the datastore
      const retrievedUser = await datastore.user.getUser(user.getId());
      expect(retrievedUser.data()?.getName()).toBe('Jane Doe');
    });

    test('should handle errors during user update', async () => {
      // Simulate an error by passing an invalid user
      const invalidUser = null as unknown as User;

      await expect(userService.updateUser(invalidUser)).rejects.toThrow();
    });
  });
});