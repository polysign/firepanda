import { Collection, Firepanda } from '../../index';

@Firepanda({
  name: 'users',
  schema: {
    _id: { type: 'string', transform: { handler: async (data: any) => {
      return data.uid;
    }, on: 'write' }},
    uid: { type: 'string', required: true },
    displayName: { type: 'string' },
    email: { type: 'string' },
    photoUrl: { type: 'string', default: 'http://www.gravatar.com/avatar/1337?d=identicon' },
    age: { type: 'number', default: 18 },
    active: { type: 'boolean' },
    roles: { type: 'array' },
    preferences: { type: 'map' },
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
