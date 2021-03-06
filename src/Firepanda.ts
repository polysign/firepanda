import * as firebaseAdmin from 'firebase-admin';
import * as firebase from 'firebase';
import { Query, WhereClause } from './Query';

type DataEventTypes = 'beforeAdd' | 'afterAdd' | 'beforeUpdate' | 'afterUpdate' | 'beforeDelete' | 'afterDelete';

interface FirepandaSchemaDefinition {
  type: string;
  name?: string;
  default?: any;
  required?: boolean;
  className?: string;
  transform?: TransformationFunction;
}

interface FirepandaSchemaEnumDefinition extends FirepandaSchemaDefinition {
  values: string[];
}

interface FirepandaIdDefinition {
  from?: string;
}

interface FirepandaParams {
  name: string;
  id?: FirepandaIdDefinition;
  schema: { [name: string]: FirepandaSchemaDefinition | FirepandaSchemaEnumDefinition };
}

interface TransformationFunction {
  handler?: Function;
  on?: DataEventTypes;
}

export function Firepanda(params: FirepandaParams) {
  return function<T extends {new(...args:any[]):{}}>(constructor: T) {
    return class extends constructor {
      firebaseApp: firebaseAdmin.app.App;
      collectionName: string = params.name;
      collectionIdDefinition: FirepandaIdDefinition = params.id;
      collectionSchema: any = params.schema;
      collectionRef: firebaseAdmin.firestore.CollectionReference;

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

      async __injectDefaults(data: any): Promise<any> {
        Object.keys(this.collectionSchema).forEach((key) => {
          if (this.collectionSchema[key].default && (!data[key] || [].concat(data[key]).length === 0)) {
            data[key] = this.collectionSchema[key].default;
          }

          switch(this.collectionSchema[key].type) {
            case 'enum':
              if (!data[key]) {
                data[key] = this.collectionSchema[key].values[0];
              }
              break;
          }
        });

        return data;
      }

      async __handleIdField(data: any, documentId?: string): Promise<[string|null, any]> {
        let newDocumentId;

        if (this.collectionIdDefinition && this.collectionIdDefinition.from) {
          newDocumentId = data[this.collectionIdDefinition.from];
        }

        if (!newDocumentId && documentId) {
          newDocumentId = documentId;
        }

        return [ newDocumentId, data ];
      }

      __toBoolean(value: any): boolean {
        if (Array.isArray(value) && value.length > 0) {
          return true;
        }

        switch(typeof value) {
          case 'string':
            return value.toLowerCase() === 'yes' ? true : false;
          case 'number':
            return value !== 0 ? true : false;
          case 'boolean':
            return value;
        }

        return false;
      }

      __handleEvent(fieldSchema: any, value: any): any {
        switch(fieldSchema.type) {
          case 'timestamp':
            value = 123;
            break;
        }
      }

      async __cleanData(data: any): Promise<any> {
        Object.keys(data).forEach((objectKey) => {
          if (objectKey !== '_id' && this.collectionSchema[objectKey]) {
            switch(this.collectionSchema[objectKey].type) {
              case 'string':
                data[objectKey] = data[objectKey].toString();
                break;
              case 'enum':
                if (!Array.from(this.collectionSchema[objectKey].values).includes(data[objectKey].toString())) {
                  data[objectKey] = this.collectionSchema[objectKey].values[0];
                }
              case 'number':
                data[objectKey] = Number(data[objectKey]);
                break;
              case 'boolean':
                data[objectKey] = this.__toBoolean(data[objectKey]);
                break;
              case 'array':
                data[objectKey] = Array.from(data[objectKey]).filter(Boolean);
                break;
              case 'map':
                data[objectKey] = Object.assign({}, data[objectKey]);
                break;
              case 'timestamp':
                let seconds = 0;
                let nanoseconds = 0;

                if (data[objectKey]._seconds) {
                  seconds = data[objectKey]._seconds;
                } else {
                  seconds = data[objectKey].seconds;
                }
                
                if (data[objectKey]._nanoseconds) {
                  nanoseconds = data[objectKey]._nanoseconds;
                } else {
                  nanoseconds = data[objectKey].nanoseconds;
                }

                if (seconds && nanoseconds) {
                  data[objectKey] = Object.assign({}, {seconds, nanoseconds});
                } else {
                  throw new Error('Unable to create timestamp')
                }
                break;
              case 'geopoint':
                let latitude = 0;
                let longitude = 0;
                if (data[objectKey].latitude || data[objectKey].lat || data[objectKey]._latitude) {
                  latitude = data[objectKey].latitude | data[objectKey].lat | data[objectKey]._latitude;
                }
                if (data[objectKey].longitude || data[objectKey].lng || data[objectKey]._longitude) {
                  longitude = data[objectKey].longitude | data[objectKey].lng | data[objectKey]._longitude;
                }

                if (latitude && longitude) {
                  data[objectKey] = Object.assign({}, {latitude, longitude});
                } else {
                  throw new Error('Unable to create geopoint')
                }
                break;
            }
          }
        });

        return await this.__injectDefaults(data);
      }

      async __applyTransform(fieldValue: any, transform: TransformationFunction): Promise<any> {
        return await transform.handler(fieldValue);
      }

      async __applyFieldTransform(fieldValue: any, schemaType: string): Promise<any> {
        switch(schemaType) {
          case 'timestamp':
            const timestamp = Date.now();
            return {
              seconds: Math.round(timestamp / 1000),
              nanoseconds: timestamp
            };
        }

        return fieldValue;
      }

      async __handleTransform(data: any, event: DataEventTypes): Promise<any> {
        const promises = [];
        const transformedData = data;

        Object.keys(this.collectionSchema).forEach(async (fieldKey) => {
          if (this.collectionSchema[fieldKey].transform && this.collectionSchema[fieldKey].transform.on === event) {
            if (typeof this.collectionSchema[fieldKey].transform.handler === 'function') {
              promises.push(new Promise(async (resolve) => {
                const result = {};
                transformedData[fieldKey] = await this.__applyTransform(transformedData[fieldKey], this.collectionSchema[fieldKey].transform);
                result[fieldKey] = transformedData[fieldKey];
                resolve(result);
              }));
            } else {
              promises.push(new Promise(async (resolve) => {
                const result = {};
                transformedData[fieldKey] = await this.__applyFieldTransform(transformedData[fieldKey], this.collectionSchema[fieldKey].type);
                result[fieldKey] = transformedData[fieldKey];
                resolve(result);
              }));
            }
          }
        });

        return Promise.all(promises).then((results) => {
          let finalData = {};
          results.forEach((result) => {
            finalData = Object.assign(transformedData, result);
          });
          return finalData;
        }).catch((err) => {
          throw err;
        });
      }

      async __beforeAddHook(data: any): Promise<any> {
        return data;
      }
      
      async __afterAddHook(docRef: firebaseAdmin.firestore.DocumentReference, data: any): Promise<any> {
        return data;
      }

      async __beforeUpdateHook(docRef: firebaseAdmin.firestore.DocumentReference, data: any): Promise<any>  {
        // console.log('beforeSaveHook');
        // Object.keys(this.collectionSchema).forEach((key) => {
        //   if (this.collectionSchema[key].transform) {
        //     this.data[key] = this.collectionSchema[key].transform(this);
        //   }
        // })
      }
      
      async __afterUpdateHook(docRef: firebaseAdmin.firestore.DocumentReference, data: any): Promise<any>  {
        // console.log('afterSaveHook');
      }
      
      async __beforeDeleteHook(docRef: firebaseAdmin.firestore.DocumentReference): Promise<any> {
        // console.log('beforeDeleteHook');
      }

      async __afterDeleteHook(docRef: firebaseAdmin.firestore.DocumentReference): Promise<any> {
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
        const querySnapshot: firebaseAdmin.firestore.QuerySnapshot = await this.collectionRef.get();
        const items: any[] = querySnapshot.docs.map((doc: firebaseAdmin.firestore.QueryDocumentSnapshot) => {
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
        if ([undefined, null].includes(data)) {
          throw new Error('Data is undefined or null');
        }

        const [ docId, docData ] = await this.__handleIdField(
          Object.assign({}, await this.__handleTransform(data, 'beforeAdd')
        ), documentId);
        let docRef: firebaseAdmin.firestore.DocumentReference;

        if (docId) {
          const existingDoc = await this.get(docId);
          if (existingDoc) {
            throw new Error(`Document does already exist with id ${docId}`);
          }
        }

        if (docId) {
          docRef = this.collectionRef.doc(docId);
          await docRef.set(await this.__cleanData(docData));
        } else {
          docRef = await this.collectionRef.add(await this.__cleanData(docData));
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
        let collectionQuery: firebaseAdmin.firestore.Query = this.collectionRef;

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
        const documents = querySnapshot.docs.map((docSnapshot: firebaseAdmin.firestore.QueryDocumentSnapshot) => {
          return docSnapshot.data();
        });
        
        return documents;  
      }
    }
  }
}
