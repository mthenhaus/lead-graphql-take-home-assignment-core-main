// !!!ATTN
//
// before running tests please execute "yarn start:db" to ensure the mongo inmemory DB is running
//
const db = require('../db');
const fetch = require('node-fetch');

jest.mock('node-fetch', () => jest.fn());

afterEach(() => {
    jest.clearAllMocks();
});

describe('Test the DB operations', () => {
    test('Open the DB', async () => {
        let dbObject = await db.open();
        expect(dbObject).toBeDefined();
        expect(dbObject.client).toBeDefined();
        expect(dbObject.mongo).toBeDefined();
        expect(dbObject.users).toBeDefined();
        expect(dbObject.properties).toBeDefined();
    });

    test('Close the DB', async () => {
        let dbObject = await db.close();
        expect(dbObject).toBeDefined();
        expect(dbObject.client).toBeNull();
        expect(dbObject.mongo).toBeNull();
        expect(dbObject.users).toBeNull();
        expect(dbObject.properties).toBeNull();
    });

    test('Authenticate successfully using the DB', async () => {
        await db.open();
        let result = await db.authenticate({
            headers: {
                authorization: 'user1@sideinc.com 676cfd34-e706-4cce-87ca-97f947c43bd4'
            }
        });
        expect(result).toBeDefined();
        expect(result.email).toBe('user1@sideinc.com');
        expect(result.token).toBe('676cfd34-e706-4cce-87ca-97f947c43bd4');
        await db.close();
    });

    test('Authenticate unsuccessfully using the DB', async () => {
        await db.open();
        let result = await db.authenticate({
            headers: {
                authorization: 'user2@sideinc.com 343cfd34-e706-4cce-87ca-97f947c43bd4'
            }
        });
        expect(result).toBeNull();
        await db.close();
    });

    // TBD - add listings tests
});