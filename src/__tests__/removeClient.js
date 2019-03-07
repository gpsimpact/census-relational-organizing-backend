import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestClient,
  createTestOLPermission,
  createTestGlobalPerm
} from "../utils/createTestEntities";
import { sq } from "../db";

const REMOVE_CLIENT_MUTATION = `
  mutation removeClient($id: String!) {
     removeClient(id: $id) {
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

describe("Create Client", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const client = await createTestClient();
    await createTestGlobalPerm(user.id, "ADMIN_CLIENTS_CRUD");
    await createTestOLPermission(user.id, client.id, "USER__READ__CLIENT");

    const response = await graphqlTestCall(
      REMOVE_CLIENT_MUTATION,
      {
        id: client.id
      },
      user.id
    );
    expect(response.data.removeClient).not.toBeNull();
    expect(response.data.removeClient.success).toEqual(true);
    const dbClient = await sq.from`clients`;
    expect(dbClient.length).toBe(0);

    // verify it cascades delete on perms
    const dbClientPerm = await sq.from`client_permissions`;
    expect(dbClientPerm.length).toBe(0);
  });

  test("Fails without ADMIN_CLIENTS_CRUD global perm", async () => {
    const user = await createTestUser();
    const client = await createTestClient();

    const response = await graphqlTestCall(
      REMOVE_CLIENT_MUTATION,
      {
        id: client.id
      },
      user.id
    );
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });
});
