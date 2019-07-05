import * as Firebase from 'firebase';
import { setupFirebase } from './helpers/firebaseHelper';

import { RolesCollection } from './collections/Roles';
import { InvitationsCollection } from './collections/Invitations';

let firebaseApp: Firebase.app.App;
let Roles: RolesCollection;
let Invitations: InvitationsCollection;

beforeAll(async () => {
  firebaseApp = await setupFirebase();
  Roles = new RolesCollection(firebaseApp);
  Invitations = new InvitationsCollection(firebaseApp);
});

beforeEach(async () => {
  const roles = await Roles.getAll();
  await Promise.all(roles.map(async (role) => {
    return await Roles.delete(role._id);
  }));
  
  const invitations = await Invitations.getAll();
  await Promise.all(invitations.map(async (invitation) => {
    return await Invitations.delete(invitation._id);
  }));
});

afterAll(async () => {
  await firebaseApp.delete();
});

describe('Field ENUM', () => {
  describe('with default value on schema', () => {
    describe('without specifying a value', () => {
      test('it should select the first item in the enum schema', async () => {
        // Given
        const documentId = 'invitation-1234';
        const doc = await Roles.add({
          uid: 'fake-user'
        }, documentId);

        // When
        const role = await Roles.get(documentId);

        // Then
        expect(role.role).toBe('member');
      });
    });
    describe('with specifying a value that does not exist', () => {
      test('it should fallback to the default value', async () => {
        // Given
        const documentId = 'invitation-1111';
        const doc = await Roles.add({
          uid: 'fake-user',
          role: 'does-not-exist'
        }, documentId);

        // When
        const role = await Roles.get(documentId);

        // Then
        expect(role.role).toBe('member');
      });
    });
  });
  describe('without default value on schema', () => {
    describe('without specifying a value', () => {
      test('it should select the first item in the enum schema', async () => {
        // Given
        const documentId = 'invitation-1234';
        const doc = await Invitations.add({
          uid: 'fake-user'
        }, documentId);

        // When
        const invitation = await Invitations.get(documentId);

        // Then
        expect(invitation.role).toBe('guest');
      });
    });
    describe('with specifying a value that does not exist', () => {
      test('it should fallback to the first value in the schema definition', async () => {
        // Given
        const documentId = 'invitation-1111';
        const doc = await Invitations.add({
          uid: 'fake-user',
          role: 'does-not-exist'
        }, documentId);

        // When
        const invitation = await Invitations.get(documentId);

        // Then
        expect(invitation.role).toBe('guest');
      });
    });
  });
});
