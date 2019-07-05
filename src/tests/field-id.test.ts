import * as Firebase from 'firebase';
import { setupFirebase } from './helpers/firebaseHelper';

import { UsersCollection } from './collections/Users';
import { RolesCollection } from './collections/Roles';

let firebaseApp: Firebase.app.App;
let Users: UsersCollection;
let Roles: RolesCollection;

beforeAll(async () => {
  firebaseApp = await setupFirebase();
  Users = new UsersCollection(firebaseApp);
  Roles = new RolesCollection(firebaseApp);
});

beforeEach(async () => {
  const users = await Users.getAll();
  await Promise.all(users.map(async (user) => {
    return await Users.delete(user._id);
  }));
  
  
  const roles = await Roles.getAll();
  await Promise.all(roles.map(async (role) => {
    return await Roles.delete(role._id);
  }));
});

afterAll(async () => {
  await firebaseApp.delete();
});

describe('Field ID', () => {
  describe('with specified from', () => {
    describe('with specifying a value in the source/from field', () => {
      test('it should use the value from the field', async () => {
        // Given
        const documentId = 'fake-user-id';
        await Users.add({
          uid: documentId
        });

        // When
        const user = await Users.get(documentId);

        // Then
        expect(user._id).toBe(documentId);
      });
    });
    describe('with specifying a value in the source/from field, but using an existing id', () => {
      test('it should fail', async () => {
        // Given
        let error;

        const documentId = 'fake-user-id';
        await Users.add({
          uid: documentId
        });
        
        // When
        try {
          await Users.add({
            uid: documentId
          });
        } catch(e) {
          error = e.message;
        }

        // Then
        expect(error).toBe(`Document does already exist with id ${documentId}`);
      });
    });
  });
  describe('without specified from', () => {
    test('it should generate a new id', async () => {
      // Given
      // When
      const documentId = await Roles.add({
        uid: 'whatever'
      });

      // Then
      expect(documentId).toBeDefined();
    });
  });
});
