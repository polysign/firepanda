import * as firebase from 'firebase';
import * as firebaseAdmin from 'firebase-admin';
import { setupFirebase } from './helpers/firebaseHelper';

import { UsersCollection } from './collections/Users';

let firebaseApp: firebase.app.App;
let Users: UsersCollection;

beforeAll(async () => {
  firebaseApp = await setupFirebase();
  Users = new UsersCollection(firebaseApp);
});

afterEach(async () => {
  const users = await Users.getAll();
  await Promise.all(users.map(async (user) => {
    return await Users.delete(user._id);
  }));
});

afterAll(async () => {
  await firebaseApp.delete();
});

describe('Schema > _id > transform', () => {
  describe('Transform the document id to data which does not exist on the document', () => {
    test('it should fallback to an autogenerated id', async () => {
      // Given
      const data = {
        displayName: 'Georges',
        email: 'whatever@email.com'
      };

      // When
      const newDocumentId = await Users.add(data);

      // Then
      expect(newDocumentId).toBeDefined();
    });
  });
  describe('Transform the document id to data which exists on the document', () => {
    test('it should use the id from the data', async () => {
      // Given
      const uid = 'user-id-1234';
      const data = {
        uid: uid,
        displayName: 'Georges',
        email: 'whatever@email.com'
      };

      // When
      const newDocumentId = await Users.add(data);

      // Then
      expect(newDocumentId).toBeDefined();
      expect(newDocumentId).toBe(uid);
    });
  });
});

