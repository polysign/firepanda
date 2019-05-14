import { Collection, Repository } from '../../src/Firepanda';

@Collection({
  name: 'users',
  schema: {
    _id: { type: 'string', transform: { handler: async (context: User) => {
      return context.data.uid;
    }, on: 'write' }},
    uid: { type: 'string', required: true },
    displayName: { type: 'string' },
    email: { type: 'string' },
    photoUrl: { type: 'string', default: 'http://www.gravatar.com/avatar/1337?d=identicon' }
  },
  rules: {
    list: null,
    read: { isAuthenticated: true, equal: ['resource.data.userId', 'request.auth.uid'] },
    update: { isAuthenticated: true, equal: ['resource.data.userId', 'request.auth.uid'] },
    write: { isAuthenticated: true }
  },
  hooks: {
    removeAllUserData: { on: 'delete' },
    sendWelcomeEmail: { on: 'create' }
  }
})
export class User extends Repository { }

export const UserFixture = {
  '1': {
    uid: '1',
    displayName: 'Georges',
    email: 'fire@panda.com',
    photoUrl: 'http://'
  },
  '2': {
    uid: '2',
    displayName: 'Antpny',
    email: 'ant@panda.com'
  },
}
