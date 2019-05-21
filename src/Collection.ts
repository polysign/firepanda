import { ICollection } from "./types";
import { WhereClause } from "./Query";

export class Collection implements ICollection {
  firebase: firebase.app.App;

  constructor(firebaseInstance: firebase.app.App) { /* STUB */ }

  /**
   * Stubbed methods in order to have intellisense on the Model
   */
  public async get(documentId?: string): Promise<any> { /* STUB */ return await null; }
  public async getAll(): Promise<any[]> { /* STUB */ return await []; }
  public async update(documentId: string, data: {}): Promise<boolean> { /* STUB */ return await true; }
  public async add(data: any, documentId?: string): Promise<string> { /* STUB */ return await ''; }
  public async delete(documentId?: string): Promise<boolean> { /* STUB */ return await true; }
  public async query(queryItems: WhereClause[], limit?: number, orderBy?: string, order: 'asc' | 'desc' = 'asc'): Promise<any[]> { /* STUB */ return await []; }
}
