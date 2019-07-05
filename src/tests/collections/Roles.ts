import { Collection, Firepanda } from '../../index';

@Firepanda({
  name: 'roles',
  schema: {
    uid: { type: 'string' },
    role: { type: 'enum', values: ['guest', 'admin', 'member'], default: 'member' }
  }
})
export class RolesCollection extends Collection {

}
