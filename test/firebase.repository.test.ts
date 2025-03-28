import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import FirebaseRepository from '../src/datastore/firebase/firebase_repository';
import FirebaseUsersRepository from '../src/datastore/firebase/firebase_users_repository';
import FirebaseConversationsRepository from '../src/datastore/firebase/firebase_conversations_repository';
import FirebaseMessagesRepository from '../src/datastore/firebase/firebase_messages_repository';

jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  cert: jest.fn(),
}));

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(),
}));

jest.mock('../src/datastore/firebase/firebase_users_repository');
jest.mock('../src/datastore/firebase/firebase_conversations_repository');
jest.mock('../src/datastore/firebase/firebase_messages_repository');

describe('FirebaseRepository', () => {
  const mockFirebaseConfig = 'mockFirebaseConfig';
  let firebaseRepository: FirebaseRepository;

  beforeEach(() => {
    (initializeApp as jest.Mock).mockReturnValue({});
    (getFirestore as jest.Mock).mockReturnValue({});
    (FirebaseUsersRepository as jest.Mock).mockImplementation(() => ({
      mockUserRepo: true,
    }));
    (FirebaseConversationsRepository as jest.Mock).mockImplementation(() => ({
      mockConversationsRepo: true,
    }));
    (FirebaseMessagesRepository as jest.Mock).mockImplementation(() => ({
      mockMessagesRepo: true,
    }));

    firebaseRepository = new FirebaseRepository(mockFirebaseConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize Firebase app with the correct config', () => {
    expect(initializeApp).toHaveBeenCalledWith({
      credential: cert(mockFirebaseConfig),
    });
  });

  test('should initialize Firestore instance', () => {
    expect(getFirestore).toHaveBeenCalled();
  });

  test('should initialize FirebaseUsersRepository with Firestore instance', () => {
    expect(FirebaseUsersRepository).toHaveBeenCalledWith({});
  });

  test('should initialize FirebaseConversationsRepository with Firestore instance', () => {
    expect(FirebaseConversationsRepository).toHaveBeenCalledWith({});
  });

  test('should initialize FirebaseMessagesRepository with Firestore instance', () => {
    expect(FirebaseMessagesRepository).toHaveBeenCalledWith({});
  });

  test('user getter should return the user repository', () => {
    expect(firebaseRepository.user).toEqual({ mockUserRepo: true });
  });

  test('conversations getter should return the conversations repository', () => {
    expect(firebaseRepository.conversations).toEqual({ mockConversationsRepo: true });
  });

  test('messages getter should return the messages repository', () => {
    expect(firebaseRepository.messages).toEqual({ mockMessagesRepo: true });
  });
});

