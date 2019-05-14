import { Repository } from '../index';
import { Collection } from '../Firepanda';

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

describe('Documents', () => {

  describe('Get', () => {
    test.only('does exist', async () => {
      const user = new User(firebaseApp, '1');
      await user.save(null);
      await user.get();

      expect(true).toBe(true);
    });
    test('does not exist', async () => {
      expect(true).toBe(true);
    });
  });
  
  describe('Set', () => {
    test('does exist', async () => {
      expect(true).toBe(true);
    });
    test('does not exist', async () => {
      expect(true).toBe(true);
    });
  });

  describe('List', () => {
    test('does exist', async () => {
      expect(true).toBe(true);
    });
    test('does not exist', async () => {
      expect(true).toBe(true);
    });
  });

  describe('Delete', () => {
    test('does exist', async () => {
      expect(true).toBe(true);
    });
    test('does not exist', async () => {
      expect(true).toBe(true);
    });
  });
});
