import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestGlobalPerm
} from "../utils/createTestEntities";
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

afterAll(async () => {
  await dbDown();
});

describe("Remove User", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const user2 = await createTestUser();
    await createTestGlobalPerm(user2.id, "ADMIN");
    const response = await graphqlTestCall(
      REMOVE_USER_MUTATION,
      {
        id: user.id
      },
      { user: { id: user2.id } }
    );
    expect(response.data.removeUser).not.toBeNull();
    expect(response.data.removeUser.success).toEqual(true);
    const dbUsers = await sq.from`users`;
    expect(dbUsers.length).toBe(1);
    expect(dbUsers[0].id).toBe(user2.id);
  });
});
