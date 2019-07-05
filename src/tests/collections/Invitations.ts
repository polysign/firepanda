import { Collection, Firepanda } from '../../index';

@Firepanda({
  name: 'invitations',
  schema: {
    uid: { type: 'string' },
    role: { type: 'enum', values: ['guest', 'member', 'admin'] }
  }
})
export class InvitationsCollection extends Collection {

}
