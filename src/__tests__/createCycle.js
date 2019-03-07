import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import { createTestClient } from "../utils/createTestEntities";
import { sq } from "../db";

const CREATE_CYCLE_MUTATION = `
  mutation createCycle($input: CreateCycleInput!) {
     createCycle(input:$input) {
      code
      success
      message
      item {
        id
        name
        active
        category
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

describe("Create Cycle", () => {
  test("Happy Path", async () => {
    const client = await createTestClient();
    // const user = await createTestUser();
    // await createTestGlobalPerm(user.id, "ADMIN_CLIENTS_CRUD");

    const newCycleData = {
      name: faker.lorem.sentence(),
      clientId: client.id,
      category: "STATE_LEGISLATURE"
    };

    // no input
    const response = await graphqlTestCall(CREATE_CYCLE_MUTATION, {
      input: newCycleData
    });
    expect(response.data.createCycle).not.toBeNull();
    expect(response.data.createCycle.item.name).toEqual(newCycleData.name);
    expect(response.data.createCycle.item.category).toEqual(
      newCycleData.category
    );
    const [dbCycle] = await sq.from`cycles`.where({
      id: response.data.createCycle.item.id
    });
    expect(dbCycle).toBeDefined();
    expect(dbCycle.name).toEqual(newCycleData.name);
    expect(dbCycle.category).toEqual(newCycleData.category);
  });
});
