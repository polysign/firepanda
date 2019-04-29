import test from 'ava';
import { Collection, Repository } from '../src/Firepanda';

import firebaseConfig from '../.secret/firebase.conf';
import { setupFirebase } from './helpers/firebaseHelper';
import { setupFixtures, teardownFixtures } from './helpers/fixturesHelper';

import { User, UserFixture } from './models/User';

let firebaseApp: firebase.app.App;

test.after.always(async () => {
  await teardownFixtures(firebaseApp, UserFixture);
});

test.before(async () => {
  firebaseApp = await setupFirebase(firebaseConfig);
});

test('Get existing document from collection', async t => {
  await setupFixtures(firebaseApp, UserFixture);

  let userModel = new User(firebaseApp, '1');
  const data = await userModel.get();
  t.deepEqual(data, UserFixture['1']);
});

test('Get non-existing document from collection', async t => {
  await setupFixtures(firebaseApp, UserFixture);
  
  let userModel = new User(firebaseApp, '99');
  const data = await userModel.get();
  t.deepEqual(data, undefined);
});
