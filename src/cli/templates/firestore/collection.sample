import { Collection, Firepanda } from 'firepanda';

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
    active: { type: 'boolean' },
    createdAt: { type: 'timestamp', transform: { on: 'beforeAdd' } },
  }
})
export class UsersCollection extends Collection {

}
