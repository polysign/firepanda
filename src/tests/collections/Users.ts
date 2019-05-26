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
    createdAt: { type: 'timestamp', transform: { on: 'beforeAdd' } },
  },
  rules: {
    list: null,
    read: { isAuthenticated: true, equal: ['resource.data.userId', 'request.auth.uid'] },
    update: { isAuthenticated: true, equal: ['resource.data.userId', 'request.auth.uid'] },
    write: { isAuthenticated: true },
    delete: null
  },
  hooks: {
    removeAllUserData: { on: 'delete' },
    sendWelcomeEmail: { on: 'create' }
  }
})
export class UsersCollection extends Collection { }
