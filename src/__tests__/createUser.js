import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestGlobalPerm
} from "../utils/createTestEntities";
import { sq } from "../db";

const CREATE_USER_MUTATION = `
  mutation createUser($input: CreateUserInput!) {
     createUser(input:$input) {
      code
      success
      message
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

describe("Create User", () => {
  test("Happy Path", async () => {
    const newUserData = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      address: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zip5: faker.address.zipCode().substring(0, 5),
      phone: `+${faker.random.number({
        min: 10000000000,
        max: 19999999999
      })}`
    };

    const adminUser = await createTestUser();
    await createTestGlobalPerm(adminUser.id, "ADMIN");

    // no input
    const response = await graphqlTestCall(
      CREATE_USER_MUTATION,
      {
        input: newUserData
      },
      { user: { id: adminUser.id } }
    );
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
    const adminUser = await createTestUser();
    await createTestGlobalPerm(adminUser.id, "ADMIN");

    const user = await createTestUser({
      email: faker.internet.email().toLowerCase()
    });

    // no input
    const response = await graphqlTestCall(
      CREATE_USER_MUTATION,
      {
        input: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          address: user.address,
          city: user.city,
          state: user.state,
          zip5: user.zip5,
          phone: user.phone
        }
      },
      { user: { id: adminUser.id } }
    );
    expect(response.data.createUser).not.toBeNull();
    expect(response.data.createUser.success).toBe(false);
    expect(response.data.createUser.code).toBe("DUPLICATE");
    expect(response.data.createUser.message).toBe(
      "A user with this email already exists."
    );
  });
});
