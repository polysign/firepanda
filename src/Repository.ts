import { IRepository } from "./types";
import { WhereClause } from "./Query";

export class Repository implements IRepository {
  firebase: firebase.app.App;
  doc: firebase.firestore.DocumentReference;
  collection: Collection;
  id: string;
  data: any;

  constructor(firebaseInstance: firebase.app.App, documentId?: string) { /* STUB */ }
  
  /**
   * Stubbed methods in order to have intellisense on the Model
   */
  public async get(documentId?: string) { /* STUB */ }
  public async save(data?: any) { /* STUB */ }
  public async add(data: any) { /* STUB */ }
  public async delete(documentId?: string) { /* STUB */ }
  public async query(queryItems: WhereClause[]) { /* STUB */ }
}