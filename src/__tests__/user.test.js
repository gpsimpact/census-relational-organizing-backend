import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestGlobalPerm,
  createTestClient,
  createTestOLPermission
} from "../utils/createTestEntities";

const GET_USER_QUERY = `
query User($id: String, $email: String) {
    user(id: $id, email: $email) {
        id
        name
        email
        globalPermissions
        clientPermissions {
          client {
            id
          }
          permissions
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

describe("User", () => {
  test("Happy Path By Id", async () => {
    const user = await createTestUser();
    const response = await graphqlTestCall(GET_USER_QUERY, { id: user.id });
    expect(response.data.user.id).toEqual(user.id);
    expect(response.data.user.name).toEqual(user.name);
  });

  test("Happy Path by email", async () => {
    const user = await createTestUser(
      null,
      faker.internet.email().toLowerCase()
    );
    const response = await graphqlTestCall(GET_USER_QUERY, {
      email: user.email
    });
    expect(response.data.user.id).toEqual(user.id);
    expect(response.data.user.name).toEqual(user.name);
    expect(response.data.user.email).toEqual(user.email);
  });

  test("Happy Path by email with case coercion", async () => {
    const user = await createTestUser(
      null,
      faker.internet.email().toLowerCase()
    );
    const response = await graphqlTestCall(GET_USER_QUERY, {
      email: user.email.toUpperCase()
    });
    expect(response.data.user.id).toEqual(user.id);
    expect(response.data.user.name).toEqual(user.name);
    expect(response.data.user.email).toEqual(user.email);
  });

  test("Global Permissions NOT NULL", async () => {
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_CLIENTS");
    await createTestGlobalPerm(user.id, "ADMIN");
    const response = await graphqlTestCall(GET_USER_QUERY, { id: user.id });
    // should return correct data
    expect(response.data.user.globalPermissions.sort()).toEqual(
      ["ADMIN_CLIENTS", "ADMIN"].sort()
    );
  });

  test("Global Permissions NULL", async () => {
    const user = await createTestUser();
    const response = await graphqlTestCall(GET_USER_QUERY, { id: user.id });
    expect(response.data.user.globalPermissions).toEqual([]);
  });

  test("Client Permissions NOT null", async () => {
    const user = await createTestUser();
    const client = await createTestClient();

    const cp1 = await createTestOLPermission(
      user.id,
      client.id,
      "USER__READ__CLIENT"
    );
    const cp2 = await createTestOLPermission(
      user.id,
      client.id,
      "USER__READ__CLIENT_CONTACT_EMAIL"
    );

    const response = await graphqlTestCall(GET_USER_QUERY, { id: user.id });
    expect(response.data.user.clientPermissions.length).toBe(1);
    expect(response.data.user.clientPermissions[0].permissions.length).toBe(2);
    expect(response.data.user.clientPermissions[0].permissions).toContain(
      cp1.permission
    );
    expect(response.data.user.clientPermissions[0].permissions).toContain(
      cp2.permission
    );
    expect(response.data.user.clientPermissions[0].client.id).toEqual(
      client.id
    );
  });

  test("Client Permissions null", async () => {
    const user = await createTestUser();

    const response1 = await graphqlTestCall(GET_USER_QUERY, { id: user.id });

    // should return correct data
    expect(response1.data.user.clientPermissions).toBeNull();
  });

  test("Client Permissions NO LEAKS", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const client = await createTestClient();

    await createTestOLPermission(user1.id, client.id, "USER__READ__CLIENT");

    await createTestOLPermission(
      user1.id,
      client.id,
      "USER__READ__CLIENT_CONTACT_EMAIL"
    );

    const response1 = await graphqlTestCall(GET_USER_QUERY, { id: user2.id });
    // should return correct data
    expect(response1.data.user.clientPermissions).toBeNull();
  });

  test("Client Permissions NO inactive Clients", async () => {
    const user = await createTestUser();
    const client = await createTestClient(false);

    await createTestOLPermission(user.id, client.id, "USER__READ__CLIENT");
    await createTestOLPermission(
      user.id,
      client.id,
      "USER__READ__CLIENT_CONTACT_EMAIL"
    );

    const response = await graphqlTestCall(GET_USER_QUERY, { id: user.id });
    expect(response.data.user.clientPermissions).toBeNull();
  });
});
