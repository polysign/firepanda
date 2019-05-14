import { Collection, Repository } from './index';

export interface IRepository {
  save(data: any): Promise<any>;
}

export { Collection, Repository };
