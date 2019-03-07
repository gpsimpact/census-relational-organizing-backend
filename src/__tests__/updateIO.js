import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestIO,
  createTestClient
} from "../utils/createTestEntities";
import { sq } from "../db";

const UPDATE_IO_MUTATION = `
  mutation updateIO($id: String!, $input: UpdateIOInput!){
    updateIO(id:$id, input: $input) {
      code
      message
      success
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
        revisionHistory {
          revisionId
          timestamp
          id
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
  }
`;

beforeEach(async () => {
  await dbUp();
});

describe("Updage IO", () => {
  test("Happy Path", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const client = await createTestClient();

    // // create first revision to io
    const ioId = "im_an_io_id";

    const IO = await createTestIO(
      ioId,
      client.id,
      user1.id,
      undefined,
      undefined,
      undefined,
      "ACQUISITION",
      undefined
    );

    const newData = {
      campaignDescription: "NEEDS TO BE THIS"
    };

    const response = await graphqlTestCall(
      UPDATE_IO_MUTATION,
      {
        id: ioId,
        input: newData
      },
      user2.id
    );
    expect(response.data.updateIO.item.revisionHistory.length).toBe(2);
    expect(response.data.updateIO).not.toBeNull();
    expect(response.data.updateIO.item.campaignDescription).toEqual(
      newData.campaignDescription
    );
    expect(response.data.updateIO.item.createdBy.id).toEqual(user2.id);
    let [dbIO] = await sq.from`insertion_orders_current`.where({
      id: ioId
    });
    expect(dbIO).toBeDefined();

    expect(dbIO.attribution).toEqual(IO.attribution);
    expect(dbIO.campaignDescription).toEqual(newData.campaignDescription);
  });
});
