import test from 'ava';
// import * as firebase from 'firebase';
import { Collection, Repository } from '../src/Firepanda';

import firebaseConfig from '../.secret/firebase.conf';
import { setupFirebase } from './helpers/firebaseHelper';
import { setupFixtures, teardownFixtures } from './helpers/fixturesHelper';

let firebaseApp: firebase.app.App;

const fixtures = {
  'test/1': {
    name: 'hi',
    value: 1
  }
}

@Collection({
  name: 'test',
  schema: {
    name: { type: 'string' },
    value: { type: 'string' }
  }
})
class FixtureTest extends Repository { }

test.after.always(async () => {
  await teardownFixtures(firebaseApp, fixtures);
});

test.before(async () => {
  firebaseApp = await setupFirebase(firebaseConfig);
});

test('Get existing document from collection', async t => {
  await setupFixtures(firebaseApp, fixtures);

  let fixtureTest = new FixtureTest(firebaseApp, '1');
  const data = await fixtureTest.get();
  t.deepEqual(data, fixtures['test/1']);
});

test('Get non-existing document from collection', async t => {
  await setupFixtures(firebaseApp, fixtures);
  
  let fixtureTest = new FixtureTest(firebaseApp, '99');
  const data = await fixtureTest.get();
  t.deepEqual(data, undefined);
});
