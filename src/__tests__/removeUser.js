import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import { createTestUser } from "../utils/createTestEntities";
import { sq } from "../db";

const REMOVE_USER_MUTATION = `
  mutation removeUser($id: String!) {
     removeUser(id: $id) {
      code
      success
      message
    }
  }
`;

beforeEach(async () => {
  await dbUp();
});

afterEach(async () => {
  await dbDown();
});

describe("Remove User", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();

    const response = await graphqlTestCall(REMOVE_USER_MUTATION, {
      id: user.id
    });
    expect(response.data.removeUser).not.toBeNull();
    expect(response.data.removeUser.success).toEqual(true);
    const dbUsers = await sq.from`users`;
    expect(dbUsers.length).toBe(0);
  });
});
