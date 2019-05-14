import { Collection, Repository } from '../Firepanda';

import firebaseConfig from '../../.secret/firebase.conf';
import { setupFirebase } from './helpers/firebaseHelper';
import { setupFixtures, teardownFixtures } from './helpers/fixturesHelper';

import { User, UserFixture } from './models/User';

let firebaseApp: firebase.app.App;

beforeAll(async () => {
  firebaseApp = await setupFirebase(firebaseConfig);
});

afterAll(() => {
  //
});

describe('Models', () => {

  describe('Schema', () => {
    test('does exist', async () => {
      expect(true).toBe(true);
    });
    test('does not exist', async () => {
      expect(true).toBe(true);
    });
  });
  
  describe('Hooks', () => {
    test('does exist', async () => {
      expect(true).toBe(true);
    });
    test('does not exist', async () => {
      expect(true).toBe(true);
    });
  });

  describe('Rules', () => {
    test('does exist', async () => {
      expect(true).toBe(true);
    });
    test('does not exist', async () => {
      expect(true).toBe(true);
    });
  });
});
