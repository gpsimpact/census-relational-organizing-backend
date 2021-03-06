import faker from "faker";

import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import { createTestUser, createAdminUser } from "../utils/createTestEntities";
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

afterAll(async () => {
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
      { user: { id: user.id } }
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
      { user: { id: user.id } }
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

  test("Can not update another user without GP ADMIN", async () => {
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
      { user: { id: user.id } }
    );
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("CAN update another user WITH GP ADMIN", async () => {
    const adminUser = await createAdminUser();
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
      { user: { id: adminUser.id } }
    );
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
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });
});
