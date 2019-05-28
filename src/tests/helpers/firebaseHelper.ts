import * as fs from 'fs';
import * as firebase from 'firebase';
import * as firebaseTesting from '@firebase/testing'

export const setupFirebase = async (): Promise<firebase.app.App> => {
  const projectId = `firepanda-${Date.now()}`;
  const app = firebaseTesting.initializeTestApp({
    projectId: projectId,
    auth: { uid: "user-id-1234", email: "test@user.com" }
  });

  await firebaseTesting.loadFirestoreRules({
    projectId: projectId,
    rules: fs.readFileSync("./firebase/firestore.rules", "utf8")
  });
    
  return app;
}