describe('Schema > Types', () => {
  describe('String', () => {
    describe('Storing data of the correct datatype', () => {
      test('it should store the data without modifying it', async () => {
        // Given
        const data = {
          uid: 'user-id-2000',
          displayName: 'Mr Universe',
          email: 'mr@universe.net'
        };

        // When
        const documentId = await Users.add(data);
        const userDocument = await Users.get(documentId);

        // Then
        expect(typeof userDocument.uid).toBe('string');
        expect(userDocument.uid).toBe(data.uid);
        expect(userDocument._id).toBe(documentId);
      });
    });
    describe('Storing data of a different datatype', () => {
      test('it should store the data, trying to modify it', async () => {
        // Given
        const data = {
          uid: '2000',
          displayName: 1337,
          email: 'mr@universe.net'
        };

        // When
        const documentId = await Users.add(data);
        const userDocument = await Users.get(documentId);

        // Then
        expect(typeof userDocument.uid).toBe('string');
        expect(typeof userDocument.displayName).toBe('string');
        expect(userDocument.displayName).not.toBe(data.displayName);
        expect(userDocument.displayName).toBe(data.displayName.toString());
      });
    });
  });
  describe('Number', () => {
    describe('Storing data of the correct datatype', () => {
      test('it should store the data without modifying it', async () => {
        // Given
        const data = {
          uid: 'user-id-2000',
          displayName: 'Mr Universe',
          email: 'mr@universe.net',
          age: 20
        };

        // When
        const documentId = await Users.add(data);
        const userDocument = await Users.get(documentId);

        // Then
        expect(typeof userDocument.age).toBe('number');
        expect(userDocument.age).toBe(data.age);
      });
    });
    describe('Storing data of a different datatype', () => {
      test('it should store the data, trying to modify it', async () => {
        // Given
        const data = {
          uid: '2000',
          displayName: 1337,
          email: 'mr@universe.net',
          age: '22'
        };

        // When
        const documentId = await Users.add(data);
        const userDocument = await Users.get(documentId);

        // Then
        expect(typeof userDocument.age).toBe('number');
        expect(userDocument.age).not.toBe(data.age);
        expect(userDocument.age).toBe(Number(data.age));
      });
    });
  });
  describe('Boolean', () => {
    describe('Storing data of the correct datatype', () => {
      test('it should store the data without modifying it', async () => {
        // Given
        const data = {
          uid: 'user-id-2000',
          displayName: 'Mr Universe',
          email: 'mr@universe.net',
          age: 20,
          active: true
        };

        // When
        const documentId = await Users.add(data);
        const userDocument = await Users.get(documentId);

        // Then
        expect(typeof userDocument.active).toBe('boolean');
        expect(userDocument.active).toBe(data.active);
      });
    });
    describe('Storing data of a different datatype', () => {
      test('it should store the data, trying to modify it', async () => {
        // Given
        const data = {
          uid: '2000',
          displayName: 1337,
          email: 'mr@universe.net',
          age: '22',
          active: 'yes'
        };

        // When
        const documentId = await Users.add(data);
        const userDocument = await Users.get(documentId);

        // Then
        expect(typeof userDocument.active).toBe('boolean');
        expect(userDocument.active).not.toBe(data.active);
        expect(userDocument.active).toBe(true);
      });
    });
  });
  describe('Array', () => {
    describe('Storing data of the correct datatype', () => {
      test('it should store the data without modifying it', async () => {
        // Given
        const data = {
          uid: 'user-id-2000',
          displayName: 'Mr Universe',
          email: 'mr@universe.net',
          age: 20,
          active: true,
          roles: ['admin', 'manager']
        };

        // When
        const documentId = await Users.add(data);
        const userDocument = await Users.get(documentId);

        // Then
        expect(Array.isArray(userDocument.roles)).toBeTruthy();
        expect(userDocument.roles.length).toBe(data.roles.length);
        expect(userDocument.roles).toMatchObject(data.roles);
      });
    });
    describe('Storing data of the correct datatype but with empty values in the array', () => {
      test('it should store the data, but removing empty values', async () => {
        // Given
        const data = {
          uid: 'user-id-2000',
          displayName: 'Mr Universe',
          email: 'mr@universe.net',
          age: 20,
          active: true,
          roles: ['admin', 'manager', null, null, 'contributor']
        };

        // When
        const documentId = await Users.add(data);
        const userDocument = await Users.get(documentId);

        // Then
        expect(Array.isArray(userDocument.roles)).toBeTruthy();
        expect(userDocument.roles.length).toBe(data.roles.length - 2);
        expect(userDocument.roles).toMatchObject(data.roles.filter(Boolean));
      });
    });
  });
  describe('Map', () => {
    describe('Storing data of the correct datatype', () => {
      test('it should store the data without modifying it', async () => {
        // Given
        const data = {
          uid: 'user-id-2000',
          preferences: {
            canDelete: true,
            canUpdate: false,
            ageIndex: 129
          }
        };

        // When
        const documentId = await Users.add(data);
        const userDocument = await Users.get(documentId);

        // Then
        expect(userDocument.preferences).toMatchObject(data.preferences);
      });
    });
  });
  describe('Timestamp', () => {
    describe('Storing data of the correct datatype', () => {
      test('it should store the data without modifying it', async () => {
        // Given
        const data = {
          uid: 'user-id-2000',
          createdAt: firebaseAdmin.firestore.Timestamp.now()
        };

        // When
        const documentId = await Users.add(data);
        const userDocument = await Users.get(documentId);

        // Then
        expect(typeof userDocument.createdAt).toBe('object');
        expect(userDocument.createdAt).toHaveProperty('nanoseconds')
        expect(userDocument.createdAt).toHaveProperty('seconds')
        expect(typeof userDocument.createdAt.nanoseconds).toBe('number');
        expect(typeof userDocument.createdAt.seconds).toBe('number');
      });
    });
    describe('Storing a javascript timestamp', () => {
      test('it should store the data by modifying it', async () => {
        // Given
        const data = {
          uid: 'user-id-2000',
          createdAt: Date.now()
        };

        // When
        const documentId = await Users.add(data);
        const userDocument = await Users.get(documentId);

        // Then
        expect(typeof userDocument.createdAt).toBe('object');
        expect(userDocument.createdAt).toHaveProperty('nanoseconds')
        expect(userDocument.createdAt).toHaveProperty('seconds')
        expect(typeof userDocument.createdAt.nanoseconds).toBe('number');
        expect(typeof userDocument.createdAt.seconds).toBe('number');
      });
    });
  });
  describe('Geopoint', () => {
    describe('Storing data of the correct datatype', () => {
      test('it should store the data without modifying it', async () => {
        // Given
        const data = {
          uid: 'user-id-2000',
          position: new firebaseAdmin.firestore.GeoPoint(20, 39)
        };

        // When
        const documentId = await Users.add(data);
        const userDocument = await Users.get(documentId);

        // Then
        expect(typeof userDocument.position).toBe('object');
        expect(userDocument.position).toHaveProperty('longitude')
        expect(userDocument.position).toHaveProperty('latitude')
        expect(typeof userDocument.position.longitude).toBe('number');
        expect(typeof userDocument.position.latitude).toBe('number');
      });
    });
    describe('Storing datapoint from a simple object with the right params', () => {
      test('it should store the data by modifying it', async () => {
        // Given
        const data = {
          uid: 'user-id-2000',
          position: { lng: 23, lat: -90 }
        };
        
        // When
        const documentId = await Users.add(data);
        const userDocument = await Users.get(documentId);
        
        // Then
        expect(typeof userDocument.position).toBe('object');
        expect(userDocument.position).toHaveProperty('longitude')
        expect(userDocument.position).toHaveProperty('latitude')
        expect(typeof userDocument.position.longitude).toBe('number');
        expect(typeof userDocument.position.latitude).toBe('number');
      });
    });
    describe('Storing datapoint from a simple object with the wrong params', () => {
      test('it should raise an error', async () => {
        // Given
        let error = null;
        const data = {
          uid: 'user-id-2000',
          position: { lng: 23, lati: -90 }
        };
        
        // When
        try {
          await Users.add(data);
        } catch (e) {
          error = e.message;
        }
        
        // Then
        expect(error).toBe('Unable to create geopoint')
      });
    });
  });
});