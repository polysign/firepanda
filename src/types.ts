import { Collection, Firepanda, Query } from './index';

export interface ICollection {
  get(documentId?: string): Promise<any>;
  getAll(): Promise<{}[]>;
  update(documentId: string, data: {}): Promise<any>;
  add(data: any, documentId?: string): Promise<string>;
  delete(documentId?: string): Promise<boolean>;
  query(query: Query): Promise<any[]>;
}

export interface IDocument {
  
}

export { Collection, Firepanda };
