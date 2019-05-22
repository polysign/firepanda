import * as firebase from 'firebase';
import { Query, WhereClause } from './Query';

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

      async __handleTransform() {
        //
      }

      async __beforeAddHook(data: any, documentId?: string): Promise<[string|null, any]> {
        let docId = null;

        if (data && this.collectionSchema._id && this.collectionSchema._id.transform) {
          docId = await this.collectionSchema._id.transform.handler(data);
        }

        if (!docId && documentId) {
          docId = documentId;
        }

        return [ docId, data ];
      }
      
      async __afterAddHook(docRef: firebase.firestore.DocumentReference, data: any): Promise<any> {
        return data;
      }

      async __beforeUpdateHook(docRef: firebase.firestore.DocumentReference, data: any): Promise<any>  {
        // console.log('beforeSaveHook');
        // Object.keys(this.collectionSchema).forEach((key) => {
        //   if (this.collectionSchema[key].transform) {
        //     this.data[key] = this.collectionSchema[key].transform(this);
        //   }
        // })
      }
      
      async __afterUpdateHook(docRef: firebase.firestore.DocumentReference, data: any): Promise<any>  {
        // console.log('afterSaveHook');
      }
      
      async __beforeDeleteHook(docRef: firebase.firestore.DocumentReference): Promise<any> {
        // console.log('beforeDeleteHook');
      }

      async __afterDeleteHook(docRef: firebase.firestore.DocumentReference): Promise<any> {
        // console.log('afterDeleteHook');
      }
      
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
          await this.__beforeUpdateHook(docRef, data);
          await docRef.update(data);
          await this.__afterUpdateHook(docRef, data);
        } catch(e) { return false; }

        return true;
      }

      async add(data: any, documentId?: string): Promise<string> {
        const [ docId, docData ] = await this.__beforeAddHook(data, documentId);
        let docRef: firebase.firestore.DocumentReference;

        if (docId) {
          const existingDoc = await this.get(docId);
          if (existingDoc) {
            throw new Error(`Document does already exist with id ${docId}`);
          }
        }

        if ([undefined, null].includes(data)) {
          throw new Error('Data is undefined or null');
        }

        if (docId) {
          docRef = this.collectionRef.doc(docId);
          await docRef.set(docData);
        } else {
          docRef = await this.collectionRef.add(docData);
        }

        await this.__afterAddHook(docRef, docData);

        return docRef.id;
      }

      async delete(documentId: string): Promise<boolean> {
        const docRef = this.collectionRef.doc(documentId);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
          throw new Error(`Document does not exist with id ${documentId}`);
        }

        await this.__beforeDeleteHook(docRef);
        await docRef.delete();
        await this.__afterDeleteHook(docRef);

        return true;
      }

      async query(query: Query): Promise<any[]> {
        let collectionQuery: firebase.firestore.Query = this.collectionRef;

        if (Object.keys(query).length === 0) {
          throw new Error('Query object missing');
        }

        if (Object.keys(query).map((queryKey) => ['where', 'limit', 'orderBy'].includes(queryKey)).filter(Boolean).length === 0) {
          throw new Error('Query object malformed');
        }

        if (query.where) {
          query.where.map((queryItem: WhereClause) => {
            collectionQuery = collectionQuery.where(queryItem.field, queryItem.comparator as firebase.firestore.WhereFilterOp, queryItem.value);
          });
        } 

        if (query.limit) {
          collectionQuery = collectionQuery.limit(query.limit);
        }

        if (query.orderBy) {
          query.orderDirection === undefined ? query.orderDirection = 'asc' : query.orderDirection;
          collectionQuery = collectionQuery.orderBy(query.orderBy, query.orderDirection);
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
