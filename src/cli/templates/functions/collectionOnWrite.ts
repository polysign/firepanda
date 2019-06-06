export const collectionPath = 'users/{userId}';

export const main = (snap: any, context: any, { firestore }) => {
  console.log('Snap', snap);
  console.log('Context', context);
};
