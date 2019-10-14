// import faker from "faker";
import jsonwebtoken from "jsonwebtoken";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import { createTestUser } from "../utils/createTestEntities";
import setLoginToken from "../dataSources/users/setLoginToken";
import redis from "../redis";

const CONFIRM_LOGIN_MUTATION = `
    mutation confirmLogin($token: String!){
      confirmLogin(token: $token) {
            code
            success
            message
            token 
        }
    }
`;

const setToken = setLoginToken(redis);

beforeEach(async () => {
  await dbUp();
});

afterAll(async () => {
  await dbDown();
});

describe("confirmLoginResolver", () => {
  test("Happy Path", async () => {
    // insert record
    const user = await createTestUser();
    const token = "fdsfdsafdsfew23r4ewr432r";
    await setToken(user.id, token);

    const rToken1 = await redis.get(token);
    expect(rToken1).toBe(user.id);

    const response = await graphqlTestCall(CONFIRM_LOGIN_MUTATION, {
      token
    });
    expect(response.data.confirmLogin.code).toBe("OK");
    expect(response.data.confirmLogin.success).toBe(true);
    expect(response.data.confirmLogin.token).not.toBeNull();

    // test token generation
    const tokenPayload = jsonwebtoken.verify(
      response.data.confirmLogin.token,
      process.env.TOKEN_SECRET
    );
    expect(tokenPayload.id).toEqual(user.id);

    const rToken2 = await redis.get(token);
    expect(rToken2).toBeNull();
  });

  test("throws error if logged in", async () => {
    const user = await createTestUser();
    const token = "fdsfdsafdsfew23r4ewr432r";
    await setToken(user.id, token);

    const res = await graphqlTestCall(
      CONFIRM_LOGIN_MUTATION,
      {
        token
      },
      { user: { id: user.id } }
    );
    expect(res.errors.length).toBe(1);
    expect(res.errors[0].message).toEqual("You are already authenticated");
  });

  test("response if no matching user", async () => {
    const res = await graphqlTestCall(CONFIRM_LOGIN_MUTATION, {
      token: "FAKECODE"
    });

    expect(res.data.confirmLogin.code).toBe("DOES_NOT_EXIST");
    expect(res.data.confirmLogin.success).toBe(false);
    expect(res.data.confirmLogin.message).toBe(
      "This token is either invalid or expired!"
    );
  });
});
