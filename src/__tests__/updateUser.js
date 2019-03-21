import faker from "faker";

import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestGlobalPerm
} from "../utils/createTestEntities";
import { sq } from "../db";

const UPDATE_USER_MUTATION = `
  mutation updateUser($id: String, $input: UpdateUserInput!){
    updateUser(id:$id, input: $input) {
      code
      message
      success
      item {
        id
        firstName
        lastName
        address
        city
        state
        zip5
        phone
        email
      }
    }
  }
`;

beforeEach(async () => {
  await dbUp();
});

afterEach(async () => {
  await dbDown();
});

describe("Update User", () => {
  test("Happy Path - is self", async () => {
    const user = await createTestUser();

    const newData = {
      firstName: faker.name.firstName(),
      email: faker.internet.email().toUpperCase()
    };

    const response = await graphqlTestCall(
      UPDATE_USER_MUTATION,
      {
        id: user.id,
        input: newData
      },
      user.id
    );
    expect(response.data.updateUser).not.toBeNull();
    expect(response.data.updateUser.item.firstName).toEqual(newData.firstName);
    expect(response.data.updateUser.item.email).toEqual(
      newData.email.toLowerCase()
    );
    const [dbUser] = await sq.from`users`.where({ id: user.id });
    expect(dbUser).toBeDefined();
    expect(dbUser.firstName).toEqual(newData.firstName);
    expect(dbUser.email).toEqual(newData.email.toLowerCase());
  });

  test("Happy Path - is ASSUMED self", async () => {
    const user = await createTestUser();

    const newData = {
      firstName: faker.name.firstName(),
      email: faker.internet.email().toUpperCase()
    };

    const response = await graphqlTestCall(
      UPDATE_USER_MUTATION,
      {
        input: newData
      },
      user.id
    );
    // console.log(response);
    expect(response.data.updateUser).not.toBeNull();
    expect(response.data.updateUser.item.firstName).toEqual(newData.firstName);
    expect(response.data.updateUser.item.email).toEqual(
      newData.email.toLowerCase()
    );
    const [dbUser] = await sq.from`users`.where({ id: user.id });
    expect(dbUser).toBeDefined();
    expect(dbUser.firstName).toEqual(newData.firstName);
    expect(dbUser.email).toEqual(newData.email.toLowerCase());
  });

  test("Can not update another user without GP ADMIN_USERS_CRUD", async () => {
    const user = await createTestUser();
    const user2 = await createTestUser();

    const newData = {
      firstName: faker.name.firstName(),
      email: faker.internet.email().toUpperCase()
    };

    const response = await graphqlTestCall(
      UPDATE_USER_MUTATION,
      {
        id: user2.id,
        input: newData
      },
      user.id
    );
    // console.log(response);
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("CAN update another user WITH GP ADMIN_USERS_CRUD", async () => {
    const user = await createTestUser();
    const user2 = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_USERS_CRUD");

    const newData = {
      firstName: faker.name.firstName(),
      email: faker.internet.email().toUpperCase()
    };

    const response = await graphqlTestCall(
      UPDATE_USER_MUTATION,
      {
        id: user2.id,
        input: newData
      },
      user.id
    );
    // console.log(response);
    expect(response.data.updateUser).not.toBeNull();
    expect(response.data.updateUser.item.firstName).toEqual(newData.firstName);
    expect(response.data.updateUser.item.email).toEqual(
      newData.email.toLowerCase()
    );
    const [dbUser] = await sq.from`users`.where({ id: user2.id });
    expect(dbUser).toBeDefined();
    expect(dbUser.firstName).toEqual(newData.firstName);
    expect(dbUser.email).toEqual(newData.email.toLowerCase());
  });

  test("fails is not authed or no id", async () => {
    const user = await createTestUser();

    const newData = {
      firstName: faker.name.firstName(),
      email: faker.internet.email().toUpperCase()
    };

    const response = await graphqlTestCall(UPDATE_USER_MUTATION, {
      id: user.id,
      input: newData
    });
    // console.log(response);
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });
});
