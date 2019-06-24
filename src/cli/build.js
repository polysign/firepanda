'use strict';

const fs = require('fs-extra');
const path = require('path');

const run = async (spinner, config) => {
  await buildFirestore(spinner, config);
  await buildFirestoreIndexes(spinner, config);
  await buildStorage(spinner, config);
}

const buildFirestore = async (spinner, config) => {
  spinner.text = 'Building firestore rules... ';
  const rulesTargetFilePath = path.join(process.cwd(), config.firestore.rulesTargetFile);

  // Setup rules file
  const rulesStart = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
`;

  const rulesEnd = `
  }
}`;

  fs.writeFileSync(rulesTargetFilePath, rulesStart);

  // Read rules files
  fs.readdirSync(path.join(process.cwd(), config.firestore.source, 'rules')).filter((fileName) => {
    return fileName.endsWith('.rules');
  }).forEach(async (fileName) => {
    const rules = fs.readFileSync(path.join(process.cwd(), config.firestore.source, 'rules', fileName));
    fs.appendFileSync(rulesTargetFilePath, `\n`);
    fs.appendFileSync(rulesTargetFilePath, rules)
    fs.appendFileSync(rulesTargetFilePath, `\n`);
  });

  fs.appendFileSync(rulesTargetFilePath, rulesEnd);
}

const buildFirestoreIndexes = async (spinner, config) => {
  spinner.text = 'Building firestore indexes... ';
  const indexesTargetFilePath = path.join(process.cwd(), config.firestore.indexesTargetFile);

  const indexesStart = `
{
  "indexes": [
`;

  const indexesEnd = `
}`;

  fs.writeFileSync(indexesTargetFilePath, indexesStart);

  // Read indexes files
  fs.readdirSync(path.join(process.cwd(), config.firestore.source, 'indexes')).filter((fileName) => {
    return fileName.endsWith('.json');
  }).forEach(async (fileName) => {
    const indexes = fs.readFileSync(path.join(process.cwd(), config.firestore.source, 'indexes', fileName));
    fs.appendFileSync(indexesTargetFilePath, `\n`);
    fs.appendFileSync(indexesTargetFilePath, indexes)
    fs.appendFileSync(indexesTargetFilePath, `\n`);
  });

  fs.appendFileSync(indexesTargetFilePath, indexesEnd);
}

const buildStorage = async (spinner, config) => {
  spinner.text = 'Building storage rules... ';
  const rulesTargetFilePath = path.join(process.cwd(), config.storage.rulesTargetFile);

  const rulesStart = `
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth!=null;
    }
`;

  const rulesEnd = `
  }
}`;
  
  fs.writeFileSync(rulesTargetFilePath, rulesStart);

  // Read rules files
  fs.readdirSync(path.join(process.cwd(), config.storage.source, 'rules')).filter((fileName) => {
    return fileName.endsWith('.rules');
  }).forEach(async (fileName) => {
    const rules = fs.readFileSync(path.join(process.cwd(), config.storage.source, 'rules', fileName));
    fs.appendFileSync(rulesTargetFilePath, `\n`);
    fs.appendFileSync(rulesTargetFilePath, rules)
    fs.appendFileSync(rulesTargetFilePath, `\n`);
  });

  fs.appendFileSync(rulesTargetFilePath, rulesEnd);
}

module.exports = run;
