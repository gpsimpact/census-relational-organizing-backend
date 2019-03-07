import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestClient,
  createTestIO
} from "../utils/createTestEntities";
import { sq } from "../db";

const CREATE_IO_LINE_ITEM_MUTATION = `
  mutation createIOLineItem($input: CreateIOLineItemInput!) {
    createIOLineItem(input:$input) {
      code
      success
      message
      item {
        id
        io {
          id
        }
        timestamp
        category
        platform
        objective
        activeDateBegin
        activeDateEnd
        costGross
        costNet
        commissionRate
        createdBy {
          id
        }
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
    const ioID = faker.random.uuid();
    await createTestIO(
      ioID,
      client.id,
      user.id,
      undefined,
      undefined,
      undefined,
      "VOTER_CONTACT"
    );

    const newIOLIData = {
      insertionOrderId: ioID,
      category: "VOTER_CONTACT",
      platform: "FACEBOOK",
      objective: "DONATIONS",
      costGross: 123.33,
      costNet: 22.01,
      commissionRate: 0.15
    };

    // no input
    const response = await graphqlTestCall(
      CREATE_IO_LINE_ITEM_MUTATION,
      {
        input: newIOLIData
      },
      user.id
    );
    expect(response.data.createIOLineItem).not.toBeNull();
    expect(response.data.createIOLineItem.item.createdBy.id).toEqual(user.id);
    expect(response.data.createIOLineItem.item.io.id).toEqual(ioID);

    const [dbIOLI] = await sq.from`insertion_orders_line_items_current`.where({
      id: response.data.createIOLineItem.item.id
    });
    expect(dbIOLI).toBeDefined();
    expect(dbIOLI.platform).toEqual(newIOLIData.platform);
  });
});
