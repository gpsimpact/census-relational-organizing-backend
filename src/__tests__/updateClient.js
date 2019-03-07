import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestClient,
  createTestGlobalPerm
} from "../utils/createTestEntities";
import { sq } from "../db";

const UPDATE_CLIENT_MUTATION = `
  mutation updateClient($id: String!, $input: UpdateClientInput!){
    updateClient(id:$id, input: $input) {
      code
      message
      success
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
    const client = await createTestClient();

    await createTestGlobalPerm(user.id, "ADMIN_CLIENTS_CRUD");

    const newData = {
      name: faker.company.companyName()
    };

    const response = await graphqlTestCall(
      UPDATE_CLIENT_MUTATION,
      {
        id: client.id,
        input: newData
      },
      user.id
    );
    expect(response.data.updateClient).not.toBeNull();
    expect(response.data.updateClient.item.name).toEqual(newData.name);
    expect(response.data.updateClient.item.abbreviation).toEqual(
      client.abbreviation
    );
    const [dbClient] = await sq.from`clients`.where({ id: client.id });
    expect(dbClient).toBeDefined();
    expect(dbClient.name).toEqual(newData.name);
    expect(dbClient.abbreviation).toEqual(client.abbreviation);
  });

  test("Fails without ADMIN_CLIENTS_CRUD global perm", async () => {
    const user = await createTestUser();
    const client = await createTestClient();

    const newData = {
      name: faker.company.companyName()
    };

    const response = await graphqlTestCall(
      UPDATE_CLIENT_MUTATION,
      {
        id: client.id,
        input: newData
      },
      user.id
    );

    // should return correct data
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });
});
