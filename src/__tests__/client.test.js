import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestClient,
  createTestGlobalPerm,
  createTestOLPermission,
  createTestCycle
} from "../utils/createTestEntities";

const GET_CLIENT_QUERY = `
query Client($id: String, $slug: String) {
    client(id:$id, slug:$slug) {
        id
        name
        slug
        userPermissions {
          user {
            id
          }
          permissions
        }
        cycles {
          id
          name
          category
          engagementDateBegin
          engagementDateEnd
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

describe("Client", () => {
  test("Happy Path By ID", async () => {
    const client = await createTestClient();
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_CLIENTS");
    const response = await graphqlTestCall(
      GET_CLIENT_QUERY,
      {
        id: client.id
      },
      user.id
    );
    // should return correct data
    expect(response.data.client.id).toEqual(client.id);
    expect(response.data.client.name).toEqual(client.name);
  });

  test("Happy Path By Slug", async () => {
    const client = await createTestClient();
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_CLIENTS");
    const response = await graphqlTestCall(
      GET_CLIENT_QUERY,
      {
        slug: client.slug
      },
      user.id
    );
    // should return correct data
    expect(response.data.client.id).toEqual(client.id);
    expect(response.data.client.name).toEqual(client.name);
    expect(response.data.client.slug).toEqual(client.slug);
  });

  test("returns null if neither slug nor id", async () => {
    await createTestClient();
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_CLIENTS");
    const response = await graphqlTestCall(GET_CLIENT_QUERY, {}, user.id);
    // should return correct data
    expect(response.data.client).toBeNull();
  });

  test("Fails without ADMIN_CLIENTS global perm", async () => {
    const client = await createTestClient();
    const user = await createTestUser();
    // no input
    const response = await graphqlTestCall(
      GET_CLIENT_QUERY,
      {
        id: client.id
      },
      user.id
    );
    // console.log(response);
    // should return correct data
    expect(response.data.client).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("UserPermissions null", async () => {
    const client = await createTestClient();
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_CLIENTS");

    const response = await graphqlTestCall(
      GET_CLIENT_QUERY,
      {
        id: client.id
      },
      user.id
    );

    expect(response.data.client.userPermissions).toBeNull();
  });

  test("UserPermissions not null", async () => {
    const user = await createTestUser();
    const client = await createTestClient();
    await createTestGlobalPerm(user.id, "ADMIN_CLIENTS");

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

    const response = await graphqlTestCall(
      GET_CLIENT_QUERY,
      {
        id: client.id
      },
      user.id
    );
    expect(response.data.client.userPermissions.length).toBe(1);
    expect(response.data.client.userPermissions[0].permissions.length).toBe(2);
    expect(response.data.client.userPermissions[0].permissions).toContain(
      cp1.permission
    );
    expect(response.data.client.userPermissions[0].permissions).toContain(
      cp2.permission
    );
    expect(response.data.client.userPermissions[0].user.id).toEqual(user.id);
  });

  test("client cycles not null", async () => {
    const user = await createTestUser();
    const client = await createTestClient();
    await createTestGlobalPerm(user.id, "ADMIN_CLIENTS");
    await createTestCycle(client.id, undefined, "FEDERAL_SENATE");
    await createTestCycle(client.id, undefined, "FEDERAL_CONGRESS");
    await createTestCycle(client.id, undefined, "STATE_LEGISLATURE");
    const response = await graphqlTestCall(
      GET_CLIENT_QUERY,
      {
        id: client.id
      },
      user.id
    );
    expect(response.data.client.cycles.length).toBe(3);
    expect(response.data.client.cycles[0].engagementDateBegin).toEqual(
      "2018-01-01"
    );
    expect(response.data.client.cycles[0].engagementDateEnd).toEqual(
      "2018-12-31"
    );
  });

  test("client cycles null", async () => {
    const user = await createTestUser();
    const client = await createTestClient();
    await createTestGlobalPerm(user.id, "ADMIN_CLIENTS");

    const response = await graphqlTestCall(
      GET_CLIENT_QUERY,
      {
        id: client.id
      },
      user.id
    );
    expect(response.data.client.cycles).toBeNull();
  });
});
