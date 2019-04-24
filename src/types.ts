import { Collection, Repository } from './Firepanda';

export interface IRepository {
  save(data: any): Promise<any>;
}

export { Collection, Repository };
