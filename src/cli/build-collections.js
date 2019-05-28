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
`;

  const rulesEnd = `
  }
}`;

  fs.writeFileSync(rulesTargetFilePath, rulesStart);

  // Read rules files
  fs.readdirSync(path.join(process.cwd(), config.source)).filter((fileName) => {
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
