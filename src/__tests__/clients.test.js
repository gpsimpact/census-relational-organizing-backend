import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestClient,
  createTestGlobalPerm,
  createTestOLPermission,
  createTestCycle
} from "../utils/createTestEntities";

const GET_ALL_CLIENTS_QUERY = `
query Clients($input:ClientsInput) {
    clients(input:$input) {
        hasMore
        totalCount
        items {
            id
            name
            abbreviation
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

describe("Clients", () => {
  test("Happy Path", async () => {
    await createTestClient();
    await createTestClient();
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_CLIENTS");

    // no input
    const response1 = await graphqlTestCall(GET_ALL_CLIENTS_QUERY, {}, user.id);
    // console.log(response1);
    // where only input
    const response2 = await graphqlTestCall(
      GET_ALL_CLIENTS_QUERY,
      {
        input: { where: { abbreviation: { neq: "fdsfdsa" } } }
      },
      user.id
    );
    // pagination only no where
    const response3 = await graphqlTestCall(
      GET_ALL_CLIENTS_QUERY,
      {
        input: { limit: 100, offset: 0 }
      },
      user.id
    );
    // partial pagination only 1
    const response4 = await graphqlTestCall(
      GET_ALL_CLIENTS_QUERY,
      {
        input: { limit: 100 }
      },
      user.id
    );
    // partial pagination only 2
    const response5 = await graphqlTestCall(
      GET_ALL_CLIENTS_QUERY,
      {
        input: { offset: 0 }
      },
      user.id
    );
    // should all be equal
    expect(response1).toEqual(response2);
    expect(response1).toEqual(response3);
    expect(response1).toEqual(response4);
    expect(response1).toEqual(response5);
    // should return correct data
    expect(response1.data.clients.hasMore).toBeFalsy();
    expect(response1.data.clients.totalCount).toBe(2);
    expect(response1.data.clients.items.length).toBe(2);
  });

  test("Fails without ADMIN_CLIENTS global perm", async () => {
    const user = await createTestUser();
    // no input
    const response = await graphqlTestCall(GET_ALL_CLIENTS_QUERY, {}, user.id);
    // should return correct data
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("Boolean Where", async () => {
    await createTestClient();
    await createTestClient(false);
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_CLIENTS");

    const response = await graphqlTestCall(
      GET_ALL_CLIENTS_QUERY,
      {
        input: { where: { active: { eq: true } } }
      },
      user.id
    );
    expect(response.data.clients.items.length).toBe(1);
  });

  test("nested advanced join query filter", async () => {
    const client = await createTestClient();
    await createTestClient();
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_CLIENTS");
    await createTestOLPermission(user.id, client.id, "ALPHA");
    await createTestOLPermission(user.id, client.id, "BETA");
    await createTestOLPermission(user.id, client.id, "CHARLIE");

    const response = await graphqlTestCall(
      GET_ALL_CLIENTS_QUERY,
      {
        input: {
          where: {
            active: { eq: true },
            clientPermissions: {
              permission: { in: ["BETA", "CHARLIE"] }
            }
          }
        }
      },
      user.id
    );
    // console.log(response);
    expect(response.data.clients.items.length).toBe(1);
    expect(response.data.clients.items[0].id).toEqual(client.id);
  });

  test("Exists Clients", async () => {
    const client = await createTestClient();
    await createTestClient();
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_CLIENTS");
    await createTestCycle(client.id, faker.lorem.sentence(), "FEDERAL_SENATE");
    await createTestCycle(
      client.id,
      faker.lorem.sentence(),
      "FEDERAL_CONGRESS"
    );
    await createTestCycle(
      client.id,
      faker.lorem.sentence(),
      "STATE_LEGISLATURE"
    );

    const response = await graphqlTestCall(
      GET_ALL_CLIENTS_QUERY,
      {
        input: {
          where: {
            active: { eq: true },
            cycles: {
              category: {
                in: ["FEDERAL_SENATE", "STATE_LEGISLATURE"]
              },
              engagementDates: { containsDate: "2018-03-05" }
            }
          }
        }
      },
      user.id
    );
    // console.log(response);
    expect(response.data.clients.items.length).toBe(1);
    expect(response.data.clients.items[0].id).toEqual(client.id);
  });
});
