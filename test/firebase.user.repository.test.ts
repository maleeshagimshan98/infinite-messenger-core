import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import FirebaseUsersRepository from '../src/datastore/firebase/firebase_users_repository';
import { User, NewUser } from '../src/Models/user';

describe('FirebaseUsersRepository Integration Tests', () => {
  let firebaseUsersRepository: FirebaseUsersRepository;
  const testUserId = 'test_user_1';
  const testUserData: NewUser = {
    id: testUserId,
    name: 'Test User',
    profileImg: 'https://example.com/profile.jpg',
    lastSeen: new Date().toISOString(),
    permissions: ['read', 'write'],
    conversationsId: 'conv_test_user_1',
  };

  beforeAll(() => {
    const app = initializeApp({
      credential: cert('./key/key.json'),
    });
    const db = getFirestore(app);
    firebaseUsersRepository = new FirebaseUsersRepository(db);
  });

  afterAll(async () => {
    // const db = getFirestore();
    // await db.collection('users').doc(testUserId).delete(); // Clean up test data
    // await db.terminate();
  });

  test('should add a single user to Firestore', async () => {
    const user = new User(testUserData);
    await firebaseUsersRepository.setUser(user);

    const db = getFirestore();
    const doc = await db.collection('users').doc(testUserId).get();

    expect(doc.exists).toBe(true);
    expect(doc.data()).toMatchObject(user.toObj());
  });

  test('should retrieve a single user from Firestore', async () => {
    const result = await firebaseUsersRepository.getUser(testUserId);
    expect(result).not.toBeNull();
    expect(result.hasData()).toBe(true);
    expect(result.data()).toBeInstanceOf(User);
    expect(result.data()?.getId()).toBe(testUserId);
    expect(result.data()?.getName()).toBe(testUserData.name);
  });

  test('should retrieve multiple users from Firestore', async () => {
    const result = await firebaseUsersRepository.getUsers();
    expect(result.data()).toBeInstanceOf(Array);
    expect(result.data()?.length).toBeGreaterThan(0);
    expect(result.data()?.some((user) => user.getId() === testUserId)).toBe(true);
  });

  test('should update a user in Firestore', async () => {
    const updatedName = 'Updated Test User';
    const user = new User({ ...testUserData, name: updatedName });
    await firebaseUsersRepository.setUser(user);

    const result = await firebaseUsersRepository.getUser(testUserId);
    expect(result.hasData()).toBe(true);
    expect(result.data()?.getName()).toBe(updatedName);
  });

  test('should delete a user from Firestore', async () => {
    const db = getFirestore();
    await db.collection('users').doc(testUserId).delete();

    const result = await firebaseUsersRepository.getUser(testUserId);
    expect(result.hasData()).toBe(false);
  });

  describe('Transaction Support - Users', () => {
    const transactionTestUserId = `txn_user_${Date.now()}`;
    const transactionTestUserData: NewUser = {
      id: transactionTestUserId,
      name: 'Transaction Test User',
      profileImg: 'https://example.com/txn-profile.jpg',
      lastSeen: new Date().toISOString(),
      permissions: ['read', 'write'],
      conversationsId: `txn_conv_${Date.now()}`,
    };

    test('should support transaction parameter in setUser', async () => {
      const db = getFirestore();
      const user = new User(transactionTestUserData);

      const result = await db.runTransaction(async (transaction) => {
        await firebaseUsersRepository.setUser(user, { transaction });
        return user.getId();
      });

      expect(result).toBe(transactionTestUserId);

      const retrieved = await firebaseUsersRepository.getUser(transactionTestUserId);
      expect(retrieved.hasData()).toBe(true);
    });

    test('should support transaction parameter in getUser', async () => {
      const db = getFirestore();
      const user = new User(transactionTestUserData);
      await firebaseUsersRepository.setUser(user);

      const result = await db.runTransaction(async (transaction) => {
        const result = await firebaseUsersRepository.getUser(transactionTestUserId, { transaction });
        return result.data()?.getName();
      });

      expect(result).toBe(transactionTestUserData.name);
    });

    test('should support transaction parameter in updateUser', async () => {
      const db = getFirestore();
      const user = new User(transactionTestUserData);
      await firebaseUsersRepository.setUser(user);

      const updatedName = `Updated ${Date.now()}`;
      const result = await db.runTransaction(async (transaction) => {
        const updatedUser = new User({ ...transactionTestUserData, name: updatedName });
        await firebaseUsersRepository.updateUser(updatedUser, { transaction });
        return updatedName;
      });

      const retrieved = await firebaseUsersRepository.getUser(transactionTestUserId);
      expect(retrieved.data()?.getName()).toBe(updatedName);
    });

    test('should support transaction parameter in deleteUser', async () => {
      const db = getFirestore();
      const testId = `txn_delete_${Date.now()}`;
      const user = new User({ ...transactionTestUserData, id: testId });
      await firebaseUsersRepository.setUser(user);

      await db.runTransaction(async (transaction) => {
        await firebaseUsersRepository.deleteUser(user, { transaction });
      });

      const retrieved = await firebaseUsersRepository.getUser(testId);
      expect(retrieved.hasData()).toBe(false);
    });
  });
});
