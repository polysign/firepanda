'use strict';

const fs = require('fs-extra');
const path = require('path');

const run = async (spinner, config) => {
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

module.exports = run;
