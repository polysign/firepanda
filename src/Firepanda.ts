import * as firebase from 'firebase';
import { app } from 'firebase'

import { IRepository } from "./types";

interface CollectionSchemaItem {
  type: string;
  default?: any;
  required?: boolean;
  transform?: Function;
}

interface CollectionFunctionItem {
  on: 'create' | 'write' | 'delete';
  functionName: string;
}

interface CollectionParams {
  name: string;
  schema: { [name: string]: CollectionSchemaItem };
  functions?: { [name: string]: CollectionFunctionItem };
}

export class Repository implements IRepository {
  firebase: firebase.app.App;
  docRef: firebase.firestore.DocumentReference;
  documentId: string;
  data: any;

  constructor(firebaseInstance: firebase.app.App, documentId?: string) {
    debugger;
  }

  protected __getDocId() {
    return this.data.id;
  }

  private __getDocRef() {
    debugger;
    console.log(this);
    // this.docRef = this.firebase.firestore().doc(this.documentId);
  }

  public async get(documentId?: string): Promise<any> {
    if (documentId) {
      this.documentId = documentId;
      this.__getDocRef();
    }

    return await this.docRef.get().then((documentSnapshot: firebase.firestore.DocumentSnapshot) => {
      this.data = documentSnapshot.data();
      return this.data;
    });
  }

  public async save(data: any) {
    Object.keys(data).forEach((dataKey) => {
      this.data[dataKey] = data[dataKey];
    });

    if (this['beforeSave']) {
      this['beforeSave']();
    }
    this['beforeSaveHook']();

    this['afterSaveHook']();
    if (this['afterSave']) {
      this['afterSave']();
    }

    return true;
  }
}

export function Collection(params: CollectionParams) {
  return function<T extends {new(...args:any[]):{}}>(constructor: T) {
    return class extends constructor {
      firebase: app.App;
      documentPath: string;
      collectionName: string = params.name;
      collectionSchema: any = params.schema;

      data: any;
      docRef: firebase.firestore.DocumentReference;

      constructor(...args: any[]) {
        super();
        this.firebase = args[0];
        this.data = {};

        if (args[1]) {
          this.documentPath = [this.collectionName, args[1]].join('/');
          console.log(this.documentPath);
          this.__getDocRef();
        } else {
          this.__injectDefaults();
        }
      }

      __getDocRef() {
        this.docRef = this.firebase.firestore().doc(this.documentPath);
      }

      __injectDefaults() {
        Object.keys(this.collectionSchema).forEach((key) => {
          switch(this.collectionSchema[key].type) {
            case 'string':
              this.data[key] = this.collectionSchema[key].default ? this.collectionSchema[key].default : '';
              break;
            case 'number':
              this.data[key] = this.collectionSchema[key].default ? this.collectionSchema[key].default : 0;
              break;
            case 'array':
              this.data[key] = this.collectionSchema[key].default ? this.collectionSchema[key].default : [];
              break;
            case 'boolean':
              this.data[key] = this.collectionSchema[key].default ? this.collectionSchema[key].default : false;
              break;
          }
        });
      }

      __beforeSaveHook() {
        console.log('beforeSaveHook');
        Object.keys(this.collectionSchema).forEach((key) => {
          if (this.collectionSchema[key].transform) {
            this.data[key] = this.collectionSchema[key].transform(this);
          }
        })
      }
      
      __afterSaveHook() {
        console.log('afterSaveHook');
      }
      
      loadData() {
        // console.log(this);
        // const a = new this.collectionSchema();
        // console.log({a})
        // const keys = Object.keys(new this.collectionSchema())
        // console.log({keys});
        // console.log(this.collectionSchema());
        console.log('loading...');
      }
    }
  }
}
