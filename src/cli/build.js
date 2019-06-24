'use strict';

const fs = require('fs-extra');
const path = require('path');

const run = async (config) => {
  const rulesTargetFilePath = path.join(process.cwd(), config.rulesTargetFile);

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

console.log('here');

  fs.writeFileSync(rulesTargetFilePath, rulesStart);

  // Read rules files
  fs.readdirSync(path.join(process.cwd(), config.source, 'rules')).filter((fileName) => {
    return fileName.endsWith('.rules');
  }).forEach(async (fileName) => {
    const rules = fs.readFileSync(path.join(process.cwd(), config.source, fileName));
    fs.appendFileSync(rulesTargetFilePath, `\n`);
    fs.appendFileSync(rulesTargetFilePath, rules)
    fs.appendFileSync(rulesTargetFilePath, `\n`);
    
  });
  fs.appendFileSync(rulesTargetFilePath, rulesEnd);
}

module.exports = run;
