const axios = require("axios");
const { subscribe } = require("../app");

describe("POST api/users/login", () => {
  test("should be status 401", async () => {
    const invalidUser = {
      email: "qqqqqqqqqq@gmial.com",
      password: "qqqqqqqqqqqq",
    };

    try {
      await axios.post("http://localhost:3000/api/users/login", invalidUser);
    } catch ({ response }) {
      expect(response.status).toBe(401);
    }
  });

  test("should be status 200", async () => {
    const correctUser = {
      email: "qwe@gmial.com",
      password: "qweqwe",
    };

    const response = await axios.post(
      "http://localhost:3000/api/users/login",
      correctUser
    );
    expect(response.status).toBe(200);
  });

  test("there must be a 'token' property", async () => {
    const correctUser = {
      email: "qwe@gmial.com",
      password: "qweqwe",
    };

    const { data } = await axios.post(
      "http://localhost:3000/api/users/login",
      correctUser
    );
    const isToken = data.hasOwnProperty("token");

    expect(isToken).toBe(true);
  });

  test("there must be a 'user' property with 2 types - 'string", async () => {
    const correctUser = {
      email: "qwe@gmial.com",
      password: "qweqwe",
    };

    const { data } = await axios.post(
      "http://localhost:3000/api/users/login",
      correctUser
    );

    const { email, subscription } = data.user;
    const isStringedTypes =
      typeof email === "string" && typeof subscription === "string";

    expect(isStringedTypes).toBe(true);
  });
});
