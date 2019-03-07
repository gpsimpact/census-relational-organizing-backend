import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import { createTestUser, createTestClient } from "../utils/createTestEntities";
import { sq } from "../db";

const CREATE_IO_MUTATION = `
  mutation createIO($input: CreateIOInput!) {
     createIO(input:$input) {
      code
      success
      message
      item {
        id
        timestamp
        client {
          id
        }
        createdBy {
          id
        }
        attribution
        campaignName
        campaignDescription
        programPhase
        commissionRate
      }
    }
  }
`;

beforeEach(async () => {
  await dbUp();
});

describe("Create IO", () => {
  test("Happy Path", async () => {
    const client = await createTestClient();
    const user = await createTestUser();

    const newIOData = {
      id: faker.random.uuid(),
      clientId: client.id,
      attribution: faker.name.firstName(),
      campaignName: faker.lorem.words(4),
      campaignDescription: faker.lorem.word(),
      programPhase: "VOTER_CONTACT",
      commissionRate: 0.15
    };

    // no input
    const response = await graphqlTestCall(
      CREATE_IO_MUTATION,
      {
        input: newIOData
      },
      user.id
    );
    expect(response.data.createIO).not.toBeNull();
    expect(response.data.createIO.item.id).toEqual(newIOData.id);
    expect(response.data.createIO.item.client.id).toEqual(newIOData.clientId);
    expect(response.data.createIO.item.createdBy.id).toEqual(user.id);
    const [dbIO] = await sq.from`insertion_orders_current`.where({
      id: response.data.createIO.item.id
    });
    expect(dbIO).toBeDefined();
    expect(dbIO.campaignName).toEqual(newIOData.campaignName);
    // expect(dbIO.commission_rate).toEqual(newIOData.commissionRate);
  });
});
