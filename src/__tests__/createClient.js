import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestClient,
  createTestGlobalPerm
} from "../utils/createTestEntities";
import { sq } from "../db";

const CREATE_CLIENT_MUTATION = `
  mutation createClient($input: CreateClientInput!) {
     createClient(input:$input) {
      code
      success
      message
      item {
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

describe("Create Client", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_CLIENTS_CRUD");

    const newClientData = {
      name: faker.company.companyName(),
      abbreviation: faker.company.bsNoun().substring(0, 5)
    };

    // no input
    const response = await graphqlTestCall(
      CREATE_CLIENT_MUTATION,
      {
        input: newClientData
      },
      user.id
    );
    expect(response.data.createClient).not.toBeNull();
    expect(response.data.createClient.item.name).toEqual(newClientData.name);
    expect(response.data.createClient.item.abbreviation).toEqual(
      newClientData.abbreviation
    );
    const [dbClient] = await sq.from`clients`.where({
      id: response.data.createClient.item.id
    });
    expect(dbClient).toBeDefined();
    expect(dbClient.name).toEqual(newClientData.name);
    expect(dbClient.abbreviation).toEqual(newClientData.abbreviation);
  });

  test("Duplicate error", async () => {
    const client = await createTestClient();
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_CLIENTS_CRUD");

    // no input
    const response1 = await graphqlTestCall(
      CREATE_CLIENT_MUTATION,
      {
        input: {
          abbreviation: client.abbreviation,
          name: client.name
        }
      },
      user.id
    );

    expect(response1.data.createClient).not.toBeNull();
    expect(response1.data.createClient.success).toBe(false);
    expect(response1.data.createClient.code).toBe("DUPLICATE");
    expect(response1.data.createClient.message).toBe(
      `A client with this abbreviation already exists.`
    );
  });

  test("Fails without ADMIN_CLIENTS_CRUD global perm", async () => {
    const user = await createTestUser();
    // await createGlobalPerm(user, AllowedGlobalPermissions.ADMIN_CLIENTS_CRUD);

    const newClientData = {
      name: faker.company.companyName(),
      abbreviation: faker.company.bsNoun().substring(0, 5)
    };

    // no input
    const response = await graphqlTestCall(
      CREATE_CLIENT_MUTATION,
      {
        input: newClientData
      },
      user.id
    );
    // should return correct data
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });
});
