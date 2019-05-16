import firebaseConfig from '../../.secret/firebase.conf';
import { setupFirebase } from './helpers/firebaseHelper';
import { setupFixtures, teardownFixtures } from './helpers/fixturesHelper';

import { UsersCollection, UsersFixture } from './collections/Users';

let firebaseApp: firebase.app.App;
let Users: UsersCollection;


beforeAll(async () => {
  firebaseApp = await setupFirebase(firebaseConfig);
  Users = new UsersCollection(firebaseApp);
});

afterEach(async () => {
  const users = await Users.getAll();
  await Promise.all(users.map(async (user) => {
    return await Users.delete(user._id);
  }));
});

describe('Collections > Get', () => {
  describe('Get object that does not exist yet', () => {
    test('it should return null', async () => {
      // Given
      const documentId = 'user-id-1234';
      await Users.delete(documentId);

      // When
      const user = await Users.get(documentId);

      // Then
      expect(user).toBe(null);
    });
  });
  describe('Get object that exists', () => {
    test('it should return the object from the database', async () => {
      // Given
      const documentId = 'user-id-1234';
      const data = { name: 'fakeUser' };
      await Users.delete(documentId);
      await Users.add(data, documentId);

      // When
      const user = await Users.get(documentId);

      // Then
      expect(user).toEqual(Object.assign(data, {_id: documentId}));
    });
  });
});
describe('Collections > getAll', () => {
  describe('Get all objects from a collection with no documents', () => {
    test('it should return the documents from the collection', async () => {
      // Given
      const users = await Users.getAll();
      await Promise.all(users.map(async (user) => {
        return await Users.delete(user._id);
      }));

      // When
      const documents = await Users.getAll();

      // Then
      expect(documents.length).toBe(0);
    });
  });
  describe('Get all objects from a collection with documents', () => {
    test('it should return the documents from the collection', async () => {
      // Given
      const documentIds = ['docA', 'docB', 'docC', 'docD'];
      const data = { name: 'fakeuser' };

      await Promise.all(documentIds.map(async (documentId) => {
        return await Users.add(data, documentId);
      }));

      // When
      const documents = await Users.getAll();

      // Then
      expect(documents.length).toBe(documentIds.length);
    });
  });
});
describe('Collections > update', () => {
});
describe('Collections > add', () => {
});
describe('Collections > delete', () => {
});
describe('Collections > query', () => {
});
