import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import { createTestUser } from "../utils/createTestEntities";
import { sq } from "../db";

const CREATE_USER_MUTATION = `
  mutation createUser($input: CreateUserInput!) {
     createUser(input:$input) {
      code
      success
      message
      item {
        id
        name
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

describe("Create User", () => {
  test("Happy Path", async () => {
    const newUserData = {
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      email: faker.internet.email().toUpperCase()
    };

    // no input
    const response = await graphqlTestCall(CREATE_USER_MUTATION, {
      input: newUserData
    });
    expect(response.data.createUser).not.toBeNull();
    expect(response.data.createUser.item.name).toEqual(newUserData.name);
    // Also check email is lower case (as per middleware)
    expect(response.data.createUser.item.email).toEqual(
      newUserData.email.toLowerCase()
    );

    const [dbUser] = await sq.from`users`.where({
      id: response.data.createUser.item.id
    });
    expect(dbUser).toBeDefined();
    expect(dbUser.name).toEqual(newUserData.name);
    // Also check email is lower case (as per middleware)
    expect(dbUser.email).toEqual(newUserData.email.toLowerCase());
  });

  test("Duplicate error", async () => {
    const user = await createTestUser(
      null,
      faker.internet.email().toLowerCase()
    );

    // no input
    const response = await graphqlTestCall(CREATE_USER_MUTATION, {
      input: {
        email: user.email,
        name: user.name
      }
    });
    expect(response.data.createUser).not.toBeNull();
    expect(response.data.createUser.success).toBe(false);
    expect(response.data.createUser.code).toBe("DUPLICATE");
    expect(response.data.createUser.message).toBe(
      "A user with this email already exists."
    );
  });
});
