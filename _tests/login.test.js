const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");

const { DB_HOST } = process.env;

describe("POST /users", () => {
  beforeAll(() => {
    mongoose.connect(DB_HOST).then(() => app.listen(3000));
  });
  afterAll(() => {
    mongoose.connection.close();
  });

  test("login", async () => {
    const user = {
      email: "qwe@gmial.com",
      password: "qweqwe",
    };
    const data = await request(app).post("/api/users/login").send(user);

    expect(data.statusCode).toBe(200);
    expect(data.body.token).toBeTruthy();
    expect(data.body.user).toBeTruthy();
    expect(typeof data.body.user.email).toContain("string");
    expect(typeof data.body.user.subscription).toContain("string");
  });
});
