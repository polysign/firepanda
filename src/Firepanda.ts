import * as firebase from 'firebase';
import { WhereClause } from './Query';

interface FirepandaSchemaDefinition {
  type: string;
  name?: string;
  default?: any;
  required?: boolean;
  className?: string;
  transform?: TransformationFunctioin;
}

interface FirepandaRuleDefinition {
  isAuthenticated: Boolean;
  equal?: string[];
}

interface FirepandaHook {
  on: 'create' | 'write' | 'delete';
  functionName?: string;
}

interface FirepandaParams {
  name: string;
  schema: { [name: string]: FirepandaSchemaDefinition };
  rules: { [name: string]: FirepandaRuleDefinition }
  hooks?: { [name: string]: FirepandaHook };
}

interface TransformationFunctioin {
  handler: Function;
  on?: 'create' | 'write' | 'delete';
}

export function Firepanda(params: FirepandaParams) {
  return function<T extends {new(...args:any[]):{}}>(constructor: T) {
    return class extends constructor {
      firebaseApp: firebase.app.App;
      collectionName: string = params.name;
      collectionSchema: any = params.schema;
      collectionRef: firebase.firestore.CollectionReference;

      constructor(...args: any[]) {
        super();
        this.firebaseApp = args[0];

        if (this.collectionName && this.collectionName.length > 0) {
          this.collectionRef = this.__getCollectionRef();
        } else {
          throw new Error('Missing collection name');
        }
      }

      __getCollectionRef() {
        return this.firebaseApp.firestore().collection(this.collectionName);
      }

      __injectDefaults() {
        const data = {};
        Object.keys(this.collectionSchema).forEach((key) => {
          switch(this.collectionSchema[key].type) {
            case 'string':
              data[key] = this.collectionSchema[key].default ? this.collectionSchema[key].default : '';
              break;
            case 'number':
              data[key] = this.collectionSchema[key].default ? this.collectionSchema[key].default : 0;
              break;
            case 'array':
              data[key] = this.collectionSchema[key].default ? this.collectionSchema[key].default : [];
              break;
            case 'boolean':
              data[key] = this.collectionSchema[key].default ? this.collectionSchema[key].default : false;
              break;
          }
        });

        return data;
      }

      __beforeSaveHook() {
        console.log('beforeSaveHook');
        // Object.keys(this.collectionSchema).forEach((key) => {
        //   if (this.collectionSchema[key].transform) {
        //     this.data[key] = this.collectionSchema[key].transform(this);
        //   }
        // })
      }
      
      __afterSaveHook() {
        console.log('afterSaveHook');
      }
      
      __beforeDeleteHook() {
        console.log('beforeDeleteHook');
      }

      __afterDeleteHook() {
        console.log('afterDeleteHook');
      }

      // save() {
      //   this.__beforeSaveHook();
      //   console.log('SAVE FROM COLL');
      //   this.__afterSaveHook();
      // }
      
      async get(documentId: string): Promise<any> {
        const docRef = this.collectionRef.doc(documentId);
        const docSnapshot = await docRef.get();

        if (docSnapshot.exists) {
          return Object.assign(docSnapshot.data(), {_id: documentId});
        }

        return null;        
      }

      async getAll(): Promise<any[]> {
        const querySnapshot: firebase.firestore.QuerySnapshot = await this.collectionRef.get();
        const items: any[] = querySnapshot.docs.map((doc: firebase.firestore.QueryDocumentSnapshot) => {
          return Object.assign(doc.data(), {_id: doc.id});
        });

        return items;
      }
      
      async update(documentId: string, data: any): Promise<boolean> {
        const docRef = this.collectionRef.doc(documentId);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
          return false;
        }

        try {
          await docRef.update(data);
        } catch(e) { return false; }

        return true;
      }

      async add(data: any, documentId?: string): Promise<string> {
        let docRef: firebase.firestore.DocumentReference;
        
        if (documentId) {
          const existingDoc = await this.get(documentId);
          if (existingDoc) {
            throw new Error(`Document does already exist with id ${documentId}`);
          }
        }

        if ([undefined, null].includes(data)) {
          throw new Error('Data is undefined or null');
        }

        if (documentId) {
          docRef = this.collectionRef.doc(documentId);
          await docRef.set(data);
        } else {
          docRef = await this.collectionRef.add(data);
        }

        return docRef.id;
      }

      async delete(documentId: string): Promise<boolean> {
        const docRef = this.collectionRef.doc(documentId);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
          throw new Error(`Document does not exist with id ${documentId}`);
        }

        await docRef.delete();
        return true;
      }

      async query(queryItems: WhereClause[], limit?: number, orderBy?: string, order: 'asc' | 'desc' = 'asc'): Promise<any[]> {
        let collectionQuery: firebase.firestore.Query = this.collectionRef;
        queryItems.map((queryItem: WhereClause) => {
          collectionQuery = collectionQuery.where(queryItem.field, queryItem.comparator as firebase.firestore.WhereFilterOp, queryItem.value);
        });

        if (limit) {
          collectionQuery = collectionQuery.limit(limit);
        }

        if (orderBy) {
          collectionQuery = collectionQuery.orderBy(orderBy, order);
        }

        const querySnapshot = await collectionQuery.get();
        const documents = querySnapshot.docs.map((docSnapshot: firebase.firestore.QueryDocumentSnapshot) => {
          return docSnapshot.data();
        });
        
        return documents;  
      }
    }
  }
}
