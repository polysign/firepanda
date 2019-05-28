import { Collection, Firepanda } from '../../index';

@Firepanda({
  name: 'users',
  id: {
    from: 'uid'
  },
  schema: {
    uid: { type: 'string', required: true },
    displayName: { type: 'string' },
    email: { type: 'string' },
    photoUrl: { type: 'string', default: 'http://www.gravatar.com/avatar/1337?d=identicon' },
    age: { type: 'number', default: 18 },
    active: { type: 'boolean' },
    roles: { type: 'array' },
    preferences: { type: 'map' },
    position: { type: 'geopoint' },
    createdAt: { type: 'timestamp', transform: { on: 'beforeAdd' } },
  }
})
export class UsersCollection extends Collection {

  removeAllUserData = async (snap, context) => {
    console.log(snap.data());
    console.log(context);
  }
  
  otherFunction = async (change, context) => {
    console.log(change);
    console.log(context);
  }

}
