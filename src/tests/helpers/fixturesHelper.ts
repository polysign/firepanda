export const setupFixtures = async (firebase, fixtures) => {
  return Promise.all(Object.keys(fixtures).map((fixtureKey) => {
    return new Promise((resolve, reject) => {
      firebase.firestore().doc(fixtureKey).set(fixtures[fixtureKey]).then((res: any) => {
        resolve(res);
      }).catch((err: any) => {
        reject(err);
      });
    });
  }));
}

export const teardownFixtures = async (firebase, fixtures) => {
  return Promise.all(Object.keys(fixtures).map((fixtureKey) => {
    return new Promise((resolve, reject) => {
      firebase.firestore().doc(fixtureKey).delete().then((res: any) => {
        resolve(res);
      }).catch((err: any) => {
        reject(err);
      });
    });
  }));
}
