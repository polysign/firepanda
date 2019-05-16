import * as firebase from 'firebase';

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

      async add(data: any, documentId?: string): Promise<string> {
        let docRef: firebase.firestore.DocumentReference;

        if (documentId) {
          docRef = this.collectionRef.doc(documentId);
          await docRef.set(data);
        } else {
          docRef = await this.collectionRef.add(data);
        }

        return docRef.id;
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
      
      async delete(documentId: string): Promise<boolean> {
        const docRef = this.collectionRef.doc(documentId);

        const docSnapshot = await docRef.get();
        if (docSnapshot.exists) {
          await docRef.delete();
          return true;
        }

        return false;
      }
    }
  }
}
