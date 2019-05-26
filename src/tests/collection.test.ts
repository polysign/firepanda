import firebaseConfig from '../../.secret/firebase.conf';
import { setupFirebase } from './helpers/firebaseHelper';

import { UsersCollection } from './collections/Users';
import { WhereClause } from '../Query';

let firebaseApp: firebase.app.App;
let Users: UsersCollection;

beforeAll(async () => {
  firebaseApp = await setupFirebase();
  Users = new UsersCollection(firebaseApp);
});

beforeEach(async () => {
  const users = await Users.getAll();
  await Promise.all(users.map(async (user) => {
    return await Users.delete(user._id);
  }));
});

describe('Collections > Get', () => {
  describe('Get document which does not exist yet', () => {
    test('it should return null', async () => {
      // Given
      const documentId = 'user-id-1234';

      // When
      const user = await Users.get(documentId);

      // Then
      expect(user).toBe(null);
    });
  });
  describe('Get document which exists', () => {
    test('it should return the document from the database', async () => {
      // Given
      const documentId = 'user-id-1234-001';
      const data = { name: 'fakeUser' };
      await Users.add(data, documentId);

      // When
      const user = await Users.get(documentId);

      // Then
      expect(user).toEqual(Object.assign(data, {_id: documentId}));
    });
  });
});
describe('Collections > getAll', () => {
  describe('Get all documents from a collection with no documents', () => {
    test('it should return no documents from the collection', async () => {
      // Given
      const users = await Users.getAll();
      await Promise.all(users.map(async (user) => {
        return await Users.delete(user._id);
      }));

      // When
      const documents = await Users.getAll();

      // Then
      expect(documents.length).toBe(0);
    });
  });
  describe('Get all documents from a collection with documents', () => {
    test('it should return the documents from the collection', async () => {
      // Given
      const documentIds = ['docA', 'docB', 'docC', 'docD'];
      const data = { name: 'fakeuser' };

      await Promise.all(documentIds.map(async (documentId) => {
        return await Users.add(data, documentId);
      }));

      // When
      const documents = await Users.getAll();

      // Then
      expect(documents.length).toBe(documentIds.length);
    });
  });
});
describe('Collections > update', () => {
  describe('Update document that does not exist', () => {
    test('it should not update any document in the database', async () => {
      // Given
      const documentId = 'user-id-1234';

      // When
      const updateResult = await Users.update(documentId, {fake: 'data'});
      const user = await Users.get(documentId);

      // Then
      expect(updateResult).toBe(false);
      expect(user).toBe(null);
    });
  });
  describe('Update document that already exists', () => {
    test('it should update the document in the database', async () => {
      // Given
      const documentId = 'user-id-1234';
      await Users.add({ fake: 'data' }, documentId);

      // When
      const updateResult = await Users.update(documentId, {fake: 'datas'});
      const user = await Users.get(documentId);

      // Then
      expect(updateResult).toBe(true);
      expect(user.fake).toBe('datas');
    });
  });
});
describe('Collections > add', () => {
  describe('Add new document without document id', () => {
    test('it should create a new document and return a new document id', async () => {
      // Given & When
      const documentId = await Users.add({ fake: 'data' });

      // Then
      expect(documentId).toBeDefined();
      expect(documentId.length).toBeGreaterThan(0);
    });
  });
  describe('Add new document with document id', () => {
    test('it should create a new document and return the same document id', async () => {
      // Given
      const documentId = 'fake-doc-id-1234';

      // When
      const newDocumentId = await Users.add({ fake: 'data1234' }, documentId);

      // Then
      expect(newDocumentId).toBe(documentId);
    });
  });
  describe('Add new document with empty data', () => {
    test('it should not create a new document and throw an exception', async () => {
      // Given
      const data = null;
      const documentId = 'fake-doc-id-1234';
      
      // When
      let error = null;
      try {
        await Users.add(data, documentId);
      } catch(e) {
        error = e.message;
      }

      // Then
      expect(error).toBe('Data is undefined or null');
    });
  });
  describe('Add document with document id which already exists', () => {
    test('it should not create a new document and throw an exception', async () => {
      // Given
      const documentId = 'fake-doc-id-1234';
      await Users.add({ fake: 'data' }, documentId);
      
      // When
      let error = null;
      try {
        await Users.add({ fake: 'datas' }, documentId);
      } catch(e) {
        error = e.message;
      }

      // Then
      expect(error).toBe(`Document does already exist with id ${documentId}`);
    });
  });
});
describe('Collections > delete', () => {
  describe('Delete a document that exists', () => {
    test('it should delete the document', async () => {
      // Given
      const documentId = 'fake-doc-1234';
      await Users.add({ fake: 'data1234' }, documentId);

      // Given
      try {
        await Users.delete(documentId);
      } catch (e) { /* */ }
      const user = await Users.get(documentId);

      // Then
      expect(user).toBe(null);
    });
  });
  describe('Delete a document that does not exist', () => {
    test('it should not delete a document and throw an exception', async () => {
      // Given
      const documentId = 'fake-doc-1234';
      try {
        await Users.delete(documentId);
      } catch (e) { /* */ }

      // Given
      let error = null;
      try {
        await Users.delete(documentId);
      } catch(e) {
        error = e.message;
      }

      // Then
      expect(error).toBe(`Document does not exist with id ${documentId}`);
    });
  });
});
describe('Collections > query', () => {
  describe('Querying documents that do not exist', () => {
    test('it should return no documents', async () => {
      // Given
      const whereClause: WhereClause = { field: 'name', comparator: '==', value: 'fake' };

      // When
      const userDocs = await Users.query({
        where: [whereClause]
      });

      // Then
      expect(userDocs.length).toBe(0);
    });
  });
  describe('Querying documents with multiple where clauses', () => {
    test('it should return documents', async () => {
      // Given
      await Users.add({ name: 'Georges', height: 168 });
      await Users.add({ name: 'Laurent', height: 197 });
      await Users.add({ name: 'Isabelle', height: 162 });

      // When
      const whereClauses: WhereClause[] = [
        { field: 'height', comparator: '<=', value: 200 },
        { field: 'height', comparator: '>=', value: 170 }
      ];
      const userDocs = await Users.query({
        where: whereClauses
      });

      // Then
      expect(userDocs[0]).toMatchObject({ name: 'Laurent', height: 197 });
      expect(userDocs.length).toBe(1);
    });
  });
  describe('Querying documents with multiple where clauses limiting to a fixed number', () => {
    test('it should return documents', async () => {
      // Given
      const res = await Users.add({ name: 'Georges', height: 168 });
      console.log(res)
      await Users.add({ name: 'Laurent', height: 197 });
      await Users.add({ name: 'Isabelle', height: 162 });

      // When
      const whereClauses: WhereClause[] = [
        { field: 'height', comparator: '<=', value: 200 },
        { field: 'height', comparator: '>=', value: 165 }
      ];
      const userDocs = await Users.query({
        where: whereClauses,
        limit: 1
      });

      // Then
      expect(userDocs.length).toBe(1);
    });
  });
  describe('Querying documents with custom ordering', () => {
    test('it should return documents', async () => {
      // Given
      await Users.add({ name: 'Georges', height: 168 });
      await Users.add({ name: 'Laurent', height: 197 });
      await Users.add({ name: 'Isabelle', height: 162 });
      const whereClauses: WhereClause[] = [
        { field: 'height', comparator: '<=', value: 200 },
        { field: 'height', comparator: '>=', value: 165 }
      ];

      // When
      const userDocs = await Users.query({
        where: whereClauses,
        orderBy: 'height',
        orderDirection: 'desc'
      });

      // Then
      expect(userDocs.length).toBe(2);
      expect(userDocs[0].name).toBe('Laurent');
      expect(userDocs[1].name).toBe('Georges');
    });
  });
  describe('Querying documents with empty query object', () => {
    test('it should throw an error', async () => {
      // Given
      let error = null;

      // When
      try {
        await Users.query({});
      } catch(e) {
        error = e.message;
      }

      // Then
      expect(error).toBe('Query object missing');      
    });
  });
  describe('Querying documents with a malformed query object', () => {
    test('it should throw an error', async () => {
      // Given
      let error = null;

      // When
      try {
        // @ts-ignore
        await Users.query({whatever: 'this is wrong'});
      } catch(e) {
        error = e.message;
      }

      // Then
      expect(error).toBe('Query object malformed');      
    });
  });
});
