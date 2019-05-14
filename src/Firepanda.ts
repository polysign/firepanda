import * as firebase from 'firebase';

interface CollectionSchemaDefinition {
  type: string;
  name?: string;
  default?: any;
  required?: boolean;
  className?: string;
  transform?: TransformationFunctioin;
}

interface CollectionRuleDefinition {
  isAuthenticated: Boolean;
  equal?: string[];
}

interface CollectionHook {
  on: 'create' | 'write' | 'delete';
  functionName?: string;
}

interface CollectionParams {
  name: string;
  schema: { [name: string]: CollectionSchemaDefinition };
  rules: { [name: string]: CollectionRuleDefinition }
  hooks?: { [name: string]: CollectionHook };
}

interface TransformationFunctioin {
  handler: Function;
  on?: 'create' | 'write' | 'delete';
}

export function Collection(params: CollectionParams) {
  return function<T extends {new(...args:any[]):{}}>(constructor: T) {
    return class extends constructor {
      firebase: firebase.app.App;
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
          this.docRef = this.__getDocRef();
        } else {
          this.data = this.__injectDefaults();
        }
      }

      __getDocRef() {
        return this.firebase.firestore().doc(this.documentPath);
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

      // save() {
      //   this.__beforeSaveHook();
      //   console.log('SAVE FROM COLL');
      //   this.__afterSaveHook();
      // }
      
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
