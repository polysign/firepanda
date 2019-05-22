import { Collection, Firepanda, WhereClause } from './index';

export interface ICollection {
  get(documentId?: string): Promise<any>;
  getAll(): Promise<{}[]>;
  update(documentId: string, data: {}): Promise<any>;
  add(data: any, documentId?: string): Promise<string>;
  delete(documentId?: string): Promise<boolean>;
  query(queryItems: WhereClause[]): Promise<any[]>;
}

export interface IDocument {
  
}

export { Collection, Firepanda };
