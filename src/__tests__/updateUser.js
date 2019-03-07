import faker from "faker";

import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import { createTestUser } from "../utils/createTestEntities";
import { sq } from "../db";

const UPDATE_USER_MUTATION = `
  mutation updateUser($id: String!, $input: UpdateUserInput!){
    updateUser(id:$id, input: $input) {
      code
      message
      success
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

describe("Create Client", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();

    const newData = {
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      email: faker.internet.email().toUpperCase()
    };

    const response = await graphqlTestCall(UPDATE_USER_MUTATION, {
      id: user.id,
      input: newData
    });
    expect(response.data.updateUser).not.toBeNull();
    expect(response.data.updateUser.item.name).toEqual(newData.name);
    expect(response.data.updateUser.item.email).toEqual(
      newData.email.toLowerCase()
    );
    const [dbUser] = await sq.from`users`.where({ id: user.id });
    expect(dbUser).toBeDefined();
    expect(dbUser.name).toEqual(newData.name);
    expect(dbUser.email).toEqual(newData.email.toLowerCase());
  });
});
