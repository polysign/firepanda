import { glob } from 'glob';
import camelcase from 'camelcase';
import * as path from 'path';
import * as functions from 'firebase-functions';
import * as FirebaseAdmin from 'firebase-admin';
import * as Firebase from 'firebase'; 

import { config } from './config/firebase.conf';

Firebase.initializeApp(config);

const injectables = {
  firebase: Firebase,
  functions: functions,
  collections: {}
};

const collectionFiles = Array.from(glob.sync('collections/**/*.js', { cwd: __dirname, ignore: './node_modules/**'}));
collectionFiles.forEach((collectionFile: string) => {
  const collectionClass = require(path.join(__dirname, collectionFile));;

  Object.keys(collectionClass).forEach((collectionClassName) => {
    injectables.collections[collectionClassName] = new collectionClass[collectionClassName](Firebase.app());
  });
});

const files = glob.sync('**/*.f.js', { cwd: __dirname, ignore: './node_modules/**'});

for(let i = 0, filesLength = files.length; i < filesLength; i++){
  const file = files[i];
  const filePath = path.join(__dirname, file);

  const filePathItems = file.slice(0, -5).split('functions').pop().split('/').filter(Boolean);
  const functionName = [filePathItems[0], camelcase(filePathItems.slice(1).join('_'))].join('_');

  if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === functionName) {
    const exportedFunction = require(filePath).main;
    let func = null;

    switch(functionName.split('_')[0]) {
      case 'http':
        func = functions.https.onCall((data, context) => {
          exportedFunction(data, context, injectables)
        });
        break;
      case 'auth':
        switch(filePathItems.pop()) {
          case 'onCreate':
            func = functions.auth.user().onCreate((user) => {
              exportedFunction(user, injectables);
            });
            break;
          case 'onDelete':
            func = functions.auth.user().onDelete((user) => {
              exportedFunction(user, injectables);
            });
            break;
        };
        break;
      case 'firestore':
        const collectionPath = require(filePath).collectionPath;
        switch(filePathItems.pop()) {
          case 'onWrite':
            func = functions.firestore.document(`${collectionPath}`).onWrite((change, context) => {
              exportedFunction(change, context, injectables);
            });
            break;
          case 'onCreate':
            func = functions.firestore.document(`${collectionPath}`).onCreate((snap, context) => {
              exportedFunction(snap, context, injectables);
            });
            break;
          case 'onUpdate':
            func = functions.firestore.document(`${collectionPath}`).onUpdate((change, context) => {
              exportedFunction(change, context, injectables);
            });
            break;
          case 'onDelete':
            func = functions.firestore.document(`${collectionPath}`).onDelete((snap, context) => {
              exportedFunction(snap, context, injectables);
            });
            break;
        }
        break;
      case 'config':
        func = functions.remoteConfig.onUpdate((versionMetadata) => {
          exportedFunction(versionMetadata, injectables);
        });
        break;
      case 'pubsub':
        const topicName = filePathItems.slice(1).join('_');
        func = functions.pubsub.topic(topicName).onPublish((message) => {
          exportedFunction(message, injectables);
        });
        break;
      case 'storage':
        const bucketPath = require(file).bucketPath;
        if (bucketPath) {
          switch(filePathItems.pop()) {
            case 'onArchive':
              func = functions.storage.bucket(`${bucketPath}`).object().onArchive((object) => {
                exportedFunction(object, injectables);
              });
              break;
            case 'onDelete':
              func = functions.storage.bucket(`${bucketPath}`).object().onDelete((object) => {
                exportedFunction(object, injectables);
              });
              break;
            case 'onFinalize':
              func = functions.storage.bucket(`${bucketPath}`).object().onFinalize((object) => {
                exportedFunction(object, injectables);
              });
              break;
            case 'onMetadataUpdate':
              func = functions.storage.bucket(`${bucketPath}`).object().onMetadataUpdate((object) => {
                exportedFunction(object, injectables);
              });
              break;
          }
        } else {
          switch(filePathItems.pop()) {
            case 'onArchive':
              func = functions.storage.bucket(`${bucketPath}`).object().onArchive((object) => {
                exportedFunction(object, injectables);
              });
              break;
            case 'onDelete':
              func = functions.storage.bucket(`${bucketPath}`).object().onDelete((object) => {
                exportedFunction(object, injectables);
              });
              break;
            case 'onFinalize':
              func = functions.storage.bucket(`${bucketPath}`).object().onFinalize((object) => {
                exportedFunction(object, injectables);
              });
              break;
            case 'onMetadataUpdate':
              func = functions.storage.bucket(`${bucketPath}`).object().onMetadataUpdate((object) => {
                exportedFunction(object, injectables);
              });
              break;
          }
        }
        break;
    }

    exports[functionName] = func;
  }
}
