import * as firebase from 'firebase';

export const setupFirebase = async (firebaseConfig): Promise<firebase.app.App> => {
  firebase.initializeApp(firebaseConfig);
  await firebase.auth().signInWithEmailAndPassword(firebaseConfig.user.email, firebaseConfig.user.password);
  return firebase.app();
}