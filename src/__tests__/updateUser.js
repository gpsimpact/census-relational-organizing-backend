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
  test("Happy Path", async () => {
    const user = await createTestUser();

    const newData = {
      firstName: faker.name.firstName(),
      email: faker.internet.email().toUpperCase()
    };

    const response = await graphqlTestCall(UPDATE_USER_MUTATION, {
      id: user.id,
      input: newData
    });
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
});
