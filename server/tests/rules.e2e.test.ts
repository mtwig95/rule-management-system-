import request from "supertest";
import app from "../src/app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { RuleModel } from "../src/models/rule.model";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

beforeEach(async () => {
  await RuleModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Rules API E2E", () => {
  it("should create and fetch a rule", async () => {
    const ruleData = {
      tenantId: "org123",
      name: "Test Rule",
      action: "Allow",
      source: [],
      destination: [],
    };

    const createRes = await request(app).post("/api/rules").send(ruleData);
    expect(createRes.status).toBe(201);
    const created = createRes.body;

    const fetchRes = await request(app)
      .get(`/api/rules/${ruleData.tenantId}`)
      .query({ page: 1, limit: 10 });

    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ _id: created._id, name: "Test Rule" }),
      ]),
    );
  });

  it("should update an existing rule", async () => {
    const createRes = await request(app).post("/api/rules").send({
      tenantId: "org123",
      name: "To Update",
      action: "Allow",
      source: [],
      destination: [],
    });

    const ruleId = createRes.body._id;

    const updateRes = await request(app)
      .put(`/api/rules/${ruleId}`)
      .send({
        tenantId: "org123",
        action: "Block",
        source: [{ name: "X", email: "x@x.com" }],
        destination: [{ name: "Y", address: "y.com" }],
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.action).toBe("Block");
    expect(updateRes.body.source[0].email).toBe("x@x.com");
  });

  it("should delete a rule", async () => {
    const createRes = await request(app).post("/api/rules").send({
      tenantId: "org123",
      name: "To Delete",
      action: "Allow",
      source: [],
      destination: [],
    });

    const ruleId = createRes.body._id;

    const deleteRes = await request(app).delete(`/api/rules/${ruleId}`);
    expect(deleteRes.status).toBe(200);

    const fetchRes = await request(app)
      .get(`/api/rules/org123`)
      .query({ page: 1, limit: 10 });

    expect(fetchRes.body.data).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: ruleId })]),
    );
  });

  it("should reorder two rules", async () => {
    const r1 = await request(app).post("/api/rules").send({
      tenantId: "org123",
      name: "First",
      action: "Allow",
      source: [],
      destination: [],
    });

    expect(r1.status).toBe(201);
    const rule1 = r1.body;

    const r2 = await request(app).post("/api/rules").send({
      tenantId: "org123",
      name: "Second",
      action: "Allow",
      source: [],
      destination: [],
    });

    expect(r2.status).toBe(201);
    const rule2 = r2.body;

    const reorderRes = await request(app)
      .post(`/api/rules/${rule1._id}/reorder`)
      .send({ afterId: rule2._id });

    expect(reorderRes.status).toBe(200);
    expect(reorderRes.body.message).toBe("Rule reordered successfully");

    const fetchRes = await request(app)
      .get(`/api/rules/org123`)
      .query({ page: 1, limit: 10 });

    const [first, second] = fetchRes.body.data;

    expect(first._id).toBe(rule2._id);
    expect(second._id).toBe(rule1._id);
  });
});
