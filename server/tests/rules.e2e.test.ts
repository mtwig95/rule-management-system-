import request from 'supertest';
import app from '../src/app';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Rules API E2E', () => {
    it('should create and fetch a rule', async () => {
        const ruleData = {
            tenantId: 'org123',
            name: 'Test Rule',
            action: 'Allow',
            source: [],
            destination: []
        };

        const createRes = await request(app).post('/api/rules').send(ruleData);
        expect(createRes.status).toBe(201);
        const created = createRes.body;

        const fetchRes = await request(app)
            .get(`/api/rules/${ruleData.tenantId}`)
            .query({ page: 1, limit: 10 });

        expect(fetchRes.status).toBe(200);
        expect(fetchRes.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ _id: created._id, name: 'Test Rule' })
            ])
        );
    });
});
