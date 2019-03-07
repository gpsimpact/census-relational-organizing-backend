import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestIO,
  createTestClient,
  createTestIOLineItem
} from "../utils/createTestEntities";
import { sq } from "../db";

const UPDATE_IO_LINE_ITEM_MUTATION = `
  mutation updateIOLineItem($id: String!, $input: UpdateIOLineItemInput!){
    updateIOLineItem(id:$id, input: $input) {
      code
      message
      success
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
        revisionHistory {
          revisionId
          timestamp
          id
          io {
            id
          }
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
  }
`;

beforeEach(async () => {
  await dbUp();
});

describe("Updage IO", () => {
  test("Happy Path", async () => {
    const client = await createTestClient();
    const user1 = await createTestUser();
    // console.log("user 1 is ", user1);
    const user2 = await createTestUser();
    // console.log("user 2 is", user2);
    const ioID = faker.random.uuid();
    await createTestIO(
      ioID,
      client.id,
      user1.id,
      undefined,
      undefined,
      undefined,
      "VOTER_CONTACT"
    );
    const IoLiId = faker.random.uuid();
    await createTestIOLineItem(
      IoLiId,
      ioID,
      user1.id,
      "VOTER_CONTACT",
      "FACEBOOK",
      "DONATIONS",
      123.33,
      22.01,
      undefined,
      0.15
    );

    const newData = {
      costGross: 400.21
    };

    const response = await graphqlTestCall(
      UPDATE_IO_LINE_ITEM_MUTATION,
      {
        id: IoLiId,
        input: newData
      },
      user2.id
    );

    expect(response.data.updateIOLineItem.item.revisionHistory.length).toBe(2);
    expect(response.data.updateIOLineItem.item.revisionHistory[0].io.id).toBe(
      ioID
    );
    expect(response.data.updateIOLineItem).not.toBeNull();
    expect(response.data.updateIOLineItem.item.costGross).toEqual(
      newData.costGross
    );
    // expect(response.data.updateIOLineItem.item.createdBy.id).toEqual(user2.id);
    const [dbIOLI] = await sq.from`insertion_orders_line_items_current`.where({
      id: response.data.updateIOLineItem.item.id
    });
    expect(dbIOLI).toBeDefined();
    expect(dbIOLI.costgross).toEqual(newData.costgross);
  });
});
